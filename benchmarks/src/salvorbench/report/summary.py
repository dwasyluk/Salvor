"""Canonical summary generation.

`summary.json` is the single source of truth for every published figure. README,
the site and REPORT.md derive from it; a Node contract test asserts that any
percentage rendered near benchmark context exists here. Hand-editing a published
number therefore fails CI rather than shipping quietly.

An incomplete run is stamped `complete: false` and MUST NOT reach a public
surface. Partial numbers look finished, which makes them worse than none.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path
from typing import Any

from ..cost.ledger import Ledger
from ..state.log import StateLog, utcnow

ARMS = ("S1", "S2", "S3", "C1", "C2", "C3")
EXPECTED_SWE = 19


def _round(x: float, n: int = 1) -> float:
    return float(f"{x:.{n}f}")


@dataclass
class ArmSummary:
    condition: str
    expected: int
    completed: int = 0
    evaluated: int = 0
    resolved: int = 0
    benchmark_failed: int = 0
    limits_exceeded: int = 0
    infra_errors: int = 0
    tokens: int = 0
    cost_usd: Decimal = Decimal(0)
    wall_s: float = 0.0
    mcp_calls: dict[str, int] | None = None

    @property
    def complete(self) -> bool:
        return self.completed == self.expected and self.evaluated == self.expected

    @property
    def success_rate(self) -> float | None:
        return _round(100 * self.resolved / self.evaluated) if self.evaluated else None

    def to_dict(self) -> dict[str, Any]:
        d = {
            "expected": self.expected,
            "completed": self.completed,
            "evaluated": self.evaluated,
            "resolved": self.resolved,
            "benchmark_failed": self.benchmark_failed,
            "limits_exceeded": self.limits_exceeded,
            "infra_errors": self.infra_errors,
            "complete": self.complete,
            "success_rate": self.success_rate,
            "tokens_total": self.tokens,
            "cost_usd": str(self.cost_usd.quantize(Decimal("0.0001"))),
            "wall_clock_s": _round(self.wall_s, 1),
        }
        if self.evaluated and self.resolved:
            d["cost_per_resolved_usd"] = str(
                (self.cost_usd / self.resolved).quantize(Decimal("0.0001")))
        if self.mcp_calls is not None:
            d["mcp_utilisation"] = self.mcp_calls
        return d


def load_arm(run_dir: Path, condition: str, expected: int) -> ArmSummary | None:
    units = run_dir / "records" / condition / "units.json"
    if not units.exists():
        return None
    rows = json.loads(units.read_text())
    s = ArmSummary(condition=condition, expected=expected)
    for r in rows:
        outcome = r.get("outcome")
        if outcome == "completed":
            s.completed += 1
        elif outcome == "benchmark_failed":
            s.completed += 1
            s.benchmark_failed += 1
        elif outcome == "limits_exceeded":
            s.completed += 1
            s.limits_exceeded += 1
        else:
            s.infra_errors += 1
        if "resolved" in r:
            s.evaluated += 1
            s.resolved += bool(r["resolved"])
        t = r.get("tokens") or {}
        s.tokens += sum(int(t.get(k, 0) or 0) for k in
                        ("input", "output", "cache_write_5m", "cache_write_1h", "cache_read"))
        s.wall_s += float(r.get("elapsed_s") or 0)
        s.cost_usd += Decimal(str(r.get("cost_usd", "0")))
    return s


def build(run_dir: Path, *, expected_cooper: int | None = None) -> dict[str, Any]:
    ledger, state = Ledger(run_dir), StateLog(run_dir)
    ledger_ok, ledger_err = ledger.verify_chain()
    state_ok, state_err = state.verify_chain()

    conditions: dict[str, Any] = {}
    arms: list[ArmSummary] = []
    for arm in ARMS:
        expected = EXPECTED_SWE if arm.startswith("S") else (expected_cooper or 0)
        summary = load_arm(run_dir, arm, expected)
        if summary is not None:
            conditions[arm] = summary.to_dict()
            arms.append(summary)

    all_complete = bool(arms) and len(arms) == len(ARMS) and all(a.complete for a in arms)

    # A condition-correlated infra-failure spread means one arm is a biased
    # subsample and the comparison is void, not merely noisy.
    rates = [a.infra_errors / a.expected for a in arms if a.expected]
    spread = (max(rates) - min(rates)) if rates else 0.0

    derived: dict[str, Any] = {}
    if {"C1", "C2"} <= conditions.keys():
        solo, coop = conditions["C1"].get("success_rate"), conditions["C2"].get("success_rate")
        if solo is not None and coop is not None:
            derived["coordination_gap_pp"] = _round(coop - solo)
            if "C3" in conditions and conditions["C3"].get("success_rate") is not None:
                derived["salvor_coordination_gap_pp"] = _round(
                    conditions["C3"]["success_rate"] - solo)
                if coop - solo < 0:
                    penalty = solo - coop
                    recovered = conditions["C3"]["success_rate"] - coop
                    derived["coordination_penalty_recovered_pct"] = (
                        _round(100 * recovered / penalty) if penalty else None)
    if {"S1", "S3"} <= conditions.keys():
        a, b = conditions["S1"].get("success_rate"), conditions["S3"].get("success_rate")
        if a is not None and b is not None:
            # Deliberately NOT called "forward transfer": it does not match that
            # metric's definition. Literal name, literal meaning.
            derived["salvor_uplift_vs_stateless_pp"] = _round(b - a)

    return {
        "schema_version": 1,
        "generated_at": utcnow(),
        "complete": all_complete,
        "model": "claude-sonnet-5",
        "conditions": conditions,
        "derived": derived,
        "spend": {
            "total_usd": str(ledger.total().quantize(Decimal("0.0001"))),
            "units_billed": len(ledger.unit_costs()),
        },
        "integrity": {
            "ledger_chain_verified": ledger_ok,
            "ledger_chain_error": ledger_err,
            "state_chain_verified": state_ok,
            "state_chain_error": state_err,
            "condition_correlated_infra_spread_pp": _round(100 * spread),
            "condition_correlated_infra_warning": spread > 0.10,
        },
        "disclosures": {
            "stack_not_core": (
                "Salvor arms measure the recommended stack - Salvor + Serena + "
                "GitNexus - as a system. They do not isolate Salvor core."),
            "swecl_scoring": (
                "SWE-Bench-CL supplies sequencing and difficulty metadata only. "
                "Patches are scored by the official SWE-bench harness against "
                "SWE-bench_Verified. Upstream's evaluator is never executed."),
            "single_run": "One run per condition. No confidence intervals; "
                          "differences within noise are not effects.",
            "evaluator_never_feeds_memory": (
                "The external evaluator result never enters memory nor gates a "
                "memory write, in any arm."),
        },
    }


def write(run_dir: Path, out: Path, **kw: Any) -> dict[str, Any]:
    data = build(run_dir, **kw)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=2) + "\n")
    return data
