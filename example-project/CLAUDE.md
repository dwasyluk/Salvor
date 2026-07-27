# Notebook
### CURRENT STATE (L1 Cache)
@.salvor/active_state.md

> For deep historical context, architecture logs, or context recovery: `.salvor/active_state_verbose.md`

## Project Overview
Notebook is a tiny notes service: a TypeScript `api` (Node built-in `http`, no framework) exposing a small REST surface (`GET/POST/DELETE /notes`) backed by an in-memory `Map`, plus a static `web` page (plain DOM, no framework) that fetches and posts notes against the API base. The dominant non-obvious constraint: **the store is purely in-memory — all notes are lost on API restart, there is no persistence.** This is a worked Salvor example, deliberately minimal so Serena can navigate real symbols and GitNexus can index their relationships.

## Architecture

| Component | Stack | Spoke |
|-----------|-------|-------|
| api | Node + TypeScript (built-in `http`) | @api/CLAUDE.md |
| web | TypeScript + static HTML (plain DOM) | @web/CLAUDE.md |

## Documentation Map

| Document | Purpose | When to Read |
|----------|---------|-------------|
| `.salvor/DOMAIN_REF.md` | Domain logic, business rules, learned failures | Changing core logic |
| `.salvor/INFRA.md` | Running, env vars, deployment, external APIs | Changing infra/deployment/APIs |
| `.salvor/DEFERRED_TODOS.md` | Known out-of-scope issues deferred (not yet fixed) | Before starting related work |
| `.salvor/decisions/` | Design decisions + load-bearing invariants (why it's this way, what must stay) | Before changing/refactoring anything non-trivial |
| `api/CLAUDE.md` | api architecture and key files | Working in api/ |
| `web/CLAUDE.md` | web architecture and key files | Working in web/ |
| `.serena/memories/` | Enhanced-mode retrieval pointers and structural notes (not canonical truth) | Use Serena MCP tools to query |

## APP_NAME
The API reads `APP_NAME` from the environment; the static web client reads
`data-app-name` from `index.html`. Both default to `Notebook`. Runtime display
and log sites reference those configuration sources rather than embedding the
project name independently.

### SYSTEM DIRECTIVE: TWO-TIER MEMORY MANAGEMENT
You maintain two memory ledgers: `.salvor/active_state.md` (L1 Cache — Concise) and `.salvor/active_state_verbose.md`
(L2 Cache — Deep Memory).

**L1 — active_state.md (Concise)**
- **Role:** Primary context for every session. Auto-loaded via `@` import (Claude Code) or read first (other CLIs).
- **Content:** Final confirmed logic, active deltas vs published behavior, infra status, and "Learned Failures."
- **Constraints:** MAXIMUM 50 LINES. Dense technical shorthand; non-standard abbreviations optimal for token density.
- **Update Trigger:** After every confirmed resolution, milestone, or architectural shift.

**L2 — active_state_verbose.md (Deep Archive)**
- **Role:** Permanent repository for reasoning, historical logs, raw tool outputs, and rejected hypotheses.
- **Update Trigger:** Immediately after updating L1 — offload the nuance pruned from L1.
- **Constraint:** Detailed but curated. When L2 exceeds ~1,500 lines or at release milestones, condense the oldest
  resolved sections — keep durable conclusions, evidence references, and commit/test/issue IDs; drop raw noise (never
  persist material on the `RULES.md` §5.3 never-persist list). Do NOT read unless explicitly instructed or during
  context recovery (memory loops).

**Execution Rules:**
- Update both files autonomously and silently. Do not ask permission for L1/L2 writes.
- On any major learning or infra nuance: update L1 instantly with shorthand and L2 with detail.

### SYSTEM DIRECTIVE: THREE CAPTURE CLASSES
Salvor may update concise operational state as work progresses. It must ask before promoting a decision, domain learning,
learned failure, or deferred finding into the repository's durable shared engineering record. You self-identify knowledge
worth persisting and ask me, verbatim, before persisting it. Three distinct capture classes (see `RULES.md` §2 and §7):
1. **Decision / Domain Learning** — a discovery, decision, or design invariant + its *why*. `"Save this as a domain learning? (yes/no)"` (a **Domain Learning** → `.salvor/domain-learnings/`) or `"Record this as a design decision? (yes/no)"` (a **Design Decision** → `.salvor/decisions/`)
2. **Learned Failure (LF#)** (a structural failure mode) → registered in `.salvor/DOMAIN_REF.md` as part of the above.
3. **Deferred Finding** (an out-of-scope finding surfaced mid-task) → `"Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"`

## GitNexus — Code Intelligence (Enhanced mode)

GitNexus owns machine-derived structural knowledge (symbols, call graphs, impact analysis); Salvor owns approved
engineering rationale in `.salvor/`. Recommended default: `gitnexus analyze --index-only` (v1.6.9+; pure index — no
context-file injection, no generated skills, no hooks). Detect capabilities with `gitnexus analyze --help`; on older
versions fall back to `--skip-agents-md` and gitignore any generated `.claude/skills/gitnexus-*/`. Run impact analysis
Only when GitNexus's MCP tools actually respond in the current client, run impact
analysis before edits and change-detection before committing; report
HIGH/CRITICAL blast radius before proceeding. If the MCP is unavailable, state
that and use the best structural review fallback. Never run `gitnexus setup`
without approval. Core mode works without GitNexus.
