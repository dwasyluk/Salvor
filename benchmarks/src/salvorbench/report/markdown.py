"""Human-readable report, generated from summary.json only.

Never hand-edited. Every figure here exists in the canonical artifact, so the
Node contract test can verify the two agree; a number that appears only in prose
is a number nobody can check.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ARM_LABEL = {
    "S1": "Stateless",
    "S2": "Ported SWE-Bench-CL semantic memory",
    "S3": "Salvor stack (Salvor + Serena + GitNexus)",
    "C1": "Solo",
    "C2": "Two-agent cooperative",
    "C3": "Two-agent cooperative + Salvor stack",
}


def _table(rows: list[list[str]], head: list[str]) -> str:
    out = ["| " + " | ".join(head) + " |",
           "|" + "|".join("---" for _ in head) + "|"]
    out += ["| " + " | ".join(r) + " |" for r in rows]
    return "\n".join(out)


def render(summary: dict[str, Any]) -> str:
    conds = summary.get("conditions") or {}
    complete = summary.get("complete")

    parts: list[str] = ["# Benchmark report", ""]

    if not complete:
        ran = ", ".join(sorted(conds)) or "none"
        parts += [
            "> **This run is incomplete and its numbers are NOT published.**",
            f"> Arms with data: {ran}. A benchmark missing arms cannot support a",
            "> comparison, and partial numbers look finished — which makes them worse",
            "> than none. README and the site remain unpopulated until every arm is",
            "> complete and `salvorbench verify` passes.",
            "",
        ]

    parts += [
        f"Model: `{summary.get('model')}` · generated {summary.get('generated_at')}",
        "",
        "Salvor arms measure the **recommended stack — Salvor + Serena + GitNexus —",
        "as a system**. They do not isolate Salvor core.",
        "",
    ]

    for group, arms, bench in (
        ("Single-agent — SWE-Bench-CL pytest curriculum", ("S1", "S2", "S3"),
         "Scored by the official SWE-bench harness against SWE-bench_Verified."),
        ("Two-agent — CooperBench flash", ("C1", "C2", "C3"),
         "Scored by CooperBench's own deterministic evaluator."),
    ):
        present = [a for a in arms if a in conds]
        if not present:
            continue
        parts += [f"## {group}", "", bench, ""]
        rows = []
        for a in present:
            d = conds[a]
            rate = d.get("success_rate")
            rows.append([
                f"**{a}** — {ARM_LABEL[a]}",
                f"{d['resolved']}/{d['evaluated']}" if d["evaluated"] else "—",
                f"{rate}%" if rate is not None else "—",
                f"${d['cost_usd']}",
                f"{d['wall_clock_s']:.0f}s",
                "yes" if d["complete"] else f"**no** ({d['completed']}/{d['expected']})",
            ])
        parts += [_table(rows, ["Arm", "Resolved", "Success rate", "Cost", "Wall clock", "Complete"]), ""]

    derived = summary.get("derived") or {}
    if derived:
        parts += ["## Derived comparisons", ""]
        for k, v in derived.items():
            parts.append(f"- `{k}`: **{v}**")
        parts += ["",
                  "`salvor_uplift_vs_stateless_pp` is a literal S3−S1 difference in",
                  "percentage points. It is deliberately **not** called forward transfer:",
                  "it does not match that metric's definition.", ""]

    integrity = summary.get("integrity") or {}
    parts += ["## Integrity", "",
              f"- cost ledger chain verified: **{integrity.get('ledger_chain_verified')}**",
              f"- run state chain verified: **{integrity.get('state_chain_verified')}**",
              f"- condition-correlated infra spread: {integrity.get('condition_correlated_infra_spread_pp')} pp"
              + (" — **WARNING: an arm may be a biased subsample**"
                 if integrity.get("condition_correlated_infra_warning") else ""),
              f"- total spend: **${(summary.get('spend') or {}).get('total_usd')}** "
              f"over {(summary.get('spend') or {}).get('units_billed')} billed units",
              ""]

    parts += ["## Disclosures", ""]
    for _, text in sorted((summary.get("disclosures") or {}).items()):
        parts.append(f"- {text}")
    parts += ["", "Full protocol, allow/deny source policy and every known deviation from",
              "upstream: [`METHODOLOGY.md`](../../METHODOLOGY.md).", ""]
    return "\n".join(parts)


def write(summary_path: Path, out: Path) -> Path:
    summary = json.loads(Path(summary_path).read_text())
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(render(summary))
    return out
