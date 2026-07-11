# Changelog

All notable changes to Salvor are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); Salvor's own repo
versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Two version layers, don't conflate them:** this CHANGELOG + the `vX.Y.Z`
> git tags version **Salvor itself**. The `VERSION.md` that Salvor *scaffolds
> into your project* (with per-component build IDs like `API:01`) versions
> **your** project, not Salvor.

## [Unreleased]

## [1.1.0] — 2026-07-12

Optional **Claude Code plugin** — a thin wrapper over the universal prompt, never a
replacement. The paste-anywhere `SETUP_PROMPT.md` remains the vendor-agnostic floor;
no Salvor capability is Claude-Code-only.

### Added
- **Claude Code plugin** (`claude-plugin/`), installable via
  `/plugin marketplace add dwasyluk/salvor` → `/plugin install salvor`:
  - `/salvor:init` — scaffold Salvor (runs the byte-identical bundled `SETUP_PROMPT.md`)
  - `/salvor:status` — read-only snapshot of the brain (L1 / versions / deferred / `LF#`)
  - `/salvor:capture` — user-initiated entry to the `RULES.md` capture protocol
  - `/salvor:health` — lint the brain against `HEALTH_CHECKLIST.md`
- **Bundled Serena + GitNexus MCP** (`.mcp.json`) so installing the plugin ≈ prerequisites done.
- `.claude-plugin/marketplace.json` (the repo is its own marketplace) and
  `scripts/sync-plugin-prompt.sh`, which keeps the bundled prompt byte-identical to the
  canonical `SETUP_PROMPT.md` (`--check` fails CI on drift).

## [1.0.0] — 2026-06-22

Initial public release.

### Added
- **`SETUP_PROMPT.md`** — the self-contained, prompt-first scaffolder. Paste it
  into any LLM CLI; it interviews your project and generates the full Salvor
  structure (hub-and-spoke `CLAUDE.md`, L1/L2 cache, `RULES.md`, `VERSION.md`
  with configurable per-component build IDs, component spokes).
- **Three user-gated capture triggers** — Continued Learning (decision
  rationale), Learned Failures (`LF#`), and Deferred TODOs (out-of-scope
  findings), each with a verbatim user prompt and a defined propagation path.
- **`.salvor/` layout** — the git-tracked "brain" (L1/L2, `DOMAIN_REF`, `INFRA`,
  `DEFERRED_TODOS`, `domain-tuning/`, `postmortems/`, and a `README` index) lives
  under one namespaced folder, so Salvor never squats in your project's `docs/`.
  Governance (`RULES.md`, `VERSION.md`) + entrypoints (`CLAUDE.md` hub/spokes) stay
  at the repo root.
- **`docs/ARCHITECTURE.md`** — the five pillars, plus the shared (in-repo) vs
  per-user (auto-memory) distinction.
- **Multivendor out of the box** — setup generates all three entrypoints by default:
  `CLAUDE.md` (canonical hub) + thin `AGENTS.md` (Codex) + `GEMINI.md` (Gemini) pointers,
  so any teammate's CLI works with no vendor to choose. See `docs/VENDOR_ADAPTERS.md`.
- **`example-project/`** — a tiny, real, runnable two-component app with Salvor
  fully applied (so Serena + GitNexus have real code to index).
- Contribution scaffolding: `CONTRIBUTING.md`, GitHub issue/PR templates.

[Unreleased]: https://github.com/dwasyluk/salvor/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/dwasyluk/salvor/releases/tag/v1.1.0
[1.0.0]: https://github.com/dwasyluk/salvor/releases/tag/v1.0.0
