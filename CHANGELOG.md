# Changelog

All notable changes to Salvor are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); Salvor's own repo
versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Two version layers, don't conflate them:** this CHANGELOG + the `vX.Y.Z`
> git tags version **Salvor itself**. The `VERSION.md` that Salvor *scaffolds
> into your project* (with per-component build IDs like `API:01`) versions
> **your** project, not Salvor.

## [Unreleased]

## [1.0.0-beta] — 2026-07-27

Initial public beta.

### Changed
- Replaced the reconstructed W10 mark family with the exact operator-authored
  `LOGO.svg` regular master and `LOGO-SM.svg` favicon master. The deterministic
  pipeline now produces geometry-identical black/white SVGs and 16–512 PNGs for
  both families, uses uniform scaling, and propagates the regular logo through
  the hero navigation, footer, README, social cards, metadata, and Loop assets
  without changing the hero background artwork.
- Added a system-theme-aware canonical SM SVG favicon that renders black in
  light browser chrome and white in dark browser chrome, with an unqualified
  black PNG compatibility fallback. The Apple touch icon remains black.
- Defined the vendor-agnostic repository core separately from vendor
  portability through compatible thin adapters, including explicit adapter
  maturity and memory-migration boundaries.
- Clarified Serena and GitNexus as optional Enhanced integrations that are
  highly recommended for the best code-grounded results.
- Expanded the GitHub Pages presentation with the six-step portable workflow,
  linked integrations, restored standalone Salvor Loop panels, responsive
  3/2/1 process layout, and vendor-agnostic/vendor-portable reasoning. The Loop
  center now keeps its canonical mark clear of the `.salvor/` brain labels and
  identifies Serena/GitNexus in a separate optional-Enhanced pill.
- Refined the single WebGL hero renderer with lighter neutral smoke,
  hanging-indent bullets, burn-state-aware text selection, and high-resolution
  canvas backing up to Retina density under a four-million-pixel cap while
  preserving mouse/touch burn accumulation, localized black-to-white copy
  transition, and interactive navigation/actions.
- Aligned the installer, adapters, FAQ, dogfooded protocol, and example project
  on the one-owner model: `.salvor/` holds canonical approved knowledge;
  adapters and Serena memories remain retrieval aids; GitNexus owns only its
  machine-derived, gitignored index.
- Upgraded the CI and GitHub Pages workflows to current supported GitHub Action
  majors and added release contracts that reject stale action versions,
  component-build drift, and release-record drift.

### Fixed
- Hero burn-off now reveals the tracked full-color mystic artwork instead of the
  dark fallback on desktop and mobile; browser regressions cover the truth
  layer's visibility, image loading, hero coverage, and cover-fit behavior.

### Added
- **`SETUP_PROMPT.md`** — the self-contained, prompt-first scaffolder. Paste it
  into any LLM CLI; it interviews your project and generates the full Salvor
  structure (hub-and-spoke `CLAUDE.md`, L1/L2 cache, `RULES.md`, component
  spokes, and — when the optional Strict defaults are enabled — a `VERSION.md`
  manifest with per-component build IDs; otherwise Salvor reuses your existing
  version source or a minimal non-counter project history).
- **Installer safety** — the setup prompt runs a preflight check before writing
  anything, never auto-commits (you review and commit the scaffold yourself),
  and is idempotent: re-running it on an already-scaffolded repo detects
  existing Salvor files and updates rather than clobbers.
- **Core vs Enhanced modes** — Core mode works with files and prompts alone (no
  extra tooling); Enhanced mode layers in optional Serena and GitNexus
  integrations for semantic symbol navigation and code-graph analysis. Both
  are highly recommended for the best code-grounded results. Same protocol
  either way.
- **Three capture classes** (user-gated, verbatim-prompted, with defined
  propagation paths) — **Decision/Domain Learning** (rationale behind choices),
  **Learned Failure** (`LF#`, what didn't work and why), and **Deferred
  Finding** (out-of-scope findings, filed to `.salvor/DEFERRED_TODOS.md`).
- **Canonical ownership** — every piece of knowledge has exactly one canonical
  home (`CLAUDE.md` hub, spokes, or `.salvor/`); vendor adapters stay thin
  pointers and never duplicate content.
- **L2 curation + security rules** — explicit rules for what belongs in the L2
  deep archive vs L1, and a hard rule that secrets, credentials, and unredacted
  logs never land in captured artifacts (see `SECURITY.md`).
- **Spec Kit coexistence** — Salvor scopes itself to memory + governance and
  coexists cleanly with spec-driven workflows (e.g. GitHub Spec Kit) rather
  than competing for the same files.
- **`.salvor/` layout** — the git-tracked "brain" (L1/L2, `DOMAIN_REF`, `INFRA`,
  `DEFERRED_TODOS`, `domain-learnings/`, `postmortems/`, and a `README` index) lives
  under one namespaced folder, so Salvor never squats in your project's `docs/`.
  Root governance (`RULES.md`, plus `VERSION.md` when Strict is enabled) and
  entrypoints (`CLAUDE.md` hub/spokes) stay at the repo root. With Strict off,
  Salvor references the project's existing version source or a minimal
  non-counter history artifact in its planned location.
- **`docs/ARCHITECTURE.md`** — the five pillars, plus the shared (in-repo) vs
  per-user (auto-memory) distinction.
- **Multivendor out of the box** — setup generates all three entrypoints by default:
  `CLAUDE.md` (canonical hub) + thin `AGENTS.md` (Codex) + `GEMINI.md` (Gemini CLI /
  Antigravity CLI) pointers, so any teammate's supported CLI works; the Markdown core
  is portable to other agents through thin adapters. See `docs/VENDOR_ADAPTERS.md`.
- **`example-project/`** — a tiny, real, runnable two-component app with Salvor
  fully applied (so Serena + GitNexus have real code to index).
- Contribution scaffolding: `CONTRIBUTING.md`, GitHub issue/PR templates.
- **`SECURITY.md`** — secret-handling expectations for `.salvor/` artifacts,
  trust boundaries (MCP servers, agent/model providers), repository
  prompt-injection guidance, and private vulnerability reporting.
- **CI** — GitHub Actions workflow running the unit (node --test) and browser
  (Playwright) suites on pushes and PRs to `main`.
- **GitHub Pages from `main`** — the site source lives in `site/` on `main`;
  `.github/workflows/pages.yml` deploys it via GitHub Actions (operator-controlled).
- **Optional Enhanced tooling, clearly scoped** — Serena (open source) and GitNexus
  (a third-party project under the PolyForm Noncommercial community license) add code
  intelligence; neither is required for Salvor Core. Enhanced-mode setup detects
  capabilities via `gitnexus analyze --help` and defaults to pure index mode —
  `gitnexus analyze --index-only` (GitNexus v1.6.9+: builds only the code index, no
  context-file writes, no generated skills, no hooks) — falling back to
  `--skip-agents-md` on older versions (which still drop local
  `.claude/skills/gitnexus-*/` skills, gitignored). Generated skills (`--skills`) and
  hooks/MCP config (`gitnexus setup`) are opt-in only.
- **Licensing + brand policy** — Salvor's code and documentation are MIT licensed
  (© 2026 Dan Wasyluk). The Salvor name, logo, wordmark, and official brand artwork
  are governed separately by `TRADEMARKS.md`; MIT is unchanged and commercial products
  built with Salvor are expressly allowed.
- **Social sharing** — an evergreen Open Graph / social-preview card
  (`site/assets/social/salvor-social-card.png`, 1200×630; GitHub preview
  `assets/social/github-social-preview.png`, 1280×640) plus static Open Graph and
  X/Twitter metadata in the site head.
- **Canonical authored brand system** — the exact operator-authored regular and
  small SVG masters drive deterministic black/white variants, exact-size
  favicons, the outlined wordmark, README lockup, full-bleed social
  compositions, canonical loop embedding, machine-readable hashes, drift
  contracts, and visual contact-sheet auditing. Retired badge, node-sigil, gem,
  reconstructed W10 geometry, and hand-built WF approximations do not ship.

[Unreleased]: https://github.com/dwasyluk/salvor/compare/v1.0.0-beta...HEAD
[1.0.0-beta]: https://github.com/dwasyluk/salvor/releases/tag/v1.0.0-beta
