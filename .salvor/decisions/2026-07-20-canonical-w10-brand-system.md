# Canonical W10 brand system

> **Superseded in part on 2026-07-27:** the mark-geometry and favicon decisions
> below are replaced by
> [`2026-07-27-canonical-logo-svg-masters.md`](./2026-07-27-canonical-logo-svg-masters.md).
> The outlined wordmark and deterministic-generation principles remain active.

## Context

Salvor had accumulated several incompatible official-mark families: a compressed
README badge, node-sigil derivatives, hand-built loop geometry, social-card
approximations, and exploratory gem/sigil assets. They did not consistently
preserve the operator-approved W10 artifact topology or uniform proportions.
The approved 1374×1492 screenshot is visually authoritative but contains raster
pixelation, ghost lines, uneven joins, asymmetry, grid artifacts, and stray marks.

## Decision

The approved W10 screenshot is the sole visual authority. Production assets are
generated deterministically from the square, bilaterally symmetric geometry in
`assets/brand/source/salvor-mark-geometry.json` by
`scripts/generate-brand-assets.mjs`.

There are exactly two symbol geometries:

1. Full — polyhedron, central/nested triangles, four-point star, stem, and rings.
2. Core/infographic — the same geometry with only the stem and rings omitted.

Black/white, raster/vector, README, site, social, favicon, and infographic uses
all derive from those named layers. The SALVOR wordmark is the verified pre-
migration Pages treatment (SF Mono 800 with `0.22em` tracking), captured as one
filled vector outline shared across every public composition.

## Rationale

Named parametric geometry preserves the approved topology while correcting the
manual reference's production defects. Deterministic generation and byte-level
drift checking prevent public surfaces from silently inventing another mark or
distorting the canonical one.

## Invariant

- No competing official mark family may ship.
- The mark always uses a square viewBox and uniform scaling.
- Black and white variants share geometry.
- The core variant differs only by omission of the named stem/rings layers.
- Favicons are exact-size renders of the full canonical master, never alternate
  topology.
- Social cards use the approved hero full bleed and the shared outlined wordmark.

## Coupling / blast radius

Changes affect `assets/brand/`, `scripts/generate-brand-assets.mjs`, README
identity, site header/footer/burn state, favicons, structured metadata, social
cards, Salvor Loop assets, release packaging, and brand regression tests.

## Alternatives rejected

- Keeping legacy aliases for compatibility: Git history already preserves them,
  and shipping them would reintroduce competing official families.
- Hand-editing SVG/PNG derivatives: cannot provide deterministic drift control.
- Separate favicon or infographic redraws: violate the single-topology contract.
- Generative-image reconstruction: cannot guarantee geometry, fidelity, or stable
  reproducibility.
