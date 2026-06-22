# web — Static Notebook client

TypeScript + a single static HTML page. Plain DOM, no framework, no bundler required for the demo.
Entry point: `index.html`, which loads `src/main.ts`. Talks to one external system: the `api`
component over HTTP at `API_BASE` (`http://localhost:8787`).

## Key Files
- `index.html` — minimal page: a note list container (`#note-list`) + a create form (`#note-form`).
  Inline CSS. Loads `src/main.ts` as a module.
- `src/main.ts` — fetches `GET /notes`, renders them into the list, and `POST /notes` on submit.
  Local `Note` interface mirrors `api/src/types.ts`. (~95 LOC)
- `tests/` — none yet (demo).

## Architecture Notes
- The `Note` interface in `src/main.ts` is a hand-mirror of `api/src/types.ts` — they share no code,
  so a field change in the API must be reflected here too (RULES §6.4, full code-path traversal).
- `API_BASE` is a module constant pointing at the api dev port; the api sends permissive CORS headers
  so a `file://` or differently-served page can call it.
- `tsconfig.json` uses `noEmit` — this component is typechecked, not compiled, for the demo. Serve
  `index.html` with any static server (or open directly) once the api is running.

## Build
- Install: `npm install`. Typecheck: `npm run typecheck` (`tsc --noEmit`). There is no build step in
  the demo; `src/main.ts` is loaded as a module.
- Version constant: `WEB_BUILD`, derived from `VERSION.md` key `web` (`WEB:XX`) at build time.

For codebase tree: use Serena MCP `get_symbols_overview`.
For domain logic: see `docs/DOMAIN_REF.md`. For infra/ops: see `docs/INFRA.md`.
