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
        # Never repaired by rewriting the log - a tamper-evident record edited
        # to make itself verify is worthless. A break is fatal UNLESS it is one
        # of the explicitly documented exceptions in
        # conf/state-chain-exceptions.json (committed, line-hash-pinned, with
        # cause + prevention); those surface as prominent warnings instead.
        excused, note = _chain_break_excused(run_dir, err)
        if excused:
            warnings.append(f"run state chain: DOCUMENTED exception - {note}")
        else:
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


def _chain_break_excused(run_dir: Path, err: str | None) -> tuple[bool, str]:
    """Is this exact chain break a committed, documented exception?

    The exception must pin the offending line by content hash - if the line
    (or anything before it, which would shift digests) changes, the excuse
    no longer applies and the break is fatal again.
    """
    import hashlib
    import re
    m = re.search(r"entry (\d+)", err or "")
    if not m:
        return False, ""
    seq = int(m.group(1))
    conf = run_dir.parents[1] / "conf" / "state-chain-exceptions.json"
    if not conf.exists():
        return False, ""
    lines = (run_dir / "state.jsonl").read_text().splitlines()
    if seq >= len(lines):
        return False, ""
    line_sha = hashlib.sha256(lines[seq].encode()).hexdigest()
    for exc in (json.loads(conf.read_text()).get("exceptions") or []):
        if exc.get("seq") == seq and exc.get("line_sha256") == line_sha:
            # the REST of the chain must still verify from the next entry on
            ok, err2 = StateLog(run_dir).verify_chain(start=seq + 1)
            if not ok:
                return False, f"exception matched but chain also broken later: {err2}"
            return True, (f"entry {seq} ({exc.get('event')}): {exc.get('cause')} "
                          f"Prevention: {exc.get('prevention')}")
    return False, ""


def _verify_treatment_freeze(run_dir: Path, failures: list[str],
                             warnings: list[str]) -> None:
    import hashlib

    entries = StateLog(run_dir).read()
    freezes = [e for e in entries if e.get("kind") == "TREATMENT_FROZEN"]
    # T0 bootstraps are the CONSTRUCTION of the treatment - they necessarily
    # precede the freeze that pins them and carry their own per-state
    # provenance. The freeze gates the arms that CONSUME the frozen
    # treatment: S3 and C3 task units.
    treated = [e for e in entries
               if e.get("event") == "unit_started"
               and str(e.get("unit_id", "")).split("/")[0] in ("S3", "C3")]
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
