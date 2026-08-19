"""In-container multi-turn Claude Code driver.

Runs the CLI headless inside an existing container environment, resumes the
same session across turns (validated: `claude -p --resume <sid>` with a shared
CLAUDE_CONFIG_DIR preserves context), matches verbatim gates in each turn's
assistant text, and replies from the fixed script - with capture gates answered
by the ratifier callback.

This one mechanism serves both lifecycle points that need a scripted operator:
the T0 bootstrap (initial prompt = SETUP_PROMPT.md) and the S3 termination pass
(resume the WORKING session - the product-faithful author - and let it run the
standard termination checklist).
"""

from __future__ import annotations

import json
import shlex
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable

from ..cost.pricing import TokenUsage
from .gates import (GENERIC_APPROVAL, Gate, find_reply, match_capture_gate)

CLAUDE_CONFIG_DIR = "/tmp/claude-cfg"


@dataclass
class Turn:
    session_id: str | None
    assistant_text: str
    result_text: str
    stream_path: str
    usage: TokenUsage


@dataclass
class DriveResult:
    session_id: str | None
    turns: list[Turn] = field(default_factory=list)
    gates_answered: list[dict[str, Any]] = field(default_factory=list)
    terminal: bool = False
    error: str | None = None

    @property
    def usage(self) -> TokenUsage:
        t = TokenUsage()
        for turn in self.turns:
            u = turn.usage
            t = TokenUsage(input=t.input + u.input, output=t.output + u.output,
                           cache_write_5m=t.cache_write_5m + u.cache_write_5m,
                           cache_write_1h=t.cache_write_1h + u.cache_write_1h,
                           cache_read=t.cache_read + u.cache_read,
                           turns=t.turns + u.turns, source="assistant_sum")
        return t


def _claude_cmd(*, prompt_path: str, stream_path: str, cwd: str,
                resume: str | None, env_exports: str, max_turns: int) -> str:
    resume_flag = f"--resume {shlex.quote(resume)} " if resume else ""
    return (
        env_exports
        + f"export CLAUDE_CONFIG_DIR={shlex.quote(CLAUDE_CONFIG_DIR)}; "
        + "export IS_SANDBOX=1; export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1; "
        + f"mkdir -p {CLAUDE_CONFIG_DIR}; cd {shlex.quote(cwd)} && "
        + "claude --verbose --output-format=stream-json "
        + "--permission-mode=bypassPermissions "
        + f"--max-turns {int(max_turns)} "
        + resume_flag
        + f'--print -- "$(cat {shlex.quote(prompt_path)})" '
        + f"2>&1 | tee {shlex.quote(stream_path)}"
    )


def _parse_stream(raw: str) -> tuple[str | None, str, str, TokenUsage]:
    session_id, texts, result = None, [], ""
    seen: set[str] = set()
    i = o = w1 = rd = turns = 0
    for line in raw.splitlines():
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        etype = event.get("type")
        if etype == "system" and event.get("subtype") == "init":
            session_id = event.get("session_id") or session_id
        elif etype == "assistant":
            msg = event.get("message") or {}
            mid = msg.get("id")
            for block in msg.get("content") or []:
                if isinstance(block, dict) and block.get("type") == "text":
                    texts.append(block.get("text", ""))
            if mid and mid not in seen:
                seen.add(mid)
                u = msg.get("usage") or {}
                i += int(u.get("input_tokens", 0) or 0)
                o += int(u.get("output_tokens", 0) or 0)
                w1 += int(u.get("cache_creation_input_tokens", 0) or 0)
                rd += int(u.get("cache_read_input_tokens", 0) or 0)
                turns += 1
        elif etype == "result":
            result = event.get("result") or ""
            session_id = event.get("session_id") or session_id
    usage = TokenUsage(input=i, output=o, cache_write_1h=w1, cache_read=rd,
                       turns=turns, source="assistant_sum",
                       cache_write_attribution="assumed_1h")
    return session_id, "\n".join(texts), result, usage


def drive(
    env: Any,
    *,
    initial_prompt_path: str,
    cwd: str,
    gates: list[Gate],
    env_exports: dict[str, str],
    is_terminal: Callable[[Any], bool],
    on_capture_gate: Callable[[str, str], str] | None = None,
    max_outer_turns: int = 14,
    inner_max_turns: int = 120,
    turn_timeout: int = 3600,
    resume: str | None = None,
) -> DriveResult:
    """Run the gate loop until terminal, out of turns, or out of script.

    ``resume``: session id to resume on the FIRST turn — used by the S3
    termination pass so close-out runs inside the work session's own context.
    """
    exports = "".join(f"export {k}={shlex.quote(v)}; " for k, v in env_exports.items())
    result = DriveResult(session_id=resume)
    used: set[str] = set()
    nudges = 0
    prompt_path = initial_prompt_path

    for outer in range(max_outer_turns):
        stream_path = f"/tmp/drive-{uuid.uuid4().hex[:8]}.jsonl"
        cmd = _claude_cmd(prompt_path=prompt_path, stream_path=stream_path,
                          cwd=cwd, resume=result.session_id,
                          env_exports=exports, max_turns=inner_max_turns)
        try:
            env.execute({"command": cmd}, timeout=turn_timeout)
        except Exception as exc:                            # noqa: BLE001
            result.error = f"turn {outer}: {type(exc).__name__}: {exc}"
            return result
        from cooperbench.agents._coop.runtime import read_file_from_container
        raw = read_file_from_container(env, stream_path) or ""
        sid, text, final, usage = _parse_stream(raw)
        result.session_id = sid or result.session_id
        result.turns.append(Turn(sid, text, final, stream_path, usage))

        if is_terminal(env):
            result.terminal = True
            return result

        # Capture gates outrank script gates: they need a live decision.
        reply: str | None = None
        capture = match_capture_gate(text + "\n" + final)
        if capture and on_capture_gate:
            reply = on_capture_gate(capture, text + "\n" + final)
            result.gates_answered.append({"gate": f"capture:{capture}", "reply": reply})
        else:
            gate = find_reply(text + "\n" + final, gates, used)
            if gate:
                used.add(gate.name)
                reply = gate.reply
                result.gates_answered.append({"gate": gate.name, "reply": reply})
            else:
                # Any unmatched turn gets the fixed standing-policy reply.
                # Probe evidence: regex question-detection missed phrasings
                # like "Reply **yes** to scaffold" and "Which would you
                # like? (A is my recommendation...)", and the blind NUDGE
                # that fired instead pushed the agent into a commit attempt.
                # The generic reply carries every standing answer, so it is
                # always safe; the outer-turn budget bounds the loop.
                reply = GENERIC_APPROVAL
                nudges += 1
                result.gates_answered.append(
                    {"gate": f"generic_approval:{nudges}", "reply": reply})
                return result

        from cooperbench.agents._coop.runtime import write_file_in_container
        reply_path = f"/tmp/reply-{uuid.uuid4().hex[:8]}.txt"
        write_file_in_container(env, reply_path, reply)
        prompt_path = reply_path

    result.error = "max outer turns reached without terminal state"
    return result
