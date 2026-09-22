# Notebook Active State — API:02 WEB:02 (2026-08-05)
## Architecture: api (Node TS, built-in `http`, port 8787) + web (static TS + DOM, API_BASE→:8787). In-memory Map store, no framework, no DB.
## Pipeline: web GET/POST /notes → api router (server.ts) → store.ts Map → JSON back. Note id = monotonic string.
## DEPLOYED: local only. No deployment target. api: `npm run dev` (tsx); web: typecheck-only, serve index.html statically.
## Current Delta to Published Logic: none — Strict profile matches code. API display name = `APP_NAME`; web display name = root `data-app-name`; optional Serena/GitNexus rules activate only when their MCP tools respond.
## LEARNED FAILURES: LF:stale-note-reference (store returned live Note ref; callers mutated stored state → getNote/listNotes return shallow copies). FIXED. See DOMAIN_REF + postmortem 2026-06-20-stale-note-reference.
## Open: deferred:no-persistence (no persistence — Map resets on api restart, Medium). No tests yet.
## Last Brain Audit: 2026-08-05 (interval 3d — RULES §10.3)
