# Salvor — one-shot setup prompt

> **How to use this file:** copy everything below the line into your LLM coding
> CLI (Claude Code, Codex, Gemini CLI, …) from the root of the project you want
> to give a memory to — new or existing. The agent will interview your project,
> then scaffold the full Salvor structure. Prerequisites (Serena + GitNexus MCP
> servers) are covered in the repo `README.md`; install them first.

---

You are about to set up **Salvor** in this repository: a version-controlled
"institutional brain" that makes project knowledge — especially the *why* —
compound across sessions, developers, and even different LLM vendors, instead of
evaporating on context rotation.

Salvor gives this repo: a **hub-and-spoke** `CLAUDE.md` (token-thrifty context),
a **two-tier persisted memory** (L1 concise + L2 deep), a strict **`RULES.md`**,
**three user-gated knowledge-capture triggers**, **per-component versioning**,
and **Serena + GitNexus** discipline. Set it up exactly as specified below.

Everything Salvor writes is **in-repo and git-tracked** — that is the *shared*
brain every contributor's agent reads. (A per-user auto-memory layer is an
optional, vendor-specific enhancement; see Step 4.)

---

## Step 0 — Confirm prerequisites

Before scaffolding, verify (and tell me if any are missing):

- **Serena** MCP server is available (semantic/symbolic code intelligence).
- **GitNexus** CLI/MCP is available (`gitnexus --version`) for the code
  knowledge graph.
- This directory is a git repository (`git rev-parse --git-dir`). If not, ask me
  before running `git init`.

Neither Serena nor GitNexus core features require an account or API key. If
either is missing, point me to the repo README's Prerequisites section.

## Step 1 — Confirm scope before writing files

Ask me these **four** questions in a single question call (or inline if your CLI
has no structured-question tool) BEFORE creating anything:

1. **Project name** — the top-level identifier (e.g. "Atlas", "Helix"). Don't
   hardcode it later; reference an `APP_NAME` env var or your language's
   build-time constant.
2. **Components** — list each top-level component directory with a one-word
   stack hint (e.g. `api` Rust/tokio, `web` Next.js, `worker` Python). Each gets
   its own spoke `CLAUDE.md` and a per-component build counter in `VERSION.md`.
   The **counter letters are derived from the component name** (e.g. `api` →
   `API:01`, `web` → `WEB:01`) — configurable, not hardcoded.
3. **Production / mirror pair?** — does any component have a "live" execution
   path AND a "simulator / replay / test mirror" that must stay bit-for-bit
   aligned (e.g. a live execution engine next to a deterministic simulator/replay
   used in tests)? If yes, name both
   files — they get a parity rule. If no, omit the parity rule from `RULES.md`
   §0 / §6.
4. **Primary LLM CLI / vendor** — Claude Code, Codex, Gemini CLI, or other. This
   decides which **entrypoint adapter** is wired:
   - **Claude Code** → `CLAUDE.md` hub with `@`-imports, optional
     `.claude/settings.json` `custom_instructions`, optional per-user
     auto-memory, Skills.
   - **Codex** → `AGENTS.md` is the native entrypoint; it points at the same
     in-repo core.
   - **Gemini CLI** → `GEMINI.md` is the entrypoint.
   - The **core files below are vendor-neutral**; only the entrypoint glue
     differs. See `docs/VENDOR_ADAPTERS.md` in the Salvor repo.

Wait for answers. Do not invent components or assume a stack. Once I respond,
proceed to Step 2.

> Throughout the templates, substitute `<PROJECT_NAME>`, `<COMPONENT_*>`,
> `<STACK_*>`, `<COMP_ID_*>` (the derived counter letters), `<LIVE_FILE>`, and
> `<MIRROR_FILE>` from my answers. The examples use components `api`/`web`/`worker`
> with IDs `API`/`WEB`/`WKR` — replace with mine.

## Step 2 — Create the file tree

### `CLAUDE.md` (hub, ~60 lines max)

```markdown
# <PROJECT_NAME>
### CURRENT STATE (L1 Cache)
@docs/active_state.md

> For deep historical context, architecture logs, or dementia recovery: `docs/active_state_verbose.md`

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
| `docs/DOMAIN_REF.md` | Domain logic, business rules, learned failures | Changing core logic |
| `docs/INFRA.md` | Running, env vars, deployment, external APIs | Changing infra/deployment/APIs |
| `docs/DEFERRED_TODOS.md` | Known out-of-scope issues deferred (not yet fixed) | Before starting related work |
| `<COMPONENT_A>/CLAUDE.md` | <COMPONENT_A> architecture and key files | Working in <COMPONENT_A>/ |
| `<COMPONENT_B>/CLAUDE.md` | <COMPONENT_B> architecture and key files | Working in <COMPONENT_B>/ |
| `.serena/memories/` | Codebase structure, execution logic, domain findings | Use Serena MCP tools to query |

## APP_NAME
Configurable via `APP_NAME` env var. Default: `<PROJECT_NAME>`. Never hardcode — reference the env var or the
language-specific constant your build wires up.

### SYSTEM DIRECTIVE: TWO-TIER MEMORY MANAGEMENT
You maintain two memory ledgers: `docs/active_state.md` (L1 Cache — Concise) and `docs/active_state_verbose.md`
(L2 Cache — Deep Memory).

**L1 — active_state.md (Concise)**
- **Role:** Primary context for every session. Auto-loaded via `@` import (Claude Code) or read first (other CLIs).
- **Content:** Final confirmed logic, active deltas vs published behavior, infra status, and "Learned Failures."
- **Constraints:** MAXIMUM 50 LINES. Dense technical shorthand; non-standard abbreviations optimal for token density.
- **Update Trigger:** After every confirmed resolution, milestone, or architectural shift.

**L2 — active_state_verbose.md (Deep Archive)**
- **Role:** Permanent repository for reasoning, historical logs, raw tool outputs, and rejected hypotheses.
- **Update Trigger:** Immediately after updating L1 — offload the nuance pruned from L1.
- **Constraint:** NO LINE LIMIT. Do NOT read unless explicitly instructed or when "dementia" (memory loops) occurs.

**Execution Rules:**
- Update both files autonomously and silently. Do not ask permission for L1/L2 writes.
- On any major learning or infra nuance: update L1 instantly with shorthand and L2 with detail.

### SYSTEM DIRECTIVE: THREE KNOWLEDGE-CAPTURE TRIGGERS
You self-identify knowledge worth persisting and ask me, verbatim, before persisting it. Three distinct triggers (see
`RULES.md` §2 and §7):
1. **Continued Learning** (a discovery + its *why*) → `"Save this as a domain-tuning artifact? (yes/no)"`
2. **Learned Failure (LF#)** (a structural failure mode) → registered in `docs/DOMAIN_REF.md` as part of the above.
3. **Deferred TODO** (an out-of-scope finding surfaced mid-task) → `"Log this to docs/DEFERRED_TODOS.md? (yes/no)"`

# GitNexus — Code Intelligence

[Run `gitnexus analyze` after the initial commit. It appends a
`<!-- gitnexus:start --> … <!-- gitnexus:end -->` block here with symbol/relationship counts and tool routing.]
```

### `RULES.md` (mandatory; §0–§7)

```markdown
# <PROJECT_NAME> Development Rules

These rules are MANDATORY. They supplement CLAUDE.md and take precedence over default behavior.

---

## 0. CRITICAL: Task Termination Protocol
Before declaring any task "Complete" or "Done," you MUST verify and execute this checklist. **No task is complete until
VERSION.md is bumped, spokes are synced, and L1/L2 caches are updated.**

1. **Version Check:** If any logic in a component changed, increment its build ID in `VERSION.md` and update the "Last
   Updated" date. No hardcoded versions in source — they derive from VERSION.md at build time.
2. **L1 Sync (`docs/active_state.md`):** Dense technical shorthand. Keep under 50 lines.
3. **L2 Sync (`docs/active_state_verbose.md`):** Offload full reasoning, logs, and nuance here.
4. **Spoke Sync:** Update the changed component's spoke `CLAUDE.md`. Update `docs/DOMAIN_REF.md` if domain logic changed;
   `docs/INFRA.md` if infra changed. Do NOT edit root CLAUDE.md for component-specific changes.
5. **Production/Mirror Parity (if applicable):** Keep `<MIRROR_FILE>` bit-for-bit aligned with `<LIVE_FILE>`. Both paths
   land in the SAME commit. See §6.3.

## 1. Dementia Recovery Procedure
If I mention "Dementia" or you find yourself in a logic loop:
1. **Stop** all code generation.
2. **Re-read** `docs/active_state_verbose.md` from the beginning.
3. **Compare** current logic against "Learned Failures" in `docs/DOMAIN_REF.md` and L1/L2.
4. **Summarize** the source of the confusion before proceeding.

## 2. Continued Learning Protocol
Every domain discovery, hypothesis falsification, validation, vendor/model verdict, or parameter learning is a **mandatory
save checkpoint**. The discovery is not the end — persisting it across the stack is.

**Trigger:** any of — hypothesis tested with evidence (accepted OR falsified); multi-dataset matrix / bakeoff result;
vendor / dependency probe with a verdict; new technique validated; Learned Failure (LF#) registered or updated; taxonomy
clarification that will outlive the refactor.

**Mandatory prompt:** at the trigger moment, pause and ask me verbatim:

> "Save this as a domain-tuning artifact? (yes/no)"

Non-negotiable — it is the signal that the rule is working. Do not infer the answer, do not batch multiple discoveries
into one prompt, do not defer.

**On `yes` — execute the full stack update:**
1. **Dated artifact:** create `docs/domain-tuning/YYYY-MM-DD-[CATEGORY]-[OUTCOME].md` per `docs/domain-tuning/README.md`.
   Include hypothesis, evidence, dataset(s), verdict, cross-links.
2. **TOC update:** add a row to the chronological index in `docs/domain-tuning/README.md`.
3. **DOMAIN_REF.md:** update to reflect new authoritative state — new/updated LF# entry, parameter rationale, finding
   status. DOMAIN_REF is current truth; the artifact is the frozen audit trail.
4. **Stack evaluation — update if affected:** `CLAUDE.md` hub (only if project-wide context shifts); spoke `CLAUDE.md`;
   L1 (`docs/active_state.md`); L2 (`docs/active_state_verbose.md`); Serena memories (`.serena/memories/`); per-user
   auto-memory (if enabled — see §8).
5. **Confirmation report:** list which files were touched so I can verify end-to-end.

**On `no`:** acknowledge and continue. Do not silently save a partial version.

**Rationale:** analytical context is lost to chat rotation, compaction, and tool drift. A discovery not written to git +
propagated will be re-litigated next session. This rule makes propagation visible and user-gated so it cannot silently
fail.

## 3. Version Increment Rules
| Component | Source of Truth | Derived Constant |
|-----------|-----------------|------------------|
| <COMPONENT_A> | `VERSION.md` -> `<COMP_ID_A>:XX` | `<COMPONENT_A_BUILD>` (build-time env / generated constant) |
| <COMPONENT_B> | `VERSION.md` -> `<COMP_ID_B>:XX` | `<COMPONENT_B_BUILD>` (build-time env / generated constant) |

- A change in a component bumps its own counter and gets its own history row. Mixed commits bump all affected components
  independently.
- Each bump carries a bulleted change list. Multiple components → one block each.

**ALL version bumps MUST be logged in VERSION.md first. No hardcoded versions in source code.**

## 4. Search & Tools
1. **Search-Before-Read:** do not `read_file` on any file >100 lines without first using `grep`, `find_symbol`, or
   `get_symbols_overview` to find specific line ranges. Targeted reads only.
2. **Priority:** Serena MCP symbolic tools first (`find_symbol`, `get_symbols_overview`). Fall back to `grep`/`glob` only
   if Serena can't resolve.
3. **Impact before edits:** before modifying a function/class/method, run GitNexus impact analysis and report the blast
   radius. Run change-detection before committing.
4. **App Name:** never hardcode the project name — use `APP_NAME` or the build constant.

## 5. Infrastructure & Safety
1. **Docker / containers:** explicit permission required for `build`, `up/down`, or `restart`. Treat as destructive — the
   operator may run parallel sessions.
2. **Production endpoints / external APIs:** explicit permission required for any call that mutates external state, costs
   money, or touches shared infrastructure.

## 6. Coding required practices
1. Read root `CLAUDE.md`, the relevant spoke `CLAUDE.md`(s), and referenced L1/L2 state before coding any component.
2. Do NOT hardcode values that change often — versions, run modes, environment endpoints. Wire them to variables.
3. **Live ↔ Mirror parity changes land in the same commit.** If a live path AND a mirror/simulator/replay path exist,
   patching one and "catching up" later is forbidden — silent drift is the failure mode.
4. **Full code-path traversal.** When you change one area, follow every related code path and update it. Example: a new
   config parameter must be added to the config UI, audit/report output, import/export, and everywhere it's read — never a
   half-wired value. Never work on assumptions; if uncertain, STOP AND ASK.
5. **Smoke-test before declaring a numerically-sensitive fix done.** Math changes (sizing, thresholds, gates, allocation,
   guards) require an explicit smoke run before "done," or a stated reason it can't be smoke-tested. "Compiles, ship it" is
   not acceptable.
6. **Verify long-running / observability processes are alive before trusting output.** Liveness check (`ps`, `kill -0`,
   `wc -l`) before relying on a background tool's output; mid-run checkpoints for multi-hour runs.
7. **Identifier hygiene at external API boundaries.** Pass the domain-correct identifier at every external call site
   (slug ≠ id ≠ external-id). When in doubt, grep the API docs / proxy handler.
8. **Cache key invariants.** Any cache key must include EVERY input that changes the output (model name, prompt-version
   hash, schema version). Adding an input without bumping the key = silent staleness.
9. **LF# is the atomic unit of work.** Upgrading a fix (v1 → v2) updates every site listed under that LF# in DOMAIN_REF.md
   together. A new mirror site = a new LF#-amendment commit, not a quiet one-liner.
10. **Production-affecting code requires explicit operator ack before deploy.** Any path touching money, customer data,
    external mutations, or shared infra — operator sees the diff first. Not "I think this is right, pushing."
11. **Delete merged branches in the same step as the merge.** After merge + push: `git branch -d <name>` AND
    `git push origin --delete <name>` in one task. Exception: long-lived integration branches need operator confirmation.

## 7. Out-of-scope finding capture (Deferred TODOs)
When in-progress work surfaces a bug, risk, tech-debt item, or other finding **not directly related to the current task**,
you MUST prompt me before doing anything else with it. Never silently ignore an unrelated finding (it gets lost), and
never silently log one (I own prioritization).

**Mandatory prompt:**

> "Log this to docs/DEFERRED_TODOS.md? (yes/no)"

Bundle multiple findings that emerge together into one prompt. **On `yes`:**
1. Read `docs/DEFERRED_TODOS.md` first and **deduplicate** — if the finding (or a close relative) already exists, surface
   it and ask whether to augment rather than add a duplicate.
2. If new, append an entry with: title, **Where** (file/location), **What**, **Severity** (Low / Medium / High — judged
   as "impact if left ~6 months," not "broken today"), and **Suggested fix**.
3. Do not derail the current task to fix it — capture and continue.

When one is later fixed: delete its entry, and reference it in the fixing commit (`closes deferred #N` if numbered).

## 8. Memory layers (what's shared vs per-user)
- **Shared, canonical, git-tracked (the team brain):** everything in-repo — `CLAUDE.md` hub + spokes, `RULES.md`,
  `VERSION.md`, `docs/*` (L1, L2, DOMAIN_REF, INFRA, DEFERRED_TODOS, postmortems, domain-tuning), `.serena/memories/`,
  and the GitNexus index blocks. This is what every contributor's agent reads.
- **Per-user, optional, NOT shared (Claude Code only):** auto-memory at `~/.claude/projects/.../memory/`. Useful for
  personal/operator preferences, but it is not version-controlled and does not reach teammates. Never put shared truth
  there — that belongs in-repo.
```

### `VERSION.md`

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
| [DATE] | <COMP_ID_A>:01 <COMP_ID_B>:01 | Initial Salvor scaffold. Hub-and-spoke CLAUDE.md, L1/L2 cache, RULES.md §0–§7, VERSION.md, per-component spokes, DEFERRED_TODOS, domain-tuning + postmortems scaffolds. |
```

### `docs/active_state.md` (L1, ≤50 lines)

```markdown
# <PROJECT_NAME> Active State — <COMP_ID_A>:01 <COMP_ID_B>:01 ([DATE])
## Architecture: [ONE-LINE: top-level stack + ports]
## Pipeline: [ONE-LINE: request/data flow, if applicable]
## DEPLOYED: [environment, ingress, latency profile — or "local only"]
## Current Delta to Published Logic: [empty initially — populate as work lands]
## LEARNED FAILURES: [empty initially — LF# entries land here in shorthand]
## Open: [active todos / pending decisions]
```

### `docs/active_state_verbose.md` (L2, unlimited)

```markdown
# <PROJECT_NAME> Active State — VERBOSE ARCHIVE

L2 cache. No line limit. Append-only deep history of reasoning, rejected hypotheses, raw tool outputs, and detail pruned
from L1. Update trigger: immediately after every L1 update.

---

## [DATE] — Project initialized
Initial Salvor scaffold: hub-and-spoke CLAUDE.md, L1/L2 cache, RULES.md §0–§7, VERSION.md, three capture triggers.
```

### `docs/DOMAIN_REF.md`

```markdown
# <PROJECT_NAME> Domain Reference

Authoritative current-truth for domain logic. Artifacts in `docs/domain-tuning/` are frozen audit trails; this file is
what's currently true.

## Sections
- [empty — populate as the project takes shape]

## Learned Failures (LF#)
[LF# entries: number, date, root cause, fix sites, cross-link to the dated artifact in `docs/domain-tuning/`. Update
existing entries when a v1 fix is upgraded to v2 (RULES §6.9).]
```

### `docs/INFRA.md`

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

### `docs/DEFERRED_TODOS.md`

```markdown
# Deferred TODOs

Out-of-scope findings intentionally **not** addressed when they surfaced — real, but not worth derailing the task they
were found in. Captured here so they don't slip into "I'll remember." Severity reflects "impact if left ~6 months," not
"broken today." See `RULES.md` §7 for the capture protocol.

<!-- Template for new entries:

### N. <short title>
- **Where**: <file / location>
- **What**: <the issue>
- **Severity**: <Low | Medium | High>
- **Suggested fix**: <actionable suggestion>
- **Why deferred**: <why it was safe to skip now>
-->

## How this file is maintained
1. When you fix one: delete its entry, and reference it in the fixing commit (`closes deferred #N` if numbered).
2. When you discover a NEW out-of-scope risk during related work: prompt me (RULES §7), and if I agree, add it here —
   don't let it slip into chat.
3. When something here becomes urgent (impact observed): promote it to a real ticket and link back.
```

### `docs/postmortems/README.md`

```markdown
# Postmortems

Structured write-ups of incidents and significant failures. Each becomes durable knowledge: findings here feed the LF#
registry in `docs/DOMAIN_REF.md` and/or new entries in `docs/DEFERRED_TODOS.md`.

## Naming
`YYYY-MM-DD-[SHORT-SLUG].md`

## Template
- **Summary** — one paragraph: what broke, blast radius, duration.
- **Timeline** — UTC-stamped sequence of events.
- **Root cause** — the actual mechanism, not the symptom.
- **Findings → follow-ups** — each finding tagged with where it goes:
  `LF#` (recurring failure mode → DOMAIN_REF), `DEFERRED` (out-of-scope fix → DEFERRED_TODOS), or `FIXED` (done in this
  pass, with commit).
- **What would have caught it earlier** — the missing test / check / alert.

## Index
| Date | File | One-line |
|------|------|----------|
| [DATE] | [link] | [takeaway] |
```

### `docs/domain-tuning/README.md`

```markdown
# Domain-Tuning Artifacts

Frozen audit trail of every domain discovery, hypothesis test, vendor probe, and learned failure. Each artifact is dated,
categorized, and never edited after creation (DOMAIN_REF.md carries the living truth; these are the receipts).

## Naming convention
`YYYY-MM-DD-[CATEGORY]-[OUTCOME].md`

Categories (extend as needed):
- `PROBE` — exploration of an external system / vendor with a verdict
- `BAKEOFF` — A/B/N test of competing approaches with a verdict
- `LF##` — Learned Failure spec with root cause + fix
- `ARCH` — architectural decision or refactor spec
- `MIGRATION` — pre-spec for a non-trivial change

## What goes here
- Hypothesis stated up front, in one sentence
- Evidence: what was tested, observed, what the data says
- Verdict: accepted / falsified / inconclusive
- Cross-links: spec → code commit → L1/L2 entries it updated

## Chronological index
| Date | File | Category | One-line takeaway |
|------|------|----------|-------------------|
| [DATE] | [link] | [cat] | [takeaway] |
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
- [where the version constant comes from — VERSION.md key + build step]

For codebase tree: use Serena MCP `get_symbols_overview`.
For domain logic: see `docs/DOMAIN_REF.md`. For infra/ops: see `docs/INFRA.md`.
```

### `.gitignore` additions

Append (don't replace) — note `.serena/memories/` is **committed** (it's shared brain); only cache is ignored:

```
.tmp/
.gitnexus/
.serena/cache/
```

### Entrypoint adapter (from Step 1, question 4)

- **Claude Code:** the `CLAUDE.md` hub above (with `@`-imports) is the entrypoint. Optionally add
  `.claude/settings.json` `custom_instructions` reinforcing RULES §0. (Ask before writing settings files.)
- **Codex:** create `AGENTS.md` at repo root that says: "Before any work, read `CLAUDE.md` (hub) + the relevant spoke +
  `RULES.md` + `docs/active_state.md` (L1). Follow RULES.md exactly." Codex reads `AGENTS.md` natively.
- **Gemini CLI:** create `GEMINI.md` with the same pointer text.
- See `docs/VENDOR_ADAPTERS.md` in the Salvor repo for the full pattern. The core files are identical across vendors.

## Step 3 — Initial commit, then index

After creating all files:

```bash
git add -A
git commit -m "chore: scaffold Salvor — hub-and-spoke + L1/L2 + RULES + per-component spokes"
```

(If your repo enforces commit signing and you're running unattended, add `--no-gpg-sign` only with operator approval.)

Then index with GitNexus to populate the code-intelligence block:

```bash
gitnexus analyze
```

This appends a `<!-- gitnexus:start --> … <!-- gitnexus:end -->` block to root `CLAUDE.md` (and `AGENTS.md` if present)
with symbol/relationship counts and tool routing. Commit the result:

```bash
git add CLAUDE.md AGENTS.md
git commit -m "chore(gitnexus): commit auto-generated code-intelligence blocks"
```

## Step 4 — Operating ground rules going forward

State that you understand these at the end of the scaffold confirmation message.

1. **Three capture triggers, user-gated.** Continued Learning → `"Save this as a domain-tuning artifact? (yes/no)"`;
   Learned Failure → registered via the same flow; Deferred TODO → `"Log this to docs/DEFERRED_TODOS.md? (yes/no)"`.
   Prompt verbatim; never infer; never batch unrelated items; on yes, run the full propagation and report the file list.
2. **L1/L2 update silently** after every confirmed resolution (CLAUDE.md SYSTEM DIRECTIVE). L1 stays under 50 lines.
3. **RULES.md §0 Task Termination Protocol is mandatory.** VERSION bump → L1 sync → L2 sync → spoke sync → mirror parity
   (if applicable) before "done."
4. **Serena MCP is the primary search tool.** `find_symbol` / `get_symbols_overview` before any read of a file >100 lines.
5. **GitNexus impact analysis before edits.** Run impact analysis on a symbol before modifying it; run change-detection
   before committing; re-run `gitnexus analyze` after structural changes.
6. **Branch hygiene (RULES §6.11).** Merge → push → delete local + remote branch in one step.
7. **Containers / production (RULES §5).** Ask before `build`/`up`/`down`/`restart` and before any production-affecting
   or outward-facing action (push, release, deploy).
8. **Shared vs per-user memory (RULES §8).** Shared truth goes in-repo. Per-user auto-memory (Claude Code only) is
   optional and non-shared — never the home of canonical knowledge.

## Step 5 — Confirmation report

After Steps 2–4, return a short report:
- File list created (with byte counts or LOC).
- Confirmation that root `CLAUDE.md`, `RULES.md` (§0–§7), `VERSION.md`, L1, L2, `DOMAIN_REF`, `INFRA`,
  `DEFERRED_TODOS`, `postmortems/README`, `domain-tuning/README`, and each spoke `CLAUDE.md` exist and have
  project-specific placeholders filled in.
- The entrypoint adapter wired for my chosen vendor.
- Initial commit hash.
- GitNexus index counts (symbols / relationships / execution flows).
- Acknowledge the 8 operating rules from Step 4.

After confirmation, I'll brief you on the first real task.
