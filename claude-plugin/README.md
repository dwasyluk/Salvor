# Salvor — Claude Code plugin

An **optional** convenience layer for [Salvor](https://github.com/dwasyluk/salvor)
when you use Claude Code. It does **not** replace the universal path — pasting
[`SETUP_PROMPT.md`](../SETUP_PROMPT.md) still works in any LLM CLI. This plugin just
wraps it in slash commands and bundles the two MCP servers.

## What it adds
- **`/salvor:init`** — scaffold Salvor into a repo (new or existing). Runs the
  bundled, byte-identical copy of the canonical `SETUP_PROMPT.md`.
- **`/salvor:status`** — read-only snapshot of the brain (L1, versions, deferred, LF#).
- **`/salvor:capture`** — persist a learning / failure / deferred via the `RULES.md` protocol.
- **`/salvor:health`** — lint the brain for staleness and drift.
- **Bundled MCP** — Serena + GitNexus declared in `.mcp.json`, so install ≈
  Prerequisites done. (Claude Code still asks you to approve each server — by design.)

## Requirements
- A recent Claude Code (`displayName` needs ≥ v2.1.143; inline plugin MCP ≥ v2.1.140).
- `uv` on PATH (for Serena via `uvx`) and Node / `npx` (for GitNexus).
- Already running Serena/GitNexus? You can decline the plugin's copies at the approval prompt.

## Install
```bash
/plugin marketplace add dwasyluk/salvor
/plugin install salvor
```
Then, in any repo: `/salvor:init`.

## Design rule (why this is safe)
The plugin **wraps, never replaces.** Every command maps to something you can do by
hand with the universal prompt + `RULES.md`; **no Salvor capability is
Claude-Code-only.** The `/salvor:init` prompt is kept byte-identical to the repo's
canonical `SETUP_PROMPT.md` via [`scripts/sync-plugin-prompt.sh`](../scripts/sync-plugin-prompt.sh)
(run it whenever the prompt changes; `--check` fails CI on drift).
