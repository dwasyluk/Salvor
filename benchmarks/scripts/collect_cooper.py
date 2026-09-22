#!/usr/bin/env python3
"""Collect one CooperBench arm: units + eval verdicts + ledger billing.

Usage: uv run python scripts/collect_cooper.py C1|C2|C3
Billing is idempotent (units already in the ledger are skipped).
"""
from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from salvorbench.cooper.collect import attach_eval, collect, write_records
from salvorbench.cost.ledger import Ledger
from salvorbench.state.log import StateLog, Event

ARM = sys.argv[1] if len(sys.argv) > 1 else "C3"
RUN = ROOT / "runs" / "beta"
NAME = f"{ARM.lower()}-flash-beta"


def main() -> int:
    rows = attach_eval(collect(RUN / "cooper", NAME, ARM))
    ledger = Ledger(RUN)
    billed = {e["unit_id"] for e in ledger._read()}
    added = 0
    for row in rows:
        unit = row["unit_id"]
        if unit in billed:
            continue
        t = row.get("tokens") or {}
        from salvorbench.cost.pricing import TokenUsage
        usage = TokenUsage(input=t.get("input", 0), output=t.get("output", 0),
                           cache_write_5m=t.get("cache_write_5m", 0),
                           cache_write_1h=t.get("cache_write_1h", 0),
                           cache_read=t.get("cache_read", 0),
                           turns=t.get("turns", 0),
                           source=t.get("source", "reconciled"))
        if usage.total:
            ledger.append(unit_id=unit, condition=ARM, phase="tasks", attempt=1,
                          model="claude-sonnet-5", usage=usage,
                          ts=datetime.now(timezone.utc).isoformat())
            added += 1
    path = write_records(rows, RUN, ARM)
    scored = [r for r in rows if r.get("both_passed") is not None]
    won = sum(1 for r in scored if r["both_passed"])
    print(f"{ARM}: {len(rows)} units | evaluated {len(scored)} | "
          f"both_passed {won}/{len(scored)} = "
          f"{100.0*won/len(scored) if scored else 0:.1f}% | "
          f"billed {added} new | ledger ${ledger.total():.2f}")
    print(f"records: {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
