"""Per-arm MCP namespace enforcement.

Every MCP tool call in Claude Code's stream-json is namespaced
``mcp__<server>__<tool>``. That naming is what makes per-arm isolation checkable
after the fact from an artifact, rather than trusted at configuration time.

Two things this module deliberately does NOT do:

* It does not treat "MCP present" as a violation. S2 is the ported
  semantic-memory arm; its ``mcp__clmem__*`` server IS the treatment.
* It does not require utilisation. An arm with a healthy, reachable server that
  the model simply chose not to call is valid behaviour - recorded, never failed.
  Forcing a call to satisfy an assertion would bias the very thing we measure.
"""

from __future__ import annotations

import fnmatch
import json
import re
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

TOOL_CALL_RE = re.compile(r"mcp__([A-Za-z0-9_.-]+)__([A-Za-z0-9_.-]+)")


@dataclass
class NamespaceReport:
    arm: str
    calls: Counter = field(default_factory=Counter)
    violations: list[str] = field(default_factory=list)

    @property
    def total_calls(self) -> int:
        return sum(self.calls.values())

    @property
    def compliant(self) -> bool:
        return not self.violations

    def to_dict(self) -> dict[str, Any]:
        return {
            "arm": self.arm,
            "mcp_calls_by_namespace": dict(self.calls),
            "mcp_calls_total": self.total_calls,
            "violations": self.violations,
            "compliant": self.compliant,
        }


def _matches_any(name: str, patterns: list[str]) -> bool:
    return any(fnmatch.fnmatch(name, p) for p in patterns)


def observed_namespaces(stream_log: str | Path) -> Counter:
    """Count MCP tool calls per ``mcp__<server>__`` namespace."""
    path = Path(stream_log)
    if not path.exists():
        return Counter()
    counts: Counter = Counter()
    for line in path.read_text(errors="replace").splitlines():
        if "mcp__" not in line:
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        # Only count actual tool *invocations*, not incidental text mentions.
        for match in TOOL_CALL_RE.finditer(json.dumps(event.get("message", event))):
            server = match.group(1)
            if _is_invocation(event, match.group(0)):
                counts[f"mcp__{server}__*"] += 1
    return counts


def _is_invocation(event: dict[str, Any], full_name: str) -> bool:
    content = (event.get("message") or {}).get("content")
    if isinstance(content, list):
        for block in content:
            if isinstance(block, dict) and block.get("type") == "tool_use" \
               and block.get("name") == full_name:
                return True
    return False


def check(arm: str, policy: dict[str, Any], stream_log: str | Path) -> NamespaceReport:
    """Validate one run's observed namespaces against its arm's policy."""
    arm_policy = policy["arms"][arm]
    allowed = list(arm_policy.get("allowed") or [])
    forbidden = list(arm_policy.get("forbidden") or [])

    report = NamespaceReport(arm=arm, calls=observed_namespaces(stream_log))
    for namespace in report.calls:
        if _matches_any(namespace, forbidden):
            report.violations.append(
                f"{namespace} is forbidden in {arm} ({arm_policy.get('label', arm)})"
            )
        elif allowed and not _matches_any(namespace, allowed):
            report.violations.append(
                f"{namespace} is not in {arm}'s allowed set {allowed}"
            )
        elif not allowed:
            report.violations.append(
                f"{namespace} observed in {arm}, which permits no MCP namespaces"
            )
    return report
