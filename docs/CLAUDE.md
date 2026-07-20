# docs — public and architectural documentation

Markdown documentation comprising root `README.md` and the complete `docs/` directory.

## Key Files
- `../README.md` — canonical public overview, quickstart, feature support, and roadmap
- `ARCHITECTURE.md` — Salvor's design and memory model
- `VENDOR_ADAPTERS.md` — cross-vendor adapter support and constraints
- `FAQ.md` — positioning, trust, and operational questions

## Architecture Notes
- Keep public claims consistent with `../SETUP_PROMPT.md` and current implementation status.
- Canonical product content, documentation, and site source all live on `main`. The deployable static site is `site/`, and `.github/workflows/pages.yml` deploys it from `main` via GitHub Actions. Pushing and deploying remain operator-controlled actions.
- New website presentation elements require operator design approval; documentation changes do not silently invent page structure.

## Validation
- Check links and paths, scan for stale vendor/version claims, and inspect rendered Markdown when layout matters.

## Build
- No compilation. `VERSION.md` key: `DOCS`; derived constant: `DOCS_BUILD`.

Use `.salvor/DOMAIN_REF.md` for product truth and `.salvor/INFRA.md` for operational details.
