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


def test_empty_memory_appends_only_the_end_marker() -> None:
    # Upstream appends the end marker even with zero retrieved memories
    # (the marker sits outside the `if retrieved_memories:` block) — the
    # port preserves that quirk rather than silently "fixing" upstream.
    assert build_context("PROMPT", []) == "PROMPT\n--- End of Past Experiences ---\n"


def test_parse_final_report_extracts_all_four_fields() -> None:
    from salvorbench.swecl.memory import parse_final_report
    r = parse_final_report(
        "done.\nSOLUTION SUMMARY: s\nCODE CHANGES:\n- a.py: x\n"
        "TESTS PASSED STATUS: All tests passed\nFINAL RATIONALE: because")
    assert r == {"SOLUTION SUMMARY": "s",
                 "CODE CHANGES": "- a.py: x",
                 "TESTS PASSED STATUS": "All tests passed",
                 "FINAL RATIONALE": "because"}


def test_infer_tests_passed_is_upstream_verbatim() -> None:
    from salvorbench.swecl.memory import infer_tests_passed
    assert infer_tests_passed("All tests passed")
    assert infer_tests_passed("everything passed cleanly")
    assert not infer_tests_passed("14 passed, 2 failed")     # 'failed' wins
    assert not infer_tests_passed("Tests not run")
    assert not infer_tests_passed("")


def test_entry_from_report_success_and_attempt_labels() -> None:
    from salvorbench.swecl.memory import entry_from_report
    ok, passed = entry_from_report("t1", {"TESTS PASSED STATUS": "All tests passed",
                                          "SOLUTION SUMMARY": "s"})
    assert passed and ok.startswith("[SUCCESSFUL SOLUTION] for Task t1:")
    att, failed = entry_from_report("t2", {"TESTS PASSED STATUS": "Some tests failed"})
    assert not failed and att.startswith("[ATTEMPTED SOLUTION] for Task t2:")


def test_missing_report_becomes_attempted_entry() -> None:
    # An agent that never emits the block still gets an entry (upstream's
    # .get defaults) labeled ATTEMPTED - memory write is unconditional.
    from salvorbench.swecl.memory import entry_from_report, parse_final_report
    content, passed = entry_from_report("t3", parse_final_report("no block at all"))
    assert not passed
    assert content.startswith("[ATTEMPTED SOLUTION] for Task t3:")
