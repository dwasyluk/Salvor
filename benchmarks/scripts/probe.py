"""Cost probe — measure one real unit of each execution shape before the matrix.

Deliberately measures rather than assumes. The projection that decides the
50-vs-25 CooperBench subset is computed from these numbers and frozen into the
manifest before any C-phase run, so the subset can never be a function of how an
arm performed.
"""
from __future__ import annotations

import json
import os
import sys
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from salvorbench.cost.pricing import cost_usd                    # noqa: E402
from salvorbench.swecl.dataset import load_sequence              # noqa: E402
from salvorbench.swecl.runner import run_task                    # noqa: E402

MODEL = "claude-sonnet-5"
MAX_TURNS = 120

key = os.environ.get("ANTHROPIC_API_KEY", "")
if not key.startswith("sk-ant-"):
    raise SystemExit("ANTHROPIC_API_KEY missing or not an API key")

tasks = load_sequence(ROOT / "vendor" / "swebench-cl-curriculum.json")
# Median difficulty tier, mid-sequence: representative rather than easiest.
probe_task = tasks[4]
print(f"probe: S1 on {probe_task.instance_id} (pos {probe_task.position}, {probe_task.difficulty})",
      flush=True)

run_dir = ROOT / "runs" / "_probe"
result = run_task(
    probe_task,
    condition="S1",
    model=MODEL,
    run_dir=run_dir,
    max_turns=MAX_TURNS,
    env_exports={"ANTHROPIC_API_KEY": key},
    brain=False,
    timeout_s=3600,
)

usage = result.run.usage
cost = cost_usd(usage, MODEL)
payload = result.to_dict() | {"cost_usd": str(cost)}

out = run_dir / "probe-swe-task.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(payload, indent=2))

print(json.dumps({
    "outcome": result.outcome.value,
    "reason": result.reason,
    "elapsed_s": round(result.run.elapsed_s, 1),
    "turns": usage.turns,
    "tokens_total": usage.total,
    "cost_usd": f"{cost:.4f}",
    "patch_lines": len((result.run.patch or "").splitlines()),
    "brain_leak": result.brain_paths_in_patch,
    "error": result.run.error,
}, indent=2))
