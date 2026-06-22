# Notebook — agent entrypoint

Before any work: read `CLAUDE.md` (the hub) + the relevant spoke (`api/CLAUDE.md` or
`web/CLAUDE.md`) + `RULES.md` + `docs/active_state.md` (L1). Follow `RULES.md` exactly —
especially §0 (Task Termination Protocol) and the three capture triggers.

The core Salvor files are vendor-neutral; this file is just the entrypoint adapter for
CLIs that read `AGENTS.md` natively (e.g. Codex). Claude Code uses the `CLAUDE.md` hub.

<!-- GitNexus appends its <!-- gitnexus:start --> … <!-- gitnexus:end --> block here after `gitnexus analyze`. -->
