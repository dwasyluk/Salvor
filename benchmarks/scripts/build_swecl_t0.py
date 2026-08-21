#!/usr/bin/env python3
"""Build the S3 T0 brain for the SWE-Bench-CL pytest sequence.

One bootstrap on the FIRST task's image/base commit — the chain then carries
the knowledge layer forward task to task (derived layer regenerates per base
commit). Same scripted operator, ratifier, and provenance as the CooperBench
fleet; the only differences are the repo path (/testbed) and the amd64
execution path already frozen for all S arms.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from salvorbench.agent.invoke import SWEBENCH_REPO_PATH
from salvorbench.brain.bootstrap import MODEL, bootstrap_state
from salvorbench.cost.governor import BudgetExceeded, Governor
from salvorbench.cost.ledger import Ledger
from salvorbench.state.log import Event, StateLog
from salvorbench.swecl.dataset import load_sequence
from salvorbench.swecl.runner import container_setup

STATE_KEY = "swecl-pytest/t0"
UNIT = "t0/swecl/pytest"


def utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-id", default="beta")
    args = ap.parse_args()

    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key.startswith("sk-ant-"):
        raise SystemExit("ANTHROPIC_API_KEY missing or not an API key")

    tasks = load_sequence(ROOT / "vendor" / "swebench-cl-curriculum.json")
    first = tasks[0]
    print(f"T0 base: {first.instance_id} (position {first.position}) "
          f"image {first.image}", flush=True)

    run_dir = ROOT / "runs" / args.run_id
    ledger, state_log = Ledger(run_dir), StateLog(run_dir)
    gov = Governor(ledger)
    gov.set_probe("t0_bootstrap", Decimal("2.50"))
    out_dir = run_dir / "brains-swecl" / "t0"

    done = any(u == UNIT and d.get("last_event") == "unit_finished"
               and d.get("usefulness_ok")
               for u, d in state_log.units().items())
    if done:
        print("already built (usefulness passed) — nothing to do", flush=True)
        return 0

    try:
        gov.admit(UNIT, "t0_bootstrap")
    except BudgetExceeded as exc:
        print(f"BUDGET HALT: {exc}", flush=True)
        return 3

    attempt = 1 + sum(1 for e in ledger._read() if e["unit_id"] == UNIT)
    state_log.append(Event.UNIT_STARTED, unit_id=UNIT, phase="t0_bootstrap",
                     image=first.image, attempt=attempt)
    res = bootstrap_state(
        state_key=STATE_KEY,
        image=first.image,
        repo_path=SWEBENCH_REPO_PATH,
        setup_prompt=ROOT.parent / "SETUP_PROMPT.md",
        out_dir=out_dir,
        api_key=key,
        project_name="pytest",
        stack_hint=None,
        platform="linux/amd64",
        claude_code_setup=container_setup(brain=False),
    )

    if res.drive:
        ledger.append(unit_id=UNIT, condition="T0", phase="t0_bootstrap",
                      attempt=attempt, model=MODEL, usage=res.drive.usage, ts=utc())
    if res.probe_usage is not None and res.probe_usage.total:
        ledger.append(unit_id=f"{UNIT}#probe", condition="T0", phase="t0_bootstrap",
                      attempt=attempt, model=MODEL, usage=res.probe_usage, ts=utc())
    unit_usd = sum((Decimal(e["cost_usd"]) for e in ledger._read()
                    if e["unit_id"].startswith(UNIT)), Decimal("0"))
    gov.release(UNIT, unit_usd)

    if res.ok and res.usefulness_ok:
        state_log.append(Event.UNIT_FINISHED, unit_id=UNIT, phase="t0_bootstrap",
                         brain_image=res.image, brain_sha256=res.brain_sha256,
                         usefulness_ok=True, elapsed_s=round(res.elapsed_s, 1))
        print(f"OK {res.image} sha={res.brain_sha256[:12]} "
              f"{res.elapsed_s/60:.1f} min ${ledger.total():.2f} cum", flush=True)
        return 0
    state_log.append(Event.UNIT_FAILED, unit_id=UNIT, phase="t0_bootstrap",
                     error=(res.error or "usefulness probe failed")[:500])
    print(f"FAILED {res.error or 'usefulness probe failed'}", flush=True)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
