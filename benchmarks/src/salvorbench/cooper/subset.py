"""Deterministic, outcome-blind CooperBench subset selection.

If measured cost forces a reduction, WHICH pairs get dropped must not depend on
how any arm performed - otherwise the published subset is a selection artifact
rather than a sample. Three properties make that checkable:

* Determinism: ranking is HMAC-SHA256 over a canonical pair key with a fixed
  literal seed baked into this file. No timestamp, no RNG, no operator input.
* Outcome-blindness: the only inputs are `flash.json`'s contents and that seed.
  This function cannot read a result even if asked to - nothing is plumbed in.
* Provability: the chosen list, its sha256, the seed and a `chosen_at` timestamp
  go into the manifest BEFORE any C-phase run, and `verify` asserts
  `chosen_at < min(C-phase started_at)`.

Stratification is round-robin over task states so every distinct
`(repo, task_id)` keeps at least one pair. That preserves repo diversity and
keeps the T0 bootstrap count at the number of distinct task states.
"""

from __future__ import annotations

import hashlib
import hmac
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

SEED = "salvorbench-flash-v1"      # fixed literal; changing it changes the sample
ALGORITHM_VERSION = 1


@dataclass(frozen=True, order=True)
class PairRef:
    repo: str
    task_id: int
    f1: int
    f2: int

    @property
    def state_key(self) -> str:
        """Pairs sharing this key share a base commit - and thus a T0 brain."""
        return f"{self.repo}/{self.task_id}"

    @property
    def canonical_key(self) -> bytes:
        return f"{self.repo}|{self.task_id}|{self.f1}|{self.f2}".encode()

    def to_dict(self) -> dict[str, Any]:
        return {"repo": self.repo, "task_id": self.task_id, "features": [self.f1, self.f2]}


def load_pairs(flash_json: str | Path) -> list[PairRef]:
    data = json.loads(Path(flash_json).read_text())
    pairs: list[PairRef] = []
    for task in data["tasks"]:
        for pair in task["pairs"]:
            a, b = sorted(int(x) for x in pair)   # unordered combination
            pairs.append(PairRef(task["repo"], int(task["task_id"]), a, b))
    return sorted(set(pairs))                      # canonical order, dedup


def _rank(pair: PairRef, seed: str = SEED) -> bytes:
    return hmac.new(seed.encode(), pair.canonical_key, hashlib.sha256).digest()


def choose(pairs: list[PairRef], n: int, seed: str = SEED) -> list[PairRef]:
    """Select `n` pairs, stratified round-robin by task state."""
    if n >= len(pairs):
        return sorted(pairs)

    by_state: dict[str, list[PairRef]] = {}
    for pair in sorted(pairs):
        by_state.setdefault(pair.state_key, []).append(pair)
    for state in by_state:
        by_state[state].sort(key=lambda p: _rank(p, seed))

    # States themselves are ordered by their best-ranked pair, so state order is
    # also seed-determined rather than dict- or filesystem-ordered.
    states = sorted(by_state, key=lambda s: _rank(by_state[s][0], seed))

    chosen: list[PairRef] = []
    depth = 0
    while len(chosen) < n:
        progressed = False
        for state in states:
            if len(chosen) >= n:
                break
            bucket = by_state[state]
            if depth < len(bucket):
                chosen.append(bucket[depth])
                progressed = True
        if not progressed:
            break
        depth += 1
    return sorted(chosen)


def manifest_block(chosen: list[PairRef], source: Path, full: int, chosen_at: str) -> dict:
    payload = [p.to_dict() for p in chosen]
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    return {
        "source": str(source),
        "source_sha256": hashlib.sha256(Path(source).read_bytes()).hexdigest(),
        "full_pairs": full,
        "chosen_n": len(chosen),
        "seed": SEED,
        "selection_algorithm_version": ALGORITHM_VERSION,
        "outcome_blind": True,
        "chosen_at": chosen_at,
        "sha256": hashlib.sha256(blob).hexdigest(),
        "distinct_task_states": len({p.state_key for p in chosen}),
        "pairs": payload,
    }
