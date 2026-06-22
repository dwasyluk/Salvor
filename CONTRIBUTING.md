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
   - **Example synced (the one hard rule).** If you edit `SETUP_PROMPT.md`, you must
     re-render `example-project/` so the worked example still matches what the
     prompt produces. The example is our regression test for the prompt — drift
     between them is the bug we most want to avoid.
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
- `docs/` — architecture, vendor adapters, the plan of record.
- `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`, `.github/` — the usual.

Thanks again. 🛟
