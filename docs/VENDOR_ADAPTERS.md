# Vendor adapters

**Goal:** use Salvor with whatever LLM CLI you like — don't get locked into one.

**How realistic is that?** The honest split:

- **~90% of Salvor is vendor-neutral.** All the substance — `RULES.md`,
  `VERSION.md`, everything in `docs/` (L1/L2, DOMAIN_REF, DEFERRED_TODOS,
  postmortems, domain-learnings), `.serena/memories/`, and the GitNexus index — is
  just git-tracked files plus two **MCP** servers. MCP is a cross-vendor standard;
  Serena and GitNexus already work in Claude Code, Codex, Gemini CLI, Cursor, and
  others. Any capable agent told to read `RULES.md` can follow the protocols.
- **The glue is vendor-specific.** *How* project instructions auto-load, where
  per-session memory lives, and how per-turn rules are enforced differ per tool.

So Salvor ships a **neutral core + all three thin entrypoint adapters by default** —
`CLAUDE.md` (canonical hub) plus `AGENTS.md` and `GEMINI.md` pointer files. Each adapter is
tiny (one pointer file), and there's no vendor to choose: any teammate's CLI works out of
the box.

## The adapter pattern

Every vendor needs one thing: a **native entrypoint** that the tool auto-reads,
which points the agent at the shared in-repo core.

| Vendor | Native entrypoint | Per-session memory | Per-turn enforcement | MCP (Serena/GitNexus) |
|---|---|---|---|---|
| **Claude Code** | `CLAUDE.md` (+ `@`-imports) | `~/.claude/.../memory/` (per-user, optional) | `.claude/settings.json` `custom_instructions` + hooks | ✅ native |
| **Codex** | `AGENTS.md` | — | instruction-driven | ✅ via MCP config |
| **Gemini CLI** | `GEMINI.md` | — | instruction-driven | ✅ via MCP config |
| **Cursor / others** | tool-specific rules file | varies | varies | ✅ if MCP-capable |

The pointer file says, in effect:

> Before any work, read `CLAUDE.md` (hub) + the relevant component spoke +
> `RULES.md` + `.salvor/active_state.md` (L1). Follow `RULES.md` exactly, including
> the Task Termination Protocol and the three capture classes. Do not duplicate or
> fork project knowledge into this adapter — shared truth lives in `CLAUDE.md`, the
> spokes, `.salvor/`, and `.serena/memories/`.

That's the whole adapter. The core files it points at are identical across vendors —
including the GitNexus code-intelligence block, which lands **only** in the canonical
`CLAUDE.md` hub (strip it back out of `AGENTS.md` if `gitnexus analyze` mirrors it there,
so the pointers stay thin).

## What ships (all three by default)

Setup generates **all three entrypoints** — no vendor choice: `CLAUDE.md` (the canonical
hub) plus thin `AGENTS.md` and `GEMINI.md` pointer files. Any teammate's CLI works out of
the box; the core files they point at are identical.

- **Claude Code — built and dogfooded.** The `CLAUDE.md` hub uses `@`-imports; the
  `example-project/` demonstrates the full setup, and Salvor's own repo runs on it.
- **Codex / Gemini — wired by default, less exercised.** The `AGENTS.md` / `GEMINI.md`
  pointers are trivial and correct, but Claude Code is the most battle-tested path. Hit a
  rough edge on Codex or Gemini? Open a
  [vendor adapter issue](https://github.com/dwasyluk/salvor/issues) or PR — exactly the
  kind of contribution Salvor wants.

## The MCP substrate: Serena + GitNexus setup and ownership

**Serena.** Current install:

```bash
uv tool install -p 3.13 serena-agent
serena init
```

Then configure your MCP client per the official guide at
<https://github.com/oraios/serena>. Serena also maintains its own optional memory
folder, `.serena/memories/`. Salvor's stance: Serena memories are a **retrieval
aid** — pointers and structural notes that help the agent find things — while
`.salvor/` is the **canonical** engineering record. If the two ever disagree,
`.salvor/` wins.

**GitNexus.** Provides indexing, impact analysis, execution-flow tracing,
generated skills/hooks, and context-file generation. The ownership contract:

- GitNexus owns its index, its generated skills/hooks, and its marked
  `<!-- gitnexus:start -->` / `<!-- gitnexus:end -->` block — which lives in the
  **canonical `CLAUDE.md` hub only**. Vendor adapters (`AGENTS.md`, `GEMINI.md`)
  stay thin; if `gitnexus analyze` mirrors the block into an adapter, strip it
  back out.
- A repo can opt out of GitNexus context blocks entirely via a `.gitnexusrc`
  containing `{"skipContextFiles": true}` — **merge** this key into an existing
  `.gitnexusrc`, never overwrite the file.
- `.claude/skills/gitnexus/` is **generated locally** by `gitnexus analyze` and
  is gitignored — which is why it's absent from the Salvor package: each machine
  regenerates it against its own index.

The division of labor in one line: **GitNexus remembers how the code is
connected. Salvor preserves why the team made it that way.**

## Claude-Code-only conveniences (safe to skip elsewhere)

These enrich the Claude Code experience but are **not** required for the shared
brain:

- **`@`-import auto-loading** of L1 into context (other CLIs just read the file).
- **Per-user auto-memory** (`~/.claude/.../memory/`) for personal/operator
  preferences — *not* shared, never canonical truth.
- **Skills** and **settings hooks** for per-turn enforcement.

If your CLI lacks these, you lose a little ergonomics, not the framework: the
in-repo core carries the weight.
