"""S3 longitudinal brain chain.

The knowledge layer (`.salvor/**`, `.serena/memories/**`, hub + adapters +
RULES) carries verbatim from task k to task k+1; the derived layer
(GitNexus index, Serena caches) regenerates per base commit — mirroring
Salvor's own two-layer contract (RULES.md §8).

Termination is product-faithful: the SAME work session is resumed
(`claude --resume <session-id>`) to run the stable close-out procedure, so
the knowledge is authored by the working agent with its full context. The
three capture gates route to the reviewer-only ratifier. The termination
prompt is a fixed constant, frozen with the treatment — it references only
the repository's own protocol files, never task content.
"""

from __future__ import annotations

import hashlib
import shlex
from pathlib import Path
from typing import Any

from .driver import CLAUDE_CONFIG_DIR, DriveResult, drive
from .gates import Gate

KNOWLEDGE_TAR_PARTS = (".salvor", ".serena/memories", "CLAUDE.md", "RULES.md",
                       "AGENTS.md", "GEMINI.md", ".gitnexusrc")

# Fixed, task-blind close-out instruction. Hashed into the treatment freeze.
TERMINATION_PROMPT = """\
Close out this working session per the repository's Salvor protocol \
(CLAUDE.md and RULES.md):

1. Update `.salvor/active_state.md` (L1) with what was confirmed this \
session, and preserve pruned nuance in `.salvor/active_state_verbose.md` \
(L2), exactly as the TWO-TIER MEMORY MANAGEMENT directive specifies.
2. If this session surfaced anything durable — a design decision, a domain \
learning, a learned failure, or a deferred finding — ask the exact capture \
question RULES specifies for it, one item at a time, and record only what \
is approved.
3. Do not modify source code, tests, or any file outside the Salvor \
knowledge files during this close-out.
"""

TERMINATION_GATES: list[Gate] = []       # capture gates only; no scripted answers


def seed_knowledge(env: Any, repo_path: str, tarball: Path) -> None:
    """Untar the carried knowledge layer into the task checkout."""
    import base64
    data = base64.b64encode(tarball.read_bytes()).decode()
    # chunked heredoc-free transfer (tar payloads can exceed argv limits)
    env.execute({"command": f"rm -f /tmp/brain-in.b64 /tmp/brain-in.tar.gz"}, timeout=30)
    for i in range(0, len(data), 120_000):
        chunk = data[i:i + 120_000]
        env.execute({"command": f"printf %s {shlex.quote(chunk)} >> /tmp/brain-in.b64"},
                    timeout=60)
    out = env.execute({"command":
        f"base64 -d /tmp/brain-in.b64 > /tmp/brain-in.tar.gz && "
        f"cd {shlex.quote(repo_path)} && tar xzf /tmp/brain-in.tar.gz && "
        f"test -f .salvor/README.md && echo SEED_OK"}, timeout=120)
    if "SEED_OK" not in (out.get("output") or ""):
        raise RuntimeError(f"knowledge seed failed: {(out.get('output') or '')[:300]}")


def extract_knowledge(env: Any, repo_path: str, dest: Path) -> str:
    """Tar the knowledge layer out of the container; returns sha256."""
    parts = " ".join(shlex.quote(p) for p in KNOWLEDGE_TAR_PARTS)
    out = env.execute({"command":
        f"cd {shlex.quote(repo_path)} && "
        f"tar czf /tmp/brain-out.tar.gz --exclude .serena/cache {parts} 2>/dev/null "
        f"|| tar czf /tmp/brain-out.tar.gz .salvor CLAUDE.md RULES.md; "
        f"base64 /tmp/brain-out.tar.gz"}, timeout=300)
    import base64
    raw = base64.b64decode((out.get("output") or "").strip().encode())
    if not raw:
        raise RuntimeError("knowledge extract produced no bytes")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(raw)
    return hashlib.sha256(raw).hexdigest()


def regenerate_derived(env: Any, repo_path: str) -> None:
    """Regenerate the derived layer at this base commit (never carried)."""
    env.execute({"command":
        f"cd {shlex.quote(repo_path)} && rm -rf .gitnexus .serena/cache && "
        f'PATH=$HOME/.local/bin:$PATH gitnexus analyze --index-only '
        f">/dev/null 2>&1 || true"}, timeout=900)


def terminate_session(
    env: Any,
    *,
    session_id: str,
    repo_path: str,
    env_exports: dict[str, str],
    on_capture_gate,
    max_outer_turns: int = 6,
) -> DriveResult:
    """Resume the WORK session and run the fixed close-out procedure."""
    env.execute({"command":
        "cat > /tmp/salvor-terminate.md <<'SALVOR_EOF'\n"
        + TERMINATION_PROMPT + "\nSALVOR_EOF"}, timeout=30)

    def is_terminal(e: Any) -> bool:
        # Close-out is done when L1 exists and was touched more recently than
        # the marker we drop before the pass begins.
        chk = e.execute({"command":
            f"cd {shlex.quote(repo_path)} && "
            f"test .salvor/active_state.md -nt /tmp/salvor-terminate-started "
            f"&& echo TERM_OK || true"}, timeout=30)
        return "TERM_OK" in (chk.get("output") or "")

    env.execute({"command": "touch /tmp/salvor-terminate-started"}, timeout=30)
    return drive(
        env,
        initial_prompt_path="/tmp/salvor-terminate.md",
        cwd=repo_path,
        gates=TERMINATION_GATES,
        env_exports=env_exports,
        is_terminal=is_terminal,
        on_capture_gate=on_capture_gate,
        max_outer_turns=max_outer_turns,
        resume=session_id,
    )
