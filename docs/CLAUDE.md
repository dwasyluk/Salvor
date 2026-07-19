# docs — public and architectural documentation

Markdown documentation comprising root `README.md` and the complete `docs/` directory.

## Key Files
- `../README.md` — canonical public overview, quickstart, feature support, and roadmap
- `ARCHITECTURE.md` — Salvor's design and memory model
- `VENDOR_ADAPTERS.md` — cross-vendor adapter support and constraints
- `FAQ.md` — positioning, trust, and operational questions

## Architecture Notes
- Keep public claims consistent with `../SETUP_PROMPT.md` and current implementation status.
- Documentation is canonical source material for the GitHub Pages presentation mirror on `ghpages/v1.0.0`.
- New website presentation elements require operator design approval; documentation changes do not silently invent page structure.

## Validation
- Check links and paths, scan for stale vendor/version claims, and inspect rendered Markdown when layout matters.

## Build
- No compilation. `VERSION.md` key: `DOCS`; derived constant: `DOCS_BUILD`.

Use `.salvor/DOMAIN_REF.md` for product truth and `.salvor/INFRA.md` for operational details.
