"""Run one SWE-Bench-CL arm over the full 19-task sequence.

Usage: run_swecl.py S1 [--limit N]

Sequential by construction: the continual-learning claim depends on task order,
so units within an arm are never parallelised. Every unit is billed to the
hash-chained ledger and admitted by the governor before launch.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from salvorbench.cost.governor import BudgetExceeded, Governor      # noqa: E402
from salvorbench.cost.ledger import Ledger                          # noqa: E402
from salvorbench.cost.pricing import cost_usd                       # noqa: E402
from salvorbench.state.log import Event, StateLog, utcnow           # noqa: E402
from salvorbench.swecl.dataset import load_sequence                 # noqa: E402
from salvorbench.swecl.runner import run_task                       # noqa: E402
from salvorbench.swecl.score import (                               # noqa: E402
    resolved_ids, score, write_predictions,
)

MODEL = "claude-sonnet-5"
MAX_TURNS = 120
PROBE_UNIT_USD = Decimal("0.15")   # measured; governor refines from observations

ap = argparse.ArgumentParser()
ap.add_argument("condition", choices=["S1", "S2", "S3"])
ap.add_argument("--limit", type=int, default=None)
ap.add_argument("--run-id", default="beta")
args = ap.parse_args()

key = os.environ.get("ANTHROPIC_API_KEY", "")
if not key.startswith("sk-ant-"):
    raise SystemExit("ANTHROPIC_API_KEY missing or not an API key")

run_dir = ROOT / "runs" / args.run_id
ledger, state = Ledger(run_dir), StateLog(run_dir)
gov = Governor(ledger)
gov.set_probe("swe_task", PROBE_UNIT_USD)

tasks = load_sequence(ROOT / "vendor" / "swebench-cl-curriculum.json")
if args.limit:
    tasks = tasks[: args.limit]

# S2: the ported semantic memory persists across the chain (resume-safe),
# starting EMPTY per the ratified design. Retrieval/write-back live inside
# run_task; evaluator outcomes never touch it.
memory = None
memory_path = run_dir / "records" / "S2" / "semantic_memory.json"
if args.condition == "S2":
    from salvorbench.swecl.memory import SemanticMemory
    memory = SemanticMemory.load(memory_path) if memory_path.exists() else SemanticMemory()
    print(f"S2 memory: {len(memory.entries)} entries loaded", flush=True)

# S3: longitudinal brain chain. Link k seeds from link k-1's knowledge
# tarball (T0 for the first task); after the work run the SAME session is
# resumed for the product-faithful close-out, capture gates going to the
# reviewer-only ratifier; the taint audit clears every future-task shingle
# overlap against the repo checkout or fails the link.
chain_dir = run_dir / "brains-swecl"
s3_futures = {t.instance_id: t.problem_statement for t in tasks}
if args.condition == "S3":
    t0_tar = chain_dir / "t0" / "brain.tar.gz"
    if not t0_tar.exists():
        raise SystemExit("S3 requires the T0 brain: run scripts/build_swecl_t0.py first")

def s3_hooks(task, prev_tar, out_tar, rat_dir):
    from salvorbench.brain.chain import (extract_knowledge, knowledge_texts,
                                         regenerate_derived, seed_knowledge,
                                         session_id_from_stream,
                                         terminate_session)
    from salvorbench.brain.ratifier import Ratifier
    from salvorbench.brain.taint import container_source_contains, scan
    from salvorbench.agent.invoke import SWEBENCH_REPO_PATH

    ratifier = Ratifier(rat_dir)

    def pre(env):
        seed_knowledge(env, SWEBENCH_REPO_PATH, prev_tar)
        regenerate_derived(env, SWEBENCH_REPO_PATH)

    def post(env, stream_path):
        meta = {}
        sid = session_id_from_stream(stream_path) if stream_path else None
        meta["work_session_id"] = sid
        if sid:
            def on_capture(gate, text):
                d = ratifier.decide(gate_question=gate, candidate=text[-4000:],
                                    evidence=text[-8000:], brain_listing="",
                                    context=f"s3-terminate:{task.instance_id}")
                return "yes" if d.approve else "no"
            term = terminate_session(
                env, session_id=sid, repo_path=SWEBENCH_REPO_PATH,
                env_exports={"ANTHROPIC_API_KEY": key,
                             "ANTHROPIC_MODEL": MODEL},
                on_capture_gate=on_capture)
            meta["termination_terminal"] = term.terminal
            meta["termination_turns"] = len(term.turns)
            meta["termination_tokens"] = term.usage.total
            meta["termination_usage"] = term.usage
            meta["ratifier_decisions"] = len(ratifier.decisions)
        sha = extract_knowledge(env, SWEBENCH_REPO_PATH, out_tar)
        meta["brain_sha256"] = sha
        future = {tid: txt for tid, txt in s3_futures.items()
                  if tid != task.instance_id
                  and s3_positions[tid] > task.position}
        report = scan(knowledge_texts(out_tar), future,
                      container_source_contains(env, SWEBENCH_REPO_PATH))
        (out_tar.parent / f"taint-{task.position:02d}.json").write_text(
            json.dumps(report.to_dict(), indent=2))
        meta["taint_passed"] = report.passed
        meta["taint_hits"] = len(report.hits)
        return meta
    return pre, post

s3_positions = {t.instance_id: t.position for t in tasks}

done = {u for u, d in state.units().items() if d.get("last_event") == "unit_finished"}
state.append(Event.PHASE_STARTED, phase=f"tasks:{args.condition}")
print(f"{args.condition}: {len(tasks)} tasks | ledger ${ledger.total():.2f} "
      f"| remaining ${gov.remaining():.2f}", flush=True)

records, patches = [], {}
for task in tasks:
    unit = f"{args.condition}/swecl/pytest/{task.position:02d}/{task.instance_id}"
    if unit in done:
        print(f"  [{task.position:2d}] SKIP (already done)", flush=True); continue

    try:
        gov.admit(unit, "swe_task")
    except BudgetExceeded as exc:
        print(f"  BUDGET HALT: {exc}", flush=True)
        state.append(Event.BUDGET_HALT, unit_id=unit, reason=str(exc))
        break

    state.append(Event.UNIT_STARTED, unit_id=unit, condition=args.condition)
    pre = post = None
    if args.condition == "S3":
        prev_tar = (chain_dir / "t0" / "brain.tar.gz" if task.position == tasks[0].position
                    else chain_dir / f"link-{task.position - 1:02d}.tar.gz")
        out_tar = chain_dir / f"link-{task.position:02d}.tar.gz"
        pre, post = s3_hooks(task, prev_tar, out_tar,
                             chain_dir / f"ratifier-{task.position:02d}")
    result = run_task(task, condition=args.condition, model=MODEL, run_dir=run_dir,
                      max_turns=MAX_TURNS, env_exports={"ANTHROPIC_API_KEY": key},
                      brain=(args.condition == "S3"), memory=memory,
                      pre_run=pre, post_run=post, timeout_s=5400)
    if memory is not None:
        memory.save(memory_path)

    usd = cost_usd(result.run.usage, MODEL)
    ledger.append(unit_id=unit, condition=args.condition, phase="tasks", attempt=1,
                  model=MODEL, usage=result.run.usage, ts=utcnow())
    term_usage = result.run.meta.pop("termination_usage", None)
    if term_usage is not None and term_usage.total:
        ledger.append(unit_id=f"{unit}#terminate", condition=args.condition,
                      phase="tasks", attempt=1, model=MODEL,
                      usage=term_usage, ts=utcnow())
        usd += cost_usd(term_usage, MODEL)
    if args.condition == "S3":
        from salvorbench.brain.ratifier import usage_from_dir
        ru = usage_from_dir(chain_dir / f"ratifier-{task.position:02d}")
        if ru is not None and ru.total:
            ledger.append(unit_id=f"{unit}#ratifier", condition=args.condition,
                          phase="tasks", attempt=1, model=MODEL, usage=ru,
                          ts=utcnow())
    gov.release(unit, usd)

    if result.brain_paths_in_patch:
        print(f"  !! BRAIN LEAK in patch: {result.brain_paths_in_patch}", flush=True)

    rec = result.to_dict() | {"cost_usd": str(usd)}
    records.append(rec)
    patches[task.instance_id] = result.run.patch or ""
    state.append(Event.UNIT_FINISHED, unit_id=unit, condition=args.condition,
                 outcome=result.outcome.value, cost_usd=str(usd))

    print(f"  [{task.position:2d}] {task.instance_id:30s} {result.outcome.value:17s} "
          f"{result.run.usage.turns:3d}t {result.run.elapsed_s:6.1f}s ${usd:.4f} "
          f"| cum ${ledger.total():.2f}", flush=True)

arm_dir = run_dir / "records" / args.condition
arm_dir.mkdir(parents=True, exist_ok=True)
(arm_dir / "units.json").write_text(json.dumps(records, indent=2))

# Official scoring, strictly downstream and invisible to the agent.
if patches:
    print(f"\nscoring {len(patches)} patches via the official harness...", flush=True)
    preds = write_predictions(run_dir / f"preds-{args.condition}.jsonl", patches,
                              f"salvorbench-{args.condition}")
    report = score(preds, list(patches), f"{args.run_id}-{args.condition}",
                   run_dir / "reports")
    got = resolved_ids(report)
    (arm_dir / "report.json").write_text(json.dumps(report, indent=2))
    for rec in records:
        rec["resolved"] = rec["instance_id"] in got
    (arm_dir / "units.json").write_text(json.dumps(records, indent=2))
    print(f"{args.condition}: resolved {len(got)}/{len(patches)} "
          f"| spend ${ledger.total_for(condition=args.condition):.2f}", flush=True)

state.append(Event.PHASE_FINISHED, phase=f"tasks:{args.condition}")
