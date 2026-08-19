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
    # The harness's summary file location varies by version, but it ALWAYS
    # writes an authoritative per-instance report.json under
    # logs/run_evaluation/<run_id>/<model>/<instance>/. Aggregate from those:
    # they are the ground truth the summary is derived from, and relying on the
    # summary's filename silently produced "0 resolved" on a run where every
    # instance had in fact resolved.
    for candidate in sorted(report_dir.glob(f"*{run_id}*.json")):
        return json.loads(candidate.read_text())
    return aggregate_from_logs(run_id)


def aggregate_from_logs(run_id: str, logs_root: Path | None = None) -> dict:
    """Build a report from the harness's per-instance report.json files."""
    root = (logs_root or Path("logs/run_evaluation")) / run_id
    resolved, unresolved, errored = [], [], []
    for report in sorted(root.glob("*/*/report.json")):
        for instance_id, r in json.loads(report.read_text()).items():
            if r.get("infra_failure"):
                errored.append(instance_id)
            elif r.get("resolved"):
                resolved.append(instance_id)
            else:
                unresolved.append(instance_id)
    total = len(resolved) + len(unresolved) + len(errored)
    if not total:
        raise FileNotFoundError(f"no per-instance reports under {root}")
    return {
        "total_instances": total,
        "resolved_instances": len(resolved),
        "unresolved_instances": len(unresolved),
        "error_instances": len(errored),
        "resolved_ids": resolved,
        "unresolved_ids": unresolved,
        "error_ids": errored,
        "source": "aggregated from per-instance report.json",
    }


def resolved_ids(report: dict) -> set[str]:
    return set(report.get("resolved_ids") or [])
