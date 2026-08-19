"""The single agent-invocation path shared by all six arms.

Scaffold parity is the whole point. Every arm runs Claude Code headless with the
same flags, because the command string is built by CooperBench's own
``_build_claude_command`` - imported, never copied. If upstream changes a flag,
every arm changes together; a forked copy would let the arms drift apart
silently, and a drifted scaffold is indistinguishable from a treatment effect.

The SWE-Bench-CL runner needs the same shape as the CooperBench path, so it
reuses upstream's container primitives too (``build_environment``,
``write_file_in_container``, ``read_file_from_container``, ``normalize_patch``).
The only structural difference is the repository root: CooperBench images use
``/workspace/repo`` while SWE-bench images use ``/testbed``. That is reconciled
with a symlink inside the container rather than by forking the command builder.
"""

from __future__ import annotations

import shlex
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from cooperbench.agents._coop.runtime import (  # noqa: F401  (re-exported)
    CONTAINER_INSTRUCTION_PATH,
    CONTAINER_REPO_PATH,
    CONTAINER_SETUP_PATH,
    build_environment,
    normalize_patch,
    read_file_from_container,
    write_file_in_container,
)
from cooperbench.agents.claude_code.adapter import _build_claude_command

from ..cost.extract import extract
from ..cost.pricing import TokenUsage

CONTAINER_STREAM_LOG = "/tmp/claude-stream.jsonl"
SWEBENCH_REPO_PATH = "/testbed"


@dataclass
class AgentRun:
    """One agent invocation. A superset of CooperBench's AgentResult."""

    status: str
    patch: str | None
    usage: TokenUsage
    elapsed_s: float
    exit_code: int | None
    stream_log: Path | None
    timed_out: bool = False
    error: str | None = None
    meta: dict[str, Any] = field(default_factory=dict)


def build_command(
    *,
    instruction_path: str,
    model: str,
    stream_log_path: str = CONTAINER_STREAM_LOG,
    max_turns: int | None = None,
    settings_path: str | None = None,
    coop_env: dict[str, str] | None = None,
) -> str:
    """Compose the in-container command via upstream's builder.

    ``max_turns`` is passed through ``extra_flags`` exactly as the upstream
    adapter does, so the flag string is identical in every arm.
    """
    extra_flags = f"--max-turns {int(max_turns)} " if max_turns else ""
    return _build_claude_command(
        instruction_path,
        model,
        stream_log_path,
        extra_flags=extra_flags,
        coop_env=coop_env,
        settings_path=settings_path,
    )


def swebench_setup_script(*, brain: bool) -> str:
    """Container prep for a SWE-bench image.

    Two jobs: make upstream's hardcoded ``cd /workspace/repo`` valid inside an
    image whose checkout lives at ``/testbed``, and - for Salvor arms - keep the
    brain out of any submitted patch.

    The brain lives inside the working tree, so a patch that captured it would
    corrupt both the score and the comparison. ``.salvor/`` is left untracked by
    the bootstrap (which answers "no" to the commit offer), and `git diff` only
    reports tracked changes - but excluding it explicitly costs nothing and
    removes the failure mode entirely.
    """
    # Docker's `-w /workspace/repo` CREATES that path as an empty directory before
    # this script runs, so a `[ -e ] || ln -s` guard silently skips the symlink.
    # The agent then finds an empty dir, works in /testbed, and writes its patch to
    # the empty /workspace/repo - which harvest never reads. That failure is
    # invisible in the result: it looks exactly like an agent that solved nothing.
    # So replace an EMPTY directory, and only ever refuse if it has real content.
    lines = [
        "set -e",
        f"mkdir -p $(dirname {CONTAINER_REPO_PATH})",
        f'if [ -L {CONTAINER_REPO_PATH} ]; then :;',
        f'elif [ -d {CONTAINER_REPO_PATH} ] && [ -z "$(ls -A {CONTAINER_REPO_PATH} 2>/dev/null)" ]; then',
        f'  rmdir {CONTAINER_REPO_PATH} && ln -s {SWEBENCH_REPO_PATH} {CONTAINER_REPO_PATH};',
        f'elif [ ! -e {CONTAINER_REPO_PATH} ]; then',
        f'  ln -s {SWEBENCH_REPO_PATH} {CONTAINER_REPO_PATH};',
        f'else echo "REFUSING: {CONTAINER_REPO_PATH} exists with content" >&2; exit 1; fi',
        f'test "$(cd {CONTAINER_REPO_PATH} && pwd -P)" = "{SWEBENCH_REPO_PATH}"',
    ]
    if brain:
        lines += [
            f"cd {SWEBENCH_REPO_PATH}",
            "mkdir -p .git/info",
            "for p in .salvor .serena .gitnexus .gitnexusrc CLAUDE.md RULES.md AGENTS.md GEMINI.md; do",
            '  grep -qxF "$p" .git/info/exclude 2>/dev/null || echo "$p" >> .git/info/exclude',
            "done",
        ]
    return "\n".join(lines) + "\n"


def harvest(env: Any, *, repo_path: str, run_dir: Path, label: str) -> tuple[str | None, Path | None]:
    """Pull the submitted patch and the stream log out of the container."""
    run_dir.mkdir(parents=True, exist_ok=True)

    patch = None
    raw = None
    # The submission block names /workspace/repo; the SWE-bench checkout is
    # /testbed. These are the same path once the symlink is in place, but read
    # both so a plumbing regression surfaces as a patch rather than a silent zero.
    for candidate in (f"{repo_path}/patch.txt", f"{CONTAINER_REPO_PATH}/patch.txt"):
        raw = read_file_from_container(env, candidate)
        if raw is not None:
            break
    if raw is not None:
        patch = normalize_patch(raw)
        (run_dir / f"{label}.patch").write_text(patch)

    stream_path = None
    stream = read_file_from_container(env, CONTAINER_STREAM_LOG)
    if stream is not None:
        stream_path = run_dir / f"{label}.stream.jsonl"
        stream_path.write_text(stream)

    return patch, stream_path


def patch_touches_brain(patch: str | None) -> list[str]:
    """Return brain paths found in a submitted patch (must always be empty)."""
    if not patch:
        return []
    guarded = (".salvor/", ".serena/", ".gitnexus/", ".gitnexusrc")
    hits = []
    for line in patch.splitlines():
        if line.startswith(("diff --git", "+++ ", "--- ")):
            for g in guarded:
                if g in line and g not in hits:
                    hits.append(g)
    return hits


def run_in_container(
    *,
    image: str,
    instruction: str,
    model: str,
    run_dir: Path,
    label: str,
    repo_path: str = SWEBENCH_REPO_PATH,
    max_turns: int | None = None,
    setup: str | None = None,
    env_exports: dict[str, str] | None = None,
    timeout_s: int = 7200,
    platform: str = "linux/amd64",
) -> AgentRun:
    """Run one agent invocation to completion inside a fresh container."""
    started = time.monotonic()
    env = None
    try:
        env = build_environment(
            image,
            backend="docker",
            extra_run_args=["--platform", platform],
        )
        if setup:
            write_file_in_container(env, CONTAINER_SETUP_PATH, setup)
            env.execute({"command": f"bash {shlex.quote(CONTAINER_SETUP_PATH)}"}, timeout=600)

        write_file_in_container(env, CONTAINER_INSTRUCTION_PATH, instruction)

        exports = "".join(f"export {k}={shlex.quote(v)}; " for k, v in (env_exports or {}).items())
        command = exports + build_command(
            instruction_path=CONTAINER_INSTRUCTION_PATH,
            model=model,
            max_turns=max_turns,
        )

        timed_out = False
        exit_code: int | None = None
        try:
            result = env.execute({"command": command}, timeout=timeout_s)
            exit_code = getattr(result, "exit_code", None) if result is not None else None
        except Exception as exc:                      # noqa: BLE001
            if "timeout" in str(exc).lower():
                timed_out = True
            else:
                raise

        patch, stream_path = harvest(env, repo_path=repo_path, run_dir=run_dir, label=label)
        usage = extract(stream_path) if stream_path else TokenUsage()

        return AgentRun(
            status="completed" if not timed_out else "timeout",
            patch=patch,
            usage=usage,
            elapsed_s=time.monotonic() - started,
            exit_code=exit_code,
            stream_log=stream_path,
            timed_out=timed_out,
            meta={"image": image, "platform": platform, "repo_path": repo_path},
        )
    except Exception as exc:                          # noqa: BLE001
        return AgentRun(
            status="error", patch=None, usage=TokenUsage(),
            elapsed_s=time.monotonic() - started, exit_code=None, stream_log=None,
            error=f"{type(exc).__name__}: {exc}", meta={"image": image},
        )
    finally:
        if env is not None:
            try:
                env.cleanup()
            except Exception:                          # noqa: BLE001
                pass
