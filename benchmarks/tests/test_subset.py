"""Subset selection must be deterministic, stratified and outcome-blind."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from salvorbench.cooper.subset import PairRef, choose, load_pairs

# Mirrors flash.json's shape: 20 task states, 50 pairs, uneven per-state counts.
FIXTURE = {
    "name": "flash-fixture",
    "tasks": [
        {"repo": f"repo_{i}_task", "task_id": 1000 + i,
         "pairs": [[j, j + 1] for j in range(1, (i % 4) + 2)]}
        for i in range(20)
    ],
}


@pytest.fixture()
def flash(tmp_path: Path) -> Path:
    p = tmp_path / "flash.json"
    p.write_text(json.dumps(FIXTURE))
    return p


def test_load_is_canonical_and_deduped(flash: Path) -> None:
    pairs = load_pairs(flash)
    assert pairs == sorted(set(pairs))
    assert all(p.f1 < p.f2 for p in pairs)


def test_choice_is_deterministic(flash: Path) -> None:
    pairs = load_pairs(flash)
    assert choose(pairs, 25) == choose(pairs, 25)


def test_choice_does_not_depend_on_input_order(flash: Path) -> None:
    pairs = load_pairs(flash)
    assert choose(list(reversed(pairs)), 25) == choose(pairs, 25)


def test_every_task_state_survives_when_n_exceeds_state_count(flash: Path) -> None:
    pairs = load_pairs(flash)
    states = {p.state_key for p in pairs}
    chosen = choose(pairs, 25)
    assert {p.state_key for p in chosen} == states, "stratification must keep all states"


def test_smaller_n_nests_inside_larger_n(flash: Path) -> None:
    """Shrinking N must drop pairs, never swap them.

    This is what makes a cost-forced reduction defensible: a 20-pair run is a
    strict subset of the 25-pair run, so the two are directly comparable and the
    smaller sample cannot have been reshuffled into a different population.
    """
    pairs = load_pairs(flash)
    assert set(choose(pairs, 20)) <= set(choose(pairs, 25)) <= set(choose(pairs, 40))


def test_full_n_returns_everything(flash: Path) -> None:
    pairs = load_pairs(flash)
    assert choose(pairs, len(pairs)) == sorted(pairs)


def test_seed_change_changes_sample(flash: Path) -> None:
    pairs = load_pairs(flash)
    assert choose(pairs, 25) != choose(pairs, 25, seed="different-seed")
