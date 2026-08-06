# 2026-07-28 — LF — Rendered pixels are the visual-alignment oracle

- **ID:** LF:rendered-pixel-alignment
- **Subject:** site, visual-alignment, playwright, release-gates
- **Claim:** Rendered screenshot ink — not DOM/CSS box geometry — is the only valid visual-alignment oracle.
- **Evidence date:** 2026-07-28
- **Status:** live

## Hypothesis

Aligning elements by DOM/CSS box geometry (matching rectangle edges reported by
the layout engine) is sufficient proof that glyphs and SVG strokes align
visually on the rendered page.

## Evidence

More than six successive revisions of the site's hero/section alignment were
"box-aligned" per DOM/CSS measurements yet still rendered pixel-incorrect —
title glyph ink, gold label ink, and SVG stroke extents disagreed with the box
edges due to font metrics, stroke centering, and DPR rounding. Only DPR-aware
Playwright screenshots with visible-ink measurement exposed the real deltas.

## Verdict

**Falsified.** Box geometry is not the oracle. Final visual-alignment gates
must use DPR-aware Playwright screenshot ink: compare a black title's lowest
ink row with the first rendered line band's lowest gold-label row, and the
icon's topmost visible stroke with the title's topmost glyph ink. Signed
deltas ≤1 CSS pixel across the 1440 / 1024 / 768 / 390 / 360 / 320 release
viewports. Boxes may delimit pixel-scan regions only.

## Cross-links

- Registry entry: `.salvor/DOMAIN_REF.md` → `LF:rendered-pixel-alignment`
- Incident evidence: `.salvor/postmortems/2026-07-28-rendered-pixel-alignment-gate.md`
- Consumer rule: `site/CLAUDE.md` (release visual-alignment gate), L1 `## LEARNED FAILURES` line
