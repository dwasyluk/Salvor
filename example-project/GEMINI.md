# Notebook — agent entrypoint (Gemini)

Before any work: read `CLAUDE.md` (the hub) + the relevant spoke (`api/CLAUDE.md` or
`web/CLAUDE.md`) + `RULES.md` + `.salvor/active_state.md` (L1). Follow `RULES.md` exactly —
especially §0 (Task Termination Protocol) and the three capture classes.

The core Salvor files are vendor-neutral; this file is just the entrypoint adapter for
Gemini CLI / Antigravity CLI, which read this compatible `GEMINI.md` project-context file.
The canonical context lives in `CLAUDE.md` (Codex uses `AGENTS.md`).

**Do not duplicate or fork project knowledge into this adapter** — shared truth (including
the GitNexus code-intelligence block) belongs only in `CLAUDE.md`, the component spokes,
`.salvor/`, and `.serena/memories/`. Keep this file a one-paragraph pointer.
