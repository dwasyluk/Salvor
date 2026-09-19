# salvorbench

Clean-room benchmark harness measuring the **recommended Salvor stack**
(Salvor + Serena + GitNexus) against matched baselines on two third-party
benchmarks.

> **Scope:** This beta is an exploratory short-horizon task benchmark. It does
> not directly instantiate Salvor's mature-project longitudinal knowledge model
> and should not be interpreted as a direct test of long-term knowledge
> compounding. Its results remain binding for the treatment that ran.

This subsystem is fully isolated from normal Salvor use: it has its own
`pyproject.toml` / `uv.lock`, is not referenced by the repository's root
`package.json`, and installs nothing when you clone Salvor and ignore it.

```bash
cd benchmarks
uv sync
cp .env.example .env      # add ANTHROPIC_API_KEY
uv run salvorbench preflight
uv run salvorbench probe
```

Full protocol — what is measured, how the arms are isolated, how the Salvor
brain is populated, and every deviation from upstream — is in
[`METHODOLOGY.md`](./METHODOLOGY.md). Results and their provenance live under
[`results/beta/`](./results/beta/).
