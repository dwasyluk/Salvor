# Notebook — agent entrypoint (Gemini)

Before any work: read `CLAUDE.md` (the hub) + the relevant spoke (`api/CLAUDE.md` or
`web/CLAUDE.md`) + `RULES.md` + `.salvor/active_state.md` (L1). Follow `RULES.md` exactly —
especially §0 (Task Termination Protocol) and the three capture triggers.

The core Salvor files are vendor-neutral; this file is just the entrypoint adapter for
Gemini CLI. The canonical context lives in `CLAUDE.md` (Codex uses `AGENTS.md`).
