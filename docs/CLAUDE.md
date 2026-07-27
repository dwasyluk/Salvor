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
- Canonical product content, documentation, and site source all live on `main`. The deployable static site is `site/`, and `.github/workflows/pages.yml` deploys it from `main` via GitHub Actions. Pushing and deploying remain operator-controlled actions.
- New website presentation elements require operator design approval; documentation changes do not silently invent page structure.
- README and social identity use the generated regular-logo/wordmark family; favicon and touch-icon consumers use the small-logo family. The adaptive favicon may add theme CSS to a generated derivative, but it must preserve the canonical `LOGO-SM.svg` geometry and source bytes. Never restore or independently redraw retired W10, badge, gem, or node-sigil assets.

## Validation
- Check links and paths, scan for stale vendor/version claims, and inspect rendered Markdown when layout matters.

## Build
- No compilation. `VERSION.md` key: `DOCS`; current build `DOCS:14`; derived constant: `DOCS_BUILD`.

Use `.salvor/DOMAIN_REF.md` for product truth and `.salvor/INFRA.md` for operational details.
