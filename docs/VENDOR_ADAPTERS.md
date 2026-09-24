# Vendor adapters

**Goal:** use Salvor's repo-native engineering knowledge layer with a supported
LLM CLI without locking the project brain to one vendor.

**How realistic is that?** The honest split:

- **Salvor Core is a vendor-agnostic engineering knowledge layer built from
  repository-local Markdown and governance.**
  No LLM vendor owns the shared brain. The substance lives under `.salvor/` —
  L1/L2 (`active_state.md` /
  `active_state_verbose.md`), `DOMAIN_REF.md`, `INFRA.md`, `DEFERRED_TODOS.md`,
  `decisions/`, `domain-learnings/`, `postmortems/`, and the experimental
  `archive/`. Root `RULES.md` + the
  vendor entrypoints provide governance and routing. `VERSION.md` is generated
  only under the optional Strict profile; with Q4=NO, Salvor references the
  repository's existing version source or creates a minimal project-history
  artifact without per-component counters. Any capable agent told to read
  `RULES.md` can follow the protocols.
- **enhanced mode optionally adds Serena + GitNexus.** They are OPTIONAL enhanced
  integrations, not constituent requirements of Salvor Core. Serena memories
  (`.serena/memories/`) are an OPTIONAL retrieval aid; GitNexus's index is
  machine-derived and **gitignored** — not canonical git-tracked memory. They
  are recommended when semantic navigation and graph-based impact analysis fit
  the work. They are standard
  **MCP** servers (a cross-vendor standard) and already work in Claude Code,
  Codex, Gemini CLI, Cursor, and others.
- **The glue is vendor-specific.** *How* project instructions auto-load, where
  per-session memory lives, and how per-turn rules are enforced differ per tool.

So Salvor ships a **vendor-agnostic core + all three thin entrypoint adapters by
default**: `CLAUDE.md` is the canonical cross-vendor hub, while thin `AGENTS.md`
and `GEMINI.md` adapters route other supported agents to the same shared brain.
The vendor-named hub filename reflects the most deeply dogfooded adapter; it
does not make the canonical repository knowledge Claude-only. Those adapters make
the shared brain vendor-portable, so supported agents can be switched without
migrating the project knowledge. Setup generates contract-tested entrypoints for
Claude Code, Codex, and GEMINI.md-compatible clients. Claude Code is the most deeply
dogfooded path; the Codex and Google adapters are wired and documented but less
exercised. Other agents can integrate through compatible thin adapters.

## The adapter pattern

Every compatible client needs one thing: a **native entrypoint** that the tool auto-reads,
which points the agent at the shared in-repo core.

| Vendor | Native entrypoint | Per-session memory | Per-turn enforcement | MCP (Serena/GitNexus) |
|---|---|---|---|---|
| **Claude Code** | `CLAUDE.md` (+ `@`-imports) | `~/.claude/.../memory/` (per-user, optional) | `CLAUDE.md` directives + `.claude/settings.json` hooks | ✅ native |
| **Codex + other AGENTS.md-compatible agents** | `AGENTS.md` | — | instruction-driven | ✅ via MCP config |
| **Gemini CLI / Antigravity CLI** | `GEMINI.md` | — | instruction-driven | ✅ via MCP config |
| **Cursor / others** | tool-specific rules file | varies | varies | ✅ if MCP-capable |

### Claude Code Projects (beta)

Claude Code Projects is a Claude-specific orchestration workspace rather than a
new repository entrypoint. Anthropic documents one coordinating conversation
that routes work to parallel Claude Code cloud threads, each on its own branch.
New threads begin with the Project's repositories, instructions, Library files,
and shared Project memory; repository `CLAUDE.md`, skills, and plugins are also
loaded from Project repositories.

Project memory and repository knowledge remain separate ownership domains.
Project auto-memory uses a `MEMORY.md` index and files managed in Project
settings; it is explicitly separate from repository `CLAUDE.md`. When a Project
repository contains Salvor, threads can consume the same `CLAUDE.md` hub and
`.salvor/` knowledge as other supported agents. Project memory remains
vendor-workspace state unless the operator separately approves promoting a
specific claim into its canonical Salvor artifact.

Cloud threads do not automatically inherit local-only files, tools, MCP servers,
or settings. Validate the planned Claude Code plugin inside Projects before
claiming parity with local Claude Code: repository files and committed skills may
load, while optional Serena/GitNexus availability depends on the Project's cloud
environment and connectors.

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

**Gemini CLI / Antigravity.** Google's coding-agent tooling reads the compatible
`GEMINI.md` project-context file — Gemini CLI natively, and Google's newer Antigravity
tooling keeps `GEMINI.md` compatibility. Whichever surface a Google-side teammate uses,
the `GEMINI.md` pointer is the same, so Salvor generates it by default — and it doesn't
assume any Google-tool behavior beyond reading `GEMINI.md`.

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

## OpenCode V2 — validated Core path

**PASS WITH DOCUMENTED LIMITATION** — validated 2026-09-24 for
[issue #15](https://github.com/dwasyluk/Salvor/issues/15), using OpenCode
**v2.0.16** with its default **`opencode/space-bunny-free`** model on Linux/WSL2.
The tests used minimal disposable Git fixtures, the existing generic `AGENTS.md`
adapter, and a subset of Salvor's rules. The observed Core behavior requires no
OpenCode-specific Salvor adapter or duplicated knowledge file: `AGENTS.md`
remains a routing adapter, never a canonical knowledge store.

Unique fixture markers and tool-read traces distinguished automatic root
`AGENTS.md` loading from explicit reads of `CLAUDE.md`, the relevant component
spoke, `RULES.md`, and `.salvor/active_state.md`. Observed behaviors included:

- dev-first branch guidance and the direct-to-main approval guard;
- human-gated durable-capture questions without unauthorized persistence;
- task completion with L1/L2 and spoke updates, version-applicability checks,
  and diff verification;
- nested `AGENTS.md` discovery, and root instruction-marker refresh when
  continuing the same session;
- permission enforcement for inspection, edits, push, and external-directory reads.

Two independent runs with only `CLAUDE.md` and no `AGENTS.md` received no
automatic project guidance, consistent with the
[OpenCode V2 instruction documentation](https://opencode.ai/v2/docs/instructions).
Keep the root `AGENTS.md` entrypoint; do not rely on legacy fallback behavior.

**Limits:** unattended `opencode run` dismissed the capture approval questions
and exited with status 1 without persistence; interactive approval behavior was
not validated. Internal nested-instruction deduplication remains unverified.
Root-marker refresh was observed across session continuation with a restarted
standalone server, not proven within one continuously running process.
Serena/GitNexus and enhanced-mode MCP integration remain **unverified**.
These results are scoped to this version, model, and minimal fixture; they do
not establish full production-policy compliance, compatibility with every
OpenCode model/version, or Claude Code plugin behavior in OpenCode.

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
