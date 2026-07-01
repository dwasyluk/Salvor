# 2026-06-20 — Stale note reference (store handed out live objects)

## Summary
While wiring an "edit note" affordance into the `web` client, fetched notes started showing corrupted titles in the list
even though no save had been triggered. Blast radius: all reads from the `api` store returned silently-mutated data;
duration: ~30 minutes of confused debugging before the reference-sharing root cause was found. No data was persisted
(the store is in-memory), so a restart "fixed" it — which is exactly what made it confusing.

## Timeline (UTC)
- **14:02** — `web` edit prototype assigns `note.title = draft` on a note returned from `GET /notes` before re-rendering.
- **14:05** — List view shows the edited title on a note the user never saved; a second note also appears changed.
- **14:11** — Confirmed `api` received no `POST`/`DELETE` between the two list renders — write path ruled out.
- **14:19** — Reproduced with a unit-style probe: mutate the object returned by `getNote(id)`, then call `getNote(id)`
  again → mutation persisted. Store was handing out its canonical instances.
- **14:24** — Fix landed: `copy(note)` shallow-spread helper in `store.ts`; `getNote`/`listNotes`/`createNote` route
  through it. Probe no longer reproduces.

## Root cause
JavaScript objects are passed by reference. `getNote()` and `listNotes()` returned the exact `Note` objects stored in the
`Map`. A caller mutating a returned note mutated the **stored** instance in place, with no write through the store API and
therefore no audit trail. The store believed its state was unchanged.

## Findings → follow-ups
- **`LF-1`** — Store must return copies, never live references. Registered in `.salvor/DOMAIN_REF.md` (LF-1) with fix sites.
- **`FIXED`** — `api/src/store.ts`: private `copy(note)` helper (shallow `{ ...note }`); applied to `getNote`,
  `listNotes`, and `createNote`'s return value. (Landed with this postmortem.)
- **`DEFERRED`** — Lack of persistence (the reason a restart masked the bug) is tracked separately as DEFERRED #1; not
  caused by this incident, but it made the symptom intermittent.

## What would have caught it earlier
A store unit test asserting that mutating a value returned by `getNote(id)` does NOT change the result of a subsequent
`getNote(id)` (i.e. the copy invariant). No such test existed because the demo had no `tests/` yet — adding one is the
cheapest guard against an LF-1 regression.
