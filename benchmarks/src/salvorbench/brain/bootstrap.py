"""T0 brain bootstrap — deterministic process, repository-derived content.

Drives the shipped v1.0.0-beta SETUP_PROMPT.md inside a task container through
the scripted operator (fixed answers; adoption approvals via the ratifier), then
snapshots the resulting brain as a docker image + tarball with full provenance.

Invariant the operator ratified, restated where the code lives: nothing in this
module or its callers maps task identity to memory content. The same procedure
runs for every task state; what differs is only the repository it reads.
"""

from __future__ import annotations

import hashlib
import json
import shlex
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from cooperbench.agents._coop.runtime import (
    build_environment,
    read_file_from_container,
    write_file_in_container,
)

from ..state.log import utcnow
from .driver import CLAUDE_CONFIG_DIR, DriveResult, drive
from .gates import setup_gates
from .ratifier import RUBRIC_SHA256, Ratifier

MODEL = "claude-sonnet-5"   # identical to every benchmark arm (ANTHROPIC_MODEL, upstream mechanism)
CLAUDE_CODE_PIN = "2.1.235"  # exact CLI version observed in every C1/C2 unit stream (init event)
SERENA_PIN = "1.1.0"        # matches the host / beta-documented install
GITNEXUS_PIN = "1.6.9"      # verified --index-only support
KNOWLEDGE_LAYER = (".salvor", ".serena/memories", "CLAUDE.md", "RULES.md",
                   "AGENTS.md", "GEMINI.md", ".gitnexusrc")

TOOLS_INSTALL = """\
set -ex
export PATH="$HOME/.local/bin:$PATH"
# uv (for serena): a PRESENT uv can still be broken (go_chi ships one whose
# ELF interpreter is missing), so select by EXECUTION not presence. Cache is
# keyed by arch+libc; the astral installer picks the right musl/gnu build.
ARCH=$(uname -m)
LIBC=$(ls /lib/ld-musl-* >/dev/null 2>&1 && echo musl || echo gnu)
CACHED="/opt/uvbin/uv-$ARCH-$LIBC"
if ! uv --version >/dev/null 2>&1; then
  if [ -x "$CACHED" ] && "$CACHED" --version >/dev/null 2>&1; then
    cp "$CACHED" /usr/local/bin/uv
  else
    curl -LSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
    mkdir -p /opt/uvbin && cp "$(command -v uv)" "$CACHED" || true
  fi
fi
uv --version
export PATH="$HOME/.local/bin:$PATH"
# Native builds happen twice here: psutil (serena dep; no musl wheel) and
# gitnexus's node module (node-gyp wants gcc/g++/make on every libc).
if [ "$LIBC" = musl ] && command -v apk >/dev/null 2>&1; then
  apk add gcc g++ make python3-dev musl-dev linux-headers
elif ! command -v make >/dev/null 2>&1; then
  apt-get install -y --no-install-recommends make g++ 2>/dev/null || \
    yum install -y make gcc-c++ 2>/dev/null || true
fi
command -v serena >/dev/null 2>&1 || uv tool install "serena-agent=={serena_pin}"
command -v gitnexus >/dev/null 2>&1 || npm install -g "gitnexus@{gitnexus_pin}"
serena --version >/dev/null 2>&1 || true
gitnexus --version
"""

MCP_CONFIG = {
    "mcpServers": {
        "serena": {"type": "stdio", "command": "bash",
                   "args": ["-lc", "PATH=$HOME/.local/bin:$PATH serena start-mcp-server --context claude-code --project {repo}"]},
        "gitnexus": {"type": "stdio", "command": "bash",
                     "args": ["-lc", "PATH=$HOME/.local/bin:$PATH gitnexus mcp"]},
    }
}

TERMINAL_CHECK = """\
set -e
cd {repo}
test -f .salvor/README.md
grep -q '^Salvor-Protocol:' .salvor/README.md
test -f CLAUDE.md && test -f RULES.md
test -f .salvor/active_state.md && test -f .salvor/active_state_verbose.md
test -f .salvor/DOMAIN_REF.md && test -f .salvor/INFRA.md
test -d .salvor/decisions && test -d .salvor/domain-learnings
test -f .gitnexusrc
echo TERMINAL_OK
"""

USEFULNESS_PROMPT = """\
Answer the following using ONLY the repository's Salvor brain (.salvor/, CLAUDE.md, \
RULES.md) and Serena memories (.serena/memories/). For each answer, cite the exact \
brain file path(s) that informed it. If the brain cannot answer one, say so.

1. How are this project's tests run?
2. What are the main modules/components and what does each own?
3. What conventions or constraints should a contributor know before editing?
"""


@dataclass
class BootstrapResult:
    state_key: str
    ok: bool
    image: str | None = None
    brain_sha256: str | None = None
    tarball: Path | None = None
    drive: DriveResult | None = None
    usefulness: str = ""
    usefulness_ok: bool = False
    error: str | None = None
    probe_usage: Any = None          # TokenUsage of the usefulness probe
    probe_usage_total: int = 0
    elapsed_s: float = 0.0
    provenance_path: Path | None = None
    ratifier_decisions: int = 0


def _sh(cmd: list[str], timeout: int = 600) -> tuple[int, str]:
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    return p.returncode, (p.stdout + p.stderr).strip()


def bootstrap_state(
    *,
    state_key: str,
    image: str,
    repo_path: str,
    setup_prompt: Path,
    out_dir: Path,
    api_key: str,
    project_name: str,
    stack_hint: str | None = None,
    platform: str | None = None,
    claude_code_setup: str | None = None,
    max_outer_turns: int = 14,
) -> BootstrapResult:
    """Bootstrap one task state and snapshot the result."""
    started = time.monotonic()
    out_dir.mkdir(parents=True, exist_ok=True)
    result = BootstrapResult(state_key=state_key, ok=False)
    ratifier = Ratifier(out_dir / "ratifier")
    env = None
    structural = None
    try:
        # Shared package caches across bootstraps: the fleet downloads each
        # package once instead of 20 times over a possibly-degraded network.
        # Volumes are never captured by docker commit, so brain images stay
        # clean; cache state is infrastructure, identical for every state.
        extra = ["-v", "salvorbench-uv-cache:/root/.cache/uv",
                 "-v", "salvorbench-npm-cache:/root/.npm",
                 "-v", "salvorbench-apt-cache:/var/cache/apt/archives",
                 "-v", "salvorbench-uvbin-cache:/opt/uvbin",
                 "-v", "salvorbench-nodegyp-cache:/root/.cache/node-gyp"]
        if platform:
            extra = ["--platform", platform, *extra]
        env = build_environment(image, backend="docker", extra_run_args=extra)

        # STRUCTURAL PROOF: no task text exists anywhere in this container.
        pre = env.execute({"command":
            "find /tmp /workspace -maxdepth 3 -name 'feature*.md' -o -name 'cb-instruction*' 2>/dev/null | head; echo SCAN_DONE"},
            timeout=60)
        structural = (pre.get("output") or "").strip()

        # Tool install (claude via upstream's own setup, then serena+gitnexus,
        # pinned). Both steps log to files, are result-checked, and retry once
        # — a transient network stall must not burn a bootstrap attempt.
        def _install(name: str, cmd: str, sentinel: str) -> None:
            last = ""
            for attempt in (1, 2):
                out = env.execute({"command":
                    f"(set -x; {cmd}) > /tmp/{name}.log 2>&1 && echo {sentinel}"},
                    timeout=2400)
                if sentinel in (out.get("output") or ""):
                    return
                # Failure diagnostics come from SEPARATE execs so a flaky
                # transport on the install exec cannot blank the evidence.
                log = read_file_from_container(env, f"/tmp/{name}.log") or ""
                inv = env.execute({"command":
                    "for t in node npm claude uv serena gitnexus; do "
                    "printf '%s=%s ' $t $(command -v $t || echo MISSING); done"},
                    timeout=60)
                last = (f"log tail: {log[-900:]!r} | tools: "
                        f"{(inv.get('output') or '').strip()}")
                (out_dir / f"{name}-install-fail-{attempt}.log").write_text(log)
            raise RuntimeError(f"{name} install failed after 2 attempts: {last}")

        if claude_code_setup:
            write_file_in_container(env, "/tmp/cc-setup.sh", claude_code_setup)
            _install("cc-setup",
                     f"export CLAUDE_CODE_VERSION={CLAUDE_CODE_PIN}; bash /tmp/cc-setup.sh",
                     "CC_SETUP_OK")
        write_file_in_container(env, "/tmp/tools.sh",
                                TOOLS_INSTALL.format(serena_pin=SERENA_PIN,
                                                     gitnexus_pin=GITNEXUS_PIN))
        _install("tools", "bash /tmp/tools.sh", "TOOLS_OK")

        # MCP registration (CooperBench's own mechanism, byte-for-byte location).
        env.execute({"command": f"mkdir -p {CLAUDE_CONFIG_DIR}"}, timeout=30)
        mcp = json.loads(json.dumps(MCP_CONFIG).replace("{repo}", repo_path))
        write_file_in_container(env, f"{CLAUDE_CONFIG_DIR}/.claude.json",
                                json.dumps(mcp, indent=2))

        if stack_hint is None:
            stack_hint = _detect_stack(env, repo_path)

        # The installer prompt, verbatim from the shipped release.
        write_file_in_container(env, "/tmp/salvor-setup-prompt.md", setup_prompt.read_text())

        def is_terminal(e: Any) -> bool:
            check = e.execute({"command": TERMINAL_CHECK.format(repo=shlex.quote(repo_path))},
                              timeout=60)
            return "TERMINAL_OK" in (check.get("output") or "")

        def on_capture(gate: str, text: str) -> str:
            decision = ratifier.decide(
                gate_question=gate, candidate=text[-4000:],
                evidence=text[-8000:],
                brain_listing=_brain_listing(env, repo_path),
                context=f"bootstrap:{state_key}")
            return "yes" if decision.approve else "no"

        result.drive = drive(
            env,
            initial_prompt_path="/tmp/salvor-setup-prompt.md",
            cwd=repo_path,
            gates=setup_gates(project_name, stack_hint),
            env_exports={"ANTHROPIC_API_KEY": api_key, "ANTHROPIC_MODEL": MODEL},
            is_terminal=is_terminal,
            on_capture_gate=on_capture,
            max_outer_turns=max_outer_turns,
        )
        if not result.drive.terminal:
            raise RuntimeError(f"bootstrap did not reach terminal state: {result.drive.error}")

        # Brain paths never enter a scored patch (task-time hygiene; written
        # AFTER the drive so the setup agent does not find unexplained
        # pre-existing exclude state and pause on it).
        env.execute({"command":
            f"cd {shlex.quote(repo_path)} && mkdir -p .git/info && "
            "for p in .salvor .serena .gitnexus .gitnexusrc CLAUDE.md RULES.md AGENTS.md GEMINI.md; do "
            "grep -qxF \"$p\" .git/info/exclude 2>/dev/null || echo \"$p\" >> .git/info/exclude; done"},
            timeout=60)

        # Derived layer: index at this exact revision.
        env.execute({"command":
            f'cd {shlex.quote(repo_path)} && PATH=$HOME/.local/bin:$PATH '
            f'gitnexus analyze --index-only >/dev/null 2>&1 || true'}, timeout=900)

        # USEFULNESS PROBE: can the brain answer generic repository questions?
        write_file_in_container(env, "/tmp/usefulness.md", USEFULNESS_PROMPT)
        probe_stream = "/tmp/usefulness-stream.jsonl"
        env.execute({"command":
            f"export ANTHROPIC_API_KEY={shlex.quote(api_key)}; "
            f"export ANTHROPIC_MODEL={MODEL}; "
            f"export CLAUDE_CONFIG_DIR={CLAUDE_CONFIG_DIR}; "
            "export IS_SANDBOX=1; export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1; "
            f"cd {shlex.quote(repo_path)} && "
            f'claude --verbose --output-format=stream-json --permission-mode=bypassPermissions '
            f'--max-turns 8 --print -- "$(cat /tmp/usefulness.md)" 2>&1 | tee {probe_stream}'},
            timeout=600)
        raw = read_file_from_container(env, probe_stream) or ""
        from .driver import _parse_stream
        _, _, probe_answer, probe_usage = _parse_stream(raw)
        result.usefulness = probe_answer[:4000]
        cited = [seg for seg in probe_answer.replace("`", " ").split()
                 if seg.startswith((".salvor", ".serena", "CLAUDE.md", "RULES.md"))]
        result.usefulness_ok = bool(probe_answer.strip()) and bool(cited)
        result.probe_usage = probe_usage
        result.probe_usage_total = probe_usage.total

        # Serena memories are a REPORTED fact, not a gate: SETUP_PROMPT treats
        # onboarding as status to classify (line 219), not a mandated write —
        # a fresh repo may legitimately finish setup with an empty memories dir.
        mem = env.execute({"command":
            f"ls -A {shlex.quote(repo_path)}/.serena/memories 2>/dev/null | wc -l"},
            timeout=30)
        serena_memories = int((mem.get("output") or "0").strip() or 0)

        # SNAPSHOT: docker commit + knowledge-layer tarball + sha256.
        cid = getattr(env, "container_id", None)
        if not cid:
            raise RuntimeError("container id unavailable for snapshot")
        image_tag = f"salvorbench-brain:{state_key.replace('/', '-')}"
        code, out = _sh(["docker", "commit",
                         "--change", f"ENV CLAUDE_CODE_VERSION={CLAUDE_CODE_PIN}",
                         cid, image_tag], timeout=900)
        if code != 0:
            raise RuntimeError(f"docker commit failed: {out[:300]}")
        result.image = image_tag

        tar_path = out_dir / "brain.tar.gz"
        parts = " ".join(shlex.quote(p) for p in KNOWLEDGE_LAYER)
        env.execute({"command":
            f"cd {shlex.quote(repo_path)} && tar czf /tmp/brain.tar.gz "
            f"--exclude .serena/cache {parts} 2>/dev/null || "
            f"tar czf /tmp/brain.tar.gz .salvor CLAUDE.md RULES.md"}, timeout=300)
        code, out = _sh(["docker", "cp", f"{cid}:/tmp/brain.tar.gz", str(tar_path)], timeout=300)
        if code != 0:
            raise RuntimeError(f"brain export failed: {out[:300]}")
        result.tarball = tar_path
        result.brain_sha256 = hashlib.sha256(tar_path.read_bytes()).hexdigest()

        result.ratifier_decisions = len(ratifier.decisions)
        result.ok = True
    except Exception as exc:                                # noqa: BLE001
        result.error = f"{type(exc).__name__}: {exc}"
    finally:
        result.elapsed_s = time.monotonic() - started
        prov = {
            "state_key": state_key,
            "image": image,
            "brain_image": result.image,
            "brain_sha256": result.brain_sha256,
            "started_utc": utcnow(),
            "elapsed_s": round(result.elapsed_s, 1),
            "ok": result.ok,
            "error": result.error,
            "serena_pin": SERENA_PIN,
            "claude_code_pin": CLAUDE_CODE_PIN,
            "stack_hint": stack_hint,
            "gitnexus_pin": GITNEXUS_PIN,
            "rubric_sha256": RUBRIC_SHA256,
            "structural_scan": structural,
            "gates_answered": (result.drive.gates_answered if result.drive else []),
            "drive_turns": len(result.drive.turns) if result.drive else 0,
            "drive_tokens": (result.drive.usage.total if result.drive else 0),
            "probe_tokens": result.probe_usage_total,
            "ratifier_decisions": result.ratifier_decisions,
            "usefulness_ok": result.usefulness_ok,
            "serena_memories": serena_memories if "serena_memories" in dir() else None,
            "usefulness_answer": result.usefulness,
        }
        if result.drive:
            (out_dir / "drive-turns.json").write_text(json.dumps(
                [{"n": i, "text": (t.assistant_text or "")[-6000:],
                  "final": (t.result_text or "")[-2000:],
                  "tokens": t.usage.total}
                 for i, t in enumerate(result.drive.turns)], indent=2))
        path = out_dir / "provenance.json"
        path.write_text(json.dumps(prov, indent=2))
        result.provenance_path = path
        if env is not None:
            try:
                env.cleanup()
            except Exception:                               # noqa: BLE001
                pass
    return result


def _brain_listing(env: Any, repo_path: str) -> str:
    out = env.execute({"command":
        f"cd {shlex.quote(repo_path)} && find .salvor .serena/memories -type f 2>/dev/null | head -60"},
        timeout=60)
    return (out.get("output") or "")[:2000]


_STACK_MARKERS = (
    ("pyproject.toml", "Python project (pyproject.toml)"),
    ("setup.py", "Python project (setup.py)"),
    ("package.json", "Node/JavaScript project (package.json)"),
    ("Cargo.toml", "Rust project (Cargo.toml)"),
    ("go.mod", "Go project (go.mod)"),
    ("pom.xml", "Java project (pom.xml)"),
)


def _detect_stack(env: Any, repo_path: str) -> str:
    """Task-blind stack hint derived mechanically from repo manifests."""
    for marker, hint in _STACK_MARKERS:
        out = env.execute({"command":
            f"test -f {shlex.quote(repo_path)}/{marker} && echo YES || echo NO"}, timeout=30)
        if "YES" in (out.get("output") or ""):
            return hint
    return "source repository (stack per its own manifests)"
