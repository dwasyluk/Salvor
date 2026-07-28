# Rendered-Pixel Alignment Gate

## Summary

Repeated Code Intelligence typography revisions passed DOM/CSS geometry checks
while the rendered Serena/GitNexus title rows remained visibly misaligned. The
blast radius was limited to an uncommitted GitHub Pages review build, but the
failure consumed more than six operator review cycles and repeatedly presented
pixel-incorrect output as ready for review.

## Timeline

- **2026-07-28 07:38 UTC** — The operator rejected element-box alignment as the
  validation oracle and approved durable Learned Failure capture once the
  replacement method was proven.
- **2026-07-28 07:42 UTC** — The corrected DPR-aware screenshot-ink regression
  failed all six release viewports, proving it detected the visible defect.
- **2026-07-28 07:44 UTC** — The diagnostic pass measured exact black/gold
  first-line baseline parity while exposing signed icon/title visible-ink top
  deltas from `-2.99px` to `+3.97px`; the shared offset could not align both icon
  geometries.
- **2026-07-28 07:45 UTC** — Per-card offsets derived from those signed deltas
  brought both visible-ink comparisons within the one-CSS-pixel tolerance; the
  same six tests passed.

## Root cause

The validation method measured layout abstractions instead of the pixels users
see:

1. `getBoundingClientRect()` and CSS alignment describe element and line boxes,
   not glyph ink baselines.
2. SVG boxes include internal whitespace, so their top edge is not the top edge
   of the visible icon stroke.
3. A wrapped gold function label has multiple rendered line bands; comparing its
   overall bottom edge to the black title checks the wrong line.
4. The first screenshot-analysis helper derived its DPR scale from the measured
   child-region extent instead of the screenshot root dimensions, so its pixel
   coordinates were not trustworthy.
5. Review readiness was inferred from those proxies instead of being gated on
   screenshot pixels across every release viewport.

The repeated outcome is the decisive evidence: after more than six alignment
iterations, element-box checks could still report aligned geometry while the
rendered layout remained visibly pixel-incorrect. A proxy that repeatedly
accepts the known defect is not a tolerable approximation; it is the wrong
release oracle.

## Findings → follow-ups

- **LF1 — Rendered pixels are the visual-alignment oracle.** DOM rectangles may
  delimit screenshot scan regions, but they must never be used as final evidence
  that glyphs, labels, or SVG strokes are visually aligned.
- **FIXED — DPR-aware image coordinates.** Divide the captured bitmap dimensions
  by the actual screenshot-root CSS dimensions.
- **FIXED — Visible-ink baseline check.** Scan black and gold RGBA pixels
  independently. Compare the black title's lowest ink row with the gold label's
  first contiguous rendered line band's lowest row, allowing at most one CSS
  pixel of delta.
- **FIXED — Visible SVG-stroke check.** Compare the icon's topmost black stroke
  pixel with the title's topmost black glyph pixel, allowing at most one CSS
  pixel of delta. Do not compare their element boxes.
- **FIXED — Signed diagnostics before CSS.** Report the direction and magnitude
  of both deltas for both tools at every viewport. Distinct SVG ink geometries
  can require distinct card offsets; one shared box offset is not evidence of
  visual alignment.
- **FIXED — Responsive containment.** The gold label remains in the heading's
  right-hand grid column. It may wrap within that column, but it must not move
  beneath the Serena/GitNexus title.
- **FIXED — Release matrix.** Run the pixel assertions at 1440, 1024, 768, 390,
  360, and 320 CSS-pixel widths before requesting visual review.

## What would have caught it earlier

The now-registered Playwright regression screenshots each heading/article,
scales regions from the actual screenshot root, detects visible black/gold ink,
separates wrapped gold text into line bands, reports signed deltas, and rejects
more than one CSS pixel of visible-ink misalignment. Its required red/green proof
is recorded above: 6/6 failures before the corrective offsets and 6/6 passes
after them.
