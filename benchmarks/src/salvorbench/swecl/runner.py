"""SWE-Bench-CL sequential runner (S1/S2/S3)."""

from __future__ import annotations

import importlib.resources as resources
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from ..agent.classify import Outcome, classify
from ..agent.invoke import (
    SWEBENCH_REPO_PATH,
    AgentRun,
    patch_touches_brain,
    run_in_container,
    swebench_setup_script,
)
from ..cost.pricing import TokenUsage
from . import prompt as prompt_mod
from .dataset import Task


def container_setup(*, brain: bool) -> str:
    """Upstream's Claude Code installer, plus our repo-root reconciliation.

    Upstream's script is used verbatim rather than reimplemented so the agent
    environment matches CooperBench's arms exactly - a different install path
    could change CLI version or tool availability between benchmarks.
    """
    try:
        upstream = (resources.files("cooperbench.agents.claude_code") / "setup.sh").read_text()
    except Exception:                                  # noqa: BLE001
        upstream = "#!/bin/bash\nset -e\nnpm install -g --silent @anthropic-ai/claude-code@latest\n"
    # Pin the CLI for EVERY S arm: cross-arm parity requires the version S1
    # actually ran (2.1.235, verified in its streams), and npm's moving
    # `latest` broke under amd64 emulation (native-binary postinstall).
    from ..brain.bootstrap import CLAUDE_CODE_PIN
    script = (f"export CLAUDE_CODE_VERSION={CLAUDE_CODE_PIN}\n"
              + upstream + "\n" + swebench_setup_script(brain=brain))
    if brain:
        from ..brain.bootstrap import (GITNEXUS_PIN, MCP_CONFIG,
                                       SERENA_PIN, TOOLS_INSTALL)
        import json as _json
        mcp = _json.dumps(MCP_CONFIG).replace("{repo}", SWEBENCH_REPO_PATH)
        script = (script + "\n"
                  + TOOLS_INSTALL.format(serena_pin=SERENA_PIN,
                                         gitnexus_pin=GITNEXUS_PIN)
                  + "\nmkdir -p /tmp/claude-cfg\n"
                  + "cat > /tmp/claude-cfg/.claude.json <<'SALVOR_MCP_EOF'\n"
                  + mcp + "\nSALVOR_MCP_EOF\n")
    return script


@dataclass
class TaskResult:
    task: Task
    condition: str
    run: AgentRun
    outcome: Outcome
    reason: str
    brain_paths_in_patch: list[str] = field(default_factory=list)
    memory_retrieved: int = 0
    memory_written: bool = False
    agent_reported_tests_passed: bool | None = None

    @property
    def unit_id(self) -> str:
        return f"{self.condition}/swecl/pytest/{self.task.position:02d}/{self.task.instance_id}"

    def to_dict(self) -> dict[str, Any]:
        u = self.run.usage
        return {
            "unit_id": self.unit_id,
            "condition": self.condition,
            "instance_id": self.task.instance_id,
            "position": self.task.position,
            "image": self.task.image,
            "outcome": self.outcome.value,
            "reason": self.reason,
            "elapsed_s": round(self.run.elapsed_s, 1),
            "patch_lines": len((self.run.patch or "").splitlines()),
            "brain_paths_in_patch": self.brain_paths_in_patch,
            "memory_retrieved": self.memory_retrieved,
            "memory_written": self.memory_written,
            "agent_reported_tests_passed": self.agent_reported_tests_passed,
            "tokens": {
                "input": u.input, "output": u.output,
                "cache_write_5m": u.cache_write_5m, "cache_write_1h": u.cache_write_1h,
                "cache_read": u.cache_read, "turns": u.turns,
                "source": u.source, "discrepancy_pct": u.discrepancy_pct,
            },
            "error": self.run.error,
            "meta": {k: v for k, v in self.run.meta.items()
                     if isinstance(v, (str, int, float, bool, type(None), list))},
        }


def run_task(
    task: Task,
    *,
    condition: str,
    model: str,
    run_dir: Path,
    max_turns: int,
    env_exports: dict[str, str],
    brain: bool = False,
    memory=None,
    pre_run=None,
    post_run=None,
    timeout_s: int = 7200,
) -> TaskResult:
    """Run one task to completion and classify the outcome.

    ``memory`` (S2 only): a ported SemanticMemory. Retrieval wraps the problem
    statement before the run; after the run the agent's self-reported final
    block is parsed and written back per the pinned upstream lifecycle. The
    external evaluator's verdict never touches it.
    """
    if memory is not None:
        from .memory import build_context
        retrieved = memory.retrieve_relevant(task.problem_statement)
        wrapped = build_context(task.problem_statement, retrieved)
        instruction = prompt_mod.build(task, wrapped_problem=wrapped,
                                       final_report=True)
    else:
        retrieved = []
        instruction = prompt_mod.build(task)
    unit_dir = run_dir / condition / f"{task.position:02d}-{task.instance_id}"

    run = run_in_container(
        image=task.image,
        instruction=instruction,
        model=model,
        run_dir=unit_dir,
        label="agent",
        repo_path=SWEBENCH_REPO_PATH,
        max_turns=max_turns,
        setup=container_setup(brain=brain),
        env_exports=env_exports,
        pre_run=pre_run,
        post_run=post_run,
        timeout_s=timeout_s,
    )

    stream_text = ""
    if run.stream_log and run.stream_log.exists():
        stream_text = run.stream_log.read_text(errors="replace")

    cls = classify(
        exit_code=run.exit_code,
        result_subtype=None,
        stream_text=stream_text,
        patch=run.patch,
        timed_out=run.timed_out,
        exception=run.error,
    )

    # A brain leaking into a scored patch would corrupt the score and the
    # comparison at once, so it is checked on every unit, not just Salvor arms.
    leaked = patch_touches_brain(run.patch)

    memory_written = False
    agent_reported_tests_passed = None
    if memory is not None:
        from .memory import entry_from_report, parse_final_report
        report = parse_final_report(_final_assistant_text(stream_text))
        content, tests_passed = entry_from_report(task.instance_id, report)
        memory.add_entry(task.instance_id, content, tests_passed=tests_passed)
        memory_written = True
        agent_reported_tests_passed = tests_passed

    return TaskResult(task=task, condition=condition, run=run,
                      outcome=cls.outcome, reason=cls.reason,
                      brain_paths_in_patch=leaked,
                      memory_retrieved=len(retrieved),
                      memory_written=memory_written,
                      agent_reported_tests_passed=agent_reported_tests_passed)


def _final_assistant_text(stream_text: str) -> str:
    """Concatenated text of the LAST assistant message in the stream."""
    import json as _json
    last = ""
    for line in stream_text.splitlines():
        try:
            ev = _json.loads(line)
        except Exception:                                   # noqa: BLE001
            continue
        if ev.get("type") == "assistant":
            texts = [b.get("text", "") for b in ev.get("message", {}).get("content", [])
                     if b.get("type") == "text"]
            if any(t.strip() for t in texts):
                last = "\n".join(texts)
    return last
