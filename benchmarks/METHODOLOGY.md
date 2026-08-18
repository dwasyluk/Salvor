# Benchmark methodology

This document is the protocol. It is written to be **attacked**: every choice
that could bias a result is stated here, including the ones that are awkward.
If you want to disprove these numbers, this is the file to start from.

The headline framing, stated once and plainly:

> The Salvor arms measure the **recommended Salvor stack — Salvor + Serena +
> GitNexus — as a system**. They do not isolate Salvor core from its recommended
> integrations. Any claim that they do would be false.

---

## 1. What is measured

Two claims carry the product, so there are two experiments.

| | Claim under test | Benchmark | Arms |
|---|---|---|---|
| **Single-agent** | A persistent, repo-native brain improves continual software engineering | SWE-Bench-CL pytest curriculum (19 tasks) | S1 stateless · S2 ported semantic memory · S3 Salvor stack |
| **Two-agent** | A shared brain reduces the documented multi-agent coordination penalty | CooperBench `flash` | C1 solo · C2 coop baseline · C3 coop + Salvor stack |

All six arms run the **same agent** (Claude Code CLI, headless) on the **same
model** (`claude-sonnet-5`) with a **byte-identical** `conf/agent.yaml`. The arms
differ only in memory and coordination mechanism. `salvorbench verify` re-asserts
that parity from the manifest rather than trusting it.

---

## 2. Upstream provenance, and one uncomfortable fact

### CooperBench — used as intended

Pinned to the **immutable commit** `4913c4e` (tag `v0.0.29`), not a tag ref.
Every release before 2026-08-14 shipped 24 non-gradeable features — including
one that passed on an untouched tree — so any result produced against an earlier
version is contaminated. Scoring is CooperBench's own deterministic, test-based
evaluator. There is no LLM judge anywhere in this harness.

### SWE-Bench-CL — dataset only, and here is why

`thomasjoshi/agents-never-forget` is an abandoned university course project: no
commits in 15 months, a `requirements.txt` that installs none of the packages its
evaluator imports, hardcoded absolute paths to a personal drive, and a paper that
reports **no results** ("experiments ongoing"). Its code contains hardcoded
*simulated* findings — literally `# Generate a findings summary based on the
simulated results`, with invented pass rates beneath it.

So this harness uses **the dataset and the sequencing concept, and nothing else**:

* **Used:** task ordering, difficulty tiers, dependency annotations.
* **Not used:** its evaluator, its metrics code, its reported numbers. None of
  them are executed, reproduced or cited.
* **Scoring:** the official Princeton **SWE-bench** harness, against its own
  dataset. The curriculum's `FAIL_TO_PASS`/`PASS_TO_PASS` lists are never fed to
  a scorer — they carry parse artifacts (one entry is the literal string
  `[100%]`).

Published as **"SWE-Bench-CL sequencing + official SWE-bench evaluation"**. It is
not an upstream leaderboard score and must never be presented as one.

**Order policy.** Upstream `sequence_position`, verbatim. That order is
difficulty-tiered and only chronological *within* a tier — verified in the data:
positions 1–5 are all `<15 min fix` (2019-05 → 2020-06) while positions 17–19 are
`1-4 hours` (2019-08 → 2022-10). It is never re-sorted; a regression test fails
if it ever becomes chronological.

---

## 3. Isolation: a namespace policy, not "no MCP"

Every MCP tool call in Claude Code's stream-json is namespaced
`mcp__<server>__<tool>`, which makes isolation checkable **after the fact from an
artifact** rather than merely configured. `conf/mcp-policy.yaml` declares, per
arm, which namespaces are allowed and which are forbidden.

| Arm | Allowed | Forbidden |
|---|---|---|
| S1 | *(none)* | Salvor · Serena · GitNexus · memory |
| **S2** | **`mcp__clmem__*`** | Salvor · Serena · GitNexus |
| S3 | `mcp__serena__*` · `mcp__gitnexus__*` | memory |
| C1 | *(none)* | Salvor · Serena · GitNexus |
| C2 | benchmark-native Redis coordination | Salvor · Serena · GitNexus |
| C3 | `mcp__serena__*` · `mcp__gitnexus__*` + native coordination | memory |

**S2 is not an MCP-clean baseline and is never described as one.** It is the
generic-memory *treatment* arm; its memory server is the mechanism under test. A
blanket "baselines must show zero MCP calls" rule would fail S2 by definition,
which is why the rule is per-namespace.

Cross-condition residue is structurally impossible: every unit is a fresh
`docker run --rm` from an immutable image digest, and Redis is namespaced per run.

---

## 4. Availability is gated; utilisation is telemetry

This distinction is load-bearing, and getting it wrong would silently bias the
result toward Salvor.

**Gated before task exposure** (a failure here is an infrastructure fault, and the
unit is retried, not scored):

* Serena registered, reachable, and answering a representative project query.
* GitNexus registered **and indexed at the expected revision** (stale-index check).
* The Redis coordination channel reachable from *each* cooperative container.
* Expected tools visible to the agent; forbidden ones absent.

**Recorded, never required, during execution:**

* Serena available, zero calls → valid model behaviour.
* GitNexus available, zero calls → valid model behaviour.
* Redis available, zero messages sent → valid cooperative behaviour.

No synthetic call is ever injected to make an arm satisfy an assertion. Forcing a
tool call would manufacture the very effect the benchmark exists to measure.
`summary.json` reports availability and utilisation as **separate** fields, and
low utilisation is a finding to discuss, not a defect to hide.

---

## 5. The T0 brain: fair, and neither empty nor preloaded

Two failure modes to avoid simultaneously: handicapping Salvor with an
unrealistically empty brain, and cheating by preloading benchmark answers.

The bootstrap drives Salvor's **real** `SETUP_PROMPT.md` through a scripted
operator that *answers* its gates rather than removing them. Answers are fixed,
hashed into the manifest, and identical across task states except the project name.

Knowledge adoption is answered **`review now`**, not `deferred`. This was verified
during design: `deferred` leaves `.salvor/` as near-empty scaffolding, which is
precisely the unrealistically-empty brain the methodology forbids. `review now` is
Salvor's normal existing-repository onboarding.

**Allowed T0 sources** — what any engineer joining the project could read at the
base commit: source, committed docs/READMEs/ADRs/CHANGELOGs, manifests and
configuration, tests present at that commit, architecture, symbols and dependency
relationships, committed history reachable from the base commit, Serena onboarding
output, GitNexus analysis.

**Forbidden, absolutely:** gold patches, expected diffs, reference solutions,
hidden evaluator tests, future repository states, future task descriptions, any
output from an earlier run or another arm, and any human-written hint. No human
edits a brain at any point.

**Validity is checked by usefulness, not by file count.** A brain passes when a
scripted retrieval probe can answer representative repository questions with
answers traceable to `.salvor/`, Serena memories or the GitNexus index. Counting
files would reward scaffolding; an arbitrary minimum would invite padding.

### Anti-leakage: provenance-aware, not zero-overlap

Task text is **never** mounted or passed into bootstrap. Two gates are hard:

1. **Structural** — the bootstrap container starts from the base image with no
   task file present; the full `docker run` argv and a pre-bootstrap inventory
   hash are recorded.
2. **Temporal** — a hash-chained phase log proves bootstrap completed before the
   task phase began. Faking it would require rewriting a chained log.

The shingle scan is an **audit detector, not a zero-hit gate**. Benchmark issue
text legitimately quotes source, docstrings, error strings, README prose and API
names that the brain is explicitly allowed to learn. So each overlap is traced to
provenance: derived from an allowed T0 source → `allowed_source_overlap`;
untraceable to any pre-task source → the leakage gate fails. The full scan report,
including cleared overlaps, is preserved so a reviewer can second-guess every call.

### Bootstrap once per task state — and what that costs

CooperBench `flash`'s 50 pairs come from ~20 distinct `(repo, base_commit)`
states. The brain is built once per state and `docker commit`ed; each pair runs
from that immutable digest.

**Disclosed trade-off:** this removes *within-state* bootstrap variance. Pairs
from the same task see a byte-identical starting brain rather than 50 independent
bootstraps. That is a deliberate variance reduction, and it means C3's variance is
slightly lower than fully independent bootstrapping would produce.

---

## 6. S3 is a chain; C3 is a live shared brain

**S3** carries one brain across the 19-task sequence: the knowledge layer
(`.salvor/**`, `.serena/memories/**`) carries forward verbatim, while the derived
layer (`.gitnexus/`, `.serena/cache/`) is regenerated at each task's base commit —
mirroring Salvor's own two-layer contract. Every task has a distinct base commit,
so the re-index is mandatory, not optional.

**C3** would prove nothing if both agents merely received identical copies of one
T0 brain — that tests initial knowledge, not collaboration. So each C3 pair mounts
a single Docker **named volume** at the Salvor knowledge layer in *both* agent
containers. Code and workspace isolation are untouched, and CooperBench's coop
semantics are unmodified: optional `--git`/team mode is **not** enabled, because
that would change the official condition.

Proven in preflight, before the expensive matrix: agent A writes a memory through
the interface it will really use; agent B reads it **without** the harness or the
Redis channel carrying it; concurrent writes do not corrupt state; the probe
memory is deleted and provably absent from every benchmark brain.

**C2 and C3 differ only by** the Salvor/Serena/GitNexus servers and that shared
volume.

---

## 7. Memory never learns from the evaluator

Binding on S2 and S3 alike, without exception:

> The external SWE-bench evaluator result must **never** enter memory, nor decide
> whether a memory is written, promoted, deleted, relabelled or retained.

Only evidence the agent observed *itself* during its own execution — tests it ran,
errors it saw, approaches it watched fail — may become persistent knowledge. The
evaluator runs strictly downstream of, and invisible to, every arm. Anything else
would let hidden ground truth leak backwards into the treatment.

S2's lifecycle is **reproduced from the pinned upstream source**, not assumed. If
upstream retains attempted as well as successful solutions, that behaviour is
preserved, labelled only by what the agent could observe. It is published as
**"Ported SWE-Bench-CL semantic memory"** — never "native" or "untouched",
because an integration through a different agent scaffold necessarily differs.

---

## 8. Cost governance and outcome-blind subsetting

Spend is capped at **$250**, enforced at admission (with in-flight units reserved
at p95, so two concurrent launches cannot each assume the other's budget) and by
an in-flight watchdog that kills a runaway unit.

Costs are computed from token categories against a **rate card read from
Anthropic's official pricing page on 2026-08-18**, never from the CLI's reported
figure. Sonnet 5 is $2/$10 per MTok with 5m/1h cache writes at $2.50/$4.00 and
reads at $0.20; the pricing page states the scheduled 2026-09-01 increase to
$3/$15 will not occur, so no rate boundary is modelled.

If measured cost forces a reduction, **only CooperBench pair count is reduced**,
never the SWE-Bench-CL sequence, and never turn limits, tool access or evaluator
semantics. Which pairs survive is decided by HMAC-SHA256 over a canonical pair key
with a fixed literal seed, stratified so every task state keeps a pair, frozen
into the manifest with a timestamp **before any C-phase run**. `verify` asserts
`subset.chosen_at` precedes every C run. Shrinking N nests: a 20-pair run is a
strict subset of the 25-pair run, so the two remain comparable.

A reduced run is labelled honestly — "25/50 CooperBench Flash beta subset" —
never as a full Flash score.

---

## 9. Failure classification

| Class | Examples | Retried? | Counted where |
|---|---|---|---|
| **Benchmark failure** | empty/unapplied patch, `both_passed:false`, F2P still failing | **No** | Scored as a real negative |
| **Limits exceeded** | turn budget exhausted | **No** | Scored as a real negative — the budget is a fixed condition |
| **Infrastructure failure** | image pull, container setup, auth, API 429/529, timeout, Redis unreachable, MCP server absent, evaluator crash | Yes, 1–2× | Excluded from denominators, reported separately |

Zero *usage* of an available tool is never an infrastructure failure.

Every attempt is billed; only the last is scored. `verify` warns
`condition_correlated_infra_failure` when infra-error rates differ across arms by
more than 10 percentage points — if only one arm's images failed to pull, that
arm is a biased subsample and the comparison is void.

---

## 10. Known deviations from upstream

Stated plainly rather than buried:

1. **Own SWE-Bench-CL runner.** Upstream's is abandoned and unusable; only the
   dataset is reused. Scoring moves to the official SWE-bench harness — a
   *stronger* evaluator, but a deviation nonetheless.
2. **Ported memory arm.** S2 reproduces upstream's lifecycle through a different
   agent scaffold. Faithful in mechanism, not identical in implementation.
3. **Bootstrap once per task state**, not per pair (§5) — variance reduction.
4. **No backward-transfer matrix.** Computing it requires re-evaluating every
   earlier task at the end (+57 runs). It is omitted and said so, never estimated.
5. **amd64 under emulation.** SWE-bench publishes eval images for x86_64 only;
   no arm64 images exist. Measured penalty on this host is ~1.3× (Rosetta, not
   QEMU). The execution path is frozen in the manifest and identical across
   S1/S2/S3, and 19/19 gold patches must resolve on it before any inference runs.
6. **Single run per condition.** No repeated seeds, so no confidence intervals.
   Differences within noise must not be read as effects.

---

## 11. Result integrity

Completion is gated on **benchmark completeness, not on Salvor winning**.

There is no logic anywhere that branches on whether Salvor outperformed a
baseline. No condition is suppressed, no failed task omitted, no run repeated
until favourable, no synthetic or estimated number substituted for a failed run,
no brain edited after seeing results, no scoring rule changed.

If Salvor loses, the suite still finishes, the report still generates, and README
and the site publish the real numbers. If the matrix is incomplete,
`summary.json` is stamped `"complete": false` with the exact shortfall and the
public surfaces are **not** populated at all — partial numbers are worse than no
numbers, because they look finished.
