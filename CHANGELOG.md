# Changelog

All notable changes to Salvor are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); Salvor's own repo
versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Two version layers, don't conflate them:** this CHANGELOG + the `vX.Y.Z`
> git tags version **Salvor itself**. The `VERSION.md` that Salvor *scaffolds
> into your project* (with per-component build IDs like `API:01`) versions
> **your** project, not Salvor.

## [Unreleased]

### Added
- **Distributed brain protocol (`RULES.md` §10)** — makes the shared brain safe
  for parallel branches, agents, and worktrees:
  - **Self-allocating slug IDs** for every knowledge artifact
    (`LF:<slug>` / `DL:` / `DEC:` / `PM:` / `deferred:<slug>`) replacing all
    sequential numbering (`LF#`, `### N.` deferred entries) — no ID allocation
    reads shared state, so parallel branches cannot collide.
  - **Structured artifact headers** (ID / Subject tags / Claim / Evidence date /
    Status) on every decision, domain learning, postmortem, and learned-failure
    artifact — the machine-comparable key for semantic dedupe.
  - **Brain Reconcile** — a merge/pull-time ceremony: three-way diff of the
    brain, subject-tag pairing, claim comparison, and operator-gated
    classification (distinct / duplicate / overlapping / contradictory /
    supersedes). Contradictions must resolve to exactly one `Status: live`
    entry; superseded artifacts keep their ID as redirects. L1 is re-synthesized
    at merges, never textually merged.
  - **Brain Audit** — a recurring all-pairs semantic self-audit (default every
    3 days, operator-tunable; tracked by a `Last Brain Audit` line in L1). The
    default interval and its configurability are explicitly open for beta
    community feedback.
  - **Integration-bump versioning** ([STRICT]) — `VERSION.md` counters advance
    only on the integration branch; feature branches record `pending` history
    rows, eliminating parallel counter races. Solo direct-to-main flow is
    unchanged.
- **Version-aware upgrade path** — `SETUP_PROMPT.md` declares its protocol
  version and stamps installs (`Salvor-Protocol:` in `.salvor/README.md`);
  re-running a newer prompt proposes only the protocol deltas, three-way-merges
  operator-customized rules (conflicts operator-decided), and never touches
  the knowledge layer. New `docs/UPGRADING.md` with per-version migration
  notes; prompt installs and future plugin installs share the identical
  upgrade path.
- **[EXPERIMENTAL] Agentic provisional capture + archive (`RULES.md`
  §10.5–§10.6, default OFF)** — opt-in `AGENT_CAPTURE = provisional` lets
  agents capture Domain Learnings / Learned Failures / Deferred Findings
  autonomously in a visibly lower trust tier: `Contributed-by`/`Review`
  provenance headers, a `Salvor-Contribution: agent` commit trailer,
  hypothesis-not-invariant consumption across all vendors, no authority over
  ratified knowledge or `RULES.md`, Design Decisions proposal-only, and
  item-by-item human ratification via the Brain Audit. Rejected or aged-out
  contributions (`ARCHIVE_AFTER_DAYS = 90`, tunable) move — IDs and content
  intact — to the new `.salvor/archive/`, which agents never load unless
  instructed. Graduation criteria tracked in a public issue.

### Changed
- Dogfooded and example brains migrated to the slug-ID scheme
  (`LF1`/`LF-1`/`LF01` → `LF:<slug>`); index tables gained ID + Subject
  columns; the README "Multi-agent & distributed teams" section now describes
  the real reconcile/audit mechanism instead of a merge-it-like-code claim.

### Fixed
- Dangling `RULES.md` "§5.3" never-persist references now point to §9.1.
- The root repo's learned failure gained its previously missing cross-linked
  `domain-learnings/` artifact.

## [1.0.0-beta] — 2026-07-27

Initial public beta.

### Changed
- Established GitHub Discussions as the beta community hub, with a prominent
  README feedback route, an X fallback through lowercase `@blockchaindan`,
  direct Community links on GitHub Pages, and documented all-caps discussion
  and issue prefixes that promote accepted `[IDEA]` topics to `[FEAT]` work.
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
- Clarified Serena and GitNexus as optional enhanced integrations that are
  highly recommended for the best code-grounded results.
- Expanded the GitHub Pages presentation with the six-step portable workflow,
  linked integrations, restored standalone Salvor Loop panels, responsive
  3/2/1 process layout, and vendor-agnostic/vendor-portable reasoning. The Loop
  center now keeps its canonical mark clear of the `.salvor/` brain labels and
  presents a vendor-agnostic hub-and-spokes model without embedding optional
  tool brands in the protocol diagram.
- Completed the final presentation hierarchy pass: the small-screen hero panel
  now carries a continuous 1px border across both clipped corners in WF and
  Mystic, 3 Capture Classes uses a stacked-document foundation icon, the Loop
  introduction uses the full section width, and the Serena MCP/GitNexus MCP
  title rows and guidance have a clearer, differentiated hierarchy.
- Standardized lowercase `enhanced` prose across the installer, current
  protocol state, public docs, example, release history, and site while
  preserving literal `ENHANCED-READY` and `ENHANCED-ACTIVE` state tokens.
- Refined the single WebGL hero renderer with lighter neutral smoke,
  hanging-indent bullets, burn-state-aware text selection, and high-resolution
  canvas backing up to Retina density under a four-million-pixel cap while
  preserving mouse/touch burn accumulation, localized black-to-white copy
  transition, and interactive navigation/actions. Tablet and mobile UI
  snapshots add a sharp, padded reading panel that burns from translucent white
  in WF to translucent black in Mystic; laptop/desktop presentation is unchanged.
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
- **Preservation-first knowledge adoption** — during setup or later on demand,
  Salvor can inventory existing docs, READMEs, ADRs, postmortems, runbooks, and
  agent instructions read-only; map selected sections independently to their
  correct canonical owners; and present exact per-item approvals before any
  durable capture. Mixed documents can yield multiple artifact types, mature
  docs can stay canonical in place, and originals remain untouched unless their
  mutation is separately approved.
- **Core vs enhanced modes** — Core mode works with files and prompts alone (no
  extra tooling); enhanced mode layers in optional Serena and GitNexus
  integrations for semantic symbol navigation and code-graph analysis. Both
  are highly recommended for the best code-grounded results. Same protocol
  either way.
- **Three capture classes** (user-gated, verbatim-prompted, with defined
  propagation paths) — **Decision/Domain Learning** (rationale behind choices),
  **Learned Failure** (what didn't work and why; numbered `LF#` in this
  release, slug IDs since), and **Deferred
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
- **Optional enhanced tooling, clearly scoped** — Serena (open source) and GitNexus
  (a third-party project under the PolyForm Noncommercial community license) add code
  intelligence; neither is required for Salvor Core. enhanced-mode setup detects
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
