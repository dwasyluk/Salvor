# Vendor adapters

**Goal:** use Salvor with whatever LLM CLI you like — don't get locked into one.

**How realistic is that?** The honest split:

- **Salvor Core is vendor-agnostic repository-local Markdown and governance.**
  No LLM vendor owns the shared brain. The substance lives under `.salvor/` —
  L1/L2 (`active_state.md` /
  `active_state_verbose.md`), `DOMAIN_REF.md`, `INFRA.md`, `DEFERRED_TODOS.md`,
  `decisions/`, `domain-learnings/`, and `postmortems/`. Root `RULES.md` + the
  vendor entrypoints provide governance and routing. `VERSION.md` is generated
  only under the optional Strict profile; with Q4=NO, Salvor references the
  repository's existing version source or creates a minimal project-history
  artifact without per-component counters. Any capable agent told to read
  `RULES.md` can follow the protocols.
- **enhanced mode optionally adds Serena + GitNexus.** They are OPTIONAL enhanced
  integrations, not constituent requirements of Salvor Core. Serena memories
  (`.serena/memories/`) are an OPTIONAL retrieval aid; GitNexus's index is
  machine-derived and **gitignored** — not canonical git-tracked memory. Both are
  highly recommended for the best code-grounded results. They are standard
  **MCP** servers (a cross-vendor standard) and already work in Claude Code,
  Codex, Gemini CLI, Cursor, and others.
- **The glue is vendor-specific.** *How* project instructions auto-load, where
  per-session memory lives, and how per-turn rules are enforced differ per tool.

So Salvor ships a **vendor-agnostic core + all three thin entrypoint adapters by
default**: `CLAUDE.md` is the canonical cross-vendor hub, while thin `AGENTS.md`
and `GEMINI.md` adapters route other supported agents to the same shared brain.
The vendor-named hub filename reflects the most deeply dogfooded adapter; it
does not make the canonical repository memory Claude-only. Those adapters make
the shared brain vendor-portable, so supported agents can be switched without
migrating the repository memory. Setup generates tested entrypoints for Claude
Code, Codex, and GEMINI.md-compatible clients. Claude Code is the most deeply
dogfooded path; the Codex and Google adapters are wired and documented but less
exercised. Other agents can integrate through compatible thin adapters.

## The adapter pattern

Every compatible client needs one thing: a **native entrypoint** that the tool auto-reads,
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
> fork project knowledge into this adapter. Canonical engineering knowledge lives
> in its assigned `.salvor/` artifact and the `CLAUDE.md` hub + spokes;
> `.serena/memories/` contains concise enhanced-mode retrieval aids only.

Each durable fact has **one canonical owner**; every other shared file (including
vendor entrypoints) links to or summarizes it rather than forking it. Canonical
engineering knowledge lives in its assigned `.salvor/` artifact. Serena memories and
vendor adapters are concise retrieval and routing aids. GitNexus owns machine-derived
code structure. Vendor entrypoints point to and summarize the canonical records —
they are never a knowledge fork. See `ARCHITECTURE.md` ("One owner per durable fact")
for the full ownership map.

Existing project documentation and vendor-specific notes are preserved in
place during setup. If the user asks Salvor to adopt their knowledge—during
setup or later—the same section-level mapping flow proposes which material
stays canonical where it is, which becomes an approved `.salvor/` artifact,
and which remains untouched. One file may yield several independently approved
artifact types; no adapter or vendor memory is bulk-copied into the canonical
brain.

That's the whole adapter. The core files it points at are identical across vendors.
In pure index mode GitNexus injects nothing; any GitNexus code-intelligence routing
note is a hand-authored note in the canonical `CLAUDE.md` hub — never a
GitNexus-owned block. Generated `.claude/skills/gitnexus-*` appear **only** when a
user explicitly picks a skill-generating mode.

**Gemini CLI / Antigravity CLI.** Google's coding-agent entrypoint reads the compatible
`GEMINI.md` project-context file. Google moved consumer terminal usage from Gemini CLI to
Antigravity CLI while keeping `GEMINI.md` compatibility; enterprise Gemini Code Assist /
API-key users may still use Gemini CLI. Either way the `GEMINI.md` pointer is the same, so
Salvor doesn't remove it — and it doesn't assume native Antigravity behavior beyond
`GEMINI.md`.

## What ships (all three by default)

Setup generates **all three entrypoints by default**: `CLAUDE.md` (the canonical
hub) plus thin `AGENTS.md` and `GEMINI.md` pointer files. Teammates using those
compatible entrypoints load the same core files; other clients require a
compatible thin adapter.

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

- **Pure index mode is the recommended default.** Where supported, run
  `gitnexus analyze --index-only` (or set `.gitnexusrc {"indexOnly": true}`). This
  skips **all** AI-context file injection — no GitNexus block in
  `CLAUDE.md`/`AGENTS.md`/`GEMINI.md`, no skills, no hooks, no global MCP change —
  and just builds the code index. Detect support via `gitnexus analyze --help`.
  Verified against GitNexus 1.6.9: `--index-only` leaves Salvor-owned entrypoints
  unchanged and installs no `.claude/` skill files. Salvor keeps its own concise
  GitNexus routing note in the canonical `CLAUDE.md` hub; vendor adapters
  (`AGENTS.md`, `GEMINI.md`) stay thin.
- **Legacy fallback for older versions: `--skip-agents-md`.** On releases that
  predate `--index-only` (e.g. GitNexus 1.6.3), run `gitnexus analyze
  --skip-agents-md`. This suppresses the context block in `CLAUDE.md`/`AGENTS.md`
  but still generates local skill files — gitignore them, show the paths, and get
  approval. The legacy fallback is a CLI **flag** used after disclosure and
  approval — it is **not** a persisted `.gitnexusrc` config key or promise. In
  GitNexus 1.6.3 the `.gitnexusrc` config keys
  `indexOnly` / `skipContextFiles` / `skipSkills` were **not** honored; current
  releases (v1.6.9) recognize `indexOnly` and add `--index-only`. This repo's
  persisted safe default is `.gitnexusrc {"indexOnly": true}` (GitNexus v1.6.9+);
  when you **merge** it into any existing `.gitnexusrc`, preserve unrelated keys and
  never replace the file. Behavior and paths vary by GitNexus version, so confirm
  against `--help`.
- **Choose an ownership mode before running `gitnexus analyze`.** Analyze can be
  invasive — plan and approve first:
  - **A — Pure index, nothing else (recommended).**
    `gitnexus analyze --index-only`. Builds only the code index; writes no GitNexus
    blocks into `CLAUDE.md`/`AGENTS.md`/`GEMINI.md`, installs no skills, no hooks, no
    global config. On pre-`--index-only` versions, fall back to `--skip-agents-md`
    (which still drops local, gitignored skill files — approve the paths).
  - **B — + repo-specific community skills (opt-in).** Add `--skills`
    (`gitnexus analyze --skills`) to generate additional repo-specific community
    skills. Inspect the proposed `.claude/skills/gitnexus-*` paths and approve them
    before accepting.
  - **C — + MCP config / hooks (approval).** Hooks and MCP config come only from
    `gitnexus setup` (never from `analyze`). Never run a global `gitnexus setup`
    without approval.
  - **D — Full (enumerate + approve).** Enumerate every file + config mutation and
    approve each before proceeding.
- **Skill-path caveat.** GitNexus may generate agent-specific skills under
  tool-specific directories such as `.claude/skills/gitnexus-*`. Exact paths and
  available skills can vary by GitNexus and coding-agent version. Inspect the
  proposed changes before approving them.

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
