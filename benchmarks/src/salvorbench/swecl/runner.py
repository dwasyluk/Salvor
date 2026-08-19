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
    return upstream + "\n" + swebench_setup_script(brain=brain)


@dataclass
class TaskResult:
    task: Task
    condition: str
    run: AgentRun
    outcome: Outcome
    reason: str
    brain_paths_in_patch: list[str] = field(default_factory=list)

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
            "tokens": {
                "input": u.input, "output": u.output,
                "cache_write_5m": u.cache_write_5m, "cache_write_1h": u.cache_write_1h,
                "cache_read": u.cache_read, "turns": u.turns,
                "source": u.source, "discrepancy_pct": u.discrepancy_pct,
            },
            "error": self.run.error,
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
    timeout_s: int = 7200,
) -> TaskResult:
    """Run one task to completion and classify the outcome."""
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

    return TaskResult(task=task, condition=condition, run=run,
                      outcome=cls.outcome, reason=cls.reason,
                      brain_paths_in_patch=leaked)
