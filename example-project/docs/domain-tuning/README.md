# Domain-Tuning Artifacts

Frozen audit trail of every domain discovery, hypothesis test, vendor probe, and learned failure. Each artifact is dated,
categorized, and never edited after creation (DOMAIN_REF.md carries the living truth; these are the receipts).

## Naming convention
`YYYY-MM-DD-[CATEGORY]-[OUTCOME].md`

Categories (extend as needed):
- `PROBE` — exploration of an external system / vendor with a verdict
- `BAKEOFF` — A/B/N test of competing approaches with a verdict
- `LF##` — Learned Failure spec with root cause + fix
- `ARCH` — architectural decision or refactor spec
- `MIGRATION` — pre-spec for a non-trivial change

## What goes here
- Hypothesis stated up front, in one sentence
- Evidence: what was tested, observed, what the data says
- Verdict: accepted / falsified / inconclusive
- Cross-links: spec → code commit → L1/L2 entries it updated

## Chronological index
| Date | File | Category | One-line takeaway |
|------|------|----------|-------------------|
| 2026-06-20 | [2026-06-20-LF01-STALE_NOTE_REFERENCE.md](2026-06-20-LF01-STALE_NOTE_REFERENCE.md) | LF01 | Store must return shallow copies, not live `Map` refs — callers mutated stored state. |
