# .salvor/ — Notebook's brain

This folder is Notebook's **git-tracked memory**, maintained by Salvor — shared,
vendor-agnostic canonical knowledge available to each supported coding agent
through its compatible entrypoint. Thin adapters make it vendor-portable
without moving or duplicating that memory. (Governance and entrypoints live at the repo root:
`CLAUDE.md` hub + `api`/`web` spokes, `RULES.md`, `VERSION.md`.)

| File | What it is |
|------|-----------|
| `active_state.md` | **L1** — ≤50-line dense current state + Learned Failures (auto-loaded) |
| `active_state_verbose.md` | **L2** — detailed but curated archive: reasoning, rejected hypotheses (rotated per `RULES.md` §0.3) |
| `DOMAIN_REF.md` | Authoritative current truth + the `LF#` learned-failure registry |
| `INFRA.md` | Running, env vars, deployment, external APIs |
| `DEFERRED_TODOS.md` | Out-of-scope findings parked (not yet fixed) |
| `domain-learnings/` | Dated, frozen empirical findings (probes, bakeoffs — the receipts) |
| `decisions/` | Design decisions + load-bearing invariants (why it's this way; what must stay; what depends on it) |
| `postmortems/` | Incident write-ups feeding `LF#` + deferred TODOs |

Everything here is meant to be **read by humans and agents alike** — it's the *why*
behind the code.
