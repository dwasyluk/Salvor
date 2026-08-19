"""Append-only, hash-chained run state.

`state.jsonl` is authoritative; `state.json` is a derived snapshot rewritten
atomically for O(1) resume. Unit IDs are deterministic (never UUIDs) so a resume
can match completed work by identity rather than by position.

The chain also underwrites the anti-leakage claim: because phase transitions are
recorded here and the log cannot be rewritten without breaking the chain,
"the brain was built before any task text existed" is a checkable property, not
an assertion in a README.
"""

from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any

GENESIS = "0" * 64


class Event(str, Enum):
    RUN_STARTED = "run_started"
    PHASE_STARTED = "phase_started"
    PHASE_FINISHED = "phase_finished"
    UNIT_STARTED = "unit_started"
    UNIT_FINISHED = "unit_finished"
    UNIT_EVALUATED = "unit_evaluated"
    UNIT_FAILED = "unit_failed"
    BRAIN_SNAPSHOTTED = "brain_snapshotted"
    SUBSET_FROZEN = "subset_frozen"
    BUDGET_HALT = "budget_halt"
    RUN_FINISHED = "run_finished"


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _canonical(payload: dict[str, Any]) -> bytes:
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()


class StateLog:
    def __init__(self, run_dir: Path) -> None:
        self.dir = Path(run_dir)
        self.dir.mkdir(parents=True, exist_ok=True)
        self.path = self.dir / "state.jsonl"
        self.snapshot_path = self.dir / "state.json"

    #: Keys owned by the chain itself. A caller field with one of these names
    #: would be signed at write time and stripped at verify time, producing a
    #: false tamper report - which is exactly how a real one would look, so the
    #: collision is refused rather than silently tolerated.
    RESERVED = ("sha256", "prev_sha256", "seq", "ts", "event")

    def append(self, event: Event, **fields: Any) -> dict[str, Any]:
        clash = sorted(set(fields) & set(self.RESERVED))
        if clash:
            raise ValueError(
                f"field name(s) {clash} are reserved by the state chain; "
                f"rename them (e.g. subset_sha256) so the digest stays verifiable"
            )
        entries = self.read()
        prev = entries[-1]["sha256"] if entries else GENESIS
        payload = {"seq": len(entries), "ts": utcnow(), "event": event.value, **fields}
        payload["prev_sha256"] = prev
        payload["sha256"] = hashlib.sha256(prev.encode() + _canonical(payload)).hexdigest()

        with self.path.open("a") as fh:
            fh.write(json.dumps(payload, sort_keys=True) + "\n")
            fh.flush()
            os.fsync(fh.fileno())

        self._snapshot(entries + [payload])
        return payload

    def read(self) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []
        return [json.loads(l) for l in self.path.read_text().splitlines() if l.strip()]

    def verify_chain(self) -> tuple[bool, str | None]:
        prev = GENESIS
        for i, entry in enumerate(self.read()):
            stored = entry.get("sha256")
            payload = {k: v for k, v in entry.items() if k != "sha256"}
            if payload.get("prev_sha256") != prev:
                return False, f"state entry {i}: prev_sha256 mismatch"
            if hashlib.sha256(prev.encode() + _canonical(payload)).hexdigest() != stored:
                return False, f"state entry {i}: content altered after write"
            prev = stored
        return True, None

    # ---- derived views -------------------------------------------------
    def units(self) -> dict[str, dict[str, Any]]:
        """Latest known state per unit id."""
        out: dict[str, dict[str, Any]] = {}
        for e in self.read():
            uid = e.get("unit_id")
            if not uid:
                continue
            out.setdefault(uid, {})
            out[uid].update({k: v for k, v in e.items() if k != "sha256"})
            out[uid]["last_event"] = e["event"]
        return out

    def phase_times(self) -> dict[str, dict[str, str]]:
        out: dict[str, dict[str, str]] = {}
        for e in self.read():
            if e["event"] in (Event.PHASE_STARTED.value, Event.PHASE_FINISHED.value):
                phase = e.get("phase", "?")
                key = "started_at" if e["event"] == Event.PHASE_STARTED.value else "finished_at"
                out.setdefault(phase, {})[key] = e["ts"]
        return out

    def _snapshot(self, entries: list[dict[str, Any]]) -> None:
        snap = {
            "seq": len(entries) - 1 if entries else -1,
            "updated_at": utcnow(),
            "head_sha256": entries[-1]["sha256"] if entries else GENESIS,
            "phases": self.phase_times(),
        }
        tmp = self.snapshot_path.with_suffix(".tmp")
        tmp.write_text(json.dumps(snap, indent=2, sort_keys=True))
        os.replace(tmp, self.snapshot_path)
