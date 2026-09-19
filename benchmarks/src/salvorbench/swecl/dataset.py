"""SWE-Bench-CL curriculum loading.

The curriculum is used for ORDERING, DIFFICULTY and DEPENDENCY metadata only.

It is deliberately NOT used for scoring. The upstream project is an abandoned
course artifact whose harness contains hardcoded simulated results, and its
`PASS_TO_PASS` lists carry parse artifacts (e.g. a literal "[100%]" entry).
Patches are scored by the official SWE-bench harness against its own dataset, so
nothing in this file can influence a score.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from pathlib import Path

PYTEST_SEQUENCE = "pytest-dev_pytest_sequence"


@dataclass(frozen=True)
class Task:
    position: int
    instance_id: str
    repo: str
    base_commit: str
    created_at: str
    difficulty: str
    difficulty_score: int
    problem_statement: str
    dependencies: tuple[str, ...]
    modified_files: tuple[str, ...]

    @property
    def image(self) -> str:
        """Official SWE-bench eval image for this instance.

        Naming follows swebench's own ImageSpec: `sweb.eval.{arch}.{id}`, with
        `__` rewritten to `_1776_` for the registry namespace. amd64 images are
        published under the `x86_64` label.
        """
        return f"swebench/sweb.eval.x86_64.{self.instance_id.replace('__', '_1776_')}:latest"


def load_sequence(curriculum: str | Path, sequence: str = PYTEST_SEQUENCE) -> list[Task]:
    data = json.loads(Path(curriculum).read_text())
    seq = next(
        s for s in data["sequences"]
        if (s.get("id") or s.get("repo")) == sequence
        or sequence.split("_")[0] in (s.get("id") or s.get("repo", ""))
    )
    tasks = [
        Task(
            position=t["continual_learning"]["sequence_position"],
            instance_id=t["metadata"]["instance_id"],
            repo=t["metadata"]["repo"],
            base_commit=t["metadata"]["base_commit"],
            created_at=t["metadata"]["created_at"],
            difficulty=t["metadata"].get("difficulty", ""),
            difficulty_score=t["continual_learning"].get("difficulty_score", 0),
            problem_statement=t["task"]["problem_statement"],
            dependencies=tuple(t["continual_learning"].get("dependencies") or ()),
            modified_files=tuple(t["continual_learning"].get("modified_files") or ()),
        )
        for t in seq["tasks"]
    ]
    # Upstream order verbatim. Never re-sorted by date: `sequence_position` is
    # difficulty-tiered and only chronological WITHIN a tier, and the continual
    # -learning metrics assume that ordering.
    return sorted(tasks, key=lambda t: t.position)


def curriculum_sha256(curriculum: str | Path) -> str:
    return hashlib.sha256(Path(curriculum).read_bytes()).hexdigest()


def manifest_block(curriculum: str | Path, tasks: list[Task]) -> dict:
    return {
        "repo": "github.com/thomasjoshi/agents-never-forget",
        "file": "data/SWE-Bench-CL-Curriculum.json",
        "sha256": curriculum_sha256(curriculum),
        "license": "MIT",
        "used_for": ["order", "difficulty", "dependencies"],
        "not_used_for": ["scoring", "test selection", "any published metric"],
        "scoring_note": (
            "Patches are scored by the official SWE-bench harness against its own "
            "dataset. The SWE-Bench-CL harness is never executed: it is abandoned "
            "and contains hardcoded simulated results."
        ),
        "order_policy": "upstream_sequence_position",
        "order_note": (
            "Difficulty-tiered, then chronological within tier - NOT globally "
            "chronological. Verified: positions 1-5 are all '<15 min fix' "
            "(2019-05..2020-06) while positions 17-19 are '1-4 hours' (2019-08..2022-10)."
        ),
        "tasks": [
            {
                "position": t.position,
                "instance_id": t.instance_id,
                "base_commit": t.base_commit,
                "created_at": t.created_at,
                "difficulty": t.difficulty,
                "image": t.image,
            }
            for t in tasks
        ],
    }
