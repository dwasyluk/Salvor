# Benchmark report

> **This run is incomplete and its numbers are NOT published.**
> Arms with data: none. A benchmark missing arms cannot support a
> comparison, and partial numbers look finished — which makes them worse
> than none. README and the site remain unpopulated until every arm is
> complete and `salvorbench verify` passes.

Model: `claude-sonnet-5` · generated 2026-08-19T02:19:20.879Z

Salvor arms measure the **recommended stack — Salvor + Serena + GitNexus —
as a system**. They do not isolate Salvor core.

## Integrity

- cost ledger chain verified: **True**
- run state chain verified: **False**
- condition-correlated infra spread: 0.0 pp
- total spend: **$3.3836** over 13 billed units

## Disclosures

- The external evaluator result never enters memory nor gates a memory write, in any arm.
- One run per condition. No confidence intervals; differences within noise are not effects.
- Salvor arms measure the recommended stack - Salvor + Serena + GitNexus - as a system. They do not isolate Salvor core.
- SWE-Bench-CL supplies sequencing and difficulty metadata only. Patches are scored by the official SWE-bench harness against SWE-bench_Verified. Upstream's evaluator is never executed.

Full protocol, allow/deny source policy and every known deviation from
upstream: [`METHODOLOGY.md`](../../METHODOLOGY.md).
