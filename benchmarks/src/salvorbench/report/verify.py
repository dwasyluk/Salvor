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
        # Deliberately NOT downgraded to a warning and never repaired by
        # rewriting the log: a tamper-evident record that gets edited to make
        # itself verify is worthless. A known-cause break is documented in the
        # report and still blocks publication.
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

    # Treatment discipline: every treated unit (S3/C3/T0) must start after
    # the TREATMENT_FROZEN event, and the frozen files must not have changed
    # between freeze and now (an intentional re-freeze appends a new event).
    _verify_treatment_freeze(run_dir, failures, warnings)

    missing = [a for a in ("S1", "S2", "S3", "C1", "C2", "C3") if a not in conditions]
    if missing:
        failures.append(f"arms not run: {', '.join(missing)}")

    if len({a for a in conditions}) and not summary.get("complete"):
        warnings.append("summary.complete is false - public surfaces must stay unpopulated")

    return (not failures), failures, warnings


def _verify_treatment_freeze(run_dir: Path, failures: list[str],
                             warnings: list[str]) -> None:
    import hashlib

    entries = StateLog(run_dir).read()
    freezes = [e for e in entries if e.get("kind") == "TREATMENT_FROZEN"]
    treated = [e for e in entries
               if e.get("event") == "unit_started"
               and str(e.get("unit_id", "")).split("/")[0] in ("S3", "C3", "t0")]
    if not treated:
        return
    if not freezes:
        failures.append("treated units ran with no TREATMENT_FROZEN event")
        return
    freeze = freezes[-1]
    first_treated = min(e["ts"] for e in treated)
    late_freezes = [f for f in freezes if f["ts"] > first_treated]
    if late_freezes:
        failures.append(
            "treatment re-frozen after treated units started "
            f"(first treated {first_treated})")
    if freeze["ts"] > first_treated:
        failures.append(
            f"TREATMENT_FROZEN ({freeze['ts']}) postdates first treated unit "
            f"({first_treated})")
    root = run_dir.parents[1]
    for rel, want in (freeze.get("files") or {}).items():
        p = (root / rel).resolve()
        if not p.exists():
            failures.append(f"frozen file missing: {rel}")
            continue
        got = hashlib.sha256(p.read_bytes()).hexdigest()
        if got != want:
            failures.append(f"frozen file changed since freeze: {rel}")


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
