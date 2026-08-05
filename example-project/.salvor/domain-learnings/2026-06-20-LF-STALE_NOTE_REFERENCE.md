# 2026-06-20 — LF01 — Stale note reference (return copies, not live refs)

**Category:** LF01 (Learned Failure spec)

## Hypothesis
The list view corruption is caused by callers mutating `Note` objects that the store returned by reference — i.e. the
store is leaking its canonical instances rather than handing out copies.

## Evidence
- **Observation:** `GET /notes` rendered an edited title with no preceding `POST`/`DELETE` to the api (write path ruled
  out — see postmortem timeline 14:11).
- **Reproduction (probe):** call `getNote(id)`, mutate `result.title`, call `getNote(id)` again → the second call returns
  the mutated value. A store that returned copies would return the original both times.
- **Mechanism:** JS objects are pass-by-reference; `Map.get()` / `Array.from(map.values())` yield the stored instances,
  so external mutation rewrites store state in place.

## Verdict
**Accepted.** The store was returning live references. Fix: a private `copy(note)` helper (shallow `{ ...note }`) routed
through `getNote`, `listNotes`, and `createNote`'s return value, so the `Map` holds the only canonical instances and
callers get disposable copies.

Shallow copy is sufficient **only while `Note` stays flat** (all primitive fields). If a nested object/array field is
added, `copy` must become a structured clone — this is the registered **v2 trigger** for LF-1 (RULES §6.9: upgrade every
site under the LF# together).

## Cross-links
- **LF registry:** `.salvor/DOMAIN_REF.md` → LF-1.
- **Postmortem:** `.salvor/postmortems/2026-06-20-stale-note-reference.md`.
- **Code:** `api/src/store.ts` (`copy` helper; `getNote` / `listNotes` / `createNote`).
- **State caches:** L1 `.salvor/active_state.md` (LEARNED FAILURES line); L2 `.salvor/active_state_verbose.md`
  (2026-06-20 LF-1 detail entry).
