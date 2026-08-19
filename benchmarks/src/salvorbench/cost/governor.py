"""Spend governor - a hard ceiling, enforced twice.

Admission control alone cannot bound a run: a single agent invocation can burn
for two hours, and the decision to launch it is taken before any of that spend
exists. So there are two enforcement points:

1. ADMISSION (before launch) - refuse to start a unit when the cumulative total
   plus a p95 estimate for in-flight and pending work would cross the cap.
2. WATCHDOG (during flight) - re-cost the growing stream-json log on an interval
   and kill the container if the projection crosses the cap.

The p95 estimate starts from the probe and switches to observed data once enough
units of the same shape have completed, so the bound tightens as evidence
accumulates rather than relying on a guess all night.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from .ledger import Ledger

# Suite-level budget controls (operator-ratified 2026-08-19).
#
# SALVORBENCH_* is the harness's existing env namespace (REDIS_PORT, REDIS_IMAGE),
# so the budget joins it rather than the provider-credential namespace: OUR
# ledger enforces this cap - Anthropic never sees it - and the suite semantics
# (bootstraps, ratifier, retries, every arm) are broader than "API spend at one
# provider". Multi-provider child caps can nest under this later; none exist now.
#
# The env is read ONCE per run via resolve_budget(); the resolved values and
# their source are frozen into the manifest and recorded as a BUDGET_SET event
# in the hash-chained state log, so a mid-run env change has no effect and any
# raise is an explicit, auditable act.
CAP_USD = Decimal("250.00")        # default when SALVORBENCH_BUDGET_USD unset
RESERVE_USD = Decimal("12.00")     # default when SALVORBENCH_BUDGET_RESERVE_USD unset
PROBE_CEILING_USD = Decimal("18.00")
MIN_OBSERVATIONS = 5               # before trusting empirical p95 over the probe


def resolve_budget() -> tuple[Decimal, Decimal, str]:
    """Resolve (cap, reserve, source) from the environment, once, at run start."""
    import os

    def _read(name: str, default: Decimal) -> tuple[Decimal, bool]:
        raw = os.environ.get(name, "").strip()
        if not raw:
            return default, False
        value = Decimal(raw)          # a malformed value should fail loudly here
        if value <= 0:
            raise ValueError(f"{name} must be positive, got {raw!r}")
        return value, True

    cap, cap_env = _read("SALVORBENCH_BUDGET_USD", CAP_USD)
    reserve, res_env = _read("SALVORBENCH_BUDGET_RESERVE_USD", RESERVE_USD)
    if reserve >= cap:
        raise ValueError(f"reserve {reserve} must be below the cap {cap}")
    source = "env" if (cap_env or res_env) else "default"
    return cap, reserve, source


class BudgetExceeded(RuntimeError):
    """Raised when a unit cannot be admitted within the cap."""


@dataclass
class Estimate:
    """Per-shape unit-cost estimate."""
    shape: str
    probe_usd: Decimal
    observations: list[Decimal]

    def p95(self) -> Decimal:
        if len(self.observations) < MIN_OBSERVATIONS:
            return self.probe_usd
        ordered = sorted(self.observations)
        idx = max(0, int(round(0.95 * (len(ordered) - 1))))
        # Never let the empirical estimate fall below the probe by more than
        # half: a run of cheap units must not license one runaway launch.
        return max(ordered[idx], self.probe_usd / 2)


class Governor:
    def __init__(
        self,
        ledger: Ledger,
        *,
        cap_usd: Decimal = CAP_USD,
        reserve_usd: Decimal = RESERVE_USD,
    ) -> None:
        self.ledger = ledger
        self.cap = Decimal(cap_usd)
        self.reserve = Decimal(reserve_usd)
        self._estimates: dict[str, Estimate] = {}
        self._in_flight: dict[str, str] = {}   # unit_id -> shape

    # ---- estimates -----------------------------------------------------
    def set_probe(self, shape: str, usd: Decimal) -> None:
        est = self._estimates.get(shape)
        if est is None:
            self._estimates[shape] = Estimate(shape, Decimal(usd), [])
        else:
            est.probe_usd = Decimal(usd)

    def observe(self, shape: str, usd: Decimal) -> None:
        self._estimates.setdefault(shape, Estimate(shape, Decimal(usd), []))
        self._estimates[shape].observations.append(Decimal(usd))

    def estimate(self, shape: str) -> Decimal:
        est = self._estimates.get(shape)
        return est.p95() if est else Decimal("0")

    # ---- enforcement ---------------------------------------------------
    @property
    def spendable(self) -> Decimal:
        return self.cap - self.reserve

    def remaining(self) -> Decimal:
        return self.spendable - self.ledger.total()

    def committed(self) -> Decimal:
        """Spend already booked plus a p95 estimate for every in-flight unit."""
        return self.ledger.total() + sum(
            (self.estimate(shape) for shape in self._in_flight.values()),
            Decimal(0),
        )

    def can_admit(self, shape: str) -> tuple[bool, str]:
        projected = self.committed() + self.estimate(shape)
        if projected > self.spendable:
            return False, (
                f"admission refused: projected ${projected:.2f} would exceed "
                f"${self.spendable:.2f} (cap ${self.cap:.2f} less "
                f"${self.reserve:.2f} reserve); ledger ${self.ledger.total():.2f}, "
                f"{len(self._in_flight)} in flight"
            )
        return True, ""

    def admit(self, unit_id: str, shape: str) -> None:
        ok, reason = self.can_admit(shape)
        if not ok:
            raise BudgetExceeded(reason)
        self._in_flight[unit_id] = shape

    def release(self, unit_id: str, actual_usd: Decimal | None = None) -> None:
        shape = self._in_flight.pop(unit_id, None)
        if shape and actual_usd is not None:
            self.observe(shape, Decimal(actual_usd))

    def would_exceed(self, in_flight_usd: Decimal) -> bool:
        """Watchdog check: does booked + this unit's live spend cross the cap?"""
        return self.ledger.total() + Decimal(in_flight_usd) > self.cap
