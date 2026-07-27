# Domain Learnings

Frozen audit trail of every domain discovery, hypothesis test, vendor probe, and learned failure. `.salvor/DOMAIN_REF.md` carries living truth; these artifacts are immutable receipts.

## Naming Convention

`YYYY-MM-DD-[CATEGORY]-[OUTCOME].md`

Categories may be extended when needed:

- `PROBE` — external-system or vendor exploration with a verdict.
- `BAKEOFF` — A/B/N comparison with a verdict.
- `LF##` — Learned Failure root cause and fix specification.
- `ARCH` — empirical architecture probe with evidence and a verdict.
- `MIGRATION` — pre-specification for a non-trivial change.

## Required Content

- One-sentence hypothesis stated before the test.
- Evidence: datasets, observations, and relevant raw results.
- Verdict: accepted, falsified, or inconclusive.
- Cross-links from specification to code commit and updated L1/L2 entries.

## Chronological Index

| Date | File | Category | One-line takeaway |
|------|------|----------|-------------------|
