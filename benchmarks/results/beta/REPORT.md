# Benchmark report

> **This run is incomplete and its numbers are NOT published.**
> Arms with data: C1, C2, S1. A benchmark missing arms cannot support a
> comparison, and partial numbers look finished — which makes them worse
> than none. README and the site remain unpopulated until every arm is
> complete and `salvorbench verify` passes.

Model: `claude-sonnet-5` · generated 2026-08-19T03:42:08.989Z

Salvor arms measure the **recommended stack — Salvor + Serena + GitNexus —
as a system**. They do not isolate Salvor core.

## Single-agent — SWE-Bench-CL pytest curriculum

Scored by the official SWE-bench harness against SWE-bench_Verified.

| Arm | Resolved | Success rate | Cost | Wall clock | Complete |
|---|---|---|---|---|---|
| **S1** — Stateless | 19/19 | 100.0% | $5.9108 | 2452s | yes |

## Two-agent — CooperBench flash

Scored by CooperBench's own deterministic evaluator.

| Arm | Resolved | Success rate | Cost | Wall clock | Complete |
|---|---|---|---|---|---|
| **C1** — Solo | 27/49 | 55.1% | $16.3367 | 6078s | **no** (49/50) |
| **C2** — Two-agent cooperative | 7/49 | 14.3% | $31.1027 | 6927s | **no** (50/50) |

## Derived comparisons

- `coordination_gap_pp`: **-40.8**

`salvor_uplift_vs_stateless_pp` is a literal S3−S1 difference in
percentage points. It is deliberately **not** called forward transfer:
it does not match that metric's definition.

## Integrity

- cost ledger chain verified: **True**
- run state chain verified: **False**
- condition-correlated infra spread: 2.0 pp
- total spend: **$53.3502** over 119 billed units

## Disclosures

- The external evaluator result never enters memory nor gates a memory write, in any arm.
- One run per condition. No confidence intervals; differences within noise are not effects.
- Salvor arms measure the recommended stack - Salvor + Serena + GitNexus - as a system. They do not isolate Salvor core.
- SWE-Bench-CL supplies sequencing and difficulty metadata only. Patches are scored by the official SWE-bench harness against SWE-bench_Verified. Upstream's evaluator is never executed.

Full protocol, allow/deny source policy and every known deviation from
upstream: [`METHODOLOGY.md`](../../METHODOLOGY.md).
