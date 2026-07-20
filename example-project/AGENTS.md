# Notebook — agent entrypoint

Before any work: read `CLAUDE.md` (the hub) + the relevant spoke (`api/CLAUDE.md` or
`web/CLAUDE.md`) + `RULES.md` + `.salvor/active_state.md` (L1). Follow `RULES.md` exactly —
especially §0 (Task Termination Protocol) and the three capture classes.

The core Salvor files are vendor-neutral; this file is just the entrypoint adapter for
CLIs that read `AGENTS.md` natively (e.g. Codex). Claude Code uses the `CLAUDE.md` hub.

**Do not duplicate or fork project knowledge into this adapter.** Canonical engineering
knowledge lives in its one assigned owner: approved rationale in `.salvor/` and the
`CLAUDE.md` hub + component spokes; GitNexus owns machine-derived code structure (symbols,
call graphs, impact). Serena memories and vendor adapters like this file are concise
retrieval / routing aids only — never durable knowledge stores. Keep this file a
one-paragraph pointer. GitNexus safe default: `gitnexus analyze --index-only` (pure index,
v1.6.9+; `--skip-agents-md` on older versions).
