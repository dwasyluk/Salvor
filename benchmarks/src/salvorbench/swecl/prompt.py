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


def build(task: Task) -> str:
    return f"{task.problem_statement}\n\n---\n\n{SUBMISSION}\n"
