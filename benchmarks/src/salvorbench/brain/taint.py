"""Provenance-aware leakage audit (the ratified shingle scan).

Not a zero-hit gate: benchmark issue text legitimately quotes source code,
docstrings, error strings and README prose the brain is allowed to learn from.
Every 8-word shingle of a FUTURE task text found in the brain is traced:

* found verbatim in an allowed source (the repository checkout at the current
  base commit) -> ``allowed_source_overlap`` (cleared, reported)
* not traceable to an allowed source -> ``untraceable`` -> the leakage gate
  FAILS for that chain link.

The full report — including cleared overlaps — lands in brain provenance so a
reviewer sees what matched and why it was cleared.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Callable, Iterable

SHINGLE_WORDS = 8

_WORD = re.compile(r"[A-Za-z0-9_]+")


def normalize(text: str) -> list[str]:
    return [w.lower() for w in _WORD.findall(text)]


def shingles(text: str, n: int = SHINGLE_WORDS) -> set[tuple[str, ...]]:
    words = normalize(text)
    return {tuple(words[i:i + n]) for i in range(len(words) - n + 1)}


@dataclass
class Hit:
    task_id: str
    shingle: str
    brain_file: str
    traced: bool          # True -> found in an allowed source

    def to_dict(self) -> dict:
        return {"task_id": self.task_id, "shingle": self.shingle,
                "brain_file": self.brain_file,
                "verdict": "allowed_source_overlap" if self.traced else "untraceable"}


@dataclass
class TaintReport:
    hits: list[Hit] = field(default_factory=list)

    @property
    def untraceable(self) -> list[Hit]:
        return [h for h in self.hits if not h.traced]

    @property
    def passed(self) -> bool:
        return not self.untraceable

    def to_dict(self) -> dict:
        return {"passed": self.passed,
                "total_hits": len(self.hits),
                "allowed_source_overlaps": sum(1 for h in self.hits if h.traced),
                "untraceable": [h.to_dict() for h in self.untraceable],
                "hits": [h.to_dict() for h in self.hits]}


def scan(
    brain_files: dict[str, str],
    future_texts: dict[str, str],
    source_contains: Callable[[str], bool],
) -> TaintReport:
    """Scan brain content against future task texts.

    ``source_contains(phrase)`` answers whether the normalized phrase occurs in
    an allowed source (typically a repo-wide grep at the current base commit).
    """
    report = TaintReport()
    brain_shingles: dict[str, set[tuple[str, ...]]] = {
        path: shingles(text) for path, text in brain_files.items()}
    for task_id, text in future_texts.items():
        task_sh = shingles(text)
        if not task_sh:
            continue
        for path, bsh in brain_shingles.items():
            for sh in task_sh & bsh:
                phrase = " ".join(sh)
                report.hits.append(Hit(task_id, phrase, path,
                                       traced=source_contains(phrase)))
    return report


def container_source_contains(env, repo_path: str) -> Callable[[str], bool]:
    """An allowed-source oracle backed by a normalized grep over the checkout.

    Normalization mirrors ``normalize()``: the repo tree is flattened to
    lowercase word streams once, then phrase checks are substring lookups.
    """
    out = env.execute({"command":
        f"cd {repo_path} && git ls-files -z | xargs -0 cat 2>/dev/null | "
        "tr -c 'A-Za-z0-9_' ' ' | tr 'A-Z' 'a-z' | tr -s ' '"}, timeout=300)
    corpus = f" {(out.get('output') or '')} "

    def contains(phrase: str) -> bool:
        return f" {phrase} " in corpus
    return contains
