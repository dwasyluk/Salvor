"""Curriculum loading must preserve upstream order and never leak into scoring."""
from __future__ import annotations

from pathlib import Path

import pytest

from salvorbench.swecl.dataset import load_sequence, manifest_block

CURRICULUM = Path(__file__).resolve().parents[1] / "vendor" / "swebench-cl-curriculum.json"
pytestmark = pytest.mark.skipif(not CURRICULUM.exists(), reason="curriculum not vendored")


@pytest.fixture(scope="module")
def tasks():
    return load_sequence(CURRICULUM)


def test_pytest_sequence_has_nineteen_tasks(tasks) -> None:
    assert len(tasks) == 19


def test_positions_are_contiguous_and_ordered(tasks) -> None:
    assert [t.position for t in tasks] == list(range(1, 20))


def test_order_is_tiered_not_globally_chronological(tasks) -> None:
    """Guards the manifest's order_note against a future 'helpful' re-sort."""
    dates = [t.created_at for t in tasks]
    assert dates != sorted(dates), (
        "upstream order is difficulty-tiered; if this ever sorts chronologically "
        "the sequence has been silently re-ordered"
    )
    assert tasks[0].difficulty == "<15 min fix"
    assert tasks[-1].difficulty == "1-4 hours"


def test_image_names_follow_swebench_convention(tasks) -> None:
    t = tasks[0]
    assert t.image.startswith("swebench/sweb.eval.x86_64.")
    assert "__" not in t.image.split("/", 1)[1], "registry names use _1776_ not __"
    assert "_1776_" in t.image


def test_every_task_has_a_distinct_base_commit(tasks) -> None:
    """Each S3 chain link must re-derive its GitNexus index for a new commit."""
    assert len({t.base_commit for t in tasks}) == 19


def test_manifest_declares_scoring_exclusion(tasks) -> None:
    block = manifest_block(CURRICULUM, tasks)
    assert "scoring" in block["not_used_for"]
    assert block["order_policy"] == "upstream_sequence_position"
    assert len(block["sha256"]) == 64
