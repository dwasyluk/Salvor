# Salvor architecture

Salvor is not a tool you run; it's a **disciplined structure** you add to a repo
so a supported LLM coding agent, through a compatible entrypoint, works against
the same accumulated, version-controlled knowledge instead of starting cold
every time.

Out of the box, an LLM CLI carries little context from one session to the next.
The rationale a teammate captured two months ago (in another session, maybe
another vendor) is often re-derived, re-litigated, or lost. Salvor's job is to
reduce that repeated context reconstruction by making the knowledge **persist,
propagate, and compound**, all inside git.

## The five pillars

### 1. Hub-and-spoke context (token thrift)
A small root `CLAUDE.md` **hub** (<~60 lines) holds project-wide invariants and a
documentation map. Each component has its own **spoke** `CLAUDE.md`. An agent
working in `api/` loads the hub + the `api` spoke — not the entire repo's
context. You pay for the context you use. `CLAUDE.md` is the current canonical
cross-vendor hub implementation, not a Claude-only memory boundary. Thin
`AGENTS.md` and `GEMINI.md` pointers ship alongside it by default, so Codex and
Gemini load the same context. The repository-owned Markdown brain is
vendor-agnostic; thin adapters make it vendor-portable, so a supported-agent
switch does not require a memory migration. Setup generates tested entrypoints
for Claude Code, Codex, and GEMINI.md-compatible clients — Claude Code is the
most deeply dogfooded path, while the Codex and Google adapters are wired and
documented but less exercised.

### 2. Two-tier persisted memory (L1 / L2)
- **L1 — `.salvor/active_state.md`:** ≤50 lines of dense shorthand. Current truth,
  active deltas, and "Learned Failures." Loaded at session start through the
  compatible entrypoint (auto-imported by Claude Code; explicitly read elsewhere).
- **L2 — `.salvor/active_state_verbose.md`:** detailed but curated archive. Full
  reasoning, evidence, *rejected* hypotheses. Read only when recovering from
  confusion. Rotation rule: when L2 exceeds ~1,500 lines or at release milestones,
  condense the oldest resolved sections — keep durable conclusions, evidence
  references, and commit/test/issue IDs; drop raw noise.

L1 is what the agent reads constantly; L2 is where the nuance lives so L1 can stay
cheap. Both are git-tracked.

### 3. RULES.md — the enforcement layer
The documents above are inert without discipline. `RULES.md` is what makes the
knowledge compound rather than decay:
- **§0 Task Termination Protocol** — RULES.md keeps reviewed memory and component
  context synchronized: nothing is "done" until L1/L2 + spokes are synced. Optional
  Strict defaults can also enforce project-specific version counters and parity
  rules (e.g. bumping `VERSION.md`); per-component versioning and `APP_NAME`
  conventions are part of the Strict profile, not a Core requirement.
- **§1 Context Recovery Procedure** — a loop-breaker.
- **§2 Continued Learning Protocol** and **§7 Out-of-scope finding capture** — the
  user-gated capture classes (below).
- **§3–§6, §8** — versioning, search-before-read, safety, full-code-path
  discipline, and the shared-vs-per-user memory rule.

### 4. Versioned audit trail of the *why*
- **`VERSION.md`** *(optional Strict profile)* — single source of truth for
  per-component build IDs, each bump carrying a detailed *why* row. Source reads
  versions at build time; nothing is hardcoded. Per-component versioning and
  `APP_NAME` conventions are Strict defaults, independent of the Core Protocol —
  a project can run the Core capture/governance loop without them.
- **`.salvor/domain-learnings/`** — dated, frozen artifacts (hypothesis → evidence →
  verdict), indexed in a TOC. `DOMAIN_REF.md` holds the living truth; the artifacts
  are the receipts.

### 5. MCP substrate: Serena + GitNexus
Both integrations are optional; Salvor Core works without them. They are highly
recommended for the best code-grounded results.

- **Serena** — semantic/symbolic code intelligence, so the agent navigates by
  symbol (token-thrifty) instead of re-reading whole files. IDE-agnostic. Serena
  also has its own optional memory folder, `.serena/memories/` — Salvor treats it
  as a retrieval aid holding pointers and structural notes; `.salvor/` remains the
  canonical engineering record.
- **GitNexus** — indexing, impact analysis, and execution-flow tracing over a
  knowledge graph of the codebase (symbols, relationships, flows) — *impact
  analysis before edits*, "know your code," not just keyword search. Especially
  valuable when you must assume code is untested. Salvor's recommended default is
  pure index mode — `gitnexus analyze --index-only` (or `.gitnexusrc
  {"indexOnly": true}`) where supported — so GitNexus builds only its code index
  with no AI-context file injection: no block in Salvor-owned
  `CLAUDE.md`/`AGENTS.md`/`GEMINI.md`, no skills, no hooks, no global MCP change
  (verified against GitNexus 1.6.9; detect support via `gitnexus analyze --help`).
  On releases that predate `--index-only` (e.g. GitNexus 1.6.3, where the
  `.gitnexusrc` `indexOnly`/`skipContextFiles`/`skipSkills` keys were not honored),
  fall back to the `--skip-agents-md` flag, which suppresses the context block but
  still generates local, gitignored skill files. Repo-specific community skills are
  opt-in via `gitnexus analyze --skills`, and hooks/MCP config come only from
  `gitnexus setup`. GitNexus owns its index, its opt-in generated skills/hooks, and
  its routing note only lives in the canonical `CLAUDE.md` hub (hand-authored by
  Salvor); vendor adapters stay thin. GitNexus is a third-party project (PolyForm
  Noncommercial community license); Salvor Core works without it. (Setup modes and
  the full ownership contract: `VENDOR_ADAPTERS.md`.)

Both are standard MCP servers, so they work across Claude Code, Codex, Gemini CLI /
Antigravity CLI, Cursor, and others. The division of labor: **GitNexus remembers how
the code is connected. Salvor preserves why the team made it that way.** (Setup details
and the ownership contract: `VENDOR_ADAPTERS.md`.)

## Where the brain lives: the `.salvor/` folder

Salvor keeps a clean split so it never squats in your project's own `docs/`:

- **Root — governance + entrypoints:** the `CLAUDE.md` hub + component spokes,
  `AGENTS.md`/`GEMINI.md`, `RULES.md`, and `VERSION.md` when the optional Strict
  profile is enabled — where compatible CLIs and build tooling discover them.
- **`.salvor/` — the brain (git-committed, shared):** L1 (`active_state.md`),
  L2 (`active_state_verbose.md`), `DOMAIN_REF.md`, `INFRA.md`, `DEFERRED_TODOS.md`,
  `domain-learnings/`, `decisions/`, `postmortems/`, and a `README.md` index.

The rule: *if a CLI or build tool auto-discovers the file at a fixed path, it stays
at the root; everything else Salvor owns lives in `.salvor/`.* Tooling gets one
predictable root, your own `docs/` stays uncluttered, and `.serena/` / `.gitnexus/`
remain their own tools' homes (Salvor orchestrates them, it doesn't absorb them).

### One owner per durable fact

Salvor is not "everything in-repo is co-canonical." Each durable fact has **one
canonical owner**; other shared files link to or summarize it rather than forking it:

- **`.salvor/` artifacts own their knowledge.** L1 (`active_state.md`) = concise
  current state; L2 (`active_state_verbose.md`) = curated recovery history;
  `DOMAIN_REF.md` = current domain facts + the failure (`LF#`) registry;
  `decisions/` = design rationale; `domain-learnings/` = validated discoveries;
  `postmortems/` = incident/failure evidence; `DEFERRED_TODOS.md` = deferred findings.
- Canonical engineering knowledge lives in its assigned `.salvor/` artifact.
  **GitNexus** owns machine-derived code structure; **Serena** memories and **vendor
  adapters** are concise retrieval and routing aids; **Spec Kit** owns its
  specs/plans.
- **Vendor entrypoints** (`CLAUDE.md` hub, `AGENTS.md`, `GEMINI.md`) point to and
  summarize the canonical records — they are **never** a knowledge fork.

## The three capture classes (the keystone)

Salvor's defining mechanism: the agent **self-identifies** knowledge worth keeping
and **asks you, verbatim, before persisting** — so durable capture is never silent
(which would let it fail unnoticed) and never automatic (which would let the agent
bloat your docs without your say). Routine L1/L2 state maintenance stays automatic;
promotion into the durable shared record is user-approved. Three distinct classes:

| Capture class | Captures | Verbatim prompt | Lands in |
|---|---|---|---|
| **Decision / Domain Learning** | A discovery, decision, or **design invariant** + its *why* | `"Save this as a domain learning? (yes/no)"` (a **Domain Learning**) · `"Record this as a design decision? (yes/no)"` (a **Design Decision**) | `.salvor/domain-learnings/` (learnings) or `.salvor/decisions/` (decisions + **Invariant/Coupling**) + `DOMAIN_REF.md` + L1/L2 |
| **Learned Failure (LF#)** | A recurring/structural failure mode + root cause + fix sites | (registered through the same flow when the discovery *is* a failure) | `DOMAIN_REF.md` LF# registry + L1 shorthand |
| **Deferred Finding** | An out-of-scope finding surfaced mid-task — real, but must not derail current work | `"Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"` | `.salvor/DEFERRED_TODOS.md` (dedupe-first; Severity + Suggested-fix) |

Keeping these three *distinct* is the legibility upgrade at the heart of Salvor:
"what we learned," "how we failed," and "what we noticed but parked" are different
kinds of knowledge with different homes.

## Two things people conflate (don't)

**Shared brain vs per-user memory.** Everything Salvor writes is **in-repo and
git-tracked** — that's the shared brain each supported agent can load through a
compatible entrypoint. Claude Code's per-user auto-memory
(`~/.claude/.../memory/`) is a *separate, optional, non-shared* convenience
layer; canonical truth never lives there.

**Salvor's version vs your project's version.** Salvor's own releases use SemVer
git tags (`v1.0.0-beta`, …) tracked in `CHANGELOG.md`. The `VERSION.md` Salvor scaffolds
*into your project* (with per-component IDs like `API:01`) versions **your**
project — not Salvor.
