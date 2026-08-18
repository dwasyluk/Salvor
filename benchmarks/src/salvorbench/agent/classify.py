"""Failure classification.

The single most important distinction in the harness. A DETERMINISTIC BENCHMARK
FAILURE is a real, scored negative result - the agent ran and did not solve the
task. An INFRASTRUCTURE FAILURE is our problem, is retried, and is excluded from
denominators so it cannot masquerade as a capability difference.

Getting this backwards in either direction corrupts the comparison: retrying
genuine failures inflates scores, while scoring infra failures deflates whichever
arm happened to be unlucky.

Note what is NOT here: zero *usage* of an available tool. An arm that never calls
Serena is exhibiting valid model behaviour, recorded as telemetry. Only a server
that is absent, unreachable, or bound to the wrong repository is an infra fault.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum


class Outcome(str, Enum):
    BENCHMARK_FAILED = "benchmark_failed"      # real negative - never retried
    LIMITS_EXCEEDED = "limits_exceeded"        # real negative - turn budget is a constant
    INFRA_FAILED = "infra_failed"              # ours - retried, excluded from denominators
    COMPLETED = "completed"


@dataclass(frozen=True)
class Classification:
    outcome: Outcome
    reason: str
    detail: str = ""
    max_retries: int = 0
    abort_run: bool = False

    @property
    def scored(self) -> bool:
        return self.outcome in (Outcome.BENCHMARK_FAILED, Outcome.LIMITS_EXCEEDED,
                                Outcome.COMPLETED)


_INFRA_PATTERNS: tuple[tuple[str, str, int, bool], ...] = (
    # (regex, reason, max_retries, abort_run)
    (r"authentication_error|invalid[_ ]api[_ ]key|401\b", "auth", 1, True),
    (r"overloaded_error|529\b", "api_overloaded", 2, False),
    (r"rate_limit_error|429\b", "api_rate_limited", 2, False),
    (r"manifest unknown|pull access denied|no such image", "image_pull", 2, False),
    (r"Cannot connect to the Docker daemon|docker: error", "docker", 2, False),
    (r"Connection refused.*6379|redis.*(refused|timed out)", "redis", 2, False),
)


def classify(
    *,
    exit_code: int | None,
    result_subtype: str | None,
    stream_text: str,
    patch: str | None,
    timed_out: bool = False,
    mcp_health_ok: bool = True,
    exception: str | None = None,
) -> Classification:
    """Classify one attempt. Order matters: infra faults are checked first so a
    genuine crash is never recorded as the agent failing the task."""

    if not mcp_health_ok:
        # A Salvor arm whose servers never came up would produce a plausible,
        # publishable, WRONG null result. Fail loudly instead.
        return Classification(Outcome.INFRA_FAILED, "mcp_unavailable",
                              "required MCP server absent/unreachable at health check",
                              max_retries=1)

    haystack = f"{exception or ''}\n{stream_text[-20000:]}"
    for pattern, reason, retries, abort in _INFRA_PATTERNS:
        if re.search(pattern, haystack, re.IGNORECASE):
            return Classification(Outcome.INFRA_FAILED, reason, pattern,
                                  max_retries=retries, abort_run=abort)

    if timed_out:
        return Classification(Outcome.INFRA_FAILED, "timeout",
                              "container exceeded wall-clock limit", max_retries=1)

    if result_subtype and re.search(r"max_turns|limit|budget", result_subtype, re.IGNORECASE):
        # Turn limits are a fixed experimental condition, identical in every arm.
        # Exhausting them is a real negative, never retried and never relaxed.
        return Classification(Outcome.LIMITS_EXCEEDED, "limits_exceeded", result_subtype)

    if exit_code not in (0, None):
        return Classification(Outcome.INFRA_FAILED, "nonzero_exit",
                              f"exit={exit_code}", max_retries=1)

    if patch is not None and not patch.strip():
        # Agent ran to completion and produced nothing: a real failure.
        return Classification(Outcome.BENCHMARK_FAILED, "empty_patch",
                              "agent submitted no diff")

    return Classification(Outcome.COMPLETED, "completed")
