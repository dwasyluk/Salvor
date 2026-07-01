# Notebook
### CURRENT STATE (L1 Cache)
@.salvor/active_state.md

> For deep historical context, architecture logs, or dementia recovery: `.salvor/active_state_verbose.md`

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
| `.salvor/DOMAIN_REF.md` | Domain logic, business rules, learned failures | Changing core logic |
| `.salvor/INFRA.md` | Running, env vars, deployment, external APIs | Changing infra/deployment/APIs |
| `.salvor/DEFERRED_TODOS.md` | Known out-of-scope issues deferred (not yet fixed) | Before starting related work |
| `api/CLAUDE.md` | api architecture and key files | Working in api/ |
| `web/CLAUDE.md` | web architecture and key files | Working in web/ |
| `.serena/memories/` | Codebase structure, execution logic, domain findings | Use Serena MCP tools to query |

## APP_NAME
Configurable via `APP_NAME` env var. Default: `Notebook`. Never hardcode — reference the env var or the
language-specific constant your build wires up.

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
- **Constraint:** NO LINE LIMIT. Do NOT read unless explicitly instructed or when "dementia" (memory loops) occurs.

**Execution Rules:**
- Update both files autonomously and silently. Do not ask permission for L1/L2 writes.
- On any major learning or infra nuance: update L1 instantly with shorthand and L2 with detail.

### SYSTEM DIRECTIVE: THREE KNOWLEDGE-CAPTURE TRIGGERS
You self-identify knowledge worth persisting and ask me, verbatim, before persisting it. Three distinct triggers (see
`RULES.md` §2 and §7):
1. **Continued Learning** (a discovery + its *why*) → `"Save this as a domain-tuning artifact? (yes/no)"`
2. **Learned Failure (LF#)** (a structural failure mode) → registered in `.salvor/DOMAIN_REF.md` as part of the above.
3. **Deferred TODO** (an out-of-scope finding surfaced mid-task) → `"Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"`

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **notebook** (161 symbols, 170 relationships, 0 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/notebook/context` | Codebase overview, check index freshness |
| `gitnexus://repo/notebook/clusters` | All functional areas |
| `gitnexus://repo/notebook/processes` | All execution flows |
| `gitnexus://repo/notebook/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
