# bench — clean-room benchmark harness

Python (uv) subsystem measuring the **recommended Salvor stack** (Salvor +
Serena + GitNexus) against matched baselines on two third-party benchmarks. It
is deliberately isolated: its own `pyproject.toml`/`uv.lock`, no reference from
the root `package.json`, and nothing installed by normal Salvor setup.

## Key Files
- `METHODOLOGY.md` — the protocol, written to be attacked; the canonical answer to any "is this fair?" question
- `conf/mcp-policy.yaml` — per-arm MCP namespace allow/deny; the isolation contract
- `conf/agent.yaml` — byte-identical agent config across all six arms
- `conf/pricing.json` — rate card mirror (Python source of truth is `cost/pricing.py`)
- `results/beta/` — canonical results; every published number derives from `summary.json`

## Architecture Notes
- **Six arms, one agent.** S1/S2/S3 (SWE-Bench-CL pytest ×19) and C1/C2/C3
  (CooperBench `flash`) all run Claude Code headless on `claude-sonnet-5` with a
  byte-identical `conf/agent.yaml`. Arms differ only in memory and coordination.
- **Import upstream, never fork it.** The agent command is built by CooperBench's
  own `_build_claude_command`; if upstream changes its flags, every arm changes
  together. Forking it would let the arms drift apart silently.
- **Isolation is a namespace policy, not "no MCP".** S2 legitimately runs a
  memory MCP server — that server is the treatment. Never describe S2 as an
  MCP-clean baseline.
- **Availability is gated; utilisation is telemetry.** Health checks must pass
  before task exposure, but an arm that never calls an available tool is
  exhibiting valid model behaviour. Never inject a synthetic call to satisfy an
  assertion — that manufactures the effect being measured.
- **The evaluator never feeds memory.** Binding on S2 and S3: the external
  SWE-bench result must not enter memory nor gate a write. Only evidence the
  agent observed itself may persist.
- **Cost is computed, never reported.** Prices come from a rate card read from
  Anthropic's official pricing page, applied to token categories — never from
  the CLI's `total_cost_usd`. Re-read the page before changing a rate.
- **Reduction touches pairs only.** If measured cost forces a cut, reduce
  CooperBench pair count via the frozen outcome-blind subset. Never reduce the
  SWE-Bench-CL sequence, turn limits, tool access or evaluator semantics.
- **Completeness, not victory.** No code branches on whether Salvor won. If the
  matrix is incomplete, `summary.json` is stamped `"complete": false` and the
  public surfaces stay unpopulated — partial numbers look finished and are worse
  than none.

## Validation
- `uv run pytest` — harness units (cost extraction, ledger tamper-evidence,
  subset determinism, isolation policy, curriculum ordering).
- `uv run salvorbench report` — regenerates `summary.json` + `REPORT.md`, then
  runs the publishability verifier: completeness per arm, ledger/state hash
  chains (documented exceptions in `conf/state-chain-exceptions.json` surface
  as warnings, anything else blocks), treatment-freeze ordering, and per-arm
  MCP namespace compliance computed from observed unit telemetry into
  `summary.isolation`.

## Build
- No compilation. `VERSION.md` key: `BENCH`; current build `BENCH:01`; derived constant: `BENCH_BUILD`.

Use `METHODOLOGY.md` for protocol truth, `.salvor/DOMAIN_REF.md` for product truth, and `.salvor/INFRA.md` for operational details.
