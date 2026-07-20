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
| **Gemini CLI / Antigravity CLI** | `GEMINI.md` | — | instruction-driven | ✅ via MCP config |
| **Cursor / others** | tool-specific rules file | varies | varies | ✅ if MCP-capable |

The pointer file says, in effect:

> Before any work, read `CLAUDE.md` (hub) + the relevant component spoke +
> `RULES.md` + `.salvor/active_state.md` (L1). Follow `RULES.md` exactly, including
> the Task Termination Protocol and the three capture classes. Do not duplicate or
> fork project knowledge into this adapter — shared truth lives in `CLAUDE.md`, the
> spokes, `.salvor/`, and `.serena/memories/`.

Each durable fact has **one canonical owner**; every other shared file (including
vendor entrypoints) links to or summarizes it rather than forking it. Vendor
entrypoints route to the canonical records — they are not knowledge forks. See
`ARCHITECTURE.md` ("One owner per durable fact") for the full ownership map.

That's the whole adapter. The core files it points at are identical across vendors —
including the GitNexus code-intelligence block, which lands **only** in the canonical
`CLAUDE.md` hub.

**Gemini CLI / Antigravity CLI.** Google's coding-agent entrypoint reads the compatible
`GEMINI.md` project-context file. Google moved consumer terminal usage from Gemini CLI to
Antigravity CLI while keeping `GEMINI.md` compatibility; enterprise Gemini Code Assist /
API-key users may still use Gemini CLI. Either way the `GEMINI.md` pointer is the same, so
Salvor doesn't remove it — and it doesn't assume native Antigravity behavior beyond
`GEMINI.md`.

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

**GitNexus.** Provides indexing, impact analysis, execution-flow tracing, and —
opt-in — generated skills and hooks. GitNexus is a third-party project with its own
license. Its current community license is PolyForm Noncommercial; review the
upstream license or enterprise terms before anticipated commercial use. Salvor Core
does not require GitNexus. The ownership contract:

- **Indexing without touching Salvor-owned files is the recommended default.**
  Run `gitnexus analyze --skip-agents-md`. Empirically verified against GitNexus
  1.6.3: the `.gitnexusrc` config keys `indexOnly` / `skipContextFiles` /
  `skipSkills` (flat and nested) are **NOT honored** — they do NOT prevent GitNexus
  from injecting its block into `CLAUDE.md`/`AGENTS.md` or from installing skills.
  The reliable control is the `--skip-agents-md` **FLAG**, which prevents GitNexus
  writing its block into `CLAUDE.md` and `AGENTS.md`. This repo's `.gitnexusrc`
  carries `{"skipAgentsMd": true}` for forward-compatibility (**merge** into any
  existing file, never replace it), but the flag is the reliable control in the
  current CLI, and behavior/paths vary by GitNexus version. Salvor keeps its own
  concise GitNexus routing note in the canonical `CLAUDE.md` hub; vendor adapters
  (`AGENTS.md`, `GEMINI.md`) stay thin.
- **Choose an ownership mode before running `gitnexus analyze`.** Analyze can be
  invasive — plan and approve first:
  - **A — Index without touching Salvor-owned files (default).**
    `gitnexus analyze --skip-agents-md`. Builds only the code index; does NOT write
    GitNexus blocks into `CLAUDE.md`/`AGENTS.md`. GitNexus still drops local
    `.claude/skills/gitnexus-*/` skill files during analyze — regenerable, gitignored,
    not committed. No hooks, no global config. Recommended.
  - **B — + repo-specific community skills (opt-in).** Add `--skills`
    (`gitnexus analyze --skip-agents-md --skills`) to generate additional
    repo-specific community skills. Inspect the proposed `.claude/skills/gitnexus-*/`
    paths and approve them before accepting.
  - **C — + MCP config / hooks (approval).** Hooks and MCP config come only from
    `gitnexus setup` (never from `analyze`). Never run a global `gitnexus setup`
    without approval.
  - **D — Full (enumerate + approve).** Enumerate every file + config mutation and
    approve each before proceeding.
- **Skill-path caveat.** GitNexus may generate agent-specific skills under
  tool-specific directories. Paths and available integrations can vary by GitNexus
  and coding-agent version; inspect the proposed changes before approving them.
- GitNexus **always** installs local static skill dirs under
  `.claude/skills/gitnexus-*/` (gitnexus-cli, -exploring, -guide, -debugging,
  -impact-analysis, -refactoring) during `gitnexus analyze`, regardless of flags —
  these are **local, regenerable, and gitignored** (Salvor's `.gitignore` matches
  `**/.claude/skills/gitnexus*/`), which is why they're absent from the Salvor
  package: each machine regenerates them against its own index. The `--skills` flag
  adds further opt-in repo-specific community skills.

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
