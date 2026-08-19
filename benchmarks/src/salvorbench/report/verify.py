"""Completeness and integrity verification.

Answers one question: may these numbers be published? It is deliberately
adversarial toward its own run - `expected` counts come from the manifest, never
from what happened to execute, so a short run cannot redefine success as
whatever it achieved.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from ..cost.ledger import Ledger
from ..state.log import StateLog


def verify(run_dir: Path, summary: dict[str, Any]) -> tuple[bool, list[str], list[str]]:
    """Return (publishable, failures, warnings)."""
    failures: list[str] = []
    warnings: list[str] = []

    ok, err = Ledger(run_dir).verify_chain()
    if not ok:
        failures.append(f"cost ledger chain broken: {err}")
    ok, err = StateLog(run_dir).verify_chain()
    if not ok:
        failures.append(f"run state chain broken: {err}")

    conditions = summary.get("conditions") or {}
    if not conditions:
        failures.append("no conditions recorded")

    for arm, data in conditions.items():
        if data["completed"] != data["expected"]:
            failures.append(
                f"{arm}: {data['completed']}/{data['expected']} completed")
        if data["evaluated"] != data["expected"]:
            failures.append(
                f"{arm}: {data['evaluated']}/{data['expected']} evaluated")
        if data["infra_errors"]:
            warnings.append(f"{arm}: {data['infra_errors']} infrastructure errors")

    integrity = summary.get("integrity") or {}
    if integrity.get("condition_correlated_infra_warning"):
        failures.append(
            "infrastructure failures are condition-correlated "
            f"({integrity.get('condition_correlated_infra_spread_pp')} pp spread) - "
            "at least one arm is a biased subsample")

    missing = [a for a in ("S1", "S2", "S3", "C1", "C2", "C3") if a not in conditions]
    if missing:
        failures.append(f"arms not run: {', '.join(missing)}")

    if len({a for a in conditions}) and not summary.get("complete"):
        warnings.append("summary.complete is false - public surfaces must stay unpopulated")

    return (not failures), failures, warnings


def render(publishable: bool, failures: list[str], warnings: list[str]) -> str:
    lines = []
    for f in failures:
        lines.append(f"  FAIL  {f}")
    for w in warnings:
        lines.append(f"  WARN  {w}")
    lines.append("")
    lines.append("  PUBLISHABLE — every arm complete and every chain verified"
                 if publishable else
                 "  NOT PUBLISHABLE — results may not reach README or the site")
    return "\n".join(lines)
