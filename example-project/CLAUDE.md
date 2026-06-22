# Notebook
### CURRENT STATE (L1 Cache)
@docs/active_state.md

> For deep historical context, architecture logs, or dementia recovery: `docs/active_state_verbose.md`

## Project Overview
Notebook is a tiny notes service: a TypeScript `api` (Node built-in `http`, no framework) exposing a small REST surface (`GET/POST/DELETE /notes`) backed by an in-memory `Map`, plus a static `web` page (plain DOM, no framework) that fetches and posts notes against the API base. The dominant non-obvious constraint: **the store is purely in-memory — all notes are lost on API restart, there is no persistence.** This is a worked Salvor example, deliberately minimal so Serena + GitNexus have real code to index.

## Architecture

| Component | Stack | Spoke |
|-----------|-------|-------|
| api | Node + TypeScript (built-in `http`) | @api/CLAUDE.md |
| web | TypeScript + static HTML (plain DOM) | @web/CLAUDE.md |

## Documentation Map

| Document | Purpose | When to Read |
|----------|---------|-------------|
| `docs/DOMAIN_REF.md` | Domain logic, business rules, learned failures | Changing core logic |
| `docs/INFRA.md` | Running, env vars, deployment, external APIs | Changing infra/deployment/APIs |
| `docs/DEFERRED_TODOS.md` | Known out-of-scope issues deferred (not yet fixed) | Before starting related work |
| `api/CLAUDE.md` | api architecture and key files | Working in api/ |
| `web/CLAUDE.md` | web architecture and key files | Working in web/ |
| `.serena/memories/` | Codebase structure, execution logic, domain findings | Use Serena MCP tools to query |

## APP_NAME
Configurable via `APP_NAME` env var. Default: `Notebook`. Never hardcode — reference the env var or the
language-specific constant your build wires up.

### SYSTEM DIRECTIVE: TWO-TIER MEMORY MANAGEMENT
You maintain two memory ledgers: `docs/active_state.md` (L1 Cache — Concise) and `docs/active_state_verbose.md`
(L2 Cache — Deep Memory).

**L1 — active_state.md (Concise)**
- **Role:** Primary context for every session. Auto-loaded via `@` import (Claude Code) or read first (other CLIs).
- **Content:** Final confirmed logic, active deltas vs published behavior, infra status, and "Learned Failures."
- **Constraints:** MAXIMUM 50 LINES. Dense technical shorthand; non-standard abbreviations optimal for token density.
- **Update Trigger:** After every confirmed resolution, milestone, or architectural shift.

**L2 — active_state_verbose.md (Deep Archive)**
- **Role:** Permanent repository for reasoning, historical logs, raw tool outputs, and rejected hypotheses.
- **Update Trigger:** Immediately after updating L1 — offload the nuance pruned from L1.
- **Constraint:** NO LINE LIMIT. Do NOT read unless explicitly instructed or when "dementia" (memory loops) occurs.

**Execution Rules:**
- Update both files autonomously and silently. Do not ask permission for L1/L2 writes.
- On any major learning or infra nuance: update L1 instantly with shorthand and L2 with detail.

### SYSTEM DIRECTIVE: THREE KNOWLEDGE-CAPTURE TRIGGERS
You self-identify knowledge worth persisting and ask me, verbatim, before persisting it. Three distinct triggers (see
`RULES.md` §2 and §7):
1. **Continued Learning** (a discovery + its *why*) → `"Save this as a domain-tuning artifact? (yes/no)"`
2. **Learned Failure (LF#)** (a structural failure mode) → registered in `docs/DOMAIN_REF.md` as part of the above.
3. **Deferred TODO** (an out-of-scope finding surfaced mid-task) → `"Log this to docs/DEFERRED_TODOS.md? (yes/no)"`

# GitNexus — Code Intelligence

[Run `gitnexus analyze` after the initial commit. It appends a
`<!-- gitnexus:start --> … <!-- gitnexus:end -->` block here with symbol/relationship counts and tool routing.]
