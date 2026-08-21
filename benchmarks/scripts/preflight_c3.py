#!/usr/bin/env python3
"""C3 shared-brain preflight: the ratified 4-step live-write proof.

Zero inference cost — pure Docker. Requires one built brain image.

1. Agent-A container writes a unique benign test memory through the same
   interface benchmark agents use (a file in the mounted .salvor tree).
2. Agent-B container reads it back WITHOUT any harness/Redis transport.
3. Concurrent writes from both containers to distinct artifacts survive;
   contended single-file append is exercised and its outcome recorded.
4. The test volumes are destroyed and proven absent; no benchmark volume
   name is touched.

Usage: uv run python scripts/preflight_c3.py --state <repo/task_id>
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from salvorbench.cooper.adapter import _brain_image  # noqa: E402

SALVOR = "/workspace/repo/.salvor"


def sh(*cmd: str, check: bool = True) -> str:
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if check and p.returncode != 0:
        raise SystemExit(f"FAIL: {' '.join(cmd)}\n{p.stdout}{p.stderr}")
    return p.stdout.strip()


def in_vol(image: str, vol: str, script: str) -> str:
    return sh("docker", "run", "--rm", "--entrypoint", "/bin/bash",
              "-v", f"{vol}:{SALVOR}", image, "-c", script)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--state", required=True)
    args = ap.parse_args()
    repo, tid = args.state.rsplit("/", 1)
    image = _brain_image(repo, int(tid))
    sh("docker", "image", "inspect", "--format", "{{.Id}}", image)

    vol = f"salvorbench-preflight-{uuid.uuid4().hex[:8]}"
    token = f"preflight-{uuid.uuid4().hex}"
    report: dict = {"image": image, "volume": vol, "steps": {}}
    try:
        sh("docker", "volume", "create", vol)
        # seed exactly as the adapter does: mount at /seed so the image's own
        # .salvor is visible as the copy source
        sh("docker", "run", "--rm", "--entrypoint", "/bin/bash",
           "-v", f"{vol}:/seed", image,
           "-c", f"cp -a {SALVOR}/. /seed/ && echo seeded")

        # 1. A writes through the agent-visible interface
        in_vol(image, vol,
               f"mkdir -p {SALVOR}/domain-learnings && "
               f"printf 'ID: DL:{token}\\nSubject: preflight\\nClaim: transport check\\n' "
               f"> {SALVOR}/domain-learnings/{token}.md")
        report["steps"]["write"] = "ok"

        # 2. B reads without any other transport
        got = in_vol(image, vol, f"cat {SALVOR}/domain-learnings/{token}.md")
        assert token in got, "cross-container read failed"
        report["steps"]["read"] = "ok"

        # 3a. concurrent distinct-artifact writes
        procs = [subprocess.Popen(
            ["docker", "run", "--rm", "--entrypoint", "/bin/bash",
             "-v", f"{vol}:{SALVOR}", image, "-c",
             f"for i in $(seq 1 25); do "
             f"printf 'x%.0s' {{1..100}} > {SALVOR}/domain-learnings/{token}-{n}-$i.md; done"])
            for n in ("a", "b")]
        for p in procs:
            assert p.wait(timeout=180) == 0
        count = in_vol(image, vol, f"ls {SALVOR}/domain-learnings/{token}-*-*.md | wc -l")
        assert int(count) == 50, f"distinct-artifact writes lost: {count}/50"
        report["steps"]["concurrent_distinct"] = f"{count}/50"

        # 3b. contended single-file append (L1-shaped hazard) — recorded, not hidden
        procs = [subprocess.Popen(
            ["docker", "run", "--rm", "--entrypoint", "/bin/bash",
             "-v", f"{vol}:{SALVOR}", image, "-c",
             f"for i in $(seq 1 50); do echo '{n}-line' >> {SALVOR}/{token}-contended.md; done"])
            for n in ("a", "b")]
        for p in procs:
            p.wait(timeout=180)
        lines = in_vol(image, vol, f"wc -l < {SALVOR}/{token}-contended.md")
        report["steps"]["contended_append"] = f"{lines}/100 lines survived"

        # 4. destroy + prove absent
        sh("docker", "volume", "rm", vol)
        leftover = sh("docker", "volume", "ls", "-q", "--filter", f"name={vol}")
        assert not leftover, "test volume not destroyed"
        report["steps"]["cleanup"] = "ok"
        report["pass"] = True
    finally:
        subprocess.run(["docker", "volume", "rm", "-f", vol], capture_output=True)
        out = ROOT / "runs" / "beta" / "preflight-c3.json"
        out.write_text(json.dumps(report, indent=2))
        print(json.dumps(report, indent=2))
    return 0 if report.get("pass") else 1


if __name__ == "__main__":
    raise SystemExit(main())
