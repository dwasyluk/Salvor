"""Gold-patch validation — the zero-inference gate.

Runs every gold patch through the official SWE-bench harness. If the emulated
environment scores gold patches wrong, every downstream number is wrong too, and
we would never know from the results alone. Costs no inference, so it runs before
any spend.

Invoked through main() rather than the CLI: `run_evaluation`'s argparse defines
both `-i` (nargs='+') and `-id`, which makes the shell form ambiguous.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from salvorbench.swecl.dataset import load_sequence          # noqa: E402
from swebench.harness.run_evaluation import main             # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DATASET = "SWE-bench/SWE-bench_Verified"   # SWE-Bench-CL is derived from Verified
RUN_ID = "gold-validate"

tasks = load_sequence(ROOT / "vendor" / "swebench-cl-curriculum.json")
ids = [t.instance_id for t in tasks]
print(f"validating {len(ids)} gold patches against {DATASET}", flush=True)

report_dir = ROOT / "runs" / "_gold"
report_dir.mkdir(parents=True, exist_ok=True)

main(
    dataset_name=DATASET,
    split="test",
    instance_ids=ids,
    predictions_path="gold",
    max_workers=4,
    open_file_limit=4096,
    run_id=RUN_ID,
    timeout=3600,
    rewrite_reports=False,
    modal=False,
    report_dir=str(report_dir),
)
