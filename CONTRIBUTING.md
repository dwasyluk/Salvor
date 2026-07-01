# Contributing to Salvor

Thanks for helping make Salvor better. It's a small, focused project — contributing
should be light and fast.

## Ways to contribute

- 🐛 **File an issue** — something in the `SETUP_PROMPT`, docs, or example didn't
  work as described.
- 💡 **Request a feature** — a new capture pattern, a `RULES` improvement, a docs fix.
- 💬 **Start a discussion** — open-ended ideas and "how do I adopt this in X?"
- 🔧 **Open a PR** — fixes, docs, and especially **new vendor adapters** (Codex,
  Gemini, Cursor…) and **example projects in other stacks**.

Issues and PRs are both encouraged — no need to ask first for small changes.

## Making a PR

1. Fork, branch, and make your change.
2. Keep it focused — one logical change per PR.
3. Fill in the PR checklist. The four things we care about:
   - **Anonymized.** Templates stay generic — no project-, company-, or
     domain-specific names baked in.
   - **Keep the example representative.** If you change `SETUP_PROMPT.md`, refresh
     `example-project/` so it still reflects what the prompt produces. It doesn't need
     to be byte-identical — just an accurate, representative rendering (the runnable
     app + the `.salvor/` structure). It's a teaching reference, not a strict fixture.
   - **Plugin prompt synced (the one hard rule).** `SETUP_PROMPT.md` is the single
     source of truth. If you edit it, run `scripts/sync-plugin-prompt.sh` so the Claude
     Code plugin's bundled copy stays byte-identical (`scripts/sync-plugin-prompt.sh
     --check` fails CI on drift). Drift between the prompt and the plugin's copy is the
     bug we most want to avoid.
   - **Docs updated** — if behavior or structure changed, update `README.md` /
     `docs/ARCHITECTURE.md` / `docs/VENDOR_ADAPTERS.md`.
   - **CHANGELOG** — add a line under `[Unreleased]` for anything user-visible.
4. Conventional-commit-style messages are appreciated (`feat:`, `fix:`, `docs:`,
   `chore:`) but not enforced.

No CLA, no heavy process. Be kind in reviews.

## What "good" looks like for vendor adapters

A vendor adapter is mostly a thin entrypoint file (e.g. `AGENTS.md` for Codex,
`GEMINI.md` for Gemini) that points the agent at Salvor's neutral in-repo core,
plus notes on that tool's memory + MCP setup. See
[`docs/VENDOR_ADAPTERS.md`](./docs/VENDOR_ADAPTERS.md) for the pattern, and tell us
what actually worked end-to-end — real-world confirmation is valuable.

## Project layout

- `SETUP_PROMPT.md` — the canonical, self-contained installer (single source of truth).
- `example-project/` — the rendered, runnable demonstration (keep in sync with the prompt).
- `claude-plugin/` — the **optional** Claude Code plugin (slash commands + bundled MCP);
  a thin wrapper over the prompt, never a replacement. Kept in sync via `scripts/sync-plugin-prompt.sh`.
- `docs/` — architecture, vendor adapters, the plan of record.
- `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`, `.github/` — the usual.

Thanks again. 🛟
