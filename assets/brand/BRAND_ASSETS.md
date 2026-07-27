# Salvor Brand Assets

This directory owns Salvor's canonical authored-SVG brand system. Generated
files must never be hand-edited; update an approved reference master or the
generator and rebuild them.

## Visual authority and provenance

Two operator-supplied SVGs are the sole visual authority for the Salvor mark:

- Regular master: `assets/brand/reference/LOGO.svg`
  - SHA-256:
    `b9e7aec604dc072c8619853de109c68d74a10036223cf209938d6436443df615`
  - ViewBox: `0 0 529.76 551.44`
- Small master: `assets/brand/reference/LOGO-SM.svg`
  - SHA-256:
    `05dabb5f372c1e9ab09d3be4cf267bb7234bbc69e64a0dd95a7d84b1cc25aa7a`
  - ViewBox: `0 0 502.26 545.67`

The reference SVGs are tracked byte-for-byte as supplied. Do not rewrite,
optimize, reformat, recolor, or edit their paths, groups, styles, stroke widths,
fill rules, or viewBoxes.

## Canonical sources

- Regular mark: `assets/brand/reference/LOGO.svg`
- Small mark: `assets/brand/reference/LOGO-SM.svg`
- Typography outlines: `assets/brand/source/salvor-text-outlines.json`
- Generator: `scripts/generate-brand-assets.mjs`
- Manifest: `assets/brand/generated/manifest.json`

The previous reconstructed W10 geometry is historical and no longer an active
brand source.

## Approved families

### Regular logo

Use the regular logo for the README lockup, standalone branding, site
header/footer and hero navigation, structured metadata, social cards, GitHub
preview, and Salvor Loop diagrams.

### Small logo

Use the small logo only for browser favicons and touch icons. It is an authored
small-format design, not a generated simplification of the regular logo.

### Color variants

The authored black color is `#231f20`. Black derivatives preserve the master
bytes exactly. White derivatives change only that color token to `#ffffff`;
their geometry and every other byte-level design property remain equivalent.

### Wordmark

The approved SALVOR wordmark remains the verified SF Mono system treatment at
weight 800 with `0.22em` tracking. Its fixed filled SVG outlines are independent
of the logo geometry and are unchanged by this migration.

## Generated inventory

- Regular and small black/white SVG derivatives
- Regular and small transparent PNGs at 16, 32, 48, 64, 128, 256, and 512
  pixels
- 720×180 README horizontal lockup (SVG and PNG)
- 1200×630 Open Graph/Twitter card (SVG and PNG)
- 1280×640 GitHub social preview (SVG and PNG)
- Root and site Salvor Loop assets with the regular canonical logo
- Site aliases generated from the same sources
- Machine-readable manifest with source and output hashes

## Regeneration and drift

```bash
npm run brand:build
npm run brand:check
npm run brand:audit
```

`brand:check` rebuilds every output in a temporary directory and compares its
bytes with the checked-in files. `brand:audit` creates visual evidence at
`/tmp/salvor-v1.0.0-beta-brand-audit/contact-sheet.png`; audit output is not
part of the release.

## Composition rules

- Never stretch, compress, crop, rotate, skew, or nonuniformly scale either
  logo.
- Use one scale factor for both axes. Square cells and raster canvases may
  include transparent padding.
- Symbol placements use `object-fit: contain` or
  `preserveAspectRatio="xMidYMid meet"`.
- Do not add gradients, glow, shadows, nodes, or decorative depth inside the
  logo.
- Favicons and touch icons use only the small family.
- Every other official mark placement uses only the regular family.
- Social cards retain the approved v1.0.0-beta hero as a full-bleed background;
  changing the logo must not alter the hero background source.
- Do not restore the retired node-sigil, gem, circular badge, reconstructed W10
  geometry, hand-built Loop polygon, or exploratory logo families.
