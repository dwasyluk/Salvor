# .salvor/ — salvor's brain

This folder is salvor's git-tracked memory: shared, vendor-agnostic canonical
knowledge available to each supported coding agent through its compatible
entrypoint. Thin adapters make it vendor-portable without moving or duplicating
that memory.
Governance and vendor entrypoints live at the repository root in `CLAUDE.md`,
`AGENTS.md`, `GEMINI.md`, `RULES.md`, and `VERSION.md`.

| File | What it is |
|------|------------|
| `active_state.md` | **L1** — ≤50-line dense current state and Learned Failures |
| `active_state_verbose.md` | **L2** — detailed but curated archive of reasoning and rejected hypotheses (rotated per `RULES.md` §0.3) |
| `DOMAIN_REF.md` | Authoritative current truth and the LF# registry |
| `INFRA.md` | Running, environment variables, deployment, external tools, and observability |
| `DEFERRED_TODOS.md` | User-approved out-of-scope findings not yet fixed |
| `decisions/` | User-approved design decisions, rationale, invariants, and coupling |
| `domain-learnings/` | Dated, frozen empirical discoveries and validated domain knowledge |
| `postmortems/` | Incident write-ups that feed LF# and deferred findings |

Everything here is intended for humans and agents alike: it preserves the why behind the repository.
