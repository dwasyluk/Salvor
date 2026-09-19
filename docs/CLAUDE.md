# docs — public and architectural documentation

Markdown documentation comprising root `README.md` and the complete `docs/` directory.

## Key Files
- `../README.md` — canonical public overview, quickstart, feature support, and roadmap
- `ARCHITECTURE.md` — Salvor's design and memory model
- `VENDOR_ADAPTERS.md` — cross-vendor adapter support and constraints
- `FAQ.md` — positioning, trust, and operational questions
- `../assets/brand/BRAND_ASSETS.md` — canonical authored-SVG brand ownership and regeneration contract

## Architecture Notes
- Keep public claims consistent with `../SETUP_PROMPT.md` and current implementation status.
- The approved public category is **repo-native engineering knowledge layer**;
  **persistent engineering cognition** names the durable, governed knowledge
  carried across sessions, contributors, branches, and models. Keep the public
  distinction explicit: Git preserves what changed; Salvor preserves what the
  project learned.
- Knowledge adoption is current beta behavior, not roadmap work: setup-time and
  later requests use one preservation-first, section-level mapping flow with
  explicit canonical ownership and untouched originals by default.
- Claude Code Projects beta is a complementary Anthropic orchestration surface:
  a coordinating conversation can launch parallel Claude Code cloud threads,
  while Project memory remains vendor-workspace state separate from repository
  `CLAUDE.md`. Salvor's distinct job is repo-owned, Git-reviewed engineering
  knowledge governance and portability. Keep cloud-environment/local-tooling
  boundaries explicit and do not imply completed compatibility validation.
  This comparison was last verified 2026-09-18 against Anthropic's official
  Projects announcement, Help Center article, and Claude Code Projects docs.
- When naming `CLAUDE.md`, explain that it is the canonical cross-vendor hub implementation and that thin `AGENTS.md`/`GEMINI.md` adapters route other supported agents to the same repository-owned brain; never imply that the memory model is Claude-only.
- Canonical product content, documentation, and site source all live on `main`. The deployable static site is `site/`, and `.github/workflows/pages.yml` deploys it from `main` via GitHub Actions. Pushing and deploying remain operator-controlled actions.
- New website presentation elements require operator design approval; documentation changes do not silently invent page structure.
- `docs/roadmap-issues.md` is an ignored local issue-authoring handoff, not
  public distributable documentation. Shipped tests must enforce roadmap
  invariants against packaged public sources such as the README instead of
  reading that internal file.
- Public feedback routing is owned by the root README and `CONTRIBUTING.md`: GitHub Discussions is the shared community hub, the official `@SalvorKnows` X account is a secondary project-updates/community channel, and actionable work moves to Issues/PRs.
- The README's primary validation narrative is longitudinal and explicitly
  open. Keep the exploratory short-horizon beta public under `benchmarks/`, but
  do not present its score table as validation of mature-repository knowledge
  compounding.
- README and social identity use the generated regular-logo/wordmark family; favicon and touch-icon consumers use the small-logo family. The adaptive favicon may add theme CSS to a generated derivative, but it must preserve the canonical `LOGO-SM.svg` geometry and source bytes. Never restore or independently redraw retired W10, badge, gem, or node-sigil assets.
- The README may use the operator-supplied Foundation-inspired artwork only as
  a single personality flourish after `Why "Salvor"?`; keep it subordinate to
  the engineering narrative, locally referenced, responsive through native
  GitHub rendering, and free of affiliation or endorsement claims.

## Validation
- Check links and paths, scan for stale vendor/version claims, and inspect rendered Markdown when layout matters.

## Build
- No compilation. `VERSION.md` key: `DOCS`; current build `DOCS:25`; derived constant: `DOCS_BUILD`.

Use `.salvor/DOMAIN_REF.md` for product truth and `.salvor/INFRA.md` for operational details.
