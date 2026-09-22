# Salvor — one-shot setup prompt

**Protocol version: v1.0.0-beta** — this same value is written into the
generated `.salvor/README.md` as the `Salvor-Protocol:` stamp, and re-running a
newer prompt on an installed repo uses the stamp to propose a version-aware
upgrade (Step 0) instead of a reinstall.

> **How to use this file:** copy everything below the line into your LLM coding
> CLI (Claude Code, Codex, Gemini CLI / Antigravity CLI, …) from the root of the project you want
> to give a memory to — new or existing. The agent runs a safety preflight, asks
> **four setup questions**, then scaffolds the full Salvor structure. Setup
> never blanket-stages files and never commits without asking you first. Serena +
> GitNexus MCP servers are **optional** (enhanced mode — see Step 0) but highly
> recommended for the best code-grounded results; Salvor Core works with
> repository files alone. **Upgrading an existing install uses this same file**
> — paste the newer version and Step 0 handles the rest, in any supported
> vendor's CLI.

---

You are about to set up **Salvor** in this repository: a version-controlled
"institutional brain" that makes project knowledge — especially the *why* —
compound across sessions, developers, and even different LLM vendors, instead of
evaporating on context rotation.

Salvor gives this repo: a **hub-and-spoke** `CLAUDE.md` (token-thrifty context),
a **two-tier persisted memory** (L1 concise + L2 curated deep archive), a
**`RULES.md`** split into a Core Protocol plus optional strict defaults, **three
user-gated capture classes** (Decision / Domain Learning, Learned Failure,
Deferred Finding), optional **per-component versioning** (when Strict defaults are
enabled), and optional **Serena + GitNexus** discipline (enhanced mode). Set it up exactly as specified below.

Everything Salvor writes is **in-repo and git-tracked** — that vendor-agnostic
repository record is the *shared* brain available to each supported agent
through its compatible entrypoint. Thin vendor adapters make the same brain
vendor-portable without a memory migration.
(A per-user auto-memory layer is an optional, vendor-specific enhancement; see
Step 4.)

The capture contract in one line: Salvor may update concise operational state as
work progresses. It must ask before promoting a decision, domain learning,
learned failure, or deferred finding into the repository's durable shared
engineering record.

---

## Step 0 — Preflight: inspect before touching anything

Run this ENTIRE step before creating or modifying any file. The prime directive
for all of setup: **never overwrite anything silently**.

### 0.1 Repo & working-tree check
- Confirm the intended repo root (`git rev-parse --show-toplevel`) and state it.
  The directory must be a git repository (`git rev-parse --git-dir`); if not,
  ask me before running `git init`.
- Run `git status --short` and report any uncommitted work. Setup must never
  stage, revert, or entangle unrelated in-flight changes.

### 0.2 Existing-installation & conflict scan
Detect and report which of these already exist:
- `.salvor/`, `.serena/`, `.gitnexusrc`, `.gitnexus/`, `.specify/`, `specs/`
- `CLAUDE.md`, `CLAUDE.local.md`, `AGENTS.md`, `GEMINI.md`, `RULES.md`, `VERSION.md`
- `.claude/`, `.codex/`, `.gemini/`, and any MCP configuration (`.mcp.json`,
  client config files)
- GitNexus-managed blocks (`<!-- gitnexus:start --> … <!-- gitnexus:end -->`)
  inside instruction files
- Third-party instruction sections in `CLAUDE.md` / `AGENTS.md` / `GEMINI.md`
  (other tools' managed blocks, hand-written project guidance)
- Existing knowledge sources: `docs/`, root and component READMEs, ADRs,
  architecture/design notes, CHANGELOGs, postmortems/incident reports, runbooks,
  and agent instruction files. Inventory paths and headings only at this stage;
  do not promote their content automatically.

**Existing-repository adoption is preservation-first.** Before proposing any
write, produce an **adoption map** with exactly these categories:
`reuse unchanged`, `add Salvor-managed section`, and
`conflict — operator decision required`.

- An existing `CLAUDE.md` remains the canonical hub. Existing component spokes
  are discovered, mapped, and reused; never create competing spokes or replace
  a mature hub-and-spoke architecture.
- Preserve an existing `RULES.md` verbatim. Equivalent existing rules are
  reused, not duplicated. Show conflicting rules side by side and require an
  operator decision; never silently choose one rule over another.
- Keep existing `.claude/`, `CLAUDE.local.md`, hooks, settings, agents, and
  skills unchanged unless each exact mutation is listed in the pre-write plan
  and receives approval. Apply the same rule to `.codex/`, `.gemini/`, MCP
  configuration, and every third-party managed section.
- If `.serena/` already exists, reuse that project state; do not re-run
  `serena init`. Never copy, migrate, or import Serena memories into
  `.salvor/`. Read-only use of a responding Serena integration needs no extra
  adoption prompt. Each proposed `.serena/memories/` file change must be named
  in the pre-write plan, explain its merge, and wait for approval. A case
  variant such as `.Serena/` is a collision: stop and ask rather than creating
  a competing lowercase tree.
- If GitNexus is already present, reuse its CLI, configuration, and index. A
  fresh index requires no migration and no rebuild. A stale index requires an
  explicit refresh choice. When setting `indexOnly`, preserve any unrelated
  existing `.gitnexusrc` keys and never replace the file. Do not run
  `gitnexus setup` or change client/global configuration without separate
  approval.

**If `.salvor/` already exists, this is an update, not an install.** Treat
`.salvor/README.md` + Salvor-managed markers as the PRIMARY installation evidence
(a Salvor install may exist with no `VERSION.md` when Q4=NO). Identify the installed
version by reading `VERSION.md` ONLY WHEN IT EXISTS; when Q4=NO and `VERSION.md` was
intentionally not generated, read the repo's established version source instead
(`package.json` / `pyproject.toml` / `Cargo.toml` / Changesets / release tool / git
tags). Report it, and propose a **repair/update plan** (add missing files, refresh Salvor-managed
sections) instead of reinstalling. Never overwrite accumulated project knowledge
(`active_state*.md`, `DOMAIN_REF.md`, `INFRA.md`, `DEFERRED_TODOS.md`,
`decisions/`, `domain-learnings/`, `postmortems/`, `archive/`) and never re-seed sample or
template content over real content.

**Version-aware upgrade (the stamp).** Read the `Salvor-Protocol:` stamp in the
installed `.salvor/README.md` and compare it with this prompt's **Protocol
version** (header above):
- **Stamp older than this prompt:** propose a delta-scoped **upgrade plan**
  covering ONLY protocol surfaces newer than the stamp — RULES sections and
  managed blocks, artifact-folder READMEs/templates, hub directives, vendor
  adapters — itemized per the repair/update rules, approve-before-write.
  Salvor's two layers make this safe: the **protocol layer** (RULES text,
  templates, adapters — Salvor's, replaceable) upgrades; the **knowledge
  layer** (artifacts, L1/L2 content, DOMAIN_REF facts, deferred entries —
  yours, accumulated) is preserved by default. An upgrade must never silently
  rewrite knowledge claims; any required identifier, header, link, metadata,
  or schema migration must be itemized in the upgrade plan and separately
  approved. Where the operator has
  customized generated RULES text, treat the change as a three-way merge
  (their version / old template / new template) and route conflicts through
  the §10.2 governance rule — RULES conflicts are ALWAYS operator-decided.
  Bump the stamp to this prompt's version as part of the applied plan, and
  summarize applied deltas in the Step 5 report.
- **Stamp equal to this prompt:** repair-only pass (add missing files, fix
  drifted managed sections); no version deltas to apply.
- **Stamp missing (pre-stamp install):** report that, treat the whole
  protocol layer as potentially stale, and propose the full repair/update
  plan — adding the stamp is part of it.

**If Spec Kit is present (`.specify/` or `specs/`):** its artifacts —
constitution, specs, plans, tasks — remain canonical *in place*. Salvor links to
them and never duplicates them; preserve Spec Kit's agent files and merge
instructions rather than replacing them. Spec Kit governs what should be built
and how a feature moves from specification to implementation. Salvor preserves
the longitudinal engineering memory accumulated while the system evolves.

### 0.2.1 Existing-knowledge adoption (setup-time and on demand)

Existing project documentation is valuable input, not Salvor-owned material.
During initial setup, offer a **read-only inventory** of `docs/`, READMEs, ADRs,
architecture/design notes, CHANGELOGs, postmortems, runbooks, and agent
instruction files. The inventory performs no writes before any write is
approved. Do not read or classify every file blindly: list candidate paths and
headings first, identify likely relevant material, and ask whether I want the
knowledge-adoption analysis now. Declining does not discard the option.

I can later request the same workflow on demand, for example:

> "Adopt project knowledge from `docs/`, starting with
> `docs/architecture.md` and `docs/incidents/`."

Initial setup and later on-demand requests use the **same knowledge-adoption
analysis and workflow**. Never treat one file as one artifact type. Analyze at
**section/snippet-level** because one document can contain multiple different
artifact types. Split unrelated material into separate candidate mappings and
do not batch their approval.

For every candidate, present a mapping row before any write with:

| Required field | Meaning |
|---|---|
| **Source path** | Existing project-owned file |
| **Source range** | Heading and line range or another unambiguous section locator |
| **Summary** | Concise statement of the durable knowledge and its why |
| **Classification** | Decision, Domain Learning, Learned Failure, current domain truth, infrastructure/operations, Deferred Finding, hub/spoke guidance, or existing canonical documentation |
| **Proposed destination** | Exact target such as `.salvor/decisions/`, `.salvor/domain-learnings/`, `.salvor/postmortems/`, `.salvor/DOMAIN_REF.md`, `.salvor/INFRA.md`, `.salvor/DEFERRED_TODOS.md`, or a hub/spoke link |
| **Canonical owner** | The one file or artifact that will own the durable fact after approval |
| **Ownership action** | One of `keep canonical in place + link`, `promote with provenance`, `migrate`, or `leave untouched` |
| **Proposed content** | Exact new or changed Markdown for review |

Interpret the ownership actions exactly:

- `keep canonical in place + link` — the existing project document remains the
  authority; Salvor adds only a concise pointer or routing summary.
- `promote with provenance` — a new Salvor artifact becomes the canonical
  engineering record and cites the untouched source as evidence/history.
- `migrate` — move ownership and modify the original source only after a
  separate, explicit source-mutation approval.
- `leave untouched` — make no Salvor or source-file change.

The original source stays unchanged by default. Never delete, rewrite, move, or
mark it non-canonical without separate explicit approval. Never create two
co-canonical copies. If ownership is unclear or two destinations compete, mark
the row `conflict — operator decision required`.

After I review the full map, confirm each unrelated mapping or durable
promotion one at a time. Use the existing exact capture gate that matches the
classification: `"Record this as a design decision? (yes/no)"`,
`"Save this as a domain learning? (yes/no)"`, the Learned Failure flow, or
`"Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"`. A structural hub/spoke
link or source migration receives its own exact diff approval. A rejected item
leaves no partial artifact.

### 0.3 Tooling check — Core vs enhanced mode
Salvor runs in one of these modes:
- **CORE** — works with repository files + vendor entrypoints alone: `.salvor/`
  artifacts, user-gated capture approval, canonical ownership, L1/L2 state,
  context recovery, and Git-based sharing. No functioning code-intelligence MCP
  is available to the agent.
- **ENHANCED-READY / PARTIAL ENHANCED** — Serena/GitNexus CLI, config, and/or
  index are present, but not every advertised MCP capability is actually
  invocable by the current agent in the current client.
- **ENHANCED-ACTIVE** — the Serena and/or GitNexus MCP tools actually respond in
  the current client, so Salvor's enhanced rules (impact analysis, symbolic
  navigation) can genuinely run.

**Detect and report each integration SEPARATELY. Do NOT infer "enhanced" just
because a CLI exists.** A CLI on `PATH`, an on-disk index, and an MCP tool that
actually responds in this client are four different facts — report each:

- **Serena:** (1) CLI/launcher available (`serena --version`)? (2) project
  initialized (`.serena/` present, onboarding done)? (3) MCP configured for the
  current client? (4) MCP tools actually responding in the current client
  (attempt a lightweight tool call and report success/failure)?
- **GitNexus:** (1) CLI available (`gitnexus --version`) and its exact detected
  version? (2) safe indexing mode supported (`--index-only` / `--skip-agents-md`
  per `gitnexus analyze --help`)? (3) index present (`.gitnexus/`)? (4) index
  fresh vs the current repo state or stale? (5) MCP configured? (6) MCP tools
  actually responding in the current client?

Classify from the SEPARATE facts above: no responding code-intelligence MCP →
**CORE**; CLI/config/index present but not every advertised MCP capability is
invocable → **ENHANCED-READY / PARTIAL ENHANCED**; the MCP tools actually
respond → **ENHANCED-ACTIVE**. Report Serena and GitNexus independently — one
may be ACTIVE while the other is only READY or absent.

**Do NOT instruct the agent to use `gitnexus_impact`, Serena symbol tools, or
any MCP-only operation unless that specific MCP is confirmed responding in the
current client.** "enhanced" must never imply unverified MCP functionality.
Never run `gitnexus setup`, install global tooling, or modify global/client MCP
config without explicit approval after enumerating the exact mutations.

Serena and GitNexus remain optional. Recommend them when semantic symbol
navigation and graph-based impact analysis fit the work.

If Serena or GitNexus is missing (or present but not MCP-active), offer me
exactly these options and wait for my choice:

  1. **Show official install instructions.** Serena (free/open):
     `uv tool install -p 3.13 serena-agent`, then `serena init`; client-specific
     MCP wiring per the official docs — https://github.com/oraios/serena (link
     there rather than per-client commands, which change). GitNexus: per its
     official README. **GitNexus is a third-party project with its own license.
     Its current community license is PolyForm Noncommercial; review the upstream
     license or enterprise terms before anticipated commercial use. Salvor Core
     does not require GitNexus.**
  2. **Continue in Core mode** — everything works except semantic navigation and
     impact analysis; the generated files mark enhanced-only rules inactive.
  3. **Cancel setup.**

NEVER silently install packages or modify global/client MCP configuration. Setup
must not fail when MCP tooling is missing — and must never report ENHANCED-ACTIVE
when the MCP tools did not actually respond in the current client (a present CLI
or index is at most ENHANCED-READY, not ENHANCED-ACTIVE).

## Step 1 — Confirm scope before writing files

Ask me these **four** questions in a single question call (or inline if your CLI
has no structured-question tool) BEFORE creating anything:

1. **Project name** — the top-level identifier (e.g. "Atlas", "Helix"). Don't
   hardcode it later; reference an `APP_NAME` env var or your language's
   build-time constant.
2. **Components** — list each top-level component directory with a one-word
   stack hint (e.g. `api` Rust/tokio, `web` Next.js, `worker` Python). Each gets
   its own spoke `CLAUDE.md`. With the optional Strict defaults enabled (Q4), each
   also gets a per-component build counter in `VERSION.md`.
   The **counter letters are derived from the component name** (e.g. `api` →
   `API:01`, `web` → `WEB:01`) — configurable, not hardcoded. If the repo has no
   natural split (a single library, a docs/prompt project), a lone `root` component
   is fine — one spoke, one counter. Prefer components only where the parts are
   genuinely isolated and versioned independently.
3. **Paired paths that must stay in sync? (optional — most projects: `none`)** —
   do you have two code paths that must change together, where editing one without
   the other is a bug? Examples: an implementation and a separate reimplementation;
   a live path and a simulator/replay used in tests; a client and a hand-written
   mock of it. If yes, name both files and they get a parity rule in `RULES.md`.
   If not, answer `none` and the parity rule is omitted from §0 / §6.
4. **Enable Optional Strict Engineering Defaults? (yes/no)** — beyond the Core
   Protocol, `RULES.md` ships opinionated strict defaults (build counters,
   mirror parity, impact-analysis-before-every-edit, whole-file-read limits,
   env-var conventions, container permission gates, branch-deletion hygiene).
   They are optional, editable, and project-specific; disabling them never
   breaks Core. For an existing repo they apply only with your explicit
   consent — answer `no` and the generated `RULES.md` marks the `[STRICT]`
   sections disabled until your team opts in. **`no` also changes the
   generated versioning artifacts:** no per-component build counters or
   derived source constants are imposed, `VERSION.md` does not compete with
   an existing version source (`package.json`, `pyproject.toml`, `Cargo.toml`,
   Changesets, release-please, semantic-release), and Salvor generates only a
   minimal project-history file (or references the repo's established
   mechanism). The per-component-counter language is removed from the initial
   history rows, component spokes, the final confirmation, and the proposed
   commit message.
> **Vendor entrypoints are automatic — no need to choose.** Every project gets all three
> by default: `CLAUDE.md` (the canonical hub) plus thin `AGENTS.md` (Codex and other
> AGENTS.md-compatible agents) and `GEMINI.md`
> (Gemini) pointer files. Salvor Core is vendor-agnostic: the shared brain is
> repository-owned Markdown, not vendor-owned state. Thin adapters make that
> memory vendor-portable, so supported agents can be switched without migrating
> the shared record. Setup generates contract-tested entrypoints for Claude Code, Codex,
> and GEMINI.md-compatible clients (Claude Code is the most dogfooded; the Codex
> and Google entrypoints are wired + documented but less exercised). Other
> agents integrate via compatible thin adapters. Only the entrypoint glue differs
> (see `docs/VENDOR_ADAPTERS.md`).

Wait for answers. Do not invent components or assume a stack. Once I respond,
proceed to Step 2.

> Throughout the templates, substitute `<PROJECT_NAME>`, `<COMPONENT_*>`,
> `<STACK_*>`, `<COMP_ID_*>` (the derived counter letters), `<LIVE_FILE>`, and
> `<MIRROR_FILE>` from my answers. The examples use components `api`/`web`/`worker`
> with IDs `API`/`WEB`/`WKR` — replace with mine.

## Step 2 — Present the setup plan, then create the file tree

**Approval gate — before writing anything**, present in one message, based on
the Step 0 scan and my Step 1 answers. Present this as the preservation-first
**adoption map** established in Step 0.2:
- **Files to create** (new, no conflict). List `VERSION.md` here ONLY when the
  selected Q4 path creates or updates it (Q4=YES, or Q4=NO with the minimal
  Salvor project-history artifact when the repo has no version source). When
  Q4=NO leaves an existing version source (`package.json` / `pyproject.toml` /
  `Cargo.toml` / Changesets / release tool) as the sole release-version source,
  do NOT list `VERSION.md` and generate NO references to a nonexistent one.
- **Files to modify** (existing files gaining or updating a Salvor-managed section)
- **Files unchanged**
- **Conflicts** (existing content overlapping Salvor's role) and the **merge
  strategy** for each.
- **Existing integrations adopted in place:** name any reused `.serena/`,
  `.gitnexus/`, `.gitnexusrc`, hub, spokes, `RULES.md`, vendor infrastructure,
  and third-party managed sections. For every proposed `.serena/memories/`
  change, name the exact file and wait for approval; an omitted file is
  unchanged.
- **Existing knowledge sources:** show the read-only candidate inventory and
  whether knowledge adoption is `review now` or `deferred by operator`. If
  reviewing now, append the section/snippet-level mapping table from Step
  0.2.1. This content plan is separate from the structural adoption map; no
  mapped knowledge is written until its per-item approval gate passes.

Merge rule for existing instruction files (`CLAUDE.md`, `AGENTS.md`,
`GEMINI.md`, `RULES.md`, …): Salvor content goes into a clearly delimited
managed section — `<!-- salvor:start --> … <!-- salvor:end -->`. Update an
existing managed block in place; never duplicate a managed block; preserve ALL
existing project and third-party guidance verbatim. Wait for my approval of the
plan, then scaffold. When scaffolding is done, show me the completed diff of
every file created or modified.

> **Layout:** vendor entrypoints (`CLAUDE.md` hub + component spokes,
> `AGENTS.md`/`GEMINI.md`) and governance (`RULES.md`, plus `VERSION.md` **only when
> Q4=YES** — see the VERSION.md section for the Q4=NO handling) live at the repo
> **root** (the CLIs/build tooling auto-discover them there). Everything else — the
> memory/audit **brain** — lives under **`.salvor/`**. Create that folder; it is
> git-committed (the shared brain), never ignored.

### `CLAUDE.md` (hub, ~60 lines max)

```markdown
# <PROJECT_NAME>
### CURRENT STATE (L1 Cache)
@.salvor/active_state.md

> For deep historical context, architecture logs, or context recovery: `.salvor/active_state_verbose.md`

## Project Overview
[ONE PARAGRAPH: what the project does, the primary external systems it integrates with, and the dominant
non-obvious constraint contributors must remember.]

## Architecture

| Component | Stack | Spoke |
|-----------|-------|-------|
| <COMPONENT_A> | <STACK_A> | @<COMPONENT_A>/CLAUDE.md |
| <COMPONENT_B> | <STACK_B> | @<COMPONENT_B>/CLAUDE.md |

## Documentation Map

| Document | Purpose | When to Read |
|----------|---------|-------------|
| `.salvor/DOMAIN_REF.md` | Domain logic, business rules, learned failures | Changing core logic |
| `.salvor/INFRA.md` | Running, env vars, deployment, external APIs | Changing infra/deployment/APIs |
| `.salvor/DEFERRED_TODOS.md` | Deferred findings (out-of-scope, not yet fixed) | Before starting related work |
| `.salvor/decisions/` | Design decisions + load-bearing invariants (why it's this way, what must stay) | Before changing/refactoring anything non-trivial |
| `<COMPONENT_A>/CLAUDE.md` | <COMPONENT_A> architecture and key files | Working in <COMPONENT_A>/ |
| `<COMPONENT_B>/CLAUDE.md` | <COMPONENT_B> architecture and key files | Working in <COMPONENT_B>/ |
| `.serena/memories/` | enhanced mode: retrieval pointers into `.salvor/` (concise summaries only) | Use Serena MCP tools to query |

## APP_NAME
Configurable via `APP_NAME` env var. Default: `<PROJECT_NAME>`. With the optional Strict defaults enabled (RULES §4.4),
never hardcode — reference the env var or the language-specific constant your build wires up. (Remove this section in
Core mode if the strict App-Name convention is disabled.)

### SYSTEM DIRECTIVE: TWO-TIER MEMORY MANAGEMENT
You maintain two memory ledgers: `.salvor/active_state.md` (L1 Cache — Concise) and `.salvor/active_state_verbose.md`
(L2 Cache — Deep Memory).

**L1 — active_state.md (Concise)**
- **Role:** Primary context for every session. Auto-loaded via `@` import (Claude Code) or read first (other CLIs).
- **Content:** Final confirmed logic, active deltas vs published behavior, infra status, and "Learned Failures."
- **Constraints:** MAXIMUM 50 LINES. Dense technical shorthand; non-standard abbreviations optimal for token density.
- **Update Trigger:** After every confirmed resolution, milestone, or architectural shift.

**L2 — active_state_verbose.md (Deep Archive)**
- **Role:** Curated repository for reasoning, condensed logs, evidence, and rejected hypotheses.
- **Update Trigger:** Immediately after updating L1 — offload the nuance pruned from L1.
- **Constraint:** Detailed but CURATED, never a raw dump — summarize command output; keep evidence, conclusions, and
  commit/test/issue IDs. Rotate: past ~1,500 lines, or at each release milestone, condense the oldest resolved sections
  into brief summaries (keep durable conclusions, drop noise). Do NOT read unless explicitly instructed or during
  Context Recovery (RULES §1).

**Execution Rules:**
- Routine L1/L2 operational-state maintenance is automatic — do not ask permission for these writes. Salvor may update
  concise operational state as work progresses. It must ask before promoting a decision, domain learning, learned
  failure, or deferred finding into the repository's durable shared engineering record.
- On any major learning or infra nuance: update L1 instantly with shorthand and L2 with detail.
- NEVER persist secrets, credentials, PII, or unredacted logs to any memory file (RULES §9). Redact before writing.

### SYSTEM DIRECTIVE: THREE CAPTURE CLASSES (user-gated)
You self-identify knowledge worth persisting durably and ask me, verbatim, before persisting it. Three capture classes
(see `RULES.md` §2 and §7):
1. **Decision / Domain Learning** — a discovery, decision, or design invariant + its *why*. Two subtypes: for a
   deliberate **Design Decision or load-bearing invariant**, ask `"Record this as a design decision? (yes/no)"` →
   `.salvor/decisions/` (with its Invariant & Coupling); for an empirical **Domain Learning**, ask
   `"Save this as a domain learning? (yes/no)"` → `.salvor/domain-learnings/`.
2. **Learned Failure (`LF:<slug>`)** (a structural failure mode) → registered in `.salvor/DOMAIN_REF.md` as part of the above.
3. **Deferred Finding** (an out-of-scope finding surfaced mid-task) → `"Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"`

### GitNexus — Code Intelligence (enhanced mode only; hand-authored, thin)
[Salvor authors this section itself — GitNexus does NOT write it when enhanced setup uses pure index mode
(Step 3's recommended Option A: `gitnexus analyze --index-only` where supported, else the legacy
`--skip-agents-md` fallback), which prevents GitNexus writing its block into `CLAUDE.md`/`AGENTS.md`.
Keep it to a few lines of routing: run impact analysis before editing a symbol; use the knowledge graph to
trace callers/execution flows instead of grepping; re-index after structural changes. GitNexus may generate
agent-specific skills under tool-specific directories such as `.claude/skills/gitnexus-*`. Exact paths and
available skills can vary by GitNexus and coding-agent version. Inspect the proposed changes before approving
them. Remove this whole section in Core mode.]
```

### `RULES.md` (mandatory; §0–§10, tiered)

```markdown
# <PROJECT_NAME> Development Rules

These rules are MANDATORY. They supplement CLAUDE.md and take precedence over default behavior.

## Rule tiers
- **[CORE] Core Protocol** — the vendor-portable substrate: context loading, L1/L2 state maintenance, capture approval,
  canonical ownership, context recovery, security, and git-safe operation. Always on; removing these breaks Salvor.
- **[STRICT] Optional Strict Engineering Defaults** — opinionated, project-specific, fully editable: build counters
  (§0.1, §3), mirror parity (§0.5, §6.3), whole-file-read limits (§4.1), impact-analysis-before-every-edit (§4.3),
  env-var conventions (§4.4, §6.2), container permission gates (§5.1), branch-deletion hygiene (§6.11), pre-merge
  brain reconcile (§0.6, §10.2). Tune, replace,
  or disable per project — disabling them must NOT break the Core Protocol. Status (from setup Q4): **[ENABLED |
  DISABLED — [STRICT] items inactive until the team opts in]**.
- **[EXPERIMENTAL] Beta features** — agentic provisional capture and the archive (§10.5–§10.6) are beta, **default
  OFF**, opt-in only by editing their config lines, and may change based on community feedback. Never required by
  Core or Strict behavior.

---

## 0. CRITICAL: Task Termination Protocol [CORE; items 1, 5 & 6 STRICT]
Before declaring any task "Complete" or "Done," you MUST verify and execute this checklist. **No task is complete until
spokes are synced and L1/L2 caches are updated** — plus, when strict defaults are enabled, the [STRICT] items below.

1. **[STRICT] Version Check:** If any logic in a component changed, increment its build ID in `VERSION.md` and update
   the "Last Updated" date. No hardcoded versions in source — they derive from VERSION.md at build time. On a feature
   branch, record the history row with the literal build ID `pending` instead — real numbers are assigned at
   integration (§3, §10.2).
2. **L1 Sync (`.salvor/active_state.md`):** Dense technical shorthand. Keep under 50 lines.
3. **L2 Sync (`.salvor/active_state_verbose.md`):** Offload full reasoning, logs, and nuance here.
4. **Spoke Sync:** Update the changed component's spoke `CLAUDE.md`. Update `.salvor/DOMAIN_REF.md` if domain logic changed;
   `.salvor/INFRA.md` if infra changed. Do NOT edit root CLAUDE.md for component-specific changes.
5. **[STRICT] Production/Mirror Parity (if applicable):** Keep `<MIRROR_FILE>` bit-for-bit aligned with `<LIVE_FILE>`.
   Both paths land in the SAME commit. See §6.3.
6. **[STRICT] Brain Reconcile (feature branches):** if this task ends in a PR or a merge into the integration branch,
   fetch the target branch and run the §10.2 Brain Reconcile ceremony against it BEFORE the merge.

## 1. Context Recovery Procedure [CORE]
If I ask for "context recovery" — or you find yourself in a logic loop, repeating already-falsified reasoning:
1. **Stop** all code generation.
2. **Re-read** `.salvor/active_state_verbose.md` from the beginning.
3. **Compare** current logic against "Learned Failures" in `.salvor/DOMAIN_REF.md` and L1/L2.
4. **Summarize** the source of the confusion before proceeding.

## 2. Continued Learning Protocol [CORE] — capture class: Decision / Domain Learning
Every domain discovery, hypothesis falsification, validation, vendor/model verdict, or parameter learning is a **mandatory
save checkpoint**. The discovery is not the end — persisting it across the stack is.

**Trigger:** any of — hypothesis tested with evidence (accepted OR falsified); multi-dataset matrix / bakeoff result;
vendor / dependency probe with a verdict; new technique validated; Learned Failure (`LF:<slug>`) registered or updated; a
**deliberate design decision or load-bearing invariant** (why the code is shaped this way and what must stay true); or a
taxonomy clarification that will outlive the refactor.

**Mandatory prompt:** at the trigger moment, pause and ask me verbatim — the phrasing that matches the kind:

> "Save this as a domain learning? (yes/no)"  — an empirical **finding**
>
> "Record this as a design decision? (yes/no)"  — a **design decision / invariant**

Non-negotiable — it is the signal that the rule is working. Do not infer the answer, do not batch multiple discoveries
into one prompt, do not defer.

**On `yes` — execute the full stack update:**
1. **Dedupe by subject first:** search the matching registry/index (and `DOMAIN_REF.md`) by **Subject tags** — not just
   title or slug — before creating anything. If an artifact with overlapping subject and the same claim already exists,
   surface it and ask whether to augment it instead of adding a duplicate (same contract as §7's deferred dedupe).
2. **Dated artifact with ID + structured header:** create the frozen record — a **finding** in
   `.salvor/domain-learnings/YYYY-MM-DD-[CATEGORY]-[OUTCOME].md` (ID `DL:<kebab-slug>`, or `LF:<kebab-slug>` for a
   Learned Failure spec; hypothesis, evidence, verdict, cross-links) per `.salvor/domain-learnings/README.md`, **or** a
   **design decision** in `.salvor/decisions/YYYY-MM-DD-[slug].md` (ID `DEC:<kebab-slug>`; Context, Decision, Rationale,
   **Invariant**, **Coupling/blast-radius**, Alternatives) per `.salvor/decisions/README.md`. Every artifact opens with
   the structured header — ID / Subject / Claim / Evidence date / Status (§10.1).
3. **TOC update:** add a row to the matching chronological index:
   `.salvor/domain-learnings/README.md` for empirical findings, or
   `.salvor/decisions/README.md` for design decisions.
4. **DOMAIN_REF.md:** update to reflect new authoritative state — new/updated `LF:<slug>` entry, parameter rationale,
   finding status. DOMAIN_REF is current truth; the artifact is the frozen audit trail.
5. **Stack evaluation — update if affected:** `CLAUDE.md` hub (only if project-wide context shifts); spoke `CLAUDE.md`;
   L1 (`.salvor/active_state.md`); L2 (`.salvor/active_state_verbose.md`); Serena memories (`.serena/memories/`,
   enhanced mode — concise pointers only, per §8); per-user auto-memory (if enabled — see §8).
6. **Confirmation report:** list which files were touched so I can verify end-to-end.

**On `no`:** acknowledge and continue. Do not silently save a partial version.

**Rationale:** analytical context is lost to chat rotation, compaction, and tool drift. A discovery not written to git +
propagated will be re-litigated next session. This rule makes propagation visible and user-gated so it cannot silently
fail. The contract: Salvor may update concise operational state as work progresses. It must ask before promoting a
decision, domain learning, learned failure, or deferred finding into the repository's durable shared engineering record.

## 3. Version Increment Rules [STRICT]
| Component | Source of Truth | Derived Constant |
|-----------|-----------------|------------------|
| <COMPONENT_A> | `VERSION.md` -> `<COMP_ID_A>:XX` | `<COMPONENT_A_BUILD>` (build-time env / generated constant) |
| <COMPONENT_B> | `VERSION.md` -> `<COMP_ID_B>:XX` | `<COMPONENT_B_BUILD>` (build-time env / generated constant) |

- A change in a component bumps its own counter and gets its own history row. Mixed commits bump all affected components
  independently.
- Each bump carries a bulleted change list. Multiple components → one block each.
- **Counters advance only on the integration branch** (`main`, or the team's designated integration branch). Work
  committed directly to it bumps immediately — the solo flow is unchanged. On a feature branch, add the history row
  with the literal build ID `pending` (e.g. `| [DATE] | <COMP_ID_A>:pending | change summary |`) and leave the JSON
  header, "Build IDs" line, L1 header, and spoke build lines untouched. The merge (§10.2 Brain Reconcile) assigns real
  numbers — ONE bump per affected component per integration, regardless of how many branch-internal tasks contributed —
  and rewrites the `pending` rows in the merge commit. Parallel branches therefore never race on a counter.

**ALL version bumps MUST be logged in VERSION.md first. No hardcoded versions in source code.**

## 4. Search & Tools [STRICT / enhanced]
1. **[STRICT] Search-Before-Read:** do not `read_file` on any file >100 lines without first using `grep`, `find_symbol`,
   or `get_symbols_overview` to find specific line ranges. Targeted reads only.
2. **[enhanced mode] Priority:** Serena MCP symbolic tools first (`find_symbol`, `get_symbols_overview`). Fall back to
   `grep`/`glob` only if Serena can't resolve. (Core mode: `grep`/`glob` are the primary tools.)
3. **[STRICT, enhanced mode] Impact before edits:** before modifying a function/class/method, run GitNexus impact
   analysis and report the blast radius. Run change-detection before committing. (Core mode: state that impact analysis
   is unavailable rather than pretending it ran.)
4. **[STRICT] App Name:** never hardcode the project name — use `APP_NAME` or the build constant.

## 5. Infrastructure & Safety
1. **[STRICT] Docker / containers:** explicit permission required for `build`, `up/down`, or `restart`. Treat as
   destructive — the operator may run parallel sessions.
2. **[CORE] Production endpoints / external APIs:** explicit permission required for any call that mutates external
   state, costs money, or touches shared infrastructure.

## 6. Coding required practices [STRICT] (§6.1, §6.4, §6.10 are Core-grade — keep them even if the rest is disabled)
1. Read root `CLAUDE.md`, the relevant spoke `CLAUDE.md`(s), and referenced L1/L2 state before coding any component.
2. Do NOT hardcode values that change often — versions, run modes, environment endpoints. Wire them to variables.
3. **Live ↔ Mirror parity changes land in the same commit.** If a live path AND a mirror/simulator/replay path exist,
   patching one and "catching up" later is forbidden — silent drift is the failure mode.
4. **Full code-path traversal.** When you change one area, follow every related code path and update it. Example: a new
   config parameter must be added to the config UI, audit/report output, import/export, and everywhere it's read — never a
   half-wired value. Never work on assumptions; if uncertain, STOP AND ASK.
5. **Smoke-test before declaring a numerically-sensitive fix done.** Math changes (numeric constants, thresholds, limits,
   allocation, rounding, guards) require an explicit smoke run before "done," or a stated reason it can't be smoke-tested.
   "Compiles, ship it" is not acceptable.
6. **Verify long-running / observability processes are alive before trusting output.** Liveness check (`ps`, `kill -0`,
   `wc -l`) before relying on a background tool's output; mid-run checkpoints for multi-hour runs.
7. **Identifier hygiene at external API boundaries.** Pass the domain-correct identifier at every external call site
   (slug ≠ id ≠ external-id). When in doubt, grep the API docs / proxy handler.
8. **Cache key invariants.** Any cache key must include EVERY input that changes the output (model name, prompt-version
   hash, schema version). Adding an input without bumping the key = silent staleness.
9. **The Learned Failure is the atomic unit of work.** Upgrading a fix (v1 → v2) updates every site listed under that
   `LF:<slug>` entry in DOMAIN_REF.md together. A new mirror site = a new LF-amendment commit, not a quiet one-liner.
10. **Production-affecting code requires explicit operator ack before deploy.** Any path touching money, customer data,
    external mutations, or shared infra — operator sees the diff first. Not "I think this is right, pushing."
11. **Delete merged branches in the same step as the merge.** After merge + push: `git branch -d <name>` AND
    `git push origin --delete <name>` in one task. Exception: long-lived integration branches need operator confirmation.

## 7. Out-of-scope finding capture [CORE] — capture class: Deferred Finding
When in-progress work surfaces a bug, risk, tech-debt item, or other finding **not directly related to the current task**,
you MUST prompt me before doing anything else with it. Never silently ignore an unrelated finding (it gets lost), and
never silently log one (I own prioritization).

**Mandatory prompt:**

> "Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"

Bundle multiple findings that emerge together into one prompt. **On `yes`:**
1. Read `.salvor/DEFERRED_TODOS.md` first and **deduplicate by subject** — if the finding (or a close relative) already
   exists, surface it and ask whether to augment rather than add a duplicate.
2. If new, append an entry headed by a self-allocating slug ID — `### deferred:<kebab-slug> — <short title>` (never a
   sequential number; §10.1) — with: **Subject** (tags), **Where** (file/location), **What**, **Severity** (Low /
   Medium / High — judged as "impact if left ~6 months," not "broken today"), and **Suggested fix**.
3. Do not derail the current task to fix it — capture and continue.

When one is later fixed: delete its entry, and reference the stable ID in the fixing commit (`closes deferred:<slug>`).

## 8. Memory layers & canonical ownership [CORE]
- **Shared and Git-tracked does not mean co-canonical. Every durable fact has one canonical owner. Other shared files
  contain concise routing instructions, summaries, derived retrieval aids, or links to that owner.** The in-repo files
  (`CLAUDE.md` hub + spokes, `RULES.md`, the version source — `VERSION.md` when Strict defaults are enabled (Q4=YES),
  otherwise the repo's established version mechanism — `.salvor/*`, `.serena/memories/` in enhanced mode, the
  hand-authored GitNexus routing note in the hub) are all shared and available to each supported agent through its
  compatible entrypoint — but each durable fact still has exactly ONE owner; everything else points at it.
- **Per-user, optional, NOT shared (Claude Code only):** auto-memory at `~/.claude/projects/.../memory/`. Useful for
  personal/operator preferences, but it is not version-controlled and does not reach teammates. Never put shared truth
  there — that belongs in-repo.
- **ONE-OWNER RULE:** each durable fact has exactly ONE canonical artifact. Every other location links or summarizes —
  never a copied full narrative:

  | Durable fact | Canonical owner |
  |--------------|-----------------|
  | Concise current state | `.salvor/active_state.md` |
  | Curated recovery history | `.salvor/active_state_verbose.md` |
  | Current domain facts + terminology | `.salvor/DOMAIN_REF.md` |
  | Design rationale | decision artifact (`.salvor/decisions/`) |
  | Validated empirical discovery | domain-learning artifact (`.salvor/domain-learnings/`) |
  | Incident / failed-approach evidence | learned-failure / postmortem artifact (`.salvor/postmortems/`) |
  | Deferred findings | `.salvor/DEFERRED_TODOS.md` |
  | Machine-derived structural code knowledge | GitNexus |
  | Symbol retrieval + semantic navigation | Serena |
  | Spec Kit requirements + plans | existing Spec Kit artifacts (`.specify/`, `specs/`) |
  | Vendor context routing | thin vendor adapter (`AGENTS.md`, `GEMINI.md`) |
  | Tool-specific retrieval aids | derived pointer / summary |

- **Serena memory is NOT co-canonical:** `.serena/memories/` holds concise pointers and summaries that help Serena route
  to `.salvor/` — canonical content lives in `.salvor/`, never as a competing full copy in Serena.
- **GitNexus-generated context is NOT co-canonical:** it is a machine-derived, regenerable retrieval aid, not an owner of
  durable facts.
- **Vendor adapters are NOT co-canonical:** `AGENTS.md` / `GEMINI.md` carry thin routing only — never a knowledge fork.
- **Component spokes link to the owner rather than duplicate:** a spoke points at the canonical artifact instead of
  restating its content.

## 9. Security & Git-safe operation [CORE]
1. **NEVER persist** to any memory/knowledge file: API keys, passwords, tokens, private keys, cookies, `.env` contents,
   credential-bearing URLs, customer PII, production datasets, unredacted logs, dependency dumps, large build output, or
   hidden model reasoning. **Redact before writing.** Summarize command output — keep evidence, conclusions, and
   commit/test/issue IDs; drop the noise.
2. `.gitignore` does not remove already-committed data. If credentials were ever committed: revoke them AND remediate
   git history — ignoring the file afterward is not a fix.
3. **Git-safe operation:** never blanket-stage (no catch-all add flags, no staging `.`), never commit without explicit
   approval, never silently overwrite files or another tool's managed sections. Stage explicit path lists; show
   `git diff --cached` before any commit you were asked to make.

## 10. Distributed Brain: IDs, Reconcile & Audit [CORE; §10.2 trigger 1 STRICT]
The brain travels through Git. Parallel branches, agents, and worktrees can capture semantically duplicate or
contradictory knowledge under different names, and shared single-file surfaces conflict textually. This section keeps
the brain single-truth with no central ID authority.

### 10.1 Knowledge IDs [CORE]
- Every durable knowledge artifact has a **self-allocating slug ID** — `<CLASS>:<kebab-slug>` — assigned at capture
  time: `LF:` (Learned Failure), `DL:` (Domain Learning), `DEC:` (Design Decision), `PM:` (Postmortem), `deferred:`
  (Deferred Finding). **Never a sequential number** — no ID allocation may read shared state.
- Every artifact opens with the **structured header** (the semantic-dedupe key):
  **ID** · **Subject** (tags: the system/vendor/component the claim is about) · **Claim** (one-line invariant) ·
  **Evidence date** · **Status** (`live` | `superseded-by: <id>`).
- IDs are immutable once merged to the integration branch; renaming before merge (on the owning branch) is fine.
- Registries/indexes enforce slug uniqueness per class. A slug collision found at reconcile time is a probable
  duplicate (§10.4), not an error. Superseded artifacts keep their ID with `Status: superseded-by: <id>` — never
  delete an ID from a registry; references must not dangle.

### 10.2 Brain Reconcile (merge/pull ceremony)
**Triggers:**
1. **[STRICT] Pre-merge:** on a feature branch, before opening a PR or merging into the integration branch, fetch the
   target and reconcile against it (§0 item 6) — dedupe lands BEFORE the textual conflict.
2. **[CORE] Post-pull:** at session start, if incoming commits touched `.salvor/`, the version source, `RULES.md`, or
   `.serena/memories/`, ask verbatim:
   > "Incoming brain changes detected — run brain reconcile? (yes/no)"

**Procedure:** three-way diff (merge base / ours / theirs) over the brain surfaces → semantic comparison (§10.4) →
per-surface resolution. Every merge/augment/supersede of durable knowledge is operator-gated, verbatim:
> "Merge these two <class> artifacts into one? (yes/no)"

| Surface | Resolution rule |
|---------|-----------------|
| Artifacts (DL / DEC / PM / LF specs) | Winner absorbs loser with a provenance block; loser becomes a one-line redirect stub (`superseded-by:`). |
| `.salvor/DOMAIN_REF.md` | Single current truth — contradictions resolve to ONE `Status: live` entry; loser marked superseded with date + why. |
| L1 (`active_state.md`) | NEVER textually merged — re-synthesize from both sides' L2 + artifacts after resolution (≤50 lines). |
| L2 (`active_state_verbose.md`) | Union both sides, normalize to chronological order, collapse duplicate sections. |
| Index READMEs + `DEFERRED_TODOS.md` | Union rows, re-sort, dedupe. (Optional `.gitattributes` `merge=union` convenience — reconcile normalizes regardless.) |
| `RULES.md` | Governance — conflicting edits to Salvor-managed sections are ALWAYS operator-decided; never auto-merged. |
| `.serena/memories/` | Derived views — re-derive from the reconciled canonical artifacts; never merge textually. |
| Spoke `CLAUDE.md` | Update knowledge references to the reconciled IDs; [STRICT] build lines per §3 integration bump. |
| Version source | [STRICT] §3 integration bump: assign real numbers to `pending` rows — one bump per component per integration. |

End with the standard confirmation report (every touched file).

### 10.3 Brain Audit (recurring semantic self-audit)
Reconcile only sees what a merge brings in; duplicates also accrete on a single branch or pre-date the protocol.
- **Cadence:** due every **3 days** — `AUDIT_INTERVAL_DAYS = 3`, operator-tunable (beta default; feedback welcome on
  the default and its configurability). Tracked by the `## Last Brain Audit:` line in L1. At session start, if
  overdue, ask verbatim:
  > "Brain audit is due (last run N days ago) — run it now? (yes/no)"
- **Sweep:** the §10.4 comparison run all-pairs across the whole brain, plus: contradiction check against DOMAIN_REF
  current truth; missing/empty Subject/Claim headers; stale L1 lines; dangling or superseded cross-links; aging
  deferred findings; L1 ≤50-line and L2 rotation checks.
- Findings route through the same classification + operator gates as §10.2. Update the L1 audit line and land the run
  as an ordinary commit.

### 10.4 Semantic comparison (never filename-only)
1. **Pair by Subject:** for each new/changed artifact, collect every existing artifact (any class, any date) sharing
   ≥1 Subject tag. Subject overlap — not name similarity — is the pairing key.
2. **Compare Claims** (read both artifacts in full):
   - same claim, compatible evidence → **duplicate** — merge into one (keep the richer body, union evidence, one live ID)
   - compatible claims, different facets → **overlapping** — augment the canonical one
   - incompatible claims → **contradictory** — operator decision required (present both evidence dates, with a
     newest-evidence presumption); exactly ONE `Status: live` entry survives
   - one retests/upgrades the other → **supersedes** — v1 → v2 per §6.9 atomicity
3. No pair → **distinct** — keep as-is.

### 10.5 [EXPERIMENTAL] Agentic provisional capture — default OFF
**Config: `AGENT_CAPTURE = off`** (operator-tunable: `off` | `provisional`). **Beta feature under active
calibration** — graduation criteria are tracked publicly (see the project's CONTRIBUTING). When `off` (the default),
nothing changes: ALL durable capture remains user-gated per §2/§7 — agents never write durable knowledge without the
verbatim prompt.

When the operator sets `provisional`:
- **Trust tier.** Agents may create durable artifacts without the per-item gate, but every such artifact enters a
  visibly lower trust tier: its structured header carries `Contributed-by: agent — <vendor/model>, <date>` and
  `Review: unreviewed`. Human-gated captures carry `Contributed-by: operator-approved` and no `Review:` field (the
  capture gate itself is the ratification). Provenance is plain Markdown data — it must survive any vendor switch and
  never rely on vendor-specific state.
- **Per-class policy.** Allowed provisionally: **Deferred Findings**, **Domain Learnings**, and **Learned Failures**
  — with `Claim:` and evidence content mandatory (no evidence, no capture). **Design Decisions:** agents may only
  file proposals (`Review: proposed`); a `DEC:` never becomes governing rationale without human ratification.
  **RULES changes: never agentic** (§10.2 governance), under any setting.
- **Consumption rule (all vendors).** Treat `Review: unreviewed` knowledge as *hypothesis, not invariant*: cite its
  provenance when acting on it, never let it relax a rule, and never let it override ratified knowledge. An
  unreviewed↔ratified contradiction resolves automatically in favor of the ratified entry pending review.
- **L1 marking.** L1 shorthand derived from unreviewed knowledge carries a `(prov)` tag until ratification — L1 must
  never launder provisional claims into apparent truth.
- **Commit trailer.** Commits introducing agent contributions carry the trailer `Salvor-Contribution: agent`. Header
  and trailer must agree — a mismatch is an audit red flag.
- **Ratification.** The Brain Audit (§10.3) enumerates every `Review: unreviewed` / `Review: proposed` artifact by
  scanning headers (no separate ledger — derived, conflict-free) and presents each through the §10.4 classification
  with the verbatim gate:
  > "Ratify this agent contribution? (yes / no / archive)"
  `yes` → `Review: ratified`, drop the L1 `(prov)` tags; `no` → one-line redirect stub stays in place, full content
  moves to the archive (§10.6); `archive` → moved untouched for later review. Review each item individually — bulk
  ratification defeats the tier.

### 10.6 [EXPERIMENTAL] Archive — `.salvor/archive/`
Unreviewed knowledge is parked, never silently discarded — the same principle as deferred findings, one tier down.
- **Layout:** mirrors the live folder structure (`archive/domain-learnings/`, `archive/decisions/`,
  `archive/postmortems/`). An archived artifact keeps its ID and full content; the live registry keeps a one-line
  `Status: archived` pointer (never delete an ID — §10.1).
- **Aging:** `ARCHIVE_AFTER_DAYS = 90` (operator-tunable). The Brain Audit surfaces unreviewed contributions older
  than the window with the verbatim gate:
  > "Archive N stale unreviewed contributions? (yes/no)"
  **Ratified knowledge never ages out** — it lives until superseded.
- **Load rule:** agents never read `.salvor/archive/` unless explicitly instructed (same contract as L2). The
  archive optimizes attention, not disk — git history retains everything regardless.
- **Un-archive:** late ratification moves the artifact back and flips `Review:`; references never dangled because
  the ID persisted.
- **Offloading** (e.g. object storage) is out of core scope — community integrations welcome; Salvor itself installs
  no hooks.
```

### `VERSION.md`

**This artifact is Q4-conditional — generate the variant that matches the Step 1 Q4 answer:**

**If Q4 = YES (Strict defaults enabled)** — generate the per-component build-ID manifest below. The [STRICT]
version-check (§0.1), version-increment (§3), and derived-constant rules are active, and the build IDs feed the
component spokes and session reports.

```markdown
<!-- {"version":"0.1.0","<comp_a_lower>":1,"<comp_b_lower>":1} -->
# <PROJECT_NAME> VERSION MANIFEST
## Current State
- **Project Version:** v0.1.0
- **Build IDs:** <COMP_ID_A>:01 | <COMP_ID_B>:01
- **Last Updated:** [DATE]

---

## Version History

| Date | Build IDs | Summary |
|------|-----------|---------|
| [DATE] | <COMP_ID_A>:01 <COMP_ID_B>:01 | Initial Salvor scaffold. Hub-and-spoke CLAUDE.md, L1/L2 cache, RULES.md §0–§10, VERSION.md, per-component spokes, DEFERRED_TODOS, domain-learnings + postmortems scaffolds. |
```

Feature-branch note ([STRICT], §3 + §10.2): counters advance only on the integration branch. Feature-branch work
records history rows with the literal build ID `pending`; the merge assigns the real numbers — so parallel branches
never race on a counter.

**If Q4 = NO (Core mode / Strict defaults disabled)** — do NOT impose per-component build counters or derived source
constants, and do NOT overwrite or compete with an existing version source. Detect the repo's established version
mechanism first (`package.json` `version`, `pyproject.toml`, `Cargo.toml`, Changesets, release-please,
semantic-release, git tags, …):
- **If the repo already has a version source:** do NOT generate a `VERSION.md` that competes with it. Reference the
  existing mechanism from the Salvor project-history artifact instead (a one-line pointer: "Versioning is owned by
  `<detected source>`"), and leave that source untouched.
- **If the repo has no version source and Core still wants a project-history artifact:** generate the MINIMAL
  Salvor project-history file below — a dated changelog with NO per-component counters and NO derived-constant
  columns. All [STRICT] version-counter behavior stays inactive.

```markdown
# <PROJECT_NAME> Project History

Salvor project-history log (Core mode — no per-component build counters). Versioning of shipped artifacts is owned
by the repo's established mechanism (`<detected version source, or "none — add one when the project needs releases">`);
this file is a chronological record of significant changes, not a build-counter manifest.

## History

| Date | Summary |
|------|---------|
| [DATE] | Initial Salvor scaffold. Hub-and-spoke CLAUDE.md, L1/L2 cache, RULES.md §0–§10 (strict defaults DISABLED), DEFERRED_TODOS, domain-learnings + postmortems scaffolds. |
```

### `.salvor/README.md` (folder index)

```markdown
# .salvor/ — <PROJECT_NAME>'s brain

This folder is <PROJECT_NAME>'s **git-tracked memory**, maintained by Salvor. Shared and
Git-tracked does not mean co-canonical: every durable fact has one canonical owner (see
RULES §8's one-owner table), and other shared files contain concise routing instructions,
summaries, derived retrieval aids, or links to that owner. (Governance and entrypoints live
at the repo root: `CLAUDE.md` hub + spokes, `RULES.md`, and — Q4-conditional — the version
source. Q4=YES: `VERSION.md`. Q4=NO with an existing version source: `RULES.md` plus a pointer
to the detected version source, with no assertion that `VERSION.md` exists. Q4=NO with a minimal
project-history file: `RULES.md` plus `<PROJECT_NAME> Project History` — name the exact artifact
the plan generated.)

Salvor-Protocol: v1.0.0-beta
<!-- The protocol stamp above records which Salvor version scaffolded/last
     upgraded this install. Re-running a newer SETUP_PROMPT reads it to propose
     a delta-scoped upgrade (protocol layer only — never your knowledge). -->

| File | What it is |
|------|-----------|
| `active_state.md` | **L1** — ≤50-line dense current state + Learned Failures (auto-loaded) |
| `active_state_verbose.md` | **L2** — curated deep archive (rotated past ~1,500 lines): reasoning, rejected hypotheses |
| `DOMAIN_REF.md` | Authoritative current truth + the `LF:` learned-failure registry |
| `INFRA.md` | Running, env vars, deployment, external APIs |
| `DEFERRED_TODOS.md` | Deferred findings parked (out-of-scope, not yet fixed) |
| `domain-learnings/` | Dated, frozen empirical findings (probes, bakeoffs — the receipts) |
| `decisions/` | Design decisions + load-bearing invariants (why it's this way; what must stay; what depends on it) |
| `postmortems/` | Incident write-ups feeding `LF:` entries + deferred findings |
| `archive/` | EXPERIMENTAL (§10.6) — parked rejected/aged agent contributions; agents don't read it unless instructed |

Everything here is meant to be **read by humans and agents alike** — it's the *why*
behind the code.
```

### `.salvor/active_state.md` (L1, ≤50 lines)

The header is Q4-conditional. Emit EXACTLY ONE of the two variants below — the one that
matches the Step 1 Q4 answer — and delete the other. The generated file must contain only
the selected heading (no component IDs when Q4=NO).

**Q4=YES header (per-component build IDs):**
```markdown
# <PROJECT_NAME> Active State — <COMP_ID_A>:01 <COMP_ID_B>:01 ([DATE])
```

**Q4=NO header (no build IDs):**
```markdown
# <PROJECT_NAME> Active State — ([DATE])
```

The rest of the L1 body is identical either way:
```markdown
## Architecture: [ONE-LINE: top-level stack + ports]
## Pipeline: [ONE-LINE: request/data flow, if applicable]
## DEPLOYED: [environment, ingress, deploy/perf notes — or "local only"]
## Current Delta to Published Logic: [empty initially — populate as work lands]
## LEARNED FAILURES: [empty initially — `LF:<slug>` entries land here in shorthand]
## Open: [active todos / pending decisions]
## Last Brain Audit: [DATE] (interval 3d — RULES §10.3)
```

### `.salvor/active_state_verbose.md` (L2, curated)

```markdown
# <PROJECT_NAME> Active State — VERBOSE ARCHIVE

L2 cache. Detailed but CURATED deep history of reasoning, rejected hypotheses, and condensed evidence pruned from L1.
Update trigger: immediately after every L1 update. Summarize command output — keep evidence, conclusions, and
commit/test/issue IDs, not raw dumps. Rotation: when this file exceeds ~1,500 lines, or at each release milestone,
condense the oldest resolved sections into brief summaries (keep durable conclusions, drop noise). Never persist
secrets, credentials, PII, or unredacted logs here (RULES §9) — redact before writing.

---

## [DATE] — Project initialized
<!-- The scaffold line is Q4-conditional — write the variant matching the Step 1 Q4 answer:
     Q4=YES: "Initial Salvor scaffold: hub-and-spoke CLAUDE.md, L1/L2 cache, RULES.md §0–§10, VERSION.md
              (per-component build counters), three capture classes."
     Q4=NO:  "Initial Salvor scaffold: hub-and-spoke CLAUDE.md, L1/L2 cache, RULES.md §0–§10 (strict defaults
              DISABLED), three capture classes. Versioning owned by <detected existing version source, or the
              minimal Salvor project-history file when the plan generated one> — no VERSION.md scaffolded." -->
Initial Salvor scaffold: hub-and-spoke CLAUDE.md, L1/L2 cache, RULES.md §0–§10, VERSION.md (per-component build counters), three capture classes.
```

### `.salvor/DOMAIN_REF.md`

```markdown
# <PROJECT_NAME> Domain Reference

Authoritative current-truth for domain logic. Artifacts in `.salvor/domain-learnings/` are frozen audit trails; this file is
what's currently true.

## Sections
- [empty — populate as the project takes shape]

## Learned Failures (LF:)
[One entry per failure mode, headed `### LF:<kebab-slug> (YYYY-MM-DD)`, opening with the structured header — Subject /
Claim / Evidence date / Status (RULES §10.1) — then root cause, fix sites, and a cross-link to the dated artifact in
`.salvor/domain-learnings/`. Update existing entries when a v1 fix is upgraded to v2 (RULES §6.9). Never two
contradictory `Status: live` entries — resolve per RULES §10.4.]
```

### `.salvor/INFRA.md`

```markdown
# <PROJECT_NAME> Infrastructure

Operational reference: running locally, deployment, env vars, external APIs, observability.

## Local
[how to run each component locally, port assignments]

## Deployment
[target environment, ingress, secrets management, deploy commands]

## Env vars
[required env vars per component, where consumed]

## External APIs
[each external system, auth method, rate limits, identifier conventions]

## Observability
[logs, metrics, dashboards]
```

### `.salvor/DEFERRED_TODOS.md`

```markdown
# Deferred Findings

Out-of-scope findings intentionally **not** addressed when they surfaced — real, but not worth derailing the task they
were found in. Captured here so they don't slip into "I'll remember." Severity reflects "impact if left ~6 months," not
"broken today." See `RULES.md` §7 for the capture protocol.

<!-- Template for new entries (self-allocating slug ID — never a sequential number; RULES §10.1):

### deferred:<kebab-slug> — <short title>
- **Subject**: <tags: system / vendor / component the finding is about>
- **Where**: <file / location>
- **What**: <the issue>
- **Severity**: <Low | Medium | High>
- **Suggested fix**: <actionable suggestion>
- **Why deferred**: <why it was safe to skip now>
-->

## How this file is maintained
1. When you fix one: delete its entry, and reference the stable slug ID in the fixing commit (`closes deferred:<slug>`).
2. When you discover a NEW out-of-scope risk during related work: prompt me (RULES §7), and if I agree, add it here —
   don't let it slip into chat.
3. When something here becomes urgent (impact observed): promote it to a real ticket and link back.
```

### `.salvor/postmortems/README.md`

```markdown
# Postmortems

Structured write-ups of incidents and significant failures. Each becomes durable knowledge: findings here feed the
`LF:` registry in `.salvor/DOMAIN_REF.md` and/or new entries in `.salvor/DEFERRED_TODOS.md`.

## Naming
`YYYY-MM-DD-[SHORT-SLUG].md` — artifact ID `PM:<kebab-slug>` (RULES §10.1)

## Template
- **Structured header** — ID / Subject / Claim / Evidence date / Status (RULES §10.1).
- **Summary** — one paragraph: what broke, blast radius, duration.
- **Timeline** — UTC-stamped sequence of events.
- **Root cause** — the actual mechanism, not the symptom.
- **Findings → follow-ups** — each finding tagged with where it goes:
  `LF:<slug>` (recurring failure mode → DOMAIN_REF), `deferred:<slug>` (out-of-scope fix → DEFERRED_TODOS), or `FIXED`
  (done in this pass, with commit).
- **What would have caught it earlier** — the missing test / check / alert.

## Index
| Date | ID | File | Subject | One-line |
|------|----|------|---------|----------|
| [DATE] | PM:[slug] | [link] | [tags] | [takeaway] |
```

### `.salvor/domain-learnings/README.md`

```markdown
# Domain Learnings

Frozen audit trail of every domain discovery, hypothesis test, vendor probe, and learned failure. Each artifact is dated,
categorized, and never edited after creation (DOMAIN_REF.md carries the living truth; these are the receipts).

## Naming convention
`YYYY-MM-DD-[CATEGORY]-[OUTCOME].md` — artifact ID `DL:<kebab-slug>` (or `LF:<kebab-slug>` for a Learned Failure
spec; RULES §10.1)

Categories (extend as needed):
- `PROBE` — exploration of an external system / vendor with a verdict
- `BAKEOFF` — A/B/N test of competing approaches with a verdict
- `LF` — Learned Failure spec with root cause + fix (carries the `LF:<slug>` ID registered in DOMAIN_REF)
- `ARCH` — empirical architecture probe with evidence and a verdict
- `MIGRATION` — pre-spec for a non-trivial change

## What goes here
- Structured header first: ID / Subject / Claim / Evidence date / Status (RULES §10.1)
- Hypothesis stated up front, in one sentence
- Evidence: what was tested, observed, what the data says
- Verdict: accepted / falsified / inconclusive
- Cross-links: spec → code commit → L1/L2 entries it updated

## Chronological index
| Date | ID | File | Category | Subject | One-line takeaway |
|------|----|------|----------|---------|-------------------|
| [DATE] | DL:[slug] | [link] | [cat] | [tags] | [takeaway] |
```

### `.salvor/decisions/README.md`

```markdown
# Design Decisions & Invariants

Dated, frozen records of **why the code is shaped the way it is — and what must stay true.**
Where `domain-learnings/` holds empirical findings and `postmortems/` hold incidents,
`decisions/` holds deliberate **design decisions and load-bearing invariants** — so a
fresh session understands the rationale *before* it changes something, including when it
touches an adjacent component that quietly depends on this one.

## Naming
`YYYY-MM-DD-[short-slug].md` — artifact ID `DEC:<kebab-slug>` (RULES §10.1)

## Entry template
- **Structured header** — ID / Subject / Claim (the invariant, one line) / Evidence date / Status (RULES §10.1).
- **Context** — the situation/forces that led to the decision.
- **Decision** — what was chosen.
- **Rationale** — the *why* that must outlive the refactor.
- **Invariant** — what must stay true; what NOT to "fix" without first understanding this.
- **Coupling / blast radius** — which components/files depend on this; touch with care
  (pair with a GitNexus impact check when the GitNexus MCP is active; otherwise use
  the best available structural search/review fallback).
- **Alternatives rejected** — and why.

## Index
| Date | ID | Decision | Subject | Invariant (one-line) | Touches |
|------|----|----------|---------|----------------------|---------|
| [DATE] | DEC:[slug] | [link] | [tags] | [what must stay true] | [components] |
```

### `.salvor/archive/README.md` (EXPERIMENTAL surface — always scaffolded, starts empty)

```markdown
# Archive (EXPERIMENTAL — RULES §10.6)

Parked knowledge: agent contributions that were rejected or aged out unreviewed
(`ARCHIVE_AFTER_DAYS`, RULES §10.6), kept in full rather than discarded. Layout
mirrors the live folders (`domain-learnings/`, `decisions/`, `postmortems/`).
Archived artifacts keep their IDs; the live registries keep `Status: archived`
pointers, so references never dangle. Late ratification moves an artifact back.

**Agents: do NOT read this folder unless explicitly instructed** (same contract
as the L2 archive). It exists to keep unreviewed noise out of loaded context
without ever throwing knowledge away.
```

### `<COMPONENT_*>/CLAUDE.md` (one per component)

```markdown
# <COMPONENT_X> — [one-line description]

[Stack summary: language, framework, runtime model. Entry point. External systems this component talks to.]

## Key Files
- `src/[entry]` — [one-line description, approximate LOC]
- `src/[domain types]` — [shared types/schemas]
- `src/[external integration]` — [API client / proxy / WS handler]
- `tests/` — [test convention]

## Architecture Notes
- [architectural invariants — e.g. "monolithic main loop", "shared connection pool"]
- [parity rule if applicable: "mirrors <other_path>; both land in the same commit per RULES §6.3"]
- [language-specific gotchas]

## Build
- [command to build this component]
- [Q4=YES only: where the version constant comes from — VERSION.md key + build step. Q4=NO: omit the per-component
  build-counter line; reference the repo's established version mechanism if the component ships releases.]

For codebase tree: use Serena MCP `get_symbols_overview`.
For domain logic: see `.salvor/DOMAIN_REF.md`. For infra/ops: see `.salvor/INFRA.md`.
```

### `.gitignore` additions

Append (don't replace) — note `.serena/memories/` is **committed** (retrieval pointers into the shared brain, per
RULES §8); only caches and locally-generated tooling are ignored:

```
.tmp/
.gitnexus/
.serena/cache/
**/.claude/skills/gitnexus*/
```

Older `gitnexus analyze` invocations (and the `--skip-agents-md` fallback path) drop local static skill dirs under
`.claude/skills/gitnexus-*/` — these are local, regenerable artifacts. The `**/.claude/skills/gitnexus*/` pattern
gitignores them, so those skill files never ship in a release package. Pure index mode (`--index-only` where supported)
generates NO skills at all; the pattern stays in `.gitignore` as a harmless safety net for the fallback path. (The
`--skills` flag generates repo-specific community skills; opt-in only — see Step 3.)

### Entrypoint adapters (generate all three by default)

`CLAUDE.md` is the **canonical hub** (created above). Salvor's Markdown memory format is
vendor-portable; setup generates contract-tested entrypoints for Claude Code, Codex, and
GEMINI.md-compatible clients (Claude Code is the most dogfooded; the Codex and Google
entrypoints are wired + documented but less exercised). Other agents integrate via thin
adapters. Always also create the two thin pointer files so those CLIs work out of the box:

- **`AGENTS.md`** (Codex and other AGENTS-aware CLIs) — at repo root, containing:
  > Before any work, read `CLAUDE.md` (the hub) + the relevant component spoke + `RULES.md` +
  > `.salvor/active_state.md` (L1). Follow `RULES.md` exactly — including the Task Termination
  > Protocol and the capture classes. The canonical context lives in `CLAUDE.md`; this file
  > just points there. **Do not duplicate or fork project knowledge into this adapter.**
  > Canonical engineering knowledge lives in its assigned `.salvor/` artifact and the
  > `CLAUDE.md` hub + component spokes; `.serena/memories/` contains concise enhanced-mode
  > retrieval aids only.
- **`GEMINI.md`** (Gemini CLI / Antigravity — Google's coding-agent tooling reads the
  compatible `GEMINI.md` project-context file; Salvor assumes nothing beyond that
  compatibility) — the same pointer text.
- **Claude Code** needs nothing extra: it auto-loads `CLAUDE.md` (with `@`-imports). Optionally
  reinforce RULES §0 with a `.claude/settings.json` hook (ask before writing settings files).

**If any entrypoint file already exists** (Step 0 scan), do not replace it: merge the Salvor pointer text into it as a
`<!-- salvor:start --> … <!-- salvor:end -->` managed section, preserving all existing content and other tools'
sections. Update an existing salvor-managed section in place — never duplicate it.

The core files are identical across vendors; only these thin entrypoints differ. See
`docs/VENDOR_ADAPTERS.md`.

## Step 3 — Show the diff, offer a commit, then index (enhanced mode)

After creating all files, show me the completed diff of everything created or
modified (Step 0's no-silent-overwrite rule). Setup NEVER stages unrelated work
and NEVER auto-commits. Ask me:

> "Salvor setup is complete. Would you like me to stage only the Salvor-related
> files, show the staged diff, and create an initialization commit?"

**If yes:** stage the explicit list of paths this setup created or modified —
named one by one, never a blanket add — then run `git diff --cached`, show me
the output, and only after I approve what's staged, commit:

```bash
# If Q4 = YES (Strict defaults enabled — per-component build counters in VERSION.md):
git commit -m "chore: scaffold Salvor — hub-and-spoke + L1/L2 + RULES + per-component spokes"
# If Q4 = NO (Core mode — no per-component counters; VERSION.md omitted or a minimal project-history file):
git commit -m "chore: scaffold Salvor — hub-and-spoke + L1/L2 + RULES (Core mode)"
```

(If your repo enforces commit signing and you're running unattended, add `--no-gpg-sign` only with operator approval.)

**If I decline:** setup still succeeds — leave the files uncommitted for me to
review and commit myself.

### GitNexus indexing (enhanced mode only — skip entirely in Core mode)

Ownership contract, before you run anything:

- **Salvor owns** `.salvor/` and the `<!-- salvor:start --> … <!-- salvor:end -->` managed sections. **User content
  stays user-owned.**
- **GitNexus owns** its index (`.gitnexus/`), graph data, any generated skills (under tool-specific directories such as
  `.claude/skills/gitnexus-*`), and hooks.
- Salvor's OWN concise GitNexus routing instructions live in the canonical `CLAUDE.md` hub as a **hand-authored, thin**
  section (see the hub template above) — GitNexus does NOT auto-write instruction blocks into `CLAUDE.md`/`AGENTS.md`.
- Never run a global `gitnexus setup` (or any other global config change) without my approval.

**`gitnexus analyze` is not read-only, and its capabilities vary by version — detect before running.** Depending on
version and flags it may write a GitNexus block into `CLAUDE.md`/`AGENTS.md` and install local static skill dirs under
`.claude/skills/gitnexus-*/` (regenerable, gitignored); hooks are installed only by the separate `gitnexus setup` (never
by `analyze`). **FIRST run `gitnexus analyze --help` to detect the installed CLI's capabilities**, then choose the safe
default accordingly:

- **If `--index-only` is supported (GitNexus v1.6.9+):** run `gitnexus analyze --index-only`, and persist the repo
  default by merging `{"indexOnly": true}` into `.gitnexusrc` (this is the current safe persisted default). This is
  pure index mode — it builds/refreshes the code index and leaves `CLAUDE.md`/`AGENTS.md`/`GEMINI.md` UNCHANGED,
  generates NO skills, creates NO `.claude/` dir, installs NO hooks, and makes NO global MCP/config change. This is the
  correct pure-index default now. When merging, PRESERVE any unrelated existing `.gitnexusrc` keys — add/set only
  `indexOnly`.
- **Else if only `--skip-agents-md` exists (older, e.g. v1.6.3):** the legacy fallback is the `--skip-agents-md` CLI
  **flag** used per-run after disclosure + approval — it is NOT persisted as a repo-config promise (do NOT write
  `{"skipAgentsMd": true}` into `.gitnexusrc` as a durable default; on v1.6.3 that key is inert and gives a false sense
  of safety). Run `gitnexus analyze --skip-agents-md`. This keeps GitNexus from writing its block into
  `CLAUDE.md`/`AGENTS.md`, but WARN me that older versions still generate local skills — SHOW the expected
  `.claude/skills/gitnexus-*/` paths (gitnexus-cli, -exploring, -guide, -debugging, -impact-analysis, -refactoring), get
  my explicit approval, and confirm they are gitignored.
- **Else (neither flag exists):** do NOT run `gitnexus analyze` automatically. Show the upstream upgrade instructions,
  offer to stay in Salvor Core mode (fully functional without GitNexus), or require my explicit approval only after
  enumerating every file/config mutation `analyze` would make.

> **Config-key caveat, scoped to v1.6.3:** In GitNexus v1.6.3 the `.gitnexusrc` keys `indexOnly` / `skipContextFiles` /
> `skipSkills` were NOT honored — they did not prevent block injection or skill installation, and the reliable control
> was the `--skip-agents-md` **flag** (a per-run CLI flag, never a persisted repo-config promise). Current releases
> (v1.6.9+) recognize `indexOnly` and add `--index-only` (verified: persisting `.gitnexusrc {"indexOnly": true}` yields
> the same clean result as the flag) — this is the recommended persisted repo default. Do NOT persist
> `{"skipAgentsMd": true}` as a repo default on any version; on v1.6.3 it is inert, and on newer versions `indexOnly`
> is the correct persisted key. Detect via `gitnexus analyze --help` and verify the actual behavior rather than trusting
> the version number.

Present me an **explicit choice** and wait — do not pick for me:

- **Option A — Pure index mode (RECOMMENDED):** run `gitnexus analyze --index-only` and persist the repo default by
  merging `{"indexOnly": true}` into `.gitnexusrc` (preserving any unrelated existing keys) where supported.
  Builds/refreshes the code index with **no context blocks, no skills, no hooks, and no global MCP change** (Salvor keeps
  its own concise, hand-authored GitNexus routing note in the hub). On older CLIs without `--index-only`, fall back to
  the per-run `--skip-agents-md` flag per the detection ladder above (a CLI flag, not a persisted `skipAgentsMd`
  config default — it still drops gitignored local skills).
- **Option B — Index + generated skills:** run `gitnexus analyze --skills` ONLY after enumerating the exact expected
  `.claude/skills/gitnexus-*/` paths, explaining they are third-party GitNexus artifacts, and getting my explicit
  approval. Repo-specific / generated skills are opt-in only. Preserve existing skills; overwrite nothing unrelated.
- **Option C — Index + hooks:** hooks come from the separate `gitnexus setup` (`analyze` never installs them). Only after
  enumerating the exact hook changes + their purpose + getting my explicit approval. Preserve existing hooks; never
  install user/global hooks silently.
- **Option D — Full approved integration:** enumerate every file + config mutation, require my explicit approval, and
  preserve Salvor + user ownership throughout.

> Never run `gitnexus setup` without my explicit approval. Salvor Core is fully usable without GitNexus.

In every option: **Salvor's GitNexus routing stays hand-authored + thin** in the canonical `CLAUDE.md` hub — there is no
"gitnexus will append its block here" placeholder; Salvor authors the routing instructions itself. **NEVER run global
`gitnexus setup`** (or any other global config change) without explicit operator approval. **Core mode remains fully
functional without GitNexus.**

> GitNexus may generate agent-specific skills under tool-specific directories such as `.claude/skills/gitnexus-*`. Exact
> paths and available skills can vary by GitNexus and coding-agent version. Inspect the proposed changes before approving
> them.

For the RECOMMENDED default (Option A), detect capabilities first, then index in pure index mode to populate the local
code-intelligence graph WITHOUT touching Salvor-owned instruction files:

```bash
gitnexus analyze --help          # detect: is --index-only supported?
gitnexus analyze --index-only    # v1.6.9+: pure index — no context blocks, no skills, no hooks
# older CLI fallback (v1.6.3): gitnexus analyze --skip-agents-md  (still drops gitignored local skills — approve first)
```

In pure index mode GitNexus builds its index and leaves `CLAUDE.md`/`AGENTS.md`/`GEMINI.md` unchanged — no skills, no
`.claude/` dir, no hooks. Salvor's own thin GitNexus routing already lives in the hub. Then OFFER — never auto-run — the
follow-up commit: stage only relevant tracked changes (any `.gitnexusrc` merge and any hand-authored hub edit), show me
`git diff --cached`, and commit only after I approve:

```bash
git commit -m "chore(gitnexus): enable local code-intelligence index (pure index mode)"
```

## Step 4 — Operating ground rules going forward

State that you understand these at the end of the scaffold confirmation message.

1. **Three capture classes, user-gated.** Decision / Domain Learning → `"Record this as a design decision? (yes/no)"`
   for a design decision/invariant (→ `.salvor/decisions/`), or `"Save this as a domain learning? (yes/no)"` for an
   empirical finding (→ `.salvor/domain-learnings/`); Learned Failure (`LF:<slug>`) → registered via the same flow;
   Deferred Finding → `"Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"`. Prompt verbatim; never infer; never batch
   unrelated items; on yes, run the full propagation and report the file list.
2. **L1/L2 update silently** after every confirmed resolution (CLAUDE.md SYSTEM DIRECTIVE). L1 stays under 50 lines;
   L2 stays curated and secret-free (RULES §9). Routine operational state is automatic; promoting anything into the
   durable shared engineering record always asks first (rule 1).
3. **RULES.md §0 Task Termination Protocol is mandatory.** L1 sync → L2 sync → spoke sync before "done" — plus VERSION
   bump and mirror parity when strict defaults are enabled.
4. **[ENHANCED-ACTIVE only] Serena MCP is the primary search tool.** Only when Serena's MCP tools actually respond in
   this client: `find_symbol` / `get_symbols_overview` before any read of a file >100 lines. Serena memories stay
   concise pointers — canonical content lives in `.salvor/` (RULES §8). If Serena is only ENHANCED-READY or absent,
   use `grep`/`glob` and do not pretend symbolic tools ran.
5. **[ENHANCED-ACTIVE only] GitNexus impact analysis before edits.** Only when GitNexus's MCP tools actually respond in
   this client: run impact analysis on a symbol before modifying it; run change-detection before committing; re-run
   `gitnexus analyze` after structural changes. If GitNexus is only ENHANCED-READY or absent, state that impact
   analysis is unavailable rather than invoking `gitnexus_impact`.
6. **[STRICT] Branch hygiene (RULES §6.11).** Merge → push → delete local + remote branch in one step.
7. **Containers / production (RULES §5).** Ask before `build`/`up`/`down`/`restart` and before any production-affecting
   or outward-facing action (push, release, deploy).
8. **Shared vs per-user memory + one-owner rule (RULES §8).** Shared truth goes in-repo; each durable fact has exactly
   one canonical artifact — everywhere else links or summarizes. Per-user auto-memory (Claude Code only) is optional
   and non-shared — never the home of canonical knowledge.
9. **Git-safe operation + security (RULES §9).** No blanket staging, no commits without explicit approval, no silent
   overwrites of files or managed sections; never persist secrets, credentials, or PII — redact before writing.
10. **Distributed brain (RULES §10).** Knowledge IDs are self-allocating slugs (`LF:` / `DL:` / `DEC:` / `PM:` /
    `deferred:`) with structured Subject/Claim headers — never sequential numbers. On incoming `.salvor/` changes, ask
    `"Incoming brain changes detected — run brain reconcile? (yes/no)"`; [STRICT] reconcile a feature branch against
    the integration branch before merging; when the Brain Audit is due (default every 3 days, tracked in L1), ask
    `"Brain audit is due (last run N days ago) — run it now? (yes/no)"`. [EXPERIMENTAL] Agentic provisional capture
    (§10.5) is OFF by default — never write durable knowledge without the capture gate unless the operator explicitly
    set `AGENT_CAPTURE = provisional`, and then only with `Contributed-by`/`Review` provenance headers, the commit
    trailer, and the hypothesis-not-invariant consumption rule.

## Step 5 — Confirmation report

After Steps 2–4, return a short report:
- Mode, reported per integration (do NOT collapse to a single "enhanced" flag):
  overall **CORE** / **ENHANCED-READY (PARTIAL ENHANCED)** / **ENHANCED-ACTIVE**,
  plus a separate line each for **Serena** and **GitNexus** stating CLI available?
  / initialized-or-indexed? / index fresh? / MCP configured? / MCP tools actually
  responding in this client? Only claim ENHANCED-ACTIVE for an integration whose
  MCP tools responded. If CORE (or an integration is not MCP-active), state which
  tools were unavailable or only READY and why, and confirm no MCP-only operation
  was instructed for a non-responding MCP.
- File list created/modified (with byte counts or LOC), plus confirmation that the completed diff was shown.
- Adoption summary: list everything reused unchanged, every Salvor-managed
  section added, and every conflict resolved by an explicit operator decision.
  Confirm that existing Serena memories, hub/spokes, rules, vendor
  infrastructure, and GitNexus configuration/index were not migrated,
  duplicated, rebuilt, or overwritten unless the approved plan named that
  exact action.
- Confirmation that root `CLAUDE.md`, `RULES.md` (§0–§10, with strict defaults marked enabled/disabled per Step 1 Q4),
  L1 (including its `Last Brain Audit` footer line), L2, `DOMAIN_REF`, `INFRA`, `DEFERRED_TODOS`, `decisions/README`,
  `postmortems/README`, `domain-learnings/README`, `archive/README` (EXPERIMENTAL surface, empty), and each spoke
  `CLAUDE.md` exist and have project-specific placeholders filled in. Confirm `AGENT_CAPTURE = off` is the generated
  default and that `.salvor/README.md` carries the `Salvor-Protocol:` stamp (on upgrades: state the stamp
  transition and the applied protocol deltas).
- **Versioning (Q4-conditional):** if Q4=YES, confirm `VERSION.md` exists with per-component build IDs and that the
  [STRICT] version-check/increment/derived-constant rules are active. If Q4=NO, confirm NO per-component build
  counters were imposed — state which version mechanism the repo owns (`package.json` / `pyproject.toml` /
  `Cargo.toml` / Changesets / release-please / semantic-release / git tags / none), and whether a minimal Salvor
  project-history file was generated or the existing source is simply referenced. All [STRICT] version-counter
  behavior is inactive.
- All three entrypoints present: `CLAUDE.md` (canonical hub) + `AGENTS.md` + `GEMINI.md` pointers (merged as
  salvor-managed sections where the files pre-existed).
- Initialization commit hash **if I approved the commit** — otherwise note that the files are left uncommitted by design.
- GitNexus index counts (symbols / relationships / execution flows) — only if an index was actually built this run;
  otherwise state the index status (present-and-fresh / present-but-stale / absent) rather than a fabricated count.
- Acknowledge the 10 operating rules from Step 4.

After confirmation, I'll brief you on the first real task.
