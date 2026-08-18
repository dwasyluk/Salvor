"""Anthropic pricing — verified against official documentation, not recalled.

Rates below were read from https://platform.claude.com/docs/en/about-claude/pricing
on 2026-08-18 and mirrored into ``conf/pricing.json`` (the two are asserted equal
by ``tests/test_pricing.py``). The manifest records this table's sha256 so a
published cost figure can always be traced to the rate card that produced it.

The pricing page states verbatim:

    "The $2/$10 per million input/output token pricing for Claude Sonnet 5,
    announced at launch as introductory pricing through August 31, 2026, is now
    the standard price. The previously scheduled increase to $3/$15 per million
    input/output tokens on September 1, 2026 will not occur."

So there is NO rate-change boundary to model, and no reason to bill projections
at an inflated "standard" rate. Conservatism comes from the mechanisms instead:
a measured probe, p95 admission control, a 30% projection contingency, a spend
reserve, and an in-flight watchdog.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path

PRICING_SOURCE = "https://platform.claude.com/docs/en/about-claude/pricing"
PRICING_RETRIEVED = "2026-08-18"

# USD per 1,000,000 tokens.
RATES: dict[str, dict[str, Decimal]] = {
    "claude-sonnet-5": {
        "input": Decimal("2.00"),
        "output": Decimal("10.00"),
        "cache_write_5m": Decimal("2.50"),   # 1.25x input
        "cache_write_1h": Decimal("4.00"),   # 2.00x input
        "cache_read": Decimal("0.20"),       # 0.10x input
    },
}

MILLION = Decimal(1_000_000)


@dataclass(frozen=True)
class TokenUsage:
    """Token counts for one billed agent invocation.

    ``source`` records how the counts were derived so a reviewer can tell a
    reconciled figure from one recovered off a truncated stream:
      * ``assistant_sum``  - summed per-turn ``assistant.message.usage``
      * ``result_event``   - the terminal ``result`` event only
      * ``reconciled``     - both extractions agreed within tolerance
    """

    input: int = 0
    output: int = 0
    cache_write_5m: int = 0
    cache_write_1h: int = 0
    cache_read: int = 0
    turns: int = 0
    source: str = "reconciled"
    discrepancy_pct: float | None = None
    cache_write_attribution: str = "breakdown"

    @property
    def total(self) -> int:
        return (
            self.input
            + self.output
            + self.cache_write_5m
            + self.cache_write_1h
            + self.cache_read
        )


def cost_usd(usage: TokenUsage, model: str = "claude-sonnet-5") -> Decimal:
    """Exact cost for one invocation. Decimal throughout - never float."""
    try:
        rate = RATES[model]
    except KeyError as exc:  # pragma: no cover - guarded by manifest validation
        raise ValueError(
            f"No verified rate card for {model!r}. Add it to RATES and "
            f"conf/pricing.json after reading {PRICING_SOURCE}; never guess a rate."
        ) from exc

    return (
        Decimal(usage.input) * rate["input"]
        + Decimal(usage.output) * rate["output"]
        + Decimal(usage.cache_write_5m) * rate["cache_write_5m"]
        + Decimal(usage.cache_write_1h) * rate["cache_write_1h"]
        + Decimal(usage.cache_read) * rate["cache_read"]
    ) / MILLION


def load_conf(path: Path | None = None) -> dict:
    """Load the JSON mirror used by the Node contract test."""
    path = path or Path(__file__).resolve().parents[3] / "conf" / "pricing.json"
    return json.loads(path.read_text())
