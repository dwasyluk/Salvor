# Salvor Brand Assets

This directory owns Salvor's canonical W10 brand system. Generated files must
never be hand-edited; change the geometry or generator and rebuild them.

## Visual authority and provenance

- Approved reference: `assets/brand/reference/salvor-w10-reference.png`
- Dimensions: `1374 × 1492`
- Preserved attachment SHA-256: `085c7cf9b9133df9465d3fb6a91249272ca82eb9de094724a77638b0b10a6b51`
- Original prompt SHA-256: `8d77d855c152a0b4ca6ad5737e44f46c28aed5307eeecd6e562309125cca80b9`

The operator confirmed that the displayed attachment is the approved final
reference and that the hash mismatch is a screenshot/transport artifact. The
preserved attachment is visual authority, not a production-ready master: its
pixelation, ghost lines, grid, asymmetry, rough joins, and stray marks are not
part of the design.

## Canonical sources

- Geometry: `assets/brand/source/salvor-mark-geometry.json`
- Typography outlines: `assets/brand/source/salvor-text-outlines.json`
- Generator: `scripts/generate-brand-assets.mjs`
- Canonical SVG master: `assets/brand/generated/salvor-mark-full-black.svg`
- Manifest: `assets/brand/generated/manifest.json`

The geometry model uses a square `0 0 1000 1000` viewBox, one centerline at
`x=500`, named stroke weights, mirrored left-side structural geometry, and
named layers. Black and white outputs use identical geometry.

## Approved variants

### Full mark

Contains the complete polyhedron, structural lines, central triangular frame,
nested triangle, four-point star, vertical stem, and two concentric elliptical
rings. Use it for the README lockup, site header/footer, favicons and app icons,
metadata, social cards, and standalone official branding.

### Core/infographic mark

Uses the exact full-mark geometry with only the named `stem` and `rings` layers
omitted. Use it only inside the Salvor Loop or similarly constrained diagrams.
It is not separately drawn and must never gain a different triangle, star, or
polyhedral topology.

## Wordmark

The approved SALVOR wordmark preserves the pre-migration GitHub Pages computed
treatment: the macOS SF Mono system face at weight 800, uppercase, with `0.22em`
tracking. Its verified glyphs are stored as filled SVG outlines rather than live
font text, so no font binary or platform fallback is required. The same paths
are used in the site navigation, footer, README lockup, Open Graph card, and
GitHub preview. Social-card tagline/support copy is outlined from the matching
SF Mono 800/600 treatments as well, keeping generated PNG bytes independent of
host font availability.

## Generated inventory

- Full/core black and white SVG marks
- Black and white outlined wordmark SVGs
- Full-mark transparent PNGs at 16, 32, 48, 64, 128, 256, and 512 pixels
- 720×180 README horizontal lockup (SVG and PNG)
- 1200×630 Open Graph/Twitter card (SVG and PNG)
- 1280×640 GitHub social preview (SVG and PNG)
- Root and site Salvor Loop assets with the canonical core mark
- Machine-readable manifest with output hashes

The site aliases under `site/assets/brand/` are generated from the same source
as the root masters. Compatibility names are allowed only when the generator
produces them and this document identifies them; there are currently no legacy
logo-family aliases.

## Regeneration and drift

```bash
npm run brand:build
npm run brand:check
npm run brand:audit
```

`brand:check` rebuilds every output in a temporary directory and compares its
bytes with the checked-in files. `brand:audit` also creates visual evidence in
`/tmp/salvor-v1.0.0-beta-brand-audit/`; audit output is not part of the release.

## Composition rules

- Never stretch, compress, crop, rotate, skew, or nonuniformly scale the mark.
- Symbol placements use square cells, `object-fit: contain`, and
  `preserveAspectRatio="xMidYMid meet"`.
- Do not add dots, orbit nodes, gradients, glow, shadows, or decorative depth
  inside the mark.
- Do not simplify or replace the topology for favicons. Small PNGs are direct
  exact-size renders of the canonical full SVG.
- Social cards use the approved v1.0.0-beta hero as a full-bleed background with a
  controlled readability overlay. The 1280×640 preview is rendered for its own
  canvas and is not a stretched 1200×630 image.
- The full mark is the only favicon/application icon geometry.
- Do not restore the retired node-sigil, gem, circular badge, prior W10/WF
  approximations, hand-built loop polygon, or exploratory logo families.
