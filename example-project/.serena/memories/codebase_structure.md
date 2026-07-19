# Codebase structure — Notebook

Worked Salvor example: a tiny in-memory notes service, two components, no framework, no DB.

```
example-project/
├── CLAUDE.md            # hub (project overview, architecture table, directives)
├── AGENTS.md            # entrypoint adapter for AGENTS.md-native CLIs
├── RULES.md             # §0–§8 development rules
├── VERSION.md           # per-component build IDs (API / WEB)
├── README.md            # what this is + how to run
├── api/                 # @notebook/api — Node + TS, built-in http
│   ├── CLAUDE.md         # spoke
│   ├── package.json      # scripts: dev (tsx), typecheck (tsc --noEmit)
│   ├── tsconfig.json     # strict, NodeNext, ESM
│   └── src/
│       ├── types.ts      # Note { id, title, body, createdAt }
│       ├── store.ts      # Map store; listNotes/getNote/createNote/deleteNote (returns COPIES — LF-1)
│       └── server.ts     # http server + router for /notes and /notes/:id
├── web/                 # @notebook/web — TS + static HTML, plain DOM
│   ├── CLAUDE.md         # spoke
│   ├── package.json      # script: typecheck (tsc --noEmit)
│   ├── tsconfig.json     # strict, DOM libs, noEmit
│   ├── index.html        # list container + create form
│   └── src/main.ts       # fetch/render/post against API_BASE (http://localhost:8787)
├── docs/
│   ├── active_state.md           # L1 (≤50 lines)
│   ├── active_state_verbose.md   # L2
│   ├── DOMAIN_REF.md             # living truth + LF# registry
│   ├── INFRA.md                  # local run, env vars, ports
│   ├── DEFERRED_TODOS.md         # #1 no persistence (Medium)
│   ├── postmortems/              # README + 2026-06-20 stale-note-reference
│   └── domain-learnings/            # README + 2026-06-20 LF01 artifact
└── .serena/memories/    # this file + suggested_commands.md (committed shared brain)
```

## Key invariants
- `api/src/store.ts` returns **shallow copies** of `Note`, never live `Map` instances (LF-1).
- Note `id` is a **string**; keep it a string at every boundary.
- `web` mirrors `api`'s `Note` type by hand — propagate field changes to both (RULES §6.4).
- In-memory only: state resets on api restart (DEFERRED #1).
