# Postmortems

Structured write-ups of incidents and significant failures. Each becomes durable knowledge: findings here feed the LF#
registry in `.salvor/DOMAIN_REF.md` and/or new entries in `.salvor/DEFERRED_TODOS.md`.

## Naming
`YYYY-MM-DD-[SHORT-SLUG].md`

## Template
- **Summary** — one paragraph: what broke, blast radius, duration.
- **Timeline** — UTC-stamped sequence of events.
- **Root cause** — the actual mechanism, not the symptom.
- **Findings → follow-ups** — each finding tagged with where it goes:
  `LF#` (recurring failure mode → DOMAIN_REF), `DEFERRED` (out-of-scope fix → DEFERRED_TODOS), or `FIXED` (done in this
  pass, with commit).
- **What would have caught it earlier** — the missing test / check / alert.

## Index
| Date | File | One-line |
|------|------|----------|
| 2026-06-20 | [2026-06-20-stale-note-reference.md](2026-06-20-stale-note-reference.md) | Store handed out live `Note` refs; a caller mutated stored state → LF-1, fixed with shallow copies. |
