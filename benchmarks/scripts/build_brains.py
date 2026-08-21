#!/usr/bin/env python3
"""Build T0 brains for the CooperBench flash task states.

One bootstrap per distinct (repo, task_id) state — 20 states cover all 50
pairs. Each bootstrap drives the shipped SETUP_PROMPT.md with the scripted
operator (fixed answers; capture gates go to the reviewer-only ratifier),
then snapshots a brain image + knowledge tarball with provenance.

Usage:
  uv run python scripts/build_brains.py --probe          # cheapest single state, then stop
  uv run python scripts/build_brains.py                  # full fleet (resumable)
  uv run python scripts/build_brains.py --state dottxt_ai_outlines_task/1655
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from cooperbench.utils import get_image_name
from cooperbench.agents._coop.runtime import CONTAINER_REPO_PATH

from salvorbench.brain.bootstrap import MODEL, bootstrap_state
from salvorbench.cooper.subset import load_pairs
from decimal import Decimal

from salvorbench.cost.governor import BudgetExceeded, Governor
from salvorbench.cost.ledger import Ledger
from salvorbench.state.log import Event, StateLog

# task3997's Hub image is published amd64-only (documented in
# runs/beta/cooper/_failed-attempts/README.md); every other flash image is
# multi-arch. Same explicit-platform fix as the repaired pair runs.
FORCED_PLATFORM = {"huggingface_datasets_task/3997": "linux/amd64"}

SETUP_SCRIPT = Path(
    ROOT / ".venv/lib/python3.12/site-packages/cooperbench/agents/claude_code/setup.sh")
PROBE_UNIT_USD = None  # set from the first observed bootstrap


def utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--probe", action="store_true", help="bootstrap ONE state and stop")
    ap.add_argument("--state", default=None, help="bootstrap a single named state (repo/task_id)")
    ap.add_argument("--run-id", default="beta")
    ap.add_argument("--flash", default=str(ROOT / "dataset/subsets/flash.json"))
    args = ap.parse_args()

    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key.startswith("sk-ant-"):
        raise SystemExit("ANTHROPIC_API_KEY missing or not an API key")

    pairs = load_pairs(args.flash)
    states = sorted({p.state_key for p in pairs})
    if args.state:
        if args.state not in states:
            raise SystemExit(f"unknown state {args.state}; known: {states}")
        states = [args.state]
    print(f"{len(states)} state(s) to bootstrap", flush=True)

    run_dir = ROOT / "runs" / args.run_id
    ledger, state_log = Ledger(run_dir), StateLog(run_dir)
    gov = Governor(ledger)
    # Bootstrap shape: conservative pre-observation estimate; the governor
    # switches to empirical p95 after MIN_OBSERVATIONS completed bootstraps.
    gov.set_probe("t0_bootstrap", Decimal("2.50"))
    brains_dir = run_dir / "brains"

    done = {u.removeprefix("t0/") for u, d in state_log.units().items()
            if u.startswith("t0/") and d.get("last_event") == "unit_finished"
            and d.get("usefulness_ok")}

    built = 0
    for sk in states:
        if sk in done:
            print(f"  SKIP {sk} (already built)", flush=True)
            continue
        repo, task_id = sk.rsplit("/", 1)
        image = get_image_name(repo, int(task_id))
        unit = f"t0/{sk}"
        out_dir = brains_dir / sk.replace("/", "-")

        try:
            gov.admit(unit, "t0_bootstrap")
        except BudgetExceeded as exc:
            print(f"  BUDGET HALT: {exc}", flush=True)
            state_log.append(Event.BUDGET_HALT, unit_id=unit, reason=str(exc))
            return 3

        attempt = 1 + sum(1 for e in ledger._read() if e["unit_id"] == unit)
        state_log.append(Event.UNIT_STARTED, unit_id=unit, phase="t0_bootstrap",
                         image=image, attempt=attempt)
        print(f"  BOOTSTRAP {sk}  image={image}", flush=True)
        res = bootstrap_state(
            state_key=sk,
            image=image,
            repo_path=CONTAINER_REPO_PATH,
            setup_prompt=ROOT.parent / "SETUP_PROMPT.md",
            out_dir=out_dir,
            api_key=key,
            project_name=repo,
            stack_hint=None,                      # machine-derived in-container
            claude_code_setup=SETUP_SCRIPT.read_text(),
            platform=FORCED_PLATFORM.get(sk),
        )

        # Bill everything observed: drive turns + usefulness probe + ratifier.
        if res.drive:
            ledger.append(unit_id=unit, condition="T0", phase="t0_bootstrap",
                          attempt=attempt, model=MODEL, usage=res.drive.usage, ts=utc())
        if res.probe_usage is not None and res.probe_usage.total:
            ledger.append(unit_id=f"{unit}#probe", condition="T0",
                          phase="t0_bootstrap", attempt=attempt, model=MODEL,
                          usage=res.probe_usage, ts=utc())
        rat_usage = _ratifier_usage(out_dir / "ratifier")
        if rat_usage is not None:
            ledger.append(unit_id=f"{unit}#ratifier", condition="T0",
                          phase="t0_bootstrap", attempt=attempt, model=MODEL,
                          usage=rat_usage, ts=utc())
        unit_usd = sum(
            (Decimal(e["cost_usd"]) for e in ledger._read()
             if e["unit_id"] in (unit, f"{unit}#probe", f"{unit}#ratifier")), Decimal("0"))
        gov.release(unit, unit_usd)

        if res.ok and not res.usefulness_ok:
            state_log.append(Event.UNIT_FAILED, unit_id=unit, phase="t0_bootstrap",
                             error="usefulness probe failed (rebuild once per plan)")
            print(f"    BUILT BUT USEFULNESS FAIL — will rebuild on next invocation",
                  flush=True)
            if args.probe:
                return 2
            continue
        if res.ok:
            state_log.append(Event.UNIT_FINISHED, unit_id=unit,
                             phase="t0_bootstrap", brain_image=res.image,
                             brain_sha256=res.brain_sha256,
                             usefulness_ok=res.usefulness_ok,
                             elapsed_s=round(res.elapsed_s, 1))
            built += 1
            print(f"    OK  {res.image}  sha={res.brain_sha256[:12]}  "
                  f"usefulness={'PASS' if res.usefulness_ok else 'FAIL'}  "
                  f"{res.elapsed_s/60:.1f} min  ${ledger.total():.2f} cum", flush=True)
        else:
            state_log.append(Event.UNIT_FAILED, unit_id=unit, phase="t0_bootstrap",
                             error=(res.error or "")[:500])
            print(f"    FAILED  {res.error}", flush=True)
            if args.probe:
                return 2

        if args.probe:
            print("\nPROBE COMPLETE — review provenance before fleet:", flush=True)
            print(f"  {out_dir}/provenance.json", flush=True)
            return 0
    print(f"\n{built} brain(s) built | ledger ${ledger.total():.2f}", flush=True)
    return 0


def _ratifier_usage(rat_dir: Path):
    """Sum token usage across this bootstrap's ratifier decision logs."""
    from salvorbench.cost.pricing import TokenUsage
    files = sorted(rat_dir.glob("*.json")) if rat_dir.exists() else []
    if not files:
        return None
    tot = TokenUsage(source="assistant_sum")
    n = 0
    for f in files:
        d = json.loads(f.read_text())
        u = (d.get("decision") or {}).get("tokens") or d.get("tokens") or {}
        if not u:
            continue
        tot = TokenUsage(
            input=tot.input + int(u.get("input", 0)),
            output=tot.output + int(u.get("output", 0)),
            cache_write_5m=tot.cache_write_5m,
            cache_write_1h=tot.cache_write_1h,
            cache_read=tot.cache_read,
            turns=tot.turns + 1, source="assistant_sum")
        n += 1
    return tot if n else None


if __name__ == "__main__":
    raise SystemExit(main())
