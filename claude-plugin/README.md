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

## Bundled Serena
- **Pinned release.** `.mcp.json` runs the PyPI release `serena-agent==1.7.0`, not
  the moving `main` branch. To upgrade, bump the pin after checking the new release.
- **Project detection.** `--project-from-cwd` binds Serena to the launch directory
  or its nearest ancestor that contains `.git` or `.serena/project.yml`. If Claude
  Code starts outside any repository (for example in your home folder), Serena
  activates no project rather than indexing that folder.
- **Upgrading from an earlier plugin build.** Earlier builds passed
  `--project ${CLAUDE_PROJECT_DIR}`, which bound Serena to whatever folder Claude
  Code was started in. If that was your home folder, Serena may have left
  `~/.serena/project.yml` behind. While that file exists, `--project-from-cwd`
  treats your home folder as a project, so any launch from a folder under your
  home folder that isn't inside a repository still binds to your home folder.
  Remove only that one file, because `~/.serena/` also
  holds Serena's global `serena_config.yml`. Optionally, also delete the
  home-folder entry under `projects:` in that config. This fix ships as plugin
  version 0.1.1; update the plugin so the new launch settings are used.
- **Files it creates.** On first start in a repository, Serena writes `.serena/`
  (`project.yml`, `memories/`, and its own `.gitignore` for `cache/` and
  `project.local.yml`). Salvor's setup treats `.serena/memories/` as committed, so
  review these files before your first commit.

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
