"""Official SWE-bench scoring.

Scoring is delegated entirely to the upstream harness against
SWE-bench_Verified. Nothing from the SWE-Bench-CL curriculum reaches it - not its
FAIL_TO_PASS/PASS_TO_PASS lists (which carry parse artifacts), not its metrics
code, and above all not its reported numbers.

The evaluator runs strictly downstream of, and invisible to, every arm: its
result is never returned into memory, and never gates a memory write. That rule
binds S2 and S3 alike.
"""

from __future__ import annotations

import json
from pathlib import Path

DATASET = "SWE-bench/SWE-bench_Verified"
SPLIT = "test"


def write_predictions(path: Path, preds: dict[str, str], model_name: str) -> Path:
    """Write a SWE-bench predictions JSONL: {instance_id, model_patch, model_name_or_path}."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w") as fh:
        for instance_id, patch in preds.items():
            fh.write(json.dumps({
                "instance_id": instance_id,
                "model_patch": patch or "",
                "model_name_or_path": model_name,
            }) + "\n")
    return path


def score(predictions: Path, instance_ids: list[str], run_id: str, report_dir: Path,
          *, max_workers: int = 4, timeout: int = 3600) -> dict:
    """Run the official harness and return its report."""
    from swebench.harness.run_evaluation import main

    report_dir.mkdir(parents=True, exist_ok=True)
    main(
        dataset_name=DATASET,
        split=SPLIT,
        instance_ids=instance_ids,
        predictions_path=str(predictions),
        max_workers=max_workers,
        open_file_limit=4096,
        run_id=run_id,
        timeout=timeout,
        rewrite_reports=False,
        modal=False,
        report_dir=str(report_dir),
    )
    for candidate in sorted(report_dir.glob(f"*{run_id}*.json")):
        return json.loads(candidate.read_text())
    raise FileNotFoundError(f"no report written for run_id={run_id} in {report_dir}")


def resolved_ids(report: dict) -> set[str]:
    return set(report.get("resolved_ids") or [])
