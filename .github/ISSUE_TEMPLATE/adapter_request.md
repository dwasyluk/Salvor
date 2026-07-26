---
name: Vendor adapter request
about: Request or contribute support for another LLM CLI (Codex, Gemini, Cursor, etc.)
title: "[adapter] "
labels: adapter
---

**Which vendor / CLI**
e.g. Codex, Gemini CLI / Antigravity CLI, Cursor, OpenCode. (Gemini CLI and Antigravity CLI both use the compatible `GEMINI.md` entrypoint.)

**Native entrypoint**
How does this tool auto-load project instructions? (e.g. `AGENTS.md`, `GEMINI.md`, a settings file.)

**Memory / hooks**
Does it have a per-session memory mechanism? A way to enforce per-turn instructions (hooks/custom-instructions)?

**MCP support**
Does it support MCP servers (so Serena + GitNexus work)? Any setup quirks?

**Willing to contribute?**
Salvor's core is vendor-agnostic repository Markdown; a compatible thin
entrypoint adapter makes that shared brain vendor-portable. PRs welcome — see
`docs/VENDOR_ADAPTERS.md`.
