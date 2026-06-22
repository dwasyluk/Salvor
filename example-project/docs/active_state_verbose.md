# Notebook Active State — VERBOSE ARCHIVE

L2 cache. No line limit. Append-only deep history of reasoning, rejected hypotheses, raw tool outputs, and detail pruned
from L1. Update trigger: immediately after every L1 update.

---

## 2026-06-22 — Project initialized
Initial Salvor scaffold: hub-and-spoke CLAUDE.md, L1/L2 cache, RULES.md §0–§8, VERSION.md, three capture triggers.

The project is a worked Salvor example named **Notebook** — a tiny notes service split into two components:
- `api` — Node + TypeScript on the built-in `http` module (no framework). In-memory `Map<string, Note>` store. Routes:
  `GET /notes`, `GET /notes/:id`, `POST /notes`, `DELETE /notes/:id`. Listens on `process.env.PORT ?? 8787`. ESM
  (`"type": "module"`, `NodeNext` resolution → `.js` import specifiers for `.ts` sources). Typecheck via `tsc --noEmit`
  (requires `@types/node` for the `node:http` / `process` globals).
- `web` — TypeScript + a single static HTML page, plain DOM, no framework. `src/main.ts` fetches/render/posts against
  `API_BASE = http://localhost:8787`. `tsconfig` uses `noEmit` with `DOM` libs. The `Note` interface here is a hand-mirror
  of `api/src/types.ts` — they share no code, so field changes must be propagated to both (RULES §6.4).

Both components typecheck clean (`tsc --noEmit` passes for api and web after `npm install`).

No live/mirror pair exists in this project, so the RULES §0.5 / §6.3 parity rule is N/A (neutralized, not omitted, so the
section numbering stays faithful to the template).

## 2026-06-20 — LF-1 detail (stale note reference)
Expanded reasoning behind the Learned Failure registered in `docs/DOMAIN_REF.md` (LF-1) and written up in
`docs/postmortems/2026-06-20-stale-note-reference.md`.

Original `store.ts` returned the canonical `Note` objects held inside the `Map` directly from `getNote()` and
`listNotes()`. Because JavaScript objects are passed by reference, any caller that mutated a returned note (the `web`
client did this while building an "edit" affordance, assigning to `note.title` on the fetched object before re-rendering)
was mutating the **stored** instance in place. The store had no idea its state had changed; subsequent `listNotes()` calls
returned the silently-corrupted data, and there was no write path to blame because no `createNote`/`deleteNote` had run.

Fix: a private `copy(note)` helper does a shallow spread `{ ...note }`; `getNote` and `listNotes` both route every
returned record through it, and `createNote` returns a copy of the stored record too. The `Map` now holds the only
canonical instances; callers receive disposable copies. A shallow copy is sufficient because `Note` is flat (all
primitive fields) — if a nested/array field is ever added, the copy must become structured (noted in the domain-tuning
artifact `2026-06-20-LF01-STALE_NOTE_REFERENCE.md` as the v2 trigger).

## 2026-06-20 — Deferred item detail (no persistence)
DEFERRED #1: the store is a process-local `Map` with a module-level `nextId` counter. Restarting the api loses every note
and resets ids to `1`. Acceptable for a demo / local use; flagged Medium ("impact if left ~6 months") because anyone
treating this as more than a toy would lose data on any redeploy. Suggested fix: persist to SQLite or a JSON file behind
the same `store.ts` function signatures (the signatures were deliberately kept storage-agnostic so a backing swap is a
single-file change). Captured in `docs/DEFERRED_TODOS.md` #1.
