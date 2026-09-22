# Canonical logo SVG masters

**Implemented:** 2026-07-27 (`GHPAGE:10`, `DOCS:12`)

## Context

Salvor's W10 production family was reconstructed from a raster reference into a
parametric geometry model. The operator has now supplied two final, authored
SVGs that supersede that reconstruction:
`assets/brand/reference/LOGO.svg` and
`assets/brand/reference/LOGO-SM.svg`.

## Decision

The two supplied SVGs are the sole visual authority for the Salvor mark and are
tracked byte-for-byte in their reference format.

Their approved SHA-256 values are
`b9e7aec604dc072c8619853de109c68d74a10036223cf209938d6436443df615`
for `LOGO.svg` and
`05dabb5f372c1e9ab09d3be4cf267bb7234bbc69e64a0dd95a7d84b1cc25aa7a`
for `LOGO-SM.svg`.

`LOGO-SM.svg` owns favicon and touch-icon geometry. `LOGO.svg` owns every other
mark placement. The deterministic brand pipeline generates black and white SVG
and PNG variants at 16, 32, 48, 64, 128, 256, and 512 pixels for both families.
The existing outlined SALVOR wordmark remains separately canonical and
unchanged.

## Rationale

Using authored vectors directly eliminates interpretive reconstruction and
makes geometry fidelity mechanically testable. Separate regular and
small-format masters preserve the designer's intentional simplification at
favicon scale without allowing consumer-specific redraws.

## Invariant

- The two reference SVG files are immutable and hash-pinned.
- Black derivatives retain the authored `#231f20`; white derivatives change
  only that color token.
- Resizing is uniform on both axes. Transparent padding is allowed; stretching,
  cropping, path editing, and topology changes are forbidden.
- Favicon and touch-icon consumers use only the small family.
- Every other logo consumer uses only the regular family.
- No prior W10 reconstruction remains an active visual authority.

## Coupling / blast radius

This decision affects `assets/brand/`, the deterministic brand generator,
README identity, site header/footer/burn states, favicons, structured metadata,
social cards, Salvor Loop diagrams, release packaging, brand documentation,
manifest hashes, and brand regression tests.

## Alternatives rejected

- Manual replacement of checked-in outputs: it weakens deterministic drift
  protection and permits consumers to diverge.
- Retaining W10 compatibility aliases: it leaves misleading names and a
  competing official family.
- Using the regular logo for favicons: it ignores the purpose-built small-format
  master.
- Modifying the reference SVGs to create variants: it would destroy the exact
  authored source record.

## Supersedes

This decision supersedes the mark-geometry and favicon portions of
`2026-07-20-canonical-w10-brand-system.md`. Its outlined wordmark and
deterministic-generation principles remain in force.
