# Domain Learnings

Frozen audit trail of every domain discovery, hypothesis test, vendor probe, and learned failure. `.salvor/DOMAIN_REF.md` carries living truth; these artifacts are immutable receipts.

## Naming Convention

`YYYY-MM-DD-[CATEGORY]-[OUTCOME].md` — artifact ID `DL:<kebab-slug>` (or
`LF:<kebab-slug>` for a Learned Failure spec; RULES §10.1)

Categories may be extended when needed:

- `PROBE` — external-system or vendor exploration with a verdict.
- `BAKEOFF` — A/B/N comparison with a verdict.
- `LF` — Learned Failure root cause and fix specification (carries the `LF:<slug>` ID registered in DOMAIN_REF).
- `ARCH` — empirical architecture probe with evidence and a verdict.
- `MIGRATION` — pre-specification for a non-trivial change.

## Required Content

- Structured header first: ID / Subject / Claim / Evidence date / Status (RULES §10.1).
- One-sentence hypothesis stated before the test.
- Evidence: datasets, observations, and relevant raw results.
- Verdict: accepted, falsified, or inconclusive.
- Cross-links from specification to code commit and updated L1/L2 entries.

## Chronological Index

| Date | ID | File | Category | Subject | One-line takeaway |
|------|----|------|----------|---------|-------------------|
| 2026-07-28 | LF:rendered-pixel-alignment | [`2026-07-28-LF-RENDERED_PIXEL_ALIGNMENT.md`](2026-07-28-LF-RENDERED_PIXEL_ALIGNMENT.md) | LF | site, visual-alignment, playwright | Box geometry falsified as alignment proof; gate on DPR-aware rendered ink, deltas ≤1 CSS px across six viewports. |
