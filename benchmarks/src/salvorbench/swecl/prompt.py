"""Task instruction assembly.

The submission protocol is imported from CooperBench so both benchmarks ask for
a patch the same way. If the two diverged, a difference in submission compliance
would masquerade as a difference in capability.

What is deliberately NOT in the prompt: the curriculum's `hints_text`,
`modified_files` and `dependencies`. Those are metadata the official agent is not
meant to observe; including them would hand the agent a partial answer key.
"""

from __future__ import annotations

from .dataset import Task

try:  # upstream owns the submission wording
    from cooperbench.agents._coop.prompt import _SUBMISSION_BLOCK as SUBMISSION
except Exception:                                    # noqa: BLE001
    SUBMISSION = (
        "When you are done, write your complete diff to /workspace/repo/patch.txt "
        "with `git diff > patch.txt`."
    )


# Ported from upstream's AgentSolution structured output (eval_v2_agent.py:751-755):
# the same four fields, requested as a labeled final block since Claude Code has
# no with_structured_output. The write-back parser reads exactly these labels and
# applies upstream's own tests_passed inference heuristic to the agent's
# SELF-REPORTED status - never any external evaluator verdict.
FINAL_REPORT_BLOCK = (
    "After writing the patch, end your final message with this exact block:\n"
    "SOLUTION SUMMARY: <concise summary of the implemented solution>\n"
    "CODE CHANGES: <key code changes; file paths, one per line prefixed with '- '>\n"
    "TESTS PASSED STATUS: <status of tests after your solution, based on tests "
    "you ran yourself (e.g. 'All tests passed', 'Some tests failed', "
    "'Tests not run'); include details if tests failed>\n"
    "FINAL RATIONALE: <why this solution is correct>\n"
)


def build(task: Task, *, wrapped_problem: str | None = None,
          final_report: bool = False) -> str:
    """Assemble the instruction.

    ``wrapped_problem`` (S2) is the problem statement already wrapped by the
    ported ``build_context`` (statement + retrieved past experiences), matching
    upstream where the memory block frames the problem rather than trailing it.
    ``final_report`` (S2) appends the ported structured-output request that
    feeds the memory write-back.
    """
    parts = [wrapped_problem or task.problem_statement]
    parts.append(f"---\n\n{SUBMISSION}")
    if final_report:
        parts.append(FINAL_REPORT_BLOCK)
    return "\n\n".join(parts) + "\n"
