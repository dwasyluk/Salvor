# Changelog

All notable changes to Salvor are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); Salvor's own repo
versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Two version layers, don't conflate them:** this CHANGELOG + the `vX.Y.Z`
> git tags version **Salvor itself**. The `VERSION.md` that Salvor *scaffolds
> into your project* (with per-component build IDs like `API:01`) versions
> **your** project, not Salvor.

## [Unreleased]

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
- **`docs/VENDOR_ADAPTERS.md`** — neutral-core + thin per-vendor adapter model;
  Claude Code adapter built, Codex/Gemini adaptation documented.
- **`example-project/`** — a tiny, real, runnable two-component app with Salvor
  fully applied (so Serena + GitNexus have real code to index).
- Contribution scaffolding: `CONTRIBUTING.md`, GitHub issue/PR templates.

[Unreleased]: https://github.com/dwasyluk/salvor/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/dwasyluk/salvor/releases/tag/v1.0.0
