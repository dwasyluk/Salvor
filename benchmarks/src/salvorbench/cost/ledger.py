"""Hash-chained, append-only spend ledger.

Every billed agent invocation appends one line. Each line carries the sha256 of
its predecessor, so a published total can be re-walked and verified: an edited
or deleted entry breaks the chain. `salvorbench verify` re-walks it and refuses
to emit a summary if the chain is broken.

The aggregate head is written separately and atomically (`os.replace`) so a
resume is O(1) and a torn write can never lose the running total - but the
chain, not the head, is authoritative.
"""

from __future__ import annotations

import hashlib
import json
import os
from dataclasses import asdict
from decimal import Decimal
from pathlib import Path
from typing import Any

from .pricing import TokenUsage, cost_usd

GENESIS = "0" * 64


def _canonical(payload: dict[str, Any]) -> bytes:
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()


def _digest(prev: str, payload: dict[str, Any]) -> str:
    return hashlib.sha256(prev.encode() + _canonical(payload)).hexdigest()


class Ledger:
    def __init__(self, run_dir: Path) -> None:
        self.dir = Path(run_dir) / "cost"
        self.dir.mkdir(parents=True, exist_ok=True)
        self.path = self.dir / "ledger.jsonl"
        self.head_path = self.dir / "ledger-head.json"

    # ---- writing -------------------------------------------------------
    def append(
        self,
        *,
        unit_id: str,
        condition: str,
        phase: str,
        attempt: int,
        model: str,
        usage: TokenUsage,
        ts: str,
    ) -> Decimal:
        """Append one billed unit; returns the new cumulative total."""
        entries = self._read()
        prev = entries[-1]["sha256"] if entries else GENESIS
        seq = len(entries)
        cost = cost_usd(usage, model)
        cum = self.total() + cost

        payload = {
            "seq": seq,
            "ts": ts,
            "unit_id": unit_id,
            "condition": condition,
            "phase": phase,
            "attempt": attempt,
            "model": model,
            "tokens": asdict(usage),
            "cost_usd": str(cost),
            "cum_usd": str(cum),
            "prev_sha256": prev,
        }
        payload["sha256"] = _digest(prev, payload)

        with self.path.open("a") as fh:
            fh.write(json.dumps(payload, sort_keys=True) + "\n")
            fh.flush()
            os.fsync(fh.fileno())

        self._write_head({"seq": seq, "cum_usd": str(cum), "sha256": payload["sha256"]})
        return cum

    def _write_head(self, head: dict[str, Any]) -> None:
        tmp = self.head_path.with_suffix(".tmp")
        tmp.write_text(json.dumps(head, sort_keys=True))
        os.replace(tmp, self.head_path)

    # ---- reading -------------------------------------------------------
    def _read(self) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []
        out = []
        for line in self.path.read_text().splitlines():
            if line.strip():
                out.append(json.loads(line))
        return out

    def total(self) -> Decimal:
        entries = self._read()
        return Decimal(entries[-1]["cum_usd"]) if entries else Decimal(0)

    def total_for(self, *, condition: str | None = None, phase: str | None = None) -> Decimal:
        acc = Decimal(0)
        for e in self._read():
            if condition and e["condition"] != condition:
                continue
            if phase and e["phase"] != phase:
                continue
            acc += Decimal(e["cost_usd"])
        return acc

    def unit_costs(self, *, condition: str | None = None, phase: str | None = None) -> list[Decimal]:
        return [
            Decimal(e["cost_usd"])
            for e in self._read()
            if (condition is None or e["condition"] == condition)
            and (phase is None or e["phase"] == phase)
        ]

    def verify_chain(self) -> tuple[bool, str | None]:
        """Re-walk the chain. Returns (ok, first_failure_description)."""
        prev = GENESIS
        running = Decimal(0)
        for i, entry in enumerate(self._read()):
            stored = entry.get("sha256")
            payload = {k: v for k, v in entry.items() if k != "sha256"}
            if payload.get("prev_sha256") != prev:
                return False, f"entry {i} ({entry.get('unit_id')}): prev_sha256 mismatch"
            if _digest(prev, payload) != stored:
                return False, f"entry {i} ({entry.get('unit_id')}): content altered after write"
            running += Decimal(entry["cost_usd"])
            if Decimal(entry["cum_usd"]) != running:
                return False, f"entry {i} ({entry.get('unit_id')}): running total inconsistent"
            prev = stored
        return True, None
