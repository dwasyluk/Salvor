# Salvor architecture

Salvor is not a tool you run; it's a **disciplined structure** you add to a repo
so that an LLM coding agent — any agent, any session, any contributor — works
against the same accumulated, version-controlled knowledge instead of starting
cold every time.

Out of the box, an LLM CLI forgets everything between sessions. The rationale a
teammate captured two months ago (in another session, maybe another vendor) is
gone — re-derived, or re-litigated, or lost. Salvor's job is to make that
knowledge **persist, propagate, and compound**, all inside git.

## The five pillars

### 1. Hub-and-spoke context (token thrift)
A small root `CLAUDE.md` **hub** (<~60 lines) holds project-wide invariants and a
documentation map. Each component has its own **spoke** `CLAUDE.md`. An agent
working in `api/` loads the hub + the `api` spoke — not the entire repo's
context. You pay for the context you use. Thin `AGENTS.md` and `GEMINI.md` pointers ship
alongside the hub by default, so Codex and Gemini load the same context — multivendor out
of the box, no vendor to choose.

### 2. Two-tier persisted memory (L1 / L2)
- **L1 — `.salvor/active_state.md`:** ≤50 lines of dense shorthand. Current truth,
  active deltas, and "Learned Failures." Auto-loaded every session.
- **L2 — `.salvor/active_state_verbose.md`:** unbounded archive. Full reasoning, raw
  outputs, *rejected* hypotheses. Read only when recovering from confusion.

L1 is what the agent reads constantly; L2 is where the nuance lives so L1 can stay
cheap. Both are git-tracked.

### 3. RULES.md — the enforcement layer
The documents above are inert without discipline. `RULES.md` is what makes the
knowledge compound rather than decay:
- **§0 Task Termination Protocol** — nothing is "done" until VERSION is bumped and
  L1/L2 + spokes are synced.
- **§1 Dementia Recovery** — a loop-breaker.
- **§2 Continued Learning Protocol** and **§7 Out-of-scope finding capture** — the
  user-gated capture triggers (below).
- **§3–§6, §8** — versioning, search-before-read, safety, full-code-path
  discipline, and the shared-vs-per-user memory rule.

### 4. Versioned audit trail of the *why*
- **`VERSION.md`** — single source of truth for per-component build IDs, each bump
  carrying a detailed *why* row. Source reads versions at build time; nothing is
  hardcoded.
- **`.salvor/domain-tuning/`** — dated, frozen artifacts (hypothesis → evidence →
  verdict), indexed in a TOC. `DOMAIN_REF.md` holds the living truth; the artifacts
  are the receipts.

### 5. MCP substrate: Serena + GitNexus
- **Serena** — semantic/symbolic code intelligence, so the agent navigates by
  symbol (token-thrifty) instead of re-reading whole files. IDE-agnostic.
- **GitNexus** — a knowledge graph of the codebase (symbols, relationships,
  execution flows) for *impact analysis before edits* — "know your code," not just
  keyword search. Especially valuable when you must assume code is untested.

Both are standard MCP servers, so they work across Claude Code, Codex, Gemini,
Cursor, and others.

## Where the brain lives: the `.salvor/` folder

Salvor keeps a clean split so it never squats in your project's own `docs/`:

- **Root — governance + entrypoints:** the `CLAUDE.md` hub + component spokes,
  `AGENTS.md`/`GEMINI.md`, `RULES.md`, and `VERSION.md` — where the CLIs and build
  tooling auto-discover them.
- **`.salvor/` — the brain (git-committed, shared):** L1 (`active_state.md`),
  L2 (`active_state_verbose.md`), `DOMAIN_REF.md`, `INFRA.md`, `DEFERRED_TODOS.md`,
  `domain-tuning/`, `decisions/`, `postmortems/`, and a `README.md` index.

The rule: *if a CLI or build tool auto-discovers the file at a fixed path, it stays
at the root; everything else Salvor owns lives in `.salvor/`.* Tooling gets one
predictable root, your own `docs/` stays uncluttered, and `.serena/` / `.gitnexus/`
remain their own tools' homes (Salvor orchestrates them, it doesn't absorb them).

## The three capture triggers (the keystone)

Salvor's defining mechanism: the agent **self-identifies** knowledge worth keeping
and **asks you, verbatim, before persisting** — so capture is never silent (which
would let it fail unnoticed) and never automatic (which would let the agent bloat
your docs without your say). Three distinct flavors:

| Trigger | Captures | Verbatim prompt | Lands in |
|---|---|---|---|
| **Continued Learning** | A discovery, decision, or **design invariant** + its *why* | `"Save this as a domain-tuning artifact? (yes/no)"` (a finding) · `"Record this as a design decision? (yes/no)"` (a decision) | `.salvor/domain-tuning/` (findings) or `.salvor/decisions/` (decisions + **Invariant/Coupling**) + `DOMAIN_REF.md` + L1/L2 |
| **Learned Failure (LF#)** | A recurring/structural failure mode + root cause + fix sites | (registered through the same flow when the discovery *is* a failure) | `DOMAIN_REF.md` LF# registry + L1 shorthand |
| **Deferred TODO** | An out-of-scope finding surfaced mid-task — real, but must not derail current work | `"Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"` | `.salvor/DEFERRED_TODOS.md` (dedupe-first; Severity + Suggested-fix) |

Keeping these three *distinct* is the legibility upgrade at the heart of Salvor:
"what we learned," "how we failed," and "what we noticed but parked" are different
kinds of knowledge with different homes.

## Two things people conflate (don't)

**Shared brain vs per-user memory.** Everything Salvor writes is **in-repo and
git-tracked** — that's the shared brain every contributor's agent reads. Claude
Code's per-user auto-memory (`~/.claude/.../memory/`) is a *separate, optional,
non-shared* convenience layer; canonical truth never lives there.

**Salvor's version vs your project's version.** Salvor's own releases use SemVer
git tags (`v1.0.0`, …) tracked in `CHANGELOG.md`. The `VERSION.md` Salvor scaffolds
*into your project* (with per-component IDs like `API:01`) versions **your**
project — not Salvor.
