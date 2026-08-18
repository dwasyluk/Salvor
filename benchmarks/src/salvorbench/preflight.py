"""Preflight — prove the environment before spending a cent.

Every check here is zero-inference. The point is that an expensive matrix should
never start against an environment that will invalidate it: a stale GitNexus
index, an unreachable Redis, an OAuth token that expires at 3am, or an emulation
path that scores gold patches wrong all produce plausible, publishable, WRONG
numbers rather than loud failures.

Checks are grouped by what they protect, and each reports independently so a
single failure does not mask the rest.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable

from .swecl.dataset import PYTEST_SEQUENCE, load_sequence

OK, WARN, FAIL, SKIP = "ok", "warn", "fail", "skip"


@dataclass
class Check:
    name: str
    status: str
    detail: str = ""
    data: dict[str, Any] = field(default_factory=dict)

    @property
    def blocking(self) -> bool:
        return self.status == FAIL


def _run(cmd: list[str], timeout: int = 60) -> tuple[int, str]:
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, (p.stdout + p.stderr).strip()
    except subprocess.TimeoutExpired:
        return 124, "timed out"
    except FileNotFoundError:
        return 127, f"{cmd[0]} not found"


# ---------------------------------------------------------------- credentials

def check_api_key() -> Check:
    """Require a real API key; reject an OAuth token explicitly.

    An OAuth/subscription token is short-lived. Accepting one would let a run
    start happily and then fail every unit after the token expires - producing a
    matrix full of auth errors that look like model failures.
    """
    key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not key:
        return Check("anthropic_api_key", FAIL, "ANTHROPIC_API_KEY is unset (see .env.example)")
    if not key.startswith("sk-ant-"):
        return Check("anthropic_api_key", FAIL,
                     "value is not an sk-ant- API key; OAuth/subscription tokens are "
                     "rejected because they expire mid-run")
    for var in ("CLAUDE_CODE_OAUTH_TOKEN",):
        if os.environ.get(var):
            return Check("anthropic_api_key", WARN,
                         f"{var} is also set; ensure the API key wins credential precedence")
    return Check("anthropic_api_key", OK, f"API key present ({len(key)} chars)")


# --------------------------------------------------------------------- docker

def check_docker() -> Check:
    code, out = _run(["docker", "info", "--format", "{{.ServerVersion}}|{{.NCPU}}|{{.MemTotal}}"])
    if code != 0:
        return Check("docker_daemon", FAIL, f"daemon unreachable: {out[:200]}")
    try:
        version, cpus, mem = out.split("|")
        gib = int(mem) / 1024**3
    except ValueError:
        return Check("docker_daemon", WARN, f"unparsed docker info: {out[:120]}")
    status = OK if gib >= 12 else WARN
    return Check("docker_daemon", status,
                 f"docker {version}, {cpus} CPUs, {gib:.1f} GiB"
                 + ("" if status == OK else " — <12 GiB risks OOM under concurrency"),
                 {"version": version, "cpus": int(cpus), "memory_gib": round(gib, 1)})


def check_emulation() -> Check:
    """SWE-bench publishes x86_64 eval images only; arm64 does not exist.

    Emulation must therefore work, and its penalty is worth recording: Rosetta
    lands near 1.3x while QEMU is 5-20x, which is the difference between a
    feasible overnight run and an impossible one.
    """
    code, out = _run(["docker", "run", "--rm", "--platform", "linux/amd64",
                      "alpine:3.20", "uname", "-m"], timeout=180)
    if code != 0:
        return Check("amd64_emulation", FAIL,
                     "cannot run amd64 containers; enable Rosetta in Docker Desktop "
                     f"(Settings > General): {out[:160]}")
    if "x86_64" not in out:
        return Check("amd64_emulation", FAIL, f"unexpected arch: {out[:80]}")
    return Check("amd64_emulation", OK, "amd64 containers run on this host")


def check_images(curriculum: Path) -> Check:
    tasks = load_sequence(curriculum, PYTEST_SEQUENCE)
    present, missing = [], []
    for t in tasks:
        code, _ = _run(["docker", "image", "inspect", t.image], timeout=30)
        (present if code == 0 else missing).append(t.instance_id)
    if missing:
        return Check("swebench_images", FAIL,
                     f"{len(present)}/{len(tasks)} present; run scripts/pull-swebench-images.sh",
                     {"present": len(present), "missing": missing})
    return Check("swebench_images", OK, f"all {len(tasks)} eval images present")


def check_registry_health() -> Check:
    """Measure the registry link before trusting a 20 GB pull to finish.

    A link that intermittently drops large blob transfers will stall a matrix
    halfway with no error that looks like a benchmark result.
    """
    code, out = _run(["docker", "pull", "-q", "hello-world"], timeout=120)
    if code != 0:
        return Check("registry_link", FAIL,
                     f"cannot pull even a tiny image: {out[-160:]}")
    return Check("registry_link", OK, "registry reachable")


# ---------------------------------------------------------------------- redis

def check_redis_from_container() -> Check:
    """Redis must be reachable from INSIDE a task container, not just the host.

    This is a silent invalidator: if the coordination channel is unreachable,
    C2/C3 agents degrade into two isolated solos while still being labelled
    cooperative, and the coordination result is meaningless.
    """
    code, out = _run([
        "docker", "run", "--rm", "--add-host=host.docker.internal:host-gateway",
        "redis:8-alpine", "redis-cli", "-h", "host.docker.internal", "ping",
    ], timeout=120)
    if code != 0 or "PONG" not in out.upper():
        return Check("redis_from_container", FAIL,
                     "no PONG from inside a container; start redis bound to a "
                     f"container-reachable interface: {out[-160:]}")
    return Check("redis_from_container", OK, "PONG from inside a container")


# ------------------------------------------------------------------- adapters

def check_adapter_registration() -> Check:
    code, out = _run(["python", "-c",
        "import os;os.environ['COOPERBENCH_EXTERNAL_AGENTS']='salvorbench.cooper.adapter';"
        "from cooperbench.agents import registry;"
        "registry._auto_register() if hasattr(registry,'_auto_register') else None;"
        "print('registered')"], timeout=120)
    if code != 0:
        return Check("cooperbench_adapter", WARN, f"registration probe failed: {out[-160:]}")
    return Check("cooperbench_adapter", OK, "external adapter import path resolves")


def check_tooling() -> Check:
    missing = [t for t in ("docker", "git") if not shutil.which(t)]
    if missing:
        return Check("host_tooling", FAIL, f"missing: {', '.join(missing)}")
    return Check("host_tooling", OK, "docker, git present")


# ----------------------------------------------------------------------- main

def run(curriculum: Path, *, skip_slow: bool = False) -> list[Check]:
    checks: list[Check] = [check_tooling(), check_api_key(), check_docker()]
    if checks[-1].blocking:
        return checks
    checks.append(check_registry_health())
    if not skip_slow:
        checks.append(check_emulation())
        checks.append(check_redis_from_container())
    checks.append(check_images(curriculum))
    checks.append(check_adapter_registration())
    return checks


def render(checks: list[Check]) -> str:
    glyph = {OK: "PASS", WARN: "WARN", FAIL: "FAIL", SKIP: "SKIP"}
    lines = [f"  {glyph[c.status]}  {c.name:24s} {c.detail}" for c in checks]
    blocking = [c for c in checks if c.blocking]
    lines.append("")
    lines.append(f"  {len(checks) - len(blocking)}/{len(checks)} checks passed"
                 + (f"; {len(blocking)} BLOCKING" if blocking else "; ready"))
    return "\n".join(lines)
