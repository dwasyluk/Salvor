"""The S2 port must match upstream's retention policy, not the plan's shorthand."""
from __future__ import annotations

from salvorbench.swecl.memory import (
    ATTEMPT_PREFIX, K_RESULTS, SUCCESS_PREFIX, build_context, format_entry,
)


def test_attempted_solutions_are_retained_not_discarded() -> None:
    """Upstream stores failures too; 'write-on-success' would be a deviation."""
    failed = format_entry("t1", summary="s", rationale="r", code_changes=["c"],
                          tests_passed=False)
    assert failed.startswith(ATTEMPT_PREFIX)
    assert "Solution Summary: s" in failed


def test_successful_solutions_carry_the_success_label() -> None:
    ok = format_entry("t2", summary="s", rationale="r", code_changes=["c"],
                      tests_passed=True)
    assert ok.startswith(SUCCESS_PREFIX)


def test_upstream_k_default_is_three() -> None:
    assert K_RESULTS == 3


def test_context_framing_matches_upstream_shape() -> None:
    ctx = build_context("PROMPT", [{"task_id": "t1", "content": "C", "score": 0.5}])
    assert "Relevant Past Experiences (from Semantic Memory)" in ctx
    assert "End of Past Experiences" in ctx
    assert ctx.startswith("PROMPT")


def test_empty_memory_leaves_the_prompt_untouched() -> None:
    assert build_context("PROMPT", []) == "PROMPT"
