# ghpage — v1.0.0-beta GitHub Pages presentation mirror

The site is `site/` on `main`, deployed from `main` by `.github/workflows/pages.yml`. `main` is the single source of truth; this component presents its public claims without inventing product behavior.

## Canonical Sources
- `../README.md` — public overview and supported capabilities
- `../SETUP_PROMPT.md` — universal setup protocol
- `../docs/VENDOR_ADAPTERS.md` — current vendor-support truth
- `../assets/brand/BRAND_ASSETS.md` — canonical authored SVG masters, generated-asset ownership, and usage rules

## Architecture Notes
- The repository sources above are authoritative; the site is their semantic presentation mirror.
- Mirror the approved category as **repo-native engineering knowledge layer**
  and treat **persistent engineering cognition** as Salvor's term for durable,
  governed knowledge across sessions, contributors, branches, and models.
- Existing mapped copy must update whenever its canonical sources change.
- Hero fold acceptance is measured from the rendered page with normal assets
  and scripts: `#why` must expose at least 120px at 1440×1000, 160px at
  768×1024, 80px at 360×780, and 40–50px at 320×568, with both CTAs usable and
  no content clipping, overlap, or horizontal overflow. Do not satisfy these
  targets by hiding content or changing the protected burn implementation.
- Keep the public sequence problem → answer → mechanics → loop → adoption →
  use → evidence → integrations. The engineering-problem section owns the
  page's only prominent numbered 1/2/3 triptych; answer, adoption, dogfood,
  and research status use distinct manifesto, rail, ledger, and compact
  editorial compositions rather than repeating that motif.
- The Salvor-on-Salvor ledger presents canonical knowledge class as the parent,
  trigger metadata (`TRIGGER: <EVENT>`) with the event title as a sibling child heading, then `CAPTURED` and
  `COMPOUNDED KNOWLEDGE` as durable-result fields. Preserve its understated
  schema and amber child rail with 28px desktop/tablet nesting and 16px phone
  nesting; do not flatten it back into equal-weight columns.
- The Primary Path presents existing-knowledge adoption as current beta
  behavior: a read-only inventory during setup and the same section-level flow
  later on demand, with originals untouched unless separately approved.
- If a source change requires a new section, interaction, or visual element, synchronization must stop with design review required. Ask the operator before adding the element.
- A source-of-truth sync is incomplete until direct Playwright runs cover desktop, tablet, Galaxy-S25-Edge-like small-phone, and 320px narrow viewports. Verify hero and copy readability, local asset loading, and zero horizontal overflow; never infer responsive health from CSS review.
- `LF:rendered-pixel-alignment`: final visual-alignment evidence comes from DPR-aware Playwright screenshot ink, not DOM/CSS box geometry. Report signed first-line glyph/label and visible SVG/title deltas and keep each within one CSS pixel across the complete six-viewport release matrix; use boxes only to delimit pixel scan regions.
- The Salvor Loop uses two site-only 800×960 SVG panels: wide consumers display them side-by-side, while tablet and phone consumers stack them at full available width.
- Keep the Loop protocol-only and vendor-agnostic. Tool-specific enhanced guidance belongs in the dedicated code-intelligence section, not inside the lifecycle diagram.
- WF/early-progress hero display copy, including the slogan, is pointer-transparent and nonselectable so the burn surface receives mouse and touch drag gestures through the text. At 80% reveal progress the semantic hero copy becomes selectable while WebGL finishes the padded smoke tail. Keep CTA controls and canonical header/navigation interactive, and do not attach burn handlers to text nodes.
- At 900px and below, the hero reading panel is part of both browser-rendered WebGL UI snapshots: translucent white in WF and translucent black in Mystic. It must burn locally with the text, retain its internal breathing room, and never alter the laptop/desktop presentation.
- Silent public-content drift is forbidden.
- Evidence used to substantiate this versioned release pins to the immutable
  `v1.0.0-beta` snapshot; live Issues, Discussions, and community destinations
  remain live rather than being release-pinned.
- Research status keeps legacy `#measured` deep links working but presents the
  longitudinal validation question as open. The exploratory short-horizon beta
  remains discoverable through pinned methodology/report links and the live
  RFC; do not restore its detailed scores as the product-validation dashboard.
- Community navigation links directly to GitHub Discussions in the desktop, mobile, and footer surfaces. The official `@SalvorKnows` X account appears once as a secondary footer destination; it does not enter the hero or primary navigation, and the maintainer's personal X account remains outside the site.
- The footer carries the site's only `$SALVOR` token reference: an understated
  authenticity annotation with the full Solana mint
  `4KxtNWc5XTL3cuyc8PJMchqB6RYggvEFeMub727GBAGS`, exact Bags/Solscan links,
  and the unofficial-token warning. The canonical public site and social/JSON-LD
  metadata origin is `https://salvorknows.dev/`. Keep both subordinate to the
  Salvor product and out of the hero and primary navigation.
- Header, footer, burned-state, metadata, social, and loop marks use the generated regular-logo family. The browser favicon uses the generated adaptive small-logo SVG, whose internal `prefers-color-scheme` rule switches canonical ink from black to white; an unqualified black 32px PNG remains the compatibility fallback, and the Apple touch icon remains black. Run `npm run brand:check` and inspect `npm run brand:audit` evidence after brand-affecting changes. Hero background images are independent and must not change during a logo-only migration.

## Build and deploy
- Static files live in `site/`; `.github/workflows/pages.yml` deploys that directory from `main`. `main` is the single source of truth.
- Run the Node contract/interaction tests and Playwright browser suite before commit. Deploys are operator-dispatched only (`workflow_dispatch` on `pages.yml`) — a push never auto-deploys; dispatching from `dev` pre-verifies the workflow before promotion to `main`.
- `VERSION.md` key: `GHPAGE`; current build `GHPAGE:23`; derived constant: `GHPAGE_BUILD`.

Use `.salvor/DOMAIN_REF.md` for product truth and `.salvor/INFRA.md` for deployment details.
