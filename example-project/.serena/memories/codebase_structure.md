# Codebase structure — Notebook

> Serena memories are retrieval aids, not the canonical brain. Canon for this example: its own `.salvor/` artifacts (`../../.salvor/`), `../../RULES.md`, and `../../README.md`. One-owner rule: each fact has exactly one canonical home — approved rationale in `.salvor/`, machine-derived code structure in GitNexus. This file just points there.

Worked Salvor example (Strict profile): a tiny in-memory notes service, two components (api + web, v0.1.0), no framework, no DB.

```
example-project/
├── CLAUDE.md            # hub (project overview, architecture table, directives)
├── AGENTS.md            # entrypoint adapter for AGENTS.md-native CLIs
├── RULES.md             # §0–§9 development rules (§8 = memory layers & canonical ownership, §9 = security & git-safe operation)
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
├── .salvor/             # canonical owner of approved engineering knowledge
│   ├── active_state.md           # L1 (≤50 lines)
│   ├── active_state_verbose.md   # L2
│   ├── DOMAIN_REF.md             # living truth + LF# registry
│   ├── INFRA.md                  # local run, env vars, ports
│   ├── DEFERRED_TODOS.md         # #1 no persistence (Medium)
│   ├── decisions/                # captured decisions
│   ├── postmortems/              # README + 2026-06-20 stale-note-reference
│   └── domain-learnings/         # README + 2026-06-20 LF01 artifact
└── .serena/memories/    # this file + suggested_commands.md (retrieval aids / pointers, NOT canon)
```

## Key invariants
- `api/src/store.ts` returns **shallow copies** of `Note`, never live `Map` instances (LF-1).
- Note `id` is a **string**; keep it a string at every boundary.
- `web` mirrors `api`'s `Note` type by hand — propagate field changes to both (RULES §6.4).
- In-memory only: state resets on api restart (DEFERRED #1).

## Capture classes (RULES §2, §7) — ask before persisting
- **Decision / Domain Learning** → `.salvor/decisions/` or `.salvor/domain-learnings/`.
- **Learned Failure (LF#)** → registered in `.salvor/DOMAIN_REF.md` (e.g. LF-1 copy-return invariant).
- **Deferred Finding** → `.salvor/DEFERRED_TODOS.md` (e.g. #1 no persistence).

## GitNexus
- Machine-derived code structure (symbols, call graphs, impact). Safe default: `gitnexus analyze --index-only` (pure index, v1.6.9+; no context files / skills / hooks). Older versions: `--skip-agents-md`. Impact before edits; change-detection before commit. Core mode works without it.
