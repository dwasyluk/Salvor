# .salvor/ — Notebook's brain

This folder is Notebook's **git-tracked memory**, maintained by Salvor — the shared,
canonical knowledge every contributor's coding agent reads. (Governance and
entrypoints live at the repo root: `CLAUDE.md` hub + `api`/`web` spokes, `RULES.md`,
`VERSION.md`.)

| File | What it is |
|------|-----------|
| `active_state.md` | **L1** — ≤50-line dense current state + Learned Failures (auto-loaded) |
| `active_state_verbose.md` | **L2** — unbounded deep archive: reasoning, rejected hypotheses |
| `DOMAIN_REF.md` | Authoritative current truth + the `LF#` learned-failure registry |
| `INFRA.md` | Running, env vars, deployment, external APIs |
| `DEFERRED_TODOS.md` | Out-of-scope findings parked (not yet fixed) |
| `domain-tuning/` | Dated, frozen empirical findings (probes, bakeoffs — the receipts) |
| `decisions/` | Design decisions + load-bearing invariants (why it's this way; what must stay; what depends on it) |
| `postmortems/` | Incident write-ups feeding `LF#` + deferred TODOs |

Everything here is meant to be **read by humans and agents alike** — it's the *why*
behind the code.
