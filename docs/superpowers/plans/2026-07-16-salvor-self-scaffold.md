# Salvor Self-Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Salvor's own version-controlled shared-memory framework on `main` with one canonical `CLAUDE.md`, thin Codex and Gemini adapters, three component spokes, tracked Serena memories, and GitNexus indexing.

**Architecture:** Root `CLAUDE.md` is the concise canonical hub. `AGENTS.md` and `GEMINI.md` point their CLIs to that hub, the relevant component spoke, `RULES.md`, and L1 instead of duplicating knowledge. Governance and component counters live at the root; the shared L1/L2 and audit brain lives under `.salvor/`; `.serena/memories/` is tracked for cross-session semantic knowledge.

**Tech Stack:** Markdown, git, Claude Code/Codex/Gemini CLI instruction adapters, Serena MCP, GitNexus CLI/MCP.

## Global Constraints

- Work only in `/private/tmp/salvor-main-v1.0.0` on branch `main`; do not modify the `ghpages/v1.0.0` checkout.
- Do not copy website implementation onto `main`; `site/CLAUDE.md` is metadata-only.
- Application name is configured by `APP_NAME`, defaulting to `salvor`.
- Component ownership is exact: `CORE` owns root `SETUP_PROMPT.md`; `WEB` owns future `site/`; `DOCS` owns root `README.md` plus `docs/`.
- Initial build IDs are exactly `CORE:01 | WEB:01 | DOCS:01`; initial project version is `v0.1.0`; date is `2026-07-16`.
- Root `CLAUDE.md` is canonical. `AGENTS.md` and `GEMINI.md` are thin adapters with no duplicated project guidance.
- Canonical public claims are `README.md`, `SETUP_PROMPT.md`, and `docs/VENDOR_ADAPTERS.md`; the future website is a generated semantic mirror.
- A future sync may update existing mapped website copy automatically, but must stop and request design approval before introducing a new page section, interaction, or visual element.
- `.salvor/active_state.md` must remain at or below 50 lines.
- `.serena/memories/` must be git-tracked; `.serena/cache/` and `.gitnexus/` remain ignored.
- Do not create `.claude/settings.json` or per-user Claude auto-memory.
- Do not push, deploy, merge, release, or call container/production operations.
- Preserve the requested scaffold and GitNexus commit subjects exactly; add concise bullet bodies to meet repository commit conventions.

---

### Task 1: Create the canonical hub, vendor adapters, governance, and component spokes

**Files:**
- Create: `CLAUDE.md`
- Create: `AGENTS.md`
- Create: `GEMINI.md`
- Create: `RULES.md`
- Create: `VERSION.md`
- Create: `core/CLAUDE.md`
- Create: `site/CLAUDE.md`
- Create: `docs/CLAUDE.md`

**Interfaces:**
- Consumes: Existing `README.md`, `SETUP_PROMPT.md`, `docs/ARCHITECTURE.md`, `docs/VENDOR_ADAPTERS.md`, and approved design `docs/superpowers/specs/2026-07-16-salvor-self-scaffold-design.md`.
- Produces: One canonical agent hub, two vendor pointers, mandatory governance, build-counter source of truth, and three ownership spokes used by all later tasks.

- [ ] **Step 1: Confirm the isolated baseline**

Run:

```bash
git branch --show-current
git status --short --branch
git log -1 --oneline
```

Expected: branch is `main`; status has no uncommitted changes; `HEAD` includes the approved multi-vendor design commits.

- [ ] **Step 2: Create the concise canonical `CLAUDE.md` hub**

Create a hub no larger than 65 lines with this exact information, expressed densely enough to satisfy the line limit:

```markdown
# salvor
### CURRENT STATE (L1 Cache)
@.salvor/active_state.md

> Deep history and dementia recovery: `.salvor/active_state_verbose.md`

## Project Overview
Salvor is a prompt-and-documentation framework that gives repositories a version-controlled institutional brain shared across sessions, contributors, and LLM vendors. Its universal installer is `SETUP_PROMPT.md`; public guidance lives in `README.md` and `docs/`; the planned GitHub Pages site is a generated presentation mirror. The non-obvious invariant is that repository knowledge and rationale are canonical, while vendor entrypoints and public surfaces stay thin and synchronized.

## Architecture
| Component | Stack | Spoke |
|-----------|-------|-------|
| core | Markdown prompt protocol | @core/CLAUDE.md |
| web | Static GitHub Pages (planned; metadata-only) | @site/CLAUDE.md |
| docs | Markdown | @docs/CLAUDE.md |

## Documentation Map
| Document | Purpose | When to Read |
|----------|---------|--------------|
| `.salvor/DOMAIN_REF.md` | Domain truth and learned failures | Changing protocol/product logic |
| `.salvor/INFRA.md` | Local, release, GitHub Pages, external tooling | Changing infra/deployment/APIs |
| `.salvor/DEFERRED_TODOS.md` | User-approved out-of-scope findings | Before related work |
| `core/CLAUDE.md` | Universal setup protocol | Changing `SETUP_PROMPT.md` |
| `site/CLAUDE.md` | Planned public site and sync contract | Changing future `site/` |
| `docs/CLAUDE.md` | README and documentation architecture | Changing `README.md` or `docs/` |
| `.serena/memories/` | Shared structure, conventions, commands | Query through Serena MCP |

## APP_NAME
Use `APP_NAME`; default `salvor`. Never introduce a separate hardcoded application-name constant.

### SYSTEM DIRECTIVE: TWO-TIER MEMORY MANAGEMENT
Maintain `.salvor/active_state.md` (L1, ≤50 lines, confirmed current logic/deltas/infra/LFs) and `.salvor/active_state_verbose.md` (L2, unlimited reasoning/history/raw evidence). Update L1 silently after every confirmed resolution, milestone, or architectural shift, then immediately preserve pruned nuance in L2. Read L2 only when explicitly requested or during dementia recovery.

### SYSTEM DIRECTIVE: THREE KNOWLEDGE-CAPTURE TRIGGERS
For each continued-learning discovery or Learned Failure, pause and ask exactly: `Save this as a domain-tuning artifact? (yes/no)`. For out-of-scope findings, ask exactly: `Log this to .salvor/DEFERRED_TODOS.md? (yes/no)`. Never infer, silently save, or batch unrelated discoveries; follow `RULES.md` §2 and §7 on approval.

# GitNexus — Code Intelligence
<!-- GitNexus context is appended after the initial scaffold commit. -->
```

- [ ] **Step 3: Create thin Codex and Gemini entrypoint adapters**

Create `AGENTS.md` and `GEMINI.md` with identical substantive instructions; only their titles differ:

```markdown
# salvor — Codex adapter

Before any work, read `CLAUDE.md` as the canonical project hub, then read the relevant component spoke (`core/CLAUDE.md`, `site/CLAUDE.md`, or `docs/CLAUDE.md`), `RULES.md`, and `.salvor/active_state.md` (L1). Follow `RULES.md` exactly.

Do not duplicate or fork project knowledge into this adapter. Shared truth belongs in `CLAUDE.md`, the spokes, `.salvor/`, and `.serena/memories/`.

# GitNexus — Code Intelligence
<!-- GitNexus context may be appended after the initial scaffold commit. -->
```

Use `# salvor — Gemini CLI adapter` as the first line of `GEMINI.md`; keep the remainder identical.

- [ ] **Step 4: Create the component spokes**

Create `core/CLAUDE.md` with:

```markdown
# core — universal Salvor setup protocol

Markdown prompt protocol implemented by root `SETUP_PROMPT.md`. It scaffolds vendor-neutral governance and memory, then adds thin CLI-specific entrypoints.

## Key Files
- `../SETUP_PROMPT.md` — canonical one-shot installer and scaffold templates
- `../example-project/` — rendered regression fixture for prompt behavior
- `../CHANGELOG.md` — user-visible protocol history

## Architecture Notes
- Keep the installer vendor-neutral; adapter glue must not fork the shared brain.
- Scope questions are user-gated. Never invent components, stacks, or parity paths.
- A prompt behavior change must be reflected in `example-project/` and user-facing documentation.

## Validation
- Compare template requirements with `example-project/` after protocol changes.
- Scan for unresolved template tokens and verify all vendor adapters point to the same canonical core.

## Build
- No compilation. `VERSION.md` key: `CORE`; derived constant: `CORE_BUILD`.

Use Serena for repository structure, `.salvor/DOMAIN_REF.md` for product truth, and `.salvor/INFRA.md` for operational details.
```

Create `site/CLAUDE.md` with:

```markdown
# web — planned GitHub Pages presentation

Metadata-only component on `main`. No website implementation is part of the initial Salvor self-scaffold.

## Canonical Sources
- `../README.md` — public overview and supported capabilities
- `../SETUP_PROMPT.md` — universal setup protocol
- `../docs/VENDOR_ADAPTERS.md` — current vendor-support truth

## Architecture Notes
- The repository sources above are authoritative; the future site is a generated semantic mirror.
- Existing mapped copy must update automatically during the future site build/deploy.
- If a source change requires a new section, interaction, or visual element, synchronization must stop with design review required. Ask the operator before adding the element.
- Once site code exists, source and mirror changes land together; silent public-content drift is forbidden.

## Build
- No site build exists on `main` yet. Do not import work from `ghpages/v1.0.0` without explicit approval.
- `VERSION.md` key: `WEB`; derived constant: `WEB_BUILD`.

Use `.salvor/DOMAIN_REF.md` for product truth and `.salvor/INFRA.md` for deployment details.
```

Create `docs/CLAUDE.md` with:

```markdown
# docs — public and architectural documentation

Markdown documentation comprising root `README.md` and the complete `docs/` directory.

## Key Files
- `../README.md` — canonical public overview, quickstart, feature support, and roadmap
- `ARCHITECTURE.md` — Salvor's design and memory model
- `VENDOR_ADAPTERS.md` — cross-vendor adapter support and constraints
- `FAQ.md` — positioning, trust, and operational questions
- `superpowers/specs/` and `superpowers/plans/` — approved design and execution records

## Architecture Notes
- Keep public claims consistent with `../SETUP_PROMPT.md` and current implementation status.
- Documentation is canonical source material for the future generated website mirror.
- New website presentation elements require operator design approval; documentation changes do not silently invent page structure.

## Validation
- Check links and paths, scan for stale vendor/version claims, and inspect rendered Markdown when layout matters.

## Build
- No compilation. `VERSION.md` key: `DOCS`; derived constant: `DOCS_BUILD`.

Use `.salvor/DOMAIN_REF.md` for product truth and `.salvor/INFRA.md` for operational details.
```

- [ ] **Step 5: Create `VERSION.md`**

Use this exact initial manifest:

```markdown
<!-- {"version":"0.1.0","core":1,"web":1,"docs":1} -->
# salvor VERSION MANIFEST
## Current State
- **Project Version:** v0.1.0
- **Build IDs:** CORE:01 | WEB:01 | DOCS:01
- **Last Updated:** 2026-07-16

---

## Version History

| Date | Build IDs | Summary |
|------|-----------|---------|
| 2026-07-16 | CORE:01 WEB:01 DOCS:01 | Initial Salvor self-scaffold. Canonical CLAUDE.md hub, thin Codex/Gemini adapters, L1/L2 cache, RULES.md, three component spokes, tracked Serena memories, deferred/domain-tuning/postmortem scaffolds, and metadata-only web contract. |
```

- [ ] **Step 6: Create complete `RULES.md` governance**

Create `# salvor Development Rules`, state that it is mandatory and takes precedence, and implement the following exact section matrix without template tokens:

| Section | Required behavior |
|---------|-------------------|
| `0. CRITICAL: Task Termination Protocol` | Before completion: bump affected `CORE`/`WEB`/`DOCS` counters, update date/history, sync L1 then L2, sync the owning spoke and DOMAIN_REF/INFRA when affected, and enforce repository-to-site semantic parity when site code exists. |
| `1. Dementia Recovery Procedure` | Stop generation, reread L2 from the beginning, compare against LF# in DOMAIN_REF and L1/L2, summarize the confusion source, then proceed. |
| `2. Continued Learning Protocol` | Use the exact prompt `Save this as a domain-tuning artifact? (yes/no)` for each evidence-backed discovery/LF; on yes create a dated artifact, update its TOC, DOMAIN_REF, affected hub/spoke/L1/L2/Serena memories, and report touched files; on no save nothing. |
| `3. Version Increment Rules` | Map `CORE`→`SETUP_PROMPT.md`→`CORE_BUILD`, `WEB`→`site/`→`WEB_BUILD`, and `DOCS`→`README.md`+`docs/`→`DOCS_BUILD`; mixed changes bump each affected component; VERSION is the sole source of truth. |
| `4. Search & Tools` | Search before reading files over 100 lines; Serena symbolic tools first; GitNexus impact before symbol edits and detect-changes before commits; use `APP_NAME`. |
| `5. Infrastructure & Safety` | Require permission for container build/up/down/restart and external mutations/cost/shared infrastructure. |
| `6. Coding required practices` | Read hub/spoke/rules/L1; avoid volatile hardcoding; enforce generated semantic parity; traverse complete code paths; smoke-test numerical fixes; verify background-process liveness; preserve identifier and cache-key invariants; treat LF# atomically; require operator ack before production changes; delete merged local+remote branches together. |
| `6.3 Repository ↔ website parity` | Canonical sources are `README.md`, `SETUP_PROMPT.md`, and `docs/VENDOR_ADAPTERS.md`. A future site build updates existing mapped copy automatically. New page elements require explicit design approval. Once the site exists on `main`, canonical-source and generated-mirror changes land together. |
| `7. Out-of-scope finding capture` | Use the exact prompt `Log this to .salvor/DEFERRED_TODOS.md? (yes/no)`; on yes deduplicate, then record title/location/issue/severity/suggested fix/reason deferred; do not derail current work. |
| `8. Memory layers` | Shared truth is root hub/adapters/spokes, RULES, VERSION, `.salvor/`, `.serena/memories/`, and GitNexus context. Per-user Claude auto-memory is optional and never canonical. |

Preserve the original trigger definitions, confirmation-report requirement, LF# update rule, smoke-test rule, external-identifier rule, cache-key rule, production-ack rule, and merge/delete rule verbatim in meaning from `SETUP_PROMPT.md` §§0–8.

- [ ] **Step 7: Validate Task 1**

Run:

```bash
wc -l CLAUDE.md
rg -n '^## [0-8]\.' RULES.md
rg -n 'CORE:01|WEB:01|DOCS:01' VERSION.md CLAUDE.md core/CLAUDE.md site/CLAUDE.md docs/CLAUDE.md
rg -n 'CLAUDE.md|RULES.md|active_state.md' AGENTS.md GEMINI.md
find site -maxdepth 1 -type f -print
git diff --check
```

Expected: hub is ≤65 lines; RULES includes sections 0–8; all three counters and adapter pointers exist; `site/` contains only `site/CLAUDE.md`; diff check is silent.

---

### Task 2: Create the shared Salvor and Serena memory layers

**Files:**
- Create: `.salvor/README.md`
- Create: `.salvor/active_state.md`
- Create: `.salvor/active_state_verbose.md`
- Create: `.salvor/DOMAIN_REF.md`
- Create: `.salvor/INFRA.md`
- Create: `.salvor/DEFERRED_TODOS.md`
- Create: `.salvor/postmortems/README.md`
- Create: `.salvor/domain-tuning/README.md`
- Create: `.serena/memories/project_overview.md`
- Create: `.serena/memories/quality_and_performance_principles.md`
- Create: `.serena/memories/style_and_conventions.md`
- Create: `.serena/memories/suggested_commands.md`
- Create: `.serena/memories/task_completion.md`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: Task 1 component IDs, ownership rules, adapters, and website synchronization contract.
- Produces: The initial git-tracked team brain read by every vendor adapter and queried through Serena.

- [ ] **Step 1: Create the `.salvor/` folder index and L1/L2 ledgers**

Create `.salvor/README.md` with a table describing L1, L2, DOMAIN_REF, INFRA, DEFERRED_TODOS, domain-tuning, and postmortems; state that root entrypoints/governance live outside `.salvor/` and everything in the folder is git-tracked shared knowledge.

Create `.salvor/active_state.md` with these exact initial facts in no more than 10 lines:

```markdown
# salvor Active State — CORE:01 WEB:01 DOCS:01 (2026-07-16)
## Architecture: Markdown prompt/docs product; canonical CLAUDE hub + Codex/Gemini adapters; core/docs/web spokes
## Pipeline: SETUP_PROMPT protocol + README/docs truth → future generated GitHub Pages presentation mirror
## DEPLOYED: Repository framework only on main; web component metadata-only; no site deployment from this worktree
## Current Delta to Published Logic: Salvor self-scaffold installed; no product-protocol or website implementation change
## LEARNED FAILURES: None registered
## Open: Implement generated public-content sync when approved website code reaches main; request design approval for new page elements
```

Create `.salvor/active_state_verbose.md` with the L2 purpose, append-only guidance, and a dated initialization entry recording the approved hub/spokes, three adapters, component IDs, tracked Serena memories, metadata-only web state, semantic sync contract, and the fact that the Pages checkout was not modified.

- [ ] **Step 2: Create current-truth and operational references**

Create `.salvor/DOMAIN_REF.md` with:

- Salvor's authoritative purpose: a version-controlled institutional brain shared across sessions, developers, and LLM vendors.
- Current product pillars: hub/spokes, L1/L2, mandatory RULES, user-gated capture, per-component versioning, Serena, and GitNexus.
- Canonical public sources: `README.md`, `SETUP_PROMPT.md`, `docs/VENDOR_ADAPTERS.md`.
- Initial `Learned Failures (LF#)` registry containing `None registered.`

Create `.salvor/INFRA.md` with:

- Local operation: documentation repository with no root package manager/test runner; example packages are separate fixtures.
- Deployment: no site implementation on `main`; GitHub Pages remains outside this worktree; future site pipeline generates mapped copy from canonical sources.
- Env vars: `APP_NAME` defaults to `salvor`; component build constants derive from VERSION.
- External tools: Serena MCP and GitNexus CLI/MCP; neither core feature requires an account/API key.
- Observability: git status/diff, GitNexus status/counts, structural/Markdown checks.

- [ ] **Step 3: Create deferred, domain-tuning, and postmortem scaffolds**

Create `.salvor/DEFERRED_TODOS.md`, `.salvor/domain-tuning/README.md`, and `.salvor/postmortems/README.md` using the exact templates and maintenance rules in `SETUP_PROMPT.md`, substituting the date `2026-07-16` and leaving their indexes intentionally empty except for header rows. Do not add a deferred item for the planned website sync: it is an approved architectural condition already represented in L1/L2 and the site spoke, not an unrelated finding.

- [ ] **Step 4: Track the five existing Serena project memories**

Create these exact memory files from the current Serena memory store:

- `project_overview.md`: Salvor is a prompt/docs product; list README, SETUP_PROMPT, architecture/vendor docs, example project; describe the shared version-controlled brain and current branding.
- `quality_and_performance_principles.md`: prioritize maintainability, accessibility, runtime performance, small focused files, minimal dependencies, responsive behavior, automated/browser verification, and peer-review quality.
- `style_and_conventions.md`: concise developer-facing Markdown; generic templates; prompt changes sync `example-project/`, README/docs, and CHANGELOG when user-visible.
- `suggested_commands.md`: `rg --files`, `rg`, git status/diff; no root package; inspect example package manifests; docs verification and prompt/example comparison guidance.
- `task_completion.md`: narrow verification, link/path and diff checks, prompt/example/CHANGELOG synchronization, and preservation of unrelated changes.

Keep the current memory headings and wording from the Serena MCP responses; do not synthesize conflicting replacements.

- [ ] **Step 5: Correct `.gitignore` for shared Serena memory**

Remove exactly these two lines:

```gitignore
# ...except this framework repo's own auto-generated root memories (session cruft)
/.serena/memories/
```

Preserve the existing ignore rules for `.tmp/`, `.gitnexus/`, and `.serena/cache/`.

- [ ] **Step 6: Validate Task 2**

Run:

```bash
wc -l .salvor/active_state.md
find .salvor -type f -maxdepth 3 -print | sort
find .serena/memories -type f -maxdepth 1 -print | sort
git check-ignore .serena/memories/project_overview.md
git check-ignore .serena/cache/example.cache
git diff --check
```

Expected: L1 ≤50 lines; eight `.salvor` files and five Serena memories are present; the memory file is not ignored (`git check-ignore` exits 1); cache remains ignored (`git check-ignore` exits 0); diff check is silent.

---

### Task 3: Verify and commit the complete initial scaffold

**Files:**
- Verify: all Task 1 and Task 2 files
- Stage: all scaffold files and the `.gitignore` correction

**Interfaces:**
- Consumes: The complete uncommitted scaffold from Tasks 1–2.
- Produces: One atomic initial Salvor scaffold commit ready for GitNexus indexing.

- [ ] **Step 1: Run the full required-file check**

Run:

```bash
test -f CLAUDE.md
test -f AGENTS.md
test -f GEMINI.md
test -f RULES.md
test -f VERSION.md
test -f core/CLAUDE.md
test -f site/CLAUDE.md
test -f docs/CLAUDE.md
test -f .salvor/README.md
test -f .salvor/active_state.md
test -f .salvor/active_state_verbose.md
test -f .salvor/DOMAIN_REF.md
test -f .salvor/INFRA.md
test -f .salvor/DEFERRED_TODOS.md
test -f .salvor/postmortems/README.md
test -f .salvor/domain-tuning/README.md
test -f .serena/memories/project_overview.md
```

Expected: every command exits 0.

- [ ] **Step 2: Scan for unresolved scaffold placeholders and structural violations**

Run:

```bash
rg -n '<PROJECT_NAME>|<COMPONENT_|<STACK_|<COMP_ID_|<LIVE_FILE>|<MIRROR_FILE>|\[DATE\]|\[ONE-LINE|\[empty' CLAUDE.md AGENTS.md GEMINI.md RULES.md VERSION.md core/CLAUDE.md site/CLAUDE.md docs/CLAUDE.md .salvor .serena/memories
wc -l CLAUDE.md .salvor/active_state.md
find site -type f -print
git diff --check
git status --short
```

Expected: placeholder scan exits 1 with no matches; hub ≤65 lines; L1 ≤50 lines; `site/CLAUDE.md` is the only site file; diff check is silent; status lists only intended scaffold files, the `.gitignore` edit, and the already-planned spec/plan state.

- [ ] **Step 3: Review the blast radius available before initial indexing**

Run:

```bash
gitnexus status
git diff --stat
git diff -- .gitignore CLAUDE.md AGENTS.md GEMINI.md RULES.md VERSION.md core/CLAUDE.md site/CLAUDE.md docs/CLAUDE.md .salvor .serena/memories
```

Expected: GitNexus reports no current index or a stale pre-scaffold index; the diff contains only the approved framework. Because the required workflow indexes only after the initial commit, record that symbol-level detect-changes is unavailable until Task 4.

- [ ] **Step 4: Stage and commit the scaffold atomically**

Run:

```bash
git add .gitignore CLAUDE.md AGENTS.md GEMINI.md RULES.md VERSION.md core/CLAUDE.md site/CLAUDE.md docs/CLAUDE.md .salvor .serena/memories
git diff --cached --check
git commit -m "chore: scaffold Salvor — hub-and-spoke + L1/L2 + RULES + per-component spokes" -m "- Adds one canonical CLAUDE.md with thin Codex and Gemini adapters
- Establishes CORE, WEB, and DOCS ownership with versioned governance
- Tracks shared Salvor and Serena memory while keeping the website metadata-only"
```

Expected: staged diff check is silent; commit succeeds and includes only the approved scaffold.

---

### Task 4: Build and commit the GitNexus index context

**Files:**
- Modify: `CLAUDE.md` (GitNexus-generated block)
- Modify if generated: `AGENTS.md`
- Modify if generated: `GEMINI.md`
- Ignore: `.gitnexus/` local index directory

**Interfaces:**
- Consumes: The committed scaffold and tracked repository sources.
- Produces: Verified GitNexus symbol/relationship/execution-flow counts and committed routing context in the vendor entrypoints.

- [ ] **Step 1: Analyze the committed repository**

Run:

```bash
gitnexus analyze
```

Expected: analysis completes, `.gitnexus/` is generated but ignored, and GitNexus appends delimited `<!-- gitnexus:start -->` / `<!-- gitnexus:end -->` context to supported entrypoint files.

- [ ] **Step 2: Verify index freshness and generated blocks**

Run:

```bash
gitnexus status
rg -n '<!-- gitnexus:(start|end) -->' CLAUDE.md AGENTS.md GEMINI.md
git status --short
git check-ignore .gitnexus
```

Expected: status reports current symbol and relationship counts plus execution flows when available; each modified supported entrypoint has one start/end pair; `.gitnexus/` is ignored.

- [ ] **Step 3: Run GitNexus change detection before the generated-context commit**

Call GitNexus MCP `detect_changes` with the worktree path `/private/tmp/salvor-main-v1.0.0` and `base_ref` set to `HEAD`. Review every affected process and confirm the generated block changes do not alter application behavior.

Expected: only instruction/context documents are changed; no production execution flow is at risk.

- [ ] **Step 4: Commit generated context**

Stage only entrypoints actually modified by GitNexus, then run:

```bash
git add CLAUDE.md AGENTS.md GEMINI.md
git diff --cached --check
git commit -m "chore(gitnexus): commit auto-generated code-intelligence blocks" -m "- Records repository symbol, relationship, and execution-flow routing
- Keeps the local .gitnexus index ignored and reproducible"
```

Expected: generated context commit succeeds; no `.gitnexus/` files are staged.

- [ ] **Step 5: Run final verification and assemble the confirmation report**

Run:

```bash
git status --short --branch
git log -4 --oneline
gitnexus status
find .salvor core site docs -name 'CLAUDE.md' -o -path '.salvor/*' -type f | sort
wc -c CLAUDE.md AGENTS.md GEMINI.md RULES.md VERSION.md core/CLAUDE.md site/CLAUDE.md docs/CLAUDE.md .salvor/*.md .salvor/postmortems/README.md .salvor/domain-tuning/README.md .serena/memories/*.md
```

Expected: worktree is clean; history includes the two design commits, scaffold commit, and GitNexus commit; index is current; file inventory and byte counts are ready for the user report.

The final report must include:

1. Created file list with byte counts or LOC.
2. Confirmation that hub, RULES §§0–8, VERSION, L1/L2, DOMAIN_REF, INFRA, DEFERRED_TODOS, postmortems, domain-tuning, all three spokes, and five Serena memories exist without template placeholders.
3. Confirmation that `CLAUDE.md` is canonical and `AGENTS.md`/`GEMINI.md` are thin adapters.
4. Scaffold commit hash and GitNexus commit hash.
5. GitNexus symbol, relationship, and execution-flow counts.
6. Confirmation that no website implementation, push, deploy, merge, or Pages-checkout mutation occurred.
7. Acknowledgement of all eight operating-ground-rule groups: capture triggers; silent L1/L2 updates; termination protocol; Serena/GitNexus discipline; branch hygiene; containers/production permission; shared-vs-personal memory; repository-to-site generated semantic parity with design approval for new elements.
