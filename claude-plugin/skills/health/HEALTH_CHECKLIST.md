# Salvor health checklist

The rubric `/salvor:health` runs. Every item is **read-only**; report
PASS / WARN / FAIL with a specific reason and a concrete fix. This file is the
single source of truth for the health rubric (the README FAQ's "won't it go stale?"
answer describes the same doctrine).

## L1 / L2
- **L1 budget** — `.salvor/active_state.md` is ≤ 50 lines. (FAIL if over; fix: prune
  detail down to L2 `active_state_verbose.md`.)
- **L1 freshness** — L1's dated header isn't far behind the latest commit that
  touched code. (WARN if stale.)
- **L1 ↔ L2 ↔ DOMAIN_REF consistency** — no claim in L1 contradicts L2 or
  `.salvor/DOMAIN_REF.md`. (WARN/FAIL on contradiction.)

## Learned Failures
- **Open LF#** — every `LF#` in `.salvor/DOMAIN_REF.md` has a resolution or is clearly
  still-open by design. (WARN on silently-open items.)
- **LF# cross-links** — each references its dated artifact in `.salvor/domain-tuning/`.
  (WARN on missing link.)

## Deferred TODOs
- **Aging** — no High-severity entry in `.salvor/DEFERRED_TODOS.md` has lingered past
  reason. (WARN.)
- **Schema** — each entry has Where / What / Severity / Suggested fix. (WARN.)

## Spokes & versioning
- **Spoke drift** — each component spoke `CLAUDE.md` still matches its code (key
  files it names still exist; nothing renamed/removed). (WARN/FAIL.)
- **VERSION bumped** — if code changed since the last `VERSION.md` bump, the build
  ID + history row were updated. (WARN.)

## Links & index
- **Broken links** — no dead `[[wikilinks]]` or relative doc links across the
  memory files. (FAIL on broken.)
- **GitNexus block** — the committed `<!-- gitnexus:start -->` block isn't obviously
  stale vs. current symbols. (WARN; fix: re-run `gitnexus analyze`.)
