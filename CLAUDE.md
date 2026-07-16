# salvor
### CURRENT STATE (L1 Cache)
@.salvor/active_state.md

> Deep history and dementia recovery: `.salvor/active_state_verbose.md`

## Project Overview
Salvor is a prompt-and-documentation framework that gives repositories a version-controlled institutional brain shared across sessions, contributors, and LLM vendors. Its universal installer is `SETUP_PROMPT.md`; public guidance lives in `README.md` and `docs/`; the planned GitHub Pages site is a generated presentation mirror. The non-obvious invariant is that repository knowledge and rationale are canonical, while vendor entrypoints and public surfaces stay thin and synchronized.

## Architecture
| Component | Stack | Spoke |
|-----------|-------|-------|
| core | Markdown prompt protocol | @core/CLAUDE.md |
| web | Static GitHub Pages (planned; metadata-only) | @site/CLAUDE.md |
| docs | Markdown | @docs/CLAUDE.md |

## Documentation Map
| Document | Purpose | When to Read |
|----------|---------|--------------|
| `.salvor/DOMAIN_REF.md` | Domain truth and learned failures | Changing protocol/product logic |
| `.salvor/INFRA.md` | Local, release, GitHub Pages, external tooling | Changing infra/deployment/APIs |
| `.salvor/DEFERRED_TODOS.md` | User-approved out-of-scope findings | Before related work |
| `core/CLAUDE.md` | Universal setup protocol | Changing `SETUP_PROMPT.md` |
| `site/CLAUDE.md` | Planned public site and sync contract | Changing future `site/` |
| `docs/CLAUDE.md` | README and documentation architecture | Changing `README.md` or `docs/` |
| `.serena/memories/` | Shared structure, conventions, commands | Query through Serena MCP |

## APP_NAME
Use `APP_NAME`; default `salvor`. Never introduce a separate hardcoded application-name constant.

### SYSTEM DIRECTIVE: TWO-TIER MEMORY MANAGEMENT
Maintain `.salvor/active_state.md` (L1, ≤50 lines, confirmed current logic/deltas/infra/LFs) and `.salvor/active_state_verbose.md` (L2, unlimited reasoning/history/raw evidence). Update L1 silently after every confirmed resolution, milestone, or architectural shift, then immediately preserve pruned nuance in L2. Read L2 only when explicitly requested or during dementia recovery.

### SYSTEM DIRECTIVE: THREE KNOWLEDGE-CAPTURE TRIGGERS
For each continued-learning discovery or Learned Failure, pause and ask exactly: `Save this as a domain-tuning artifact? (yes/no)`. For out-of-scope findings, ask exactly: `Log this to .salvor/DEFERRED_TODOS.md? (yes/no)`. Never infer, silently save, or batch unrelated discoveries; follow `RULES.md` §2 and §7 on approval.

# GitNexus — Code Intelligence
<!-- GitNexus context is appended after the initial scaffold commit. -->
