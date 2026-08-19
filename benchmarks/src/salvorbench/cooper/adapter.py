"""C3 external agent adapter: upstream Claude Code + live shared Salvor brain.

Registered as ``salvor_claude_code`` via ``COOPERBENCH_EXTERNAL_AGENTS``.
The run path is upstream ``ClaudeCodeRunner`` UNMODIFIED — same command
builder, same instruction, same coop Redis wiring. C3 differs from C2 by
exactly two things, both applied here:

1. the task container starts from the state's T0 **brain image**
   (``salvorbench-brain:<state>``: pinned claude-code/serena/gitnexus +
   the bootstrapped brain + MCP registration at /tmp/claude-cfg), and
2. a per-pair Docker named volume is mounted over the knowledge layer
   (``.salvor`` and ``.serena/memories``) in BOTH agent containers —
   the disclosed benchmark transport for what a shared git branch
   provides in real use.

Volumes are seeded once per pair from the brain image itself (file lock;
marker file), and never reused across pairs — ``verify`` asserts both.
Nothing here reads task text or varies by task identity beyond resolving
which state's brain to attach.
"""

from __future__ import annotations

import fcntl
import json
import re
import subprocess
import threading
from pathlib import Path
from typing import Any

import cooperbench.agents.claude_code.adapter as _upstream
from cooperbench.agents.claude_code.adapter import ClaudeCodeRunner
from cooperbench.agents.registry import register

_LOCK_DIR = Path("/tmp/salvorbench-locks")
_CTX = threading.local()                       # per-run-thread mount context
_ORIG_BUILD_ENV = _upstream._build_environment

_KNOWLEDGE_MOUNTS = (
    # (volume suffix, container path)
    ("salvor", "/workspace/repo/.salvor"),
    ("serena-mem", "/workspace/repo/.serena/memories"),
)


def _patched_build_environment(image: str, **kwargs: Any):
    """Thread-local seam: swap image + append volume mounts for C3 runs only."""
    ctx = getattr(_CTX, "current", None)
    if ctx:
        extra = list(kwargs.get("extra_run_args") or [])
        extra.extend(ctx["mount_args"])
        kwargs["extra_run_args"] = extra
        image = ctx["image"]
    return _ORIG_BUILD_ENV(image, **kwargs)


_upstream._build_environment = _patched_build_environment


def _sh(cmd: list[str], timeout: int = 600) -> tuple[int, str]:
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    return p.returncode, (p.stdout + p.stderr).strip()


def _pair_from_log_dir(log_dir: str) -> tuple[str, int, str]:
    """Extract (repo, task_id, feature_str) from upstream's coop log path."""
    m = re.search(r"/coop/([^/]+)/(\d+)/(f\d+_f\d+)$", log_dir)
    if not m:
        raise RuntimeError(f"cannot derive pair identity from log_dir: {log_dir}")
    return m.group(1), int(m.group(2)), m.group(3)


def _brain_image(repo: str, task_id: int) -> str:
    return f"salvorbench-brain:{repo}-{task_id}"


def _volume_name(repo: str, task_id: int, feature_str: str, suffix: str) -> str:
    return f"salvorbench-c3-{repo}-{task_id}-{feature_str}-{suffix}".replace("_", "-")


def _ensure_seeded_volumes(repo: str, task_id: int, feature_str: str) -> list[str]:
    """Create + seed the pair's shared knowledge volumes (idempotent, locked).

    Seeds come from the state's brain image so both agents open the exact
    bytes the bootstrap snapshotted. Returns docker-run mount args.
    """
    image = _brain_image(repo, task_id)
    code, out = _sh(["docker", "image", "inspect", "--format", "{{.Id}}", image], 60)
    if code != 0:
        raise RuntimeError(f"brain image missing for C3: {image} — run build_brains first")

    _LOCK_DIR.mkdir(parents=True, exist_ok=True)
    # Setup-provisioning caches, NOT treatment: upstream's setup.sh reinstalls
    # the pinned claude-code inside its 600s exec budget, which a degraded
    # network can blow (observed: both smoke agents dead at exactly 600s,
    # zero inference). The warm npm cache (populated by the 20 bootstraps)
    # plus prefer_offline makes that reinstall local. Identical claude
    # version either way; agents never see these paths.
    mount_args: list[str] = [
        "-v", "salvorbench-npm-cache:/root/.npm",
        "-v", "salvorbench-apt-cache:/var/cache/apt/archives",
        "-e", "npm_config_prefer_offline=true",
    ]
    for suffix, cpath in _KNOWLEDGE_MOUNTS:
        vol = _volume_name(repo, task_id, feature_str, suffix)
        lock_path = _LOCK_DIR / f"{vol}.lock"
        with open(lock_path, "w") as lk:
            fcntl.flock(lk, fcntl.LOCK_EX)
            _sh(["docker", "volume", "create", vol], 60)
            # marker-guarded one-time seed from the brain image
            code, seeded = _sh([
                "docker", "run", "--rm", "--entrypoint", "/bin/bash",
                "-v", f"{vol}:/seed", image, "-c",
                f"if [ ! -f /seed/.salvorbench-seeded ]; then "
                f"  cp -a {cpath}/. /seed/ 2>/dev/null || true; "
                f"  echo '{image}' > /seed/.salvorbench-seeded; "
                f"  echo SEEDED; else echo ALREADY; fi"], 300)
            if code != 0:
                raise RuntimeError(f"volume seed failed for {vol}: {seeded[:300]}")
        mount_args.extend(["-v", f"{vol}:{cpath}"])
    return mount_args


def _stamp(log_dir: str | None, agent_id: str, base_image: str,
           brain_image: str, mount_args: list[str]) -> None:
    if not log_dir:
        return
    d = Path(log_dir)
    d.mkdir(parents=True, exist_ok=True)
    (d / f"salvor_condition_{agent_id}.json").write_text(json.dumps({
        "condition": "C3",
        "agent_id": agent_id,
        "base_image": base_image,
        "brain_image": brain_image,
        "shared_mounts": mount_args,
    }, indent=2))


@register("salvor_claude_code")
class SalvorClaudeCodeRunner(ClaudeCodeRunner):
    """Upstream run path; C3 image + shared-brain mounts applied via the seam."""

    def run(self, task: str, image: str, **kwargs: Any):
        log_dir = kwargs.get("log_dir")
        agent_id = kwargs.get("agent_id", "agent")
        if not log_dir:
            raise RuntimeError("salvor_claude_code requires log_dir for pair identity")
        repo, task_id, feature_str = _pair_from_log_dir(str(log_dir))
        brain = _brain_image(repo, task_id)
        mounts = _ensure_seeded_volumes(repo, task_id, feature_str)
        _stamp(str(log_dir), agent_id, image, brain, mounts)
        _CTX.current = {"image": brain, "mount_args": mounts}
        try:
            return super().run(task=task, image=image, **kwargs)
        finally:
            _CTX.current = None
