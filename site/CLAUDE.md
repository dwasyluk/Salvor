# ghpage — v1.0.0 GitHub Pages presentation mirror

Concrete static-site consumer on `ghpages/v1.0.0`. `main` remains the single source of truth; this component presents its public claims without inventing product behavior.

## Canonical Sources
- `../README.md` — public overview and supported capabilities
- `../SETUP_PROMPT.md` — universal setup protocol
- `../docs/VENDOR_ADAPTERS.md` — current vendor-support truth

## Architecture Notes
- The repository sources above are authoritative; the site is their semantic presentation mirror.
- Existing mapped copy must update whenever main is merged into this branch.
- If a source change requires a new section, interaction, or visual element, synchronization must stop with design review required. Ask the operator before adding the element.
- A source-of-truth sync is incomplete until direct Playwright runs cover desktop, tablet, Galaxy-S25-Edge-like small-phone, and 320px narrow viewports. Verify hero and copy readability, local asset loading, and zero horizontal overflow; never infer responsive health from CSS review.
- Silent public-content drift is forbidden.

## Build and deploy
- Static files live in `site/`; `.github/workflows/pages.yml` publishes only that directory from `ghpages/v1.0.0`.
- Run the Node contract/interaction tests and Playwright browser suite before commit. A push deploys, so never push without explicit approval.
- `VERSION.md` key: `GHPAGE`; derived constant: `GHPAGE_BUILD`.

Use `.salvor/DOMAIN_REF.md` for product truth and `.salvor/INFRA.md` for deployment details.
