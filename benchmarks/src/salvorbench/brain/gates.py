"""Verbatim gate matchers for the scripted operator.

Matchers key on the exact prompt strings the shipped v1.0.0-beta SETUP_PROMPT
and RULES instruct the agent to ask. Replies are fixed (the deterministic
PROCESS); capture-gate replies are supplied by the ratifier at decision time
(the reviewer). Nothing here varies by task identity.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Callable

# The three §2/§7 capture gates - routed to the ratifier, never auto-answered.
CAPTURE_GATES: tuple[tuple[str, re.Pattern], ...] = (
    ("design_decision", re.compile(r"Record this as a design decision\?\s*\(yes/no\)")),
    ("domain_learning", re.compile(r"Save this as a domain learning\?\s*\(yes/no\)")),
    ("deferred_finding", re.compile(r"Log this to \.salvor/DEFERRED_TODOS\.md\?\s*\(yes/no\)")),
)


@dataclass(frozen=True)
class Gate:
    name: str
    pattern: re.Pattern
    reply: str
    once: bool = True


def setup_gates(project_name: str, stack_hint: str) -> list[Gate]:
    """The fixed script for driving SETUP_PROMPT.md, in match-priority order."""
    return [
        Gate("step1_questions",
             re.compile(r"Enable Optional Strict Engineering Defaults\?", re.I),
             f"1. Project name: {project_name}\n"
             f"2. Components: single component `root` — {stack_hint}\n"
             f"3. Paired paths that must stay in sync: none\n"
             f"4. Enable Optional Strict Engineering Defaults: no — this repository "
             f"already owns its release/version tooling.\n"
             f"For the existing-knowledge inventory: review now."),
        Gate("knowledge_adoption",
             re.compile(r"knowledge-adoption analysis now|review now.*deferred by operator", re.I | re.S),
             "Review now."),
        Gate("plan_approval",
             re.compile(r"Wait for my approval of the plan|approval of the plan, then scaffold", re.I),
             "Approved. Proceed with the plan exactly as presented."),
        Gate("gitnexus_option",
             re.compile(r"Option A[^\n]{0,80}(index|Pure index)", re.I),
             "Option A."),
        Gate("commit_offer",
             re.compile(r"Would you like me to stage only the Salvor-related", re.I),
             "No — leave the files uncommitted."),
    ]


NUDGE = "Continue with the setup exactly as specified. Do not wait for further input beyond the answers already given."
MAX_NUDGES = 2


def match_capture_gate(text: str) -> str | None:
    for name, pattern in CAPTURE_GATES:
        if pattern.search(text):
            return name
    return None


def find_reply(text: str, gates: list[Gate], used: set[str]) -> Gate | None:
    for gate in gates:
        if gate.once and gate.name in used:
            continue
        if gate.pattern.search(text):
            return gate
    return None
