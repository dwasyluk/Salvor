# Suggested commands — Notebook

> Serena memories are retrieval aids, not the canonical brain. Canon for this example: its own `.salvor/` artifacts (`../../.salvor/`), `../../RULES.md`, and `../../README.md`. This is a Strict-profile "Notebook" demo (api + web, v0.1.0).

## api (cd api)
- `npm install` — install deps (`typescript`, `tsx`, `@types/node`).
- `npm run dev` — start the REST API on `http://localhost:8787` (`tsx src/server.ts`). Override port with `PORT=…`.
- `npm run typecheck` — `tsc --noEmit` (required green before "done", RULES §0).

## web (cd web)
- `npm install` — install deps (`typescript`).
- `npm run typecheck` — `tsc --noEmit`.
- Serve the page: `npx serve .` or `python3 -m http.server`, then open `index.html` (start the api first).

## Quick API smoke (api running)
- `curl localhost:8787/notes` — list (starts empty `[]`).
- `curl -X POST localhost:8787/notes -H 'content-type: application/json' -d '{"title":"hi","body":"there"}'` — create.
- `curl localhost:8787/notes/1` — fetch by id.
- `curl -X DELETE localhost:8787/notes/1` — delete (204) / 404 if missing.

## Discipline (RULES.md §0–§10)
- When its MCP tools respond, use GitNexus impact analysis before editing a
  symbol and change-detection before committing; otherwise state that the MCP is
  unavailable and use the best structural review fallback.
- GitNexus safe default: `gitnexus analyze --index-only` (pure index, v1.6.9+; `--skip-agents-md` on older versions). Core mode works without GitNexus.
- On "done": bump `VERSION.md` (API/WEB), sync L1 (`.salvor/active_state.md`) + L2, sync the touched spoke. No live/mirror
  parity step — N/A here.
- Ask before persisting a capture class (RULES §2/§7): Decision / Domain Learning, Learned Failure (`LF:<slug>`), Deferred Finding.
