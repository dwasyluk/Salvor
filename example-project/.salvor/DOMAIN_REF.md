# Notebook Domain Reference

Authoritative current-truth for domain logic. Artifacts in `.salvor/domain-tuning/` are frozen audit trails; this file is
what's currently true.

## Sections

### Note model
A `Note` is `{ id, title, body, createdAt }` (`api/src/types.ts`). `id` is a **string** (monotonic, assigned by the store);
`createdAt` is an ISO-8601 timestamp string. `title` and `body` are arbitrary strings; the API rejects a `POST /notes`
where either is missing or non-string (400).

### Store semantics
The store (`api/src/store.ts`) is a single in-memory `Map<string, Note>`:
- `listNotes()` — all notes, newest-first by `createdAt`, as **shallow copies** (LF-1).
- `getNote(id)` — one note as a shallow copy, or `undefined`.
- `createNote(title, body)` — assigns the next string id + `createdAt = now`, stores, returns a copy.
- `deleteNote(id)` — returns `true` if a note was removed.
- **No durability:** state is process-local and resets on restart (DEFERRED #1). Function signatures are storage-agnostic
  so a SQLite/JSON backing can be swapped in without touching callers.

### Copy invariant (LF-1)
`getNote` and `listNotes` MUST return shallow copies, never the live `Map` instances. This is a shallow `{ ...note }`,
valid only while `Note` stays flat; a nested field would require a structured copy (the v2 trigger for LF-1).

## Learned Failures (LF#)

### LF-1 — In-memory store returned a stale live reference
- **Date:** 2026-06-20
- **Root cause:** `getNote()` / `listNotes()` returned the canonical `Note` objects stored inside the `Map` directly.
  A caller (the `web` client building an edit affordance) mutated a returned note's field, which mutated the **stored**
  instance in place — silent state corruption with no write path to blame.
- **Fix sites:** `api/src/store.ts` — private `copy(note)` helper (shallow spread); routed through `getNote`,
  `listNotes`, and `createNote`'s return.
- **Status:** FIXED. v2 trigger: if `Note` gains a nested/array field, upgrade `copy` to a structured clone and update
  every site listed here together (RULES §6.9).
- **Cross-link:** `.salvor/domain-tuning/2026-06-20-LF01-STALE_NOTE_REFERENCE.md`;
  postmortem `.salvor/postmortems/2026-06-20-stale-note-reference.md`.
