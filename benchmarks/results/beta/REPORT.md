# Benchmark report

> **Scope:** This beta is an exploratory short-horizon task benchmark. It
> does not directly instantiate Salvor's mature-project longitudinal
> knowledge model and should not be interpreted as a direct test of
> long-term knowledge compounding. Its results remain binding for the
> treatment that ran.

Model: `claude-sonnet-5` · generated 2026-08-20T23:15:53.246Z

Salvor arms measure the **recommended stack — Salvor + Serena + GitNexus —
as a system**. They do not isolate Salvor core.

## Single-agent — SWE-Bench-CL pytest curriculum

Scored by the official SWE-bench harness against SWE-bench_Verified.

| Arm | Resolved | Success rate | Cost | Wall clock | Complete |
|---|---|---|---|---|---|
| **S1** — Stateless | 19/19 | 100.0% | $5.9108 | 2452s | yes |
| **S2** — Ported SWE-Bench-CL semantic memory | 18/19 | 94.7% | $7.3327 | 12848s | yes |
| **S3** — Salvor stack (Salvor + Serena + GitNexus) | 18/19 | 94.7% | $17.3248 | 39625s | yes |

## Two-agent — CooperBench flash

Scored by CooperBench's own deterministic evaluator.

| Arm | Resolved | Success rate | Cost | Wall clock | Complete |
|---|---|---|---|---|---|
| **C1** — Solo | 27/50 | 54.0% | $16.4988 | 6157s | yes |
| **C2** — Two-agent cooperative | 7/50 | 14.0% | $31.4224 | 7012s | yes |
| **C3** — Two-agent cooperative + Salvor stack | 7/50 | 14.0% | $33.7349 | 15543s | yes |

## Derived comparisons

- `coordination_gap_pp`: **-40.0**
- `salvor_coordination_gap_pp`: **-40.0**
- `coordination_penalty_recovered_pct`: **0.0**
- `salvor_uplift_vs_stateless_pp`: **-5.3**

`salvor_uplift_vs_stateless_pp` is a literal S3−S1 difference in
percentage points. It is deliberately **not** called forward transfer:
it does not match that metric's definition.

## Integrity

- cost ledger chain verified: **True**
- run state chain verified: **True**
- condition-correlated infra spread: 0.0 pp
- total spend: **$149.9984** over 303 billed units

## Disclosures

- The external evaluator result never enters memory nor gates a memory write, in any arm.
- One run per condition. No confidence intervals; differences within noise are not effects.
- Salvor arms measure the recommended stack - Salvor + Serena + GitNexus - as a system. They do not isolate Salvor core.
- SWE-Bench-CL supplies sequencing and difficulty metadata only. Patches are scored by the official SWE-bench harness against SWE-bench_Verified. Upstream's evaluator is never executed.

Full protocol, allow/deny source policy and every known deviation from
upstream: [`METHODOLOGY.md`](../../METHODOLOGY.md).
