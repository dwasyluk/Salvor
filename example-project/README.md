# Notebook — a worked Salvor example

This directory is a **filled-in example** of the structure that `SETUP_PROMPT.md` scaffolds. It's a real, runnable,
two-component TypeScript app with the full Salvor brain applied on top — so you can see what a populated repo looks like
(and so Serena can navigate real symbols while GitNexus can index their relationships). It demonstrates the **optional strict profile**: every Optional
Strict Engineering Default in `RULES.md` is enabled on top of the Core Protocol.

Its shared Salvor brain is vendor-agnostic repository Markdown. Compatible thin
adapters make that same memory vendor-portable without copying or migrating it.

The app itself is deliberately tiny: an in-memory **Notes** service.

> The store is **in-memory** — all notes are lost when the API restarts. There is no database. That's intentional for a
> demo (and it's tracked as a Deferred TODO).

## Components

| Component | Stack | What it is |
|-----------|-------|------------|
| `api` | Node + TypeScript, built-in `http` (no framework) | REST API: `GET /notes`, `GET /notes/:id`, `POST /notes`, `DELETE /notes/:id`, backed by a `Map`. |
| `web` | TypeScript + static HTML, plain DOM (no framework) | A single page that lists notes and posts new ones against the API. |

## Layout
- `CLAUDE.md` — hub (project overview, architecture table, memory + capture directives).
- `AGENTS.md` — entrypoint adapter for `AGENTS.md`-native CLIs (Claude Code uses the `CLAUDE.md` hub).
- `RULES.md` — §0–§9 development rules (Core Protocol + the strict profile this example demonstrates).
- `VERSION.md` — per-component build IDs (`API:02 | WEB:02`).
- `api/`, `web/` — the two components, each with its own spoke `CLAUDE.md`.
- `.salvor/` — L1 (`active_state.md`) + L2 (`active_state_verbose.md`), `DOMAIN_REF.md`, `INFRA.md`, `DEFERRED_TODOS.md`,
  and the `decisions/` + `postmortems/` + `domain-learnings/` knowledge archives (with one worked LF-1 entry threaded
  through all of them).
- `.serena/memories/` — committed enhanced-mode retrieval aids (concise structure and command pointers); `.salvor/`
  remains the canonical engineering record.

## Run it

Start the API:

```bash
cd api
npm install
npm run dev          # → http://localhost:8787  (override with PORT=…)
```

Then open the web page (in a second terminal). The page calls the API at `http://localhost:8787`, so start the API first:

```bash
cd web
npm install
npm run typecheck    # tsc --noEmit
# then open index.html directly, or serve it:
npx serve .          # or: python3 -m http.server
```

Add a note in the form; it POSTs to the API and re-renders the list. Restart the API and the notes are gone — that's the
in-memory constraint.

## Quick API smoke

```bash
curl localhost:8787/notes
curl -X POST localhost:8787/notes -H 'content-type: application/json' -d '{"title":"hi","body":"there"}'
curl localhost:8787/notes/1
curl -X DELETE localhost:8787/notes/1
```

See `.salvor/INFRA.md` for env vars and ports, and `.salvor/DOMAIN_REF.md` for the domain rules (including the LF-1 copy
invariant that the store enforces).
