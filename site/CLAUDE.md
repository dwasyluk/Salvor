# ghpage — v1.0.0 GitHub Pages presentation mirror

The site is `site/` on `main`, deployed from `main` by `.github/workflows/pages.yml`. `main` is the single source of truth; this component presents its public claims without inventing product behavior.

## Canonical Sources
- `../README.md` — public overview and supported capabilities
- `../SETUP_PROMPT.md` — universal setup protocol
- `../docs/VENDOR_ADAPTERS.md` — current vendor-support truth

## Architecture Notes
- The repository sources above are authoritative; the site is their semantic presentation mirror.
- Existing mapped copy must update whenever main is merged into this branch.
- If a source change requires a new section, interaction, or visual element, synchronization must stop with design review required. Ask the operator before adding the element.
- A source-of-truth sync is incomplete until direct Playwright runs cover desktop, tablet, Galaxy-S25-Edge-like small-phone, and 320px narrow viewports. Verify hero and copy readability, local asset loading, and zero horizontal overflow; never infer responsive health from CSS review.
- The Salvor Loop uses two site-only 800×960 SVG panels: wide consumers display them side-by-side, while tablet and phone consumers stack them at full available width.
- Non-slogan hero display copy is pointer-transparent so the existing background burn surface receives mouse and touch drag gestures through the large title. Keep the slogan, CTA controls, and canonical header/navigation pointer-interactive; do not attach burn handlers to text nodes.
- Silent public-content drift is forbidden.

## Build and deploy
- Static files live in `site/`; `.github/workflows/pages.yml` deploys that directory from `main`. `main` is the single source of truth.
- Run the Node contract/interaction tests and Playwright browser suite before commit. A push deploys, so never push without explicit approval.
- `VERSION.md` key: `GHPAGE`; current build `GHPAGE:03`; derived constant: `GHPAGE_BUILD`.

Use `.salvor/DOMAIN_REF.md` for product truth and `.salvor/INFRA.md` for deployment details.
