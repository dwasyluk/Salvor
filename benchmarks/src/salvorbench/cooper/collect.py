"""Harvest CooperBench results into salvorbench's ledger and records.

Two things upstream's own `result.json` cannot give us:

* **Trustworthy cost.** Its `cost` field comes from litellm's pricing table, and
  a newly released model is frequently absent from that table - which is exactly
  why upstream's published runs show `total_cost 0.0`. Tokens are re-priced here
  against the rate card read from Anthropic's pricing page.
* **Isolation evidence.** Namespace compliance has to be read from the agent's
  own stream log, which upstream persists next to each result.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Iterator

from ..cost.extract import extract
from ..cost.pricing import TokenUsage, cost_usd
from ..isolation.mcpcheck import observed_namespaces

STREAM_GLOBS = ("*_stream.jsonl",)


def iter_results(cooper_dir: Path, run_name: str) -> Iterator[Path]:
    yield from sorted((cooper_dir / run_name).rglob("result.json"))


def _usage_from_agent_block(agent: dict[str, Any]) -> TokenUsage:
    """Fallback when the stream log is unreadable.

    Upstream exposes only a scalar cache-write count, so it is attributed to the
    more expensive 1h bucket - the same conservative rule the stream extractor
    applies, so a fallback can never under-bill relative to the primary path.
    """
    return TokenUsage(
        input=int(agent.get("input_tokens") or 0),
        output=int(agent.get("output_tokens") or 0),
        cache_write_1h=int(agent.get("cache_write_tokens") or 0),
        cache_read=int(agent.get("cache_read_tokens") or 0),
        turns=int(agent.get("steps") or 0),
        source="upstream_result_json",
        cache_write_attribution="assumed_1h",
    )


def collect_unit(result_path: Path, *, condition: str) -> dict[str, Any]:
    data = json.loads(result_path.read_text())
    unit_dir = result_path.parent
    repo, task_id = data.get("repo"), data.get("task_id")
    features = data.get("features") or []
    unit_id = (f"{condition}/cooper/{repo}/{task_id}/"
               f"f{'_'.join(str(f) for f in features)}")

    per_agent: list[dict[str, Any]] = []
    total = TokenUsage()
    namespaces: dict[str, int] = {}

    streams = [p for g in STREAM_GLOBS for p in sorted(unit_dir.glob(g))]
    for stream in streams:
        usage = extract(stream)
        for ns, n in observed_namespaces(stream).items():
            namespaces[ns] = namespaces.get(ns, 0) + n
        per_agent.append({"stream": stream.name, "turns": usage.turns,
                          "cost_usd": str(cost_usd(usage))})
        total = TokenUsage(
            input=total.input + usage.input,
            output=total.output + usage.output,
            cache_write_5m=total.cache_write_5m + usage.cache_write_5m,
            cache_write_1h=total.cache_write_1h + usage.cache_write_1h,
            cache_read=total.cache_read + usage.cache_read,
            turns=total.turns + usage.turns,
            source="reconciled",
        )

    if total.total == 0:            # stream unreadable - fall back, never zero-bill
        agent = data.get("agent") or {}
        total = _usage_from_agent_block(agent)

    return {
        "unit_id": unit_id,
        "condition": condition,
        "repo": repo,
        "task_id": task_id,
        "features": features,
        "setting": data.get("setting"),
        "agent_status": (data.get("agent") or {}).get("status"),
        "elapsed_s": round(float(data.get("duration_seconds") or 0), 1),
        "tokens": {
            "input": total.input, "output": total.output,
            "cache_write_5m": total.cache_write_5m,
            "cache_write_1h": total.cache_write_1h,
            "cache_read": total.cache_read, "turns": total.turns,
            "source": total.source,
        },
        "cost_usd": str(cost_usd(total)),
        "upstream_reported_cost": (data.get("agent") or {}).get("cost"),
        "mcp_namespaces": namespaces,
        "agents": per_agent,
        "log_dir": str(unit_dir),
    }


def collect(cooper_dir: Path, run_name: str, condition: str) -> list[dict[str, Any]]:
    return [collect_unit(p, condition=condition)
            for p in iter_results(cooper_dir, run_name)]


def attach_eval(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Attach upstream's evaluator verdict to each collected unit.

    Uses the per-unit eval.json rather than the runner's console summary: that
    summary counts only the units a given invocation processed, so re-running
    `cooperbench eval` reports a different denominator for the same arm. The
    per-unit artifacts are the complete record.

    Upstream's own field name (`both_passed`) is preserved rather than renamed
    to something like "merged success" - the evaluator's semantics are its own
    to describe, and paraphrasing them would misstate what was measured.
    """
    for row in rows:
        eval_path = Path(row["log_dir"]) / "eval.json"
        if not eval_path.exists():
            # No verdict: the agent never produced a scoreable run. Classified
            # as infrastructure, so it is excluded from denominators rather
            # than counted as a failure the model is responsible for.
            row["evaluated"] = False
            row["both_passed"] = None
            row["outcome"] = "infra_failed" if row.get("agent_status") == "Error" else "benchmark_failed"
            continue
        e = json.loads(eval_path.read_text())
        row["evaluated"] = True
        row["both_passed"] = bool(e.get("both_passed"))
        row["feature1_passed"] = bool((e.get("feature1") or {}).get("passed"))
        row["feature2_passed"] = bool((e.get("feature2") or {}).get("passed"))
        row["merge"] = e.get("merge")
        row["outcome"] = "completed"
    return rows


def write_records(rows: list[dict[str, Any]], run_dir: Path, condition: str) -> Path:
    out = run_dir / "records" / condition
    out.mkdir(parents=True, exist_ok=True)
    path = out / "units.json"
    path.write_text(json.dumps(rows, indent=2))
    return path
