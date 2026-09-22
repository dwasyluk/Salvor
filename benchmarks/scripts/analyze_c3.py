#!/usr/bin/env python3
"""Three-arm CooperBench comparison + C3 shared-brain telemetry.

Read-only over collected records and pair artifacts. Produces the
coordination-gap table and the disclosed treatment-utilization facts
(brain reads/writes observed in streams; volumes are telemetry, never
coerced — availability was gated at bootstrap).
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUN = ROOT / "runs" / "beta"


def rate(rows):
    scored = [r for r in rows if r.get("both_passed") is not None]
    won = sum(1 for r in scored if r["both_passed"])
    return won, len(scored)


def main() -> int:
    recs = {}
    for arm in ("C1", "C2", "C3"):
        p = RUN / "records" / arm / "units.json"
        if p.exists():
            recs[arm] = json.loads(p.read_text())
    print("=== resolution (upstream both_passed) ===")
    rates = {}
    for arm, rows in recs.items():
        w, n = rate(rows)
        rates[arm] = 100.0 * w / n if n else float("nan")
        print(f"  {arm}: {w}/{n} = {rates[arm]:.1f}%")
    if {"C1", "C2"} <= rates.keys():
        print(f"  baseline coordination gap (C2-C1): {rates['C2']-rates['C1']:+.1f} pp")
    if {"C1", "C3"} <= rates.keys():
        print(f"  salvor coordination gap  (C3-C1): {rates['C3']-rates['C1']:+.1f} pp")
    if {"C2", "C3"} <= rates.keys():
        print(f"  C3 vs C2 delta:                  {rates['C3']-rates['C2']:+.1f} pp")
        if {"C1"} <= rates.keys() and rates["C2"] < rates["C1"]:
            rec = (rates["C3"] - rates["C2"]) / (rates["C1"] - rates["C2"]) * 100
            print(f"  coordination penalty recovered:  {rec:.0f}%")

    # merge outcomes per arm
    print("\n=== merge.status distribution ===")
    for arm, rows in recs.items():
        dist = {}
        for r in rows:
            m = (r.get("merge") or {}).get("status") if isinstance(r.get("merge"), dict) else r.get("merge")
            dist[m or "n/a"] = dist.get(m or "n/a", 0) + 1
        print(f"  {arm}: {dict(sorted(dist.items()))}")

    # C3 shared-brain utilization telemetry (observed, never required)
    coop = RUN / "cooper" / "c3-flash-beta" / "coop"
    touched = read_hits = 0
    pairs = 0
    for pair in sorted(coop.glob("*/*/*")):
        if not (pair / "result.json").exists():
            continue
        pairs += 1
        for st in pair.glob("agent*_stream.jsonl"):
            txt = st.read_text(errors="replace")
            if ".salvor/" in txt:
                read_hits += 1
        vols = subprocess.run(
            ["docker", "volume", "ls", "-q", "--filter",
             f"name=salvorbench-c3-"], capture_output=True, text=True).stdout
    print(f"\n=== C3 telemetry ===\n  pairs with results: {pairs}")
    print(f"  agent streams referencing .salvor/: {read_hits}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
