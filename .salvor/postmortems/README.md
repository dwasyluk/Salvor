# Postmortems

Structured write-ups of incidents and significant failures. Findings feed the LF# registry in `.salvor/DOMAIN_REF.md` and/or approved entries in `.salvor/DEFERRED_TODOS.md`.

## Naming

`YYYY-MM-DD-[SHORT-SLUG].md`

## Template

- **Summary** — what broke, blast radius, and duration.
- **Timeline** — UTC-stamped event sequence.
- **Root cause** — the mechanism, not the symptom.
- **Findings → follow-ups** — tag each as `LF#`, `DEFERRED`, or `FIXED` with its destination or commit.
- **What would have caught it earlier** — the missing test, check, or alert.

## Index

| Date | File | One-line takeaway |
|------|------|-------------------|
| 2026-07-28 | [`2026-07-28-rendered-pixel-alignment-gate.md`](2026-07-28-rendered-pixel-alignment-gate.md) | More than six box-aligned revisions stayed pixel-wrong; gate visual alignment on DPR-aware rendered ink. |
