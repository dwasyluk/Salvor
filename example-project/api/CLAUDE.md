# api — In-memory Notes REST API

Node + TypeScript on the built-in `http` module (no web framework). Entry point: `src/server.ts`,
run via `tsx`. Talks to no external systems — all state is an in-memory `Map`. Serves JSON over
HTTP for the static `web` client.

## Key Files
- `src/server.ts` — `http` server + router. Maps `GET/POST/DELETE /notes` and `/notes/:id` to store
  functions; JSON helpers, CORS headers, body parsing. (~140 LOC)
- `src/store.ts` — in-memory `Map<string, Note>` store: `listNotes`, `getNote`, `createNote`,
  `deleteNote`. Returns shallow copies (LF-1). Monotonic string `id`. (~55 LOC)
- `src/types.ts` — `Note` domain type (`id`, `title`, `body`, `createdAt`). Mirrored by `web`.
- `tests/` — none yet (demo). Add under `tests/` when logic grows.

## Architecture Notes
- Single-process, single-`Map` store — **resets on restart**, no durability (see DEFERRED #1).
- `getNote`/`listNotes` MUST return shallow copies, never the live `Map` instance (LF-1 — callers
  mutated stored notes through the handed-out reference).
- `id` is a **string**, not a number — keep it a string at every boundary (RULES §6.7).
- ESM project (`"type": "module"`) with `NodeNext` resolution — intra-package imports use `.js`
  extensions even though sources are `.ts`.

## Build
- Install: `npm install`. Run dev server: `npm run dev` (`tsx src/server.ts`). Typecheck:
  `npm run typecheck` (`tsc --noEmit`).
- Listens on `process.env.PORT ?? 8787`.
- Startup display name comes from `process.env.APP_NAME ?? "Notebook"`.
- Version constant: `API_BUILD`, derived from `VERSION.md` key `api`; current build `API:02`.

For codebase tree: use Serena MCP `get_symbols_overview`.
For domain logic: see `.salvor/DOMAIN_REF.md`. For infra/ops: see `.salvor/INFRA.md`.
