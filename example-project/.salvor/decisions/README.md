# Design Decisions & Invariants

Dated, frozen records of **why Notebook's code is shaped the way it is — and what must
stay true.** Where `domain-learnings/` holds empirical findings and `postmortems/` hold
incidents, `decisions/` holds deliberate **design decisions and load-bearing invariants**
— so a fresh session understands the rationale *before* it changes something, including
when it touches an adjacent component that quietly depends on this one.

## Naming
`YYYY-MM-DD-[short-slug].md` — artifact ID `DEC:<kebab-slug>` (RULES §10.1)

## Entry template
- **Structured header** — ID / Subject / Claim / Evidence date / Status (RULES §10.1).
- **Context** — the situation/forces that led to the decision.
- **Decision** — what was chosen.
- **Rationale** — the *why* that must outlive the refactor.
- **Invariant** — what must stay true; what NOT to "fix" without first understanding this.
- **Coupling / blast radius** — which components/files depend on this; touch with care
  (pair with a GitNexus impact check when the GitNexus MCP is active; otherwise
  use the best available structural search/review fallback).
- **Alternatives rejected** — and why.

## Index
| Date | ID | Decision | Subject | Invariant (one-line) | Touches |
|------|----|----------|---------|----------------------|---------|
| 2026-06-20 | DEC:store-returns-copies | [store returns copies](./2026-06-20-store-returns-copies.md) | api, store, mutation-safety | Never hand out references to Notes inside the store | `api/src/store.ts`, all Note readers |
