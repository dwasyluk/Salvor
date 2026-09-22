# Notebook Domain Reference

Authoritative current-truth for domain logic. Artifacts in `.salvor/domain-learnings/` are frozen audit trails; this file is
what's currently true.

## Sections

### Note model
A `Note` is `{ id, title, body, createdAt }` (`api/src/types.ts`). `id` is a **string** (monotonic, assigned by the store);
`createdAt` is an ISO-8601 timestamp string. `title` and `body` are arbitrary strings; the API rejects a `POST /notes`
where either is missing or non-string (400).

### Store semantics
The store (`api/src/store.ts`) is a single in-memory `Map<string, Note>`:
- `listNotes()` — all notes, newest-first by `createdAt`, as **shallow copies** (LF:stale-note-reference).
- `getNote(id)` — one note as a shallow copy, or `undefined`.
- `createNote(title, body)` — assigns the next string id + `createdAt = now`, stores, returns a copy.
- `deleteNote(id)` — returns `true` if a note was removed.
- **No durability:** state is process-local and resets on restart (deferred:no-persistence). Function signatures are storage-agnostic
  so a SQLite/JSON backing can be swapped in without touching callers.

### Copy invariant (LF:stale-note-reference)
`getNote` and `listNotes` MUST return shallow copies, never the live `Map` instances. This is a shallow `{ ...note }`,
valid only while `Note` stays flat; a nested field would require a structured copy (the v2 trigger for
LF:stale-note-reference).
Full rationale + coupling: [`decisions/2026-06-20-store-returns-copies.md`](./decisions/2026-06-20-store-returns-copies.md).

## Learned Failures (LF:)

### LF:stale-note-reference (2026-06-20)
- **ID:** LF:stale-note-reference
- **Subject:** api, store, mutation-safety
- **Claim:** getNote/listNotes must return shallow copies — returning live store references lets callers mutate persisted state.
- **Evidence date:** 2026-06-20
- **Status:** live
- **Root cause:** `getNote()` / `listNotes()` returned the canonical `Note` objects stored inside the `Map` directly.
  A caller (the `web` client building an edit affordance) mutated a returned note's field, which mutated the **stored**
  instance in place — silent state corruption with no write path to blame.
- **Fix sites:** `api/src/store.ts` — private `copy(note)` helper (shallow spread); routed through `getNote`,
  `listNotes`, and `createNote`'s return.
- **Status:** FIXED. v2 trigger: if `Note` gains a nested/array field, upgrade `copy` to a structured clone and update
  every site listed here together (RULES §6.9).
- **Cross-link:** `.salvor/domain-learnings/2026-06-20-LF-STALE_NOTE_REFERENCE.md`;
  postmortem `.salvor/postmortems/2026-06-20-stale-note-reference.md`.
