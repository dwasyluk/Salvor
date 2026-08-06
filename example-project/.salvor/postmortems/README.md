# Postmortems

Structured write-ups of incidents and significant failures. Each becomes durable knowledge: findings here feed the `LF:`
registry in `.salvor/DOMAIN_REF.md` and/or new entries in `.salvor/DEFERRED_TODOS.md`.

## Naming
`YYYY-MM-DD-[SHORT-SLUG].md` — artifact ID `PM:<kebab-slug>` (RULES §10.1)

## Template
- **Structured header** — ID / Subject / Claim / Evidence date / Status (RULES §10.1).
- **Summary** — one paragraph: what broke, blast radius, duration.
- **Timeline** — UTC-stamped sequence of events.
- **Root cause** — the actual mechanism, not the symptom.
- **Findings → follow-ups** — tag each as `LF:<slug>` (recurring failure mode → DOMAIN_REF), `deferred:<slug>`
  (out-of-scope fix → DEFERRED_TODOS), or `FIXED` (done in this pass, with commit).
- **What would have caught it earlier** — the missing test / check / alert.

## Index
| Date | ID | File | Subject | One-line takeaway |
|------|----|------|---------|-------------------|
| 2026-06-20 | PM:stale-note-reference | [2026-06-20-stale-note-reference.md](2026-06-20-stale-note-reference.md) | api, store, mutation-safety | Store handed out live `Note` refs; a caller mutated stored state → LF:stale-note-reference, fixed with shallow copies. |
