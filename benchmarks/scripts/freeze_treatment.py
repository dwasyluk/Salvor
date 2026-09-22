#!/usr/bin/env python3
"""Freeze the C3/S3 treatment before any treated run.

Hashes every file that defines the deterministic lifecycle PROCESS plus the
shipped installer prompt, records the budget configuration, and appends a
TREATMENT_FROZEN event to the state log. `verify` asserts that every treated
unit starts after this event and that the hashes never changed afterwards.

Re-running after a change is an explicit, visible re-freeze (new event).
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from salvorbench.brain.ratifier import RUBRIC_SHA256, RUBRIC_VERSION
from salvorbench.cost.governor import resolve_budget
from salvorbench.state.log import Event, StateLog

FROZEN_FILES = [
    "src/salvorbench/brain/gates.py",
    "src/salvorbench/brain/ratifier.py",
    "src/salvorbench/brain/driver.py",
    "src/salvorbench/brain/bootstrap.py",
    "src/salvorbench/cooper/adapter.py",
    "src/salvorbench/brain/chain.py",
    "src/salvorbench/brain/taint.py",
    "scripts/build_brains.py",
    "conf/agent.yaml",
    "../SETUP_PROMPT.md",
]


def main() -> int:
    hashes = {}
    for rel in FROZEN_FILES:
        p = (ROOT / rel).resolve()
        hashes[rel] = hashlib.sha256(p.read_bytes()).hexdigest()

    cap, reserve, source = resolve_budget()
    state = StateLog(ROOT / "runs" / "beta")
    ev = state.append(Event.SUBSET_FROZEN, phase="treatment_freeze",
                      kind="TREATMENT_FROZEN",
                      files=hashes,
                      rubric_version=RUBRIC_VERSION,
                      rubric_sha256=RUBRIC_SHA256,
                      budget_usd=str(cap), budget_reserve_usd=str(reserve),
                      budget_source=source)
    out = ROOT / "runs" / "beta" / "treatment-frozen.json"
    out.write_text(json.dumps(ev, indent=2))
    print(json.dumps({k: v[:12] for k, v in hashes.items()}, indent=2))
    print(f"TREATMENT_FROZEN recorded — budget ${cap} (reserve ${reserve}, {source})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
