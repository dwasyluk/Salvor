# Notebook Active State — VERBOSE ARCHIVE

L2 cache. Detailed but curated: when this file exceeds ~1,500 lines or at release milestones, condense the oldest
resolved sections — keep durable conclusions, evidence references, and commit/test/issue IDs; drop raw noise. Deep
history of reasoning, rejected hypotheses, and detail pruned from L1. Update trigger: immediately after every L1 update.

---

## 2026-08-05 — Protocol migration to Salvor v1.0.0-beta (API:02 WEB:02 — no component logic changed)

The fixture was re-rendered against the current protocol: knowledge IDs moved
from numeric to slug form (`LF:stale-note-reference`, `deferred:no-persistence`)
with structured ID/Subject/Claim/Evidence-date/Status headers on all three
artifacts and ID+Subject columns in the index tables; `RULES.md` extended to
§0–§10, including the [EXPERIMENTAL] §10.5–§10.6 sections in their default-OFF
state (`AGENT_CAPTURE = off`, `ARCHIVE_AFTER_DAYS = 90`); `.salvor/archive/`
scaffolded empty; the `Salvor-Protocol: v1.0.0-beta` stamp added to
`.salvor/README.md`; and L1 gained the `Last Brain Audit` footer. Store
comments, spokes, README, and Serena memories updated to the slug IDs.

## 2026-07-27 — Final fixture consistency sync (API:02 WEB:02)

The runnable example now demonstrates its Strict defaults without implying that
optional enhanced tools are installed: Serena-first and GitNexus-impact rules
activate only when their MCP tools respond, with explicit structural-review
fallbacks otherwise. Capture-class propagation updates the matching Domain
Learning or Design Decision index instead of always writing to the learning
index. The API startup display name reads `APP_NAME`; the static web client reads
`data-app-name` from `index.html` and applies it to the title and heading. Both
component typechecks and the live API smoke are release-gate requirements.

---

## 2026-06-22 — Project initialized
Initial Salvor scaffold: hub-and-spoke CLAUDE.md, L1/L2 cache, RULES.md §0–§8, VERSION.md, three capture classes.

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

## 2026-06-20 — LF:stale-note-reference detail (stale note reference) (ID migrated 2026-08-05)
Expanded reasoning behind the Learned Failure registered in `.salvor/DOMAIN_REF.md` (LF:stale-note-reference) and written up in
`.salvor/postmortems/2026-06-20-stale-note-reference.md`.

Original `store.ts` returned the canonical `Note` objects held inside the `Map` directly from `getNote()` and
`listNotes()`. Because JavaScript objects are passed by reference, any caller that mutated a returned note (the `web`
client did this while building an "edit" affordance, assigning to `note.title` on the fetched object before re-rendering)
was mutating the **stored** instance in place. The store had no idea its state had changed; subsequent `listNotes()` calls
returned the silently-corrupted data, and there was no write path to blame because no `createNote`/`deleteNote` had run.

Fix: a private `copy(note)` helper does a shallow spread `{ ...note }`; `getNote` and `listNotes` both route every
returned record through it, and `createNote` returns a copy of the stored record too. The `Map` now holds the only
canonical instances; callers receive disposable copies. A shallow copy is sufficient because `Note` is flat (all
primitive fields) — if a nested/array field is ever added, the copy must become structured (noted in the domain-learnings
artifact `2026-06-20-LF-STALE_NOTE_REFERENCE.md` as the v2 trigger).

## 2026-06-20 — Deferred item detail (no persistence)
deferred:no-persistence (ID migrated 2026-08-05): the store is a process-local `Map` with a module-level `nextId` counter. Restarting the api loses every note
and resets ids to `1`. Acceptable for a demo / local use; flagged Medium ("impact if left ~6 months") because anyone
treating this as more than a toy would lose data on any redeploy. Suggested fix: persist to SQLite or a JSON file behind
the same `store.ts` function signatures (the signatures were deliberately kept storage-agnostic so a backing swap is a
single-file change). Captured in `.salvor/DEFERRED_TODOS.md` as `deferred:no-persistence`.
