"""salvorbench CLI."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from . import preflight as _preflight
from .cooper.subset import choose, load_pairs, manifest_block as subset_manifest
from .cost.governor import CAP_USD, RESERVE_USD
from .swecl.dataset import load_sequence, manifest_block as swecl_manifest

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM = ROOT / "vendor" / "swebench-cl-curriculum.json"


def _load_env() -> None:
    """Load benchmarks/.env without adding a dependency for one file."""
    env = ROOT / ".env"
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())


def cmd_preflight(args: argparse.Namespace) -> int:
    _load_env()
    print("salvorbench preflight\n")
    checks = _preflight.run(CURRICULUM, skip_slow=args.fast)
    print(_preflight.render(checks))
    blocking = [c for c in checks if c.blocking]
    if blocking:
        print("\nBlocking issues must be resolved before any inference runs:")
        for c in blocking:
            print(f"  - {c.name}: {c.detail}")
        return 1
    return 0


def cmd_dataset(args: argparse.Namespace) -> int:
    tasks = load_sequence(CURRICULUM)
    if args.json:
        print(json.dumps(swecl_manifest(CURRICULUM, tasks), indent=2))
        return 0
    print(f"SWE-Bench-CL pytest sequence — {len(tasks)} tasks (upstream order)\n")
    for t in tasks:
        print(f"  {t.position:2d}. {t.instance_id:32s} {t.created_at[:10]}  {t.difficulty}")
    print("\nOrder is difficulty-tiered then chronological within tier — never re-sorted.")
    return 0


def cmd_subset(args: argparse.Namespace) -> int:
    flash = Path(args.flash)
    if not flash.exists():
        print(f"flash.json not found at {flash}", file=sys.stderr)
        print("Run `cooperbench prepare` (or point --flash at the dataset).", file=sys.stderr)
        return 1
    pairs = load_pairs(flash)
    chosen = choose(pairs, args.n)
    if args.json:
        from .state.log import utcnow
        print(json.dumps(subset_manifest(chosen, flash, len(pairs), utcnow()), indent=2))
        return 0
    print(f"CooperBench flash: {len(pairs)} pairs across "
          f"{len({p.state_key for p in pairs})} task states")
    print(f"Outcome-blind selection of {len(chosen)} "
          f"(covers {len({p.state_key for p in chosen})} states)\n")
    for p in chosen:
        print(f"  {p.repo}/{p.task_id}  features {p.f1},{p.f2}")
    return 0


def cmd_budget(args: argparse.Namespace) -> int:
    from .cost.pricing import RATES, PRICING_RETRIEVED, PRICING_SOURCE
    print(f"Cap ${CAP_USD} (reserve ${RESERVE_USD}; spendable ${CAP_USD - RESERVE_USD})")
    print(f"Rate card read {PRICING_RETRIEVED} from {PRICING_SOURCE}\n")
    for model, r in RATES.items():
        print(f"  {model}")
        for k, v in r.items():
            print(f"    {k:16s} ${v}/MTok")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="salvorbench",
        description="Clean-room benchmark harness for the recommended Salvor stack.")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("preflight", help="prove the environment (zero inference cost)")
    p.add_argument("--fast", action="store_true", help="skip container-launching checks")
    p.set_defaults(func=cmd_preflight)

    p = sub.add_parser("dataset", help="show the SWE-Bench-CL sequence in upstream order")
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_dataset)

    p = sub.add_parser("subset", help="compute the outcome-blind CooperBench subset")
    p.add_argument("--flash", default=str(ROOT / "vendor" / "CooperBench" / "dataset" / "subsets" / "flash.json"))
    p.add_argument("-n", type=int, default=25)
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_subset)

    p = sub.add_parser("report", help="generate summary.json + REPORT.md and verify")
    p.add_argument("--run-id", default="beta")
    p.add_argument("--cooper-pairs", type=int, default=50)
    p.set_defaults(func=cmd_report)

    p = sub.add_parser("budget", help="show the cap and the verified rate card")
    p.set_defaults(func=cmd_budget)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())


def cmd_report(args: argparse.Namespace) -> int:
    """Generate summary.json + REPORT.md from a run, then verify publishability."""
    from .report import markdown, verify as verify_mod
    from .report.summary import write as write_summary

    run_dir = ROOT / "runs" / args.run_id
    if not run_dir.exists():
        print(f"no run at {run_dir}", file=sys.stderr)
        return 1

    results = ROOT / "results" / args.run_id
    summary_path = results / "summary.json"
    summary = write_summary(run_dir, summary_path, expected_cooper=args.cooper_pairs)
    markdown.write(summary_path, results / "REPORT.md")

    publishable, failures, warnings = verify_mod.verify(run_dir, summary)
    print(f"summary: {summary_path}")
    print(f"report:  {results / 'REPORT.md'}\n")
    print(verify_mod.render(publishable, failures, warnings))
    return 0 if publishable else 1
