# Salvor FAQ

## Is Salvor just another AI second brain?

No. Most "AI second brain" projects are personal knowledge-management systems:
notes, life context, meetings, ideas, and retrieval. Salvor is for software
teams. It preserves the reasoning behind a codebase in git so coding agents,
across sessions and vendors, stop starting cold.

The four-way intersection is Salvor:

**code-grounded + team-shared/git-versioned + governed + engineering-specific.**

That is the wedge. Salvor is not trying to be your personal memory palace. It is
the durable engineering memory layer for a repo.

## At a glance: where Salvor sits

| Tool | Built for | Storage | Code-aware? | Capture | Governance |
|---|---|---|---|---|---|
| **Salvor** | a **team's codebase** memory | Markdown in **git (in-repo)** | **Yes** — Serena + GitNexus | **User-gated triggers** | **RULES + versioning** |
| Obsidian + Claude | personal notes / PKM | local vault | No | passive / auto | none |
| GBrain | personal/company knowledge runtime | Postgres + pgvector | No | auto + cron | health / lint |
| Vendor memory (Claude/Cursor) | per-user continuity & prefs | vendor cloud | session-only | automatic, opaque | none |
| RAG / vector DB | retrieval over your docs | vector store | No | ingest pipeline | none |
| Cline/Roo Memory Bank | per-project agent notes | Markdown in repo | No | agent-maintained | light |

Only Salvor sits at **code-grounded + team-shared/git-versioned + governed + engineering-specific** all at once.

## How is Salvor different from GBrain?

[GBrain](https://github.com/garrytan/gbrain) is a full knowledge runtime:
database, retrieval, synthesis, graph traversal, ingestion, agents, permissions,
and background jobs. It is real, substantial, and much closer to "give my agent a
general personal or company brain."

Salvor is intentionally smaller and more repo-native: a disciplined file
structure and operating protocol that makes coding agents preserve project
knowledge as they work.

GBrain asks: "How do I ingest, retrieve, and synthesize a large knowledge base?"

Salvor asks: "How do I make every coding agent inherit this codebase's accumulated
engineering reasoning?"

The overlap is useful lineage, not duplication. GBrain validates the broader
persistent-knowledge trend; Salvor narrows it to software teams, git, governance,
and code-aware workflows.

## How is Salvor different from Obsidian + Claude?

Obsidian + Claude gives you a personal Markdown vault an AI can read and
organize. Tools like
[claude-obsidian](https://github.com/AgriciDaniel/claude-obsidian) and
[obsidian-second-brain](https://github.com/eugeniughelbur/obsidian-second-brain)
are aimed at AI-first PKM: notes, tasks, calendars, research, and personal
knowledge graphs.

Salvor gives a software repo a governed memory system: component spokes,
versioned rationale, learned failures, deferred TODOs, task termination rules,
and code intelligence through Serena and GitNexus.

Obsidian helps organize knowledge. Salvor helps ship software without losing why
decisions were made.

## Doesn't Claude Code already have CLAUDE.md?

`CLAUDE.md` is an instruction file. Salvor is a full operating discipline around
instruction files: hub-and-spoke context, L1/L2 memory, user-gated capture
triggers, learned-failure registry, deferred TODOs, per-component versioning, and
vendor adapters.

A plain `CLAUDE.md` tells the agent what to do. Salvor gives the project a
durable memory system for what the team has learned.

## Doesn't Cursor, Copilot, Codex, or Claude already understand my codebase?

They can inspect code in the current session. Salvor preserves the reasoning that
is not obvious from code: prior failed approaches, domain decisions, known traps,
deferred risks, version rationale, cross-agent discoveries, and the evidence
behind a decision.

Code search answers "where is this?"

Salvor answers "what did we learn, why did we decide this, and what should the
next agent not repeat?"

## Does my code leave my machine? What access does Salvor need?

Salvor is files in your git repo plus two **local** MCP servers (Serena, GitNexus)
that run on your machine over stdio. No SaaS, no account, no cloud sync — nothing
is uploaded. It doesn't request calendar, email, or vault-wide scopes the way
"wire your whole life into an agent" setups do. Your code and reasoning stay in
your repo, under your version control and your keys. As the security rule goes:
control access with scoped, read-where-possible keys — not by telling an agent
"don't."

## Isn't this just Cline/Roo's "Memory Bank"?

Memory Bank is the closest cousin — markdown files an agent maintains per project,
same good instinct. Salvor goes further: a governance protocol (Task Termination
Protocol, per-component versioning, full-code-path discipline), code-grounding via
Serena + GitNexus, and **three user-gated capture triggers** (learnings / failures
/ deferred TODOs) instead of freeform notes — and it's vendor-agnostic, not tied to
one extension. Memory Bank remembers; Salvor remembers *with discipline, the why,
and the code graph.*

## Doesn't Mem0 / Letta / Zep / an MCP memory server already do agent memory?

Those are memory *runtimes* — APIs and stores you wire into an agent you're
building (vector DBs, key-value/graph recall, memory endpoints). Salvor isn't a
service you run; it's a repo-native discipline for the coding agent you already
use, with the canonical memory living in git so the whole team inherits it. They
operate at a different layer — you could even back Salvor's retrieval with one
someday (that's the embeddings roadmap).

## Isn't this just Serena + GitNexus with extra steps?

Serena and GitNexus are the substrate: they tell the agent about your code *as it
is right now* — symbols, call graph, impact. Salvor is the discipline and the
memory *on top*: why decisions were made, what was tried and failed, what's
deferred, what changed and when. Code intelligence answers "what is this?"; Salvor
answers "what did we learn, and why." Salvor uses them — it isn't them.

## Isn't this just a folder of markdown files?

Yes — on purpose. Plain markdown in git is reviewable, diffable, branchable,
portable, and locked to no vendor. The value isn't a binary or a database; it's the
**protocol** around those files — what gets captured, when, with what reasoning,
and how it stays in sync with the code. The simplicity is the feature.

## Doesn't Claude or Cursor already have built-in memory?

Vendor memory is per-user, cloud-stored, opaque, and tied to one tool — great for
personal preferences and light continuity, useless as a team's canonical
engineering record. Salvor's memory lives in your repo: every teammate's agent
reads it, you can diff it in a PR, it travels across branches and vendors, and it
survives you switching models next year. Different jobs — use both.

## What does it cost, and is it only for teams?

Free and MIT. You pay only for the LLM you already use; the two MCP servers are
free and local. It shines for teams (one shared brain), but it compounds for solo
devs too — it's your memory across your own sessions, machines, and the models
you'll switch to next.

## Is the graph useful, or is it just visual hype?

Salvor's graph has a job. GitNexus maps symbols, relationships, and execution
flows so agents can do impact analysis before editing. It is not an Obsidian-style
"look at my constellation" feature.

The point is not visual delight. The point is:

> If I change this, what might break?

That makes the graph operational, not decorative.

## Why not just use RAG or embeddings?

RAG and embeddings are useful retrieval infrastructure, but they are not
governance. Salvor's source of truth is Markdown in git: reviewable, diffable,
branchable, and shared by the team.

Embeddings belong on the roadmap as a derived index over L1/L2,
`DOMAIN_REF.md`, postmortems, and domain-tuning artifacts. They should make the
right prior reasoning easier to retrieve, but they should not replace the
canonical project memory.

The principle is:

**Markdown is the source of truth. Vector search is an accelerator.**

## What does Salvor borrow from the current second-brain wave?

The good idea is persistent knowledge compounding: agents should not relearn the
same thing every session. Karpathy-style LLM Wiki discussions, GBrain, and the
recent Obsidian + Claude projects all point at the same pressure: chat context
alone is too fragile for serious work.

Salvor borrows that pattern, then narrows it to software engineering:

- code-aware context instead of general notes
- git-tracked truth instead of private app state
- team-shared files instead of per-user memory
- explicit capture rules instead of passive recall
- learned failures, postmortems, and deferred TODOs instead of generic pages
- impact analysis instead of decorative graph views

## What is "compiled truth + append-only timeline" in Salvor terms?

Salvor splits memory into two complementary layers:

- **Compiled truth:** `.salvor/active_state.md` and `.salvor/DOMAIN_REF.md` hold the
  current, compressed state an agent should rely on.
- **Append-only timeline:** `.salvor/active_state_verbose.md`, dated
  `.salvor/domain-tuning/` artifacts, `.salvor/decisions/` (design rationale +
  invariants), and postmortems preserve the reasoning, evidence, rejected
  hypotheses, and history behind that truth.

That split keeps day-to-day context cheap while preserving the deeper audit trail
needed when an agent gets confused or a team needs to revisit a decision.

## Why the name Salvor instead of "brain"?

The persistent-memory space is crowded with "brain" names. Salvor stands out
because it describes the actual job: salvaging project knowledge before it is
lost to context resets, team turnover, vendor changes, and forgotten decisions.

The Prime Radiant identity reinforces that. Salvor is about preserving the plan,
the reasoning, and the hard-won lessons that let the next session continue
instead of restarting.

## Is Salvor trying to replace GBrain, Obsidian, or vendor memory?

No. These layers can coexist:

- Use GBrain or Obsidian for personal/company knowledge.
- Use vendor memory for preferences and lightweight continuity.
- Use Salvor for canonical engineering memory inside the repo.

The boundary matters. Canonical project truth belongs somewhere the team can
review, diff, branch, and merge. For Salvor, that place is git.

## Won't the memory go stale or drift from the code?

That's the failure mode Salvor is built to *surface*, not hide. A core doctrine:
preserve not just what's **known**, but what's **stale, contradicted, or missing**.
`DEFERRED_TODOS.md` parks open risks instead of dropping them, the `LF#` registry
records what *didn't* work, and L1 carries a "current delta vs. published behavior."
The Task Termination Protocol (RULES §0) makes updating L1/L2 + spokes + versioning
part of *finishing* work, so the memory stays tied to the code.

A first-class **`salvor health`** pass — flagging stale L1 lines, unresolved `LF#`s,
aging deferred TODOs, drifted GitNexus blocks, and `DOMAIN_REF` ↔ L1 ↔ L2
contradictions — is the top roadmap item. See the
[Roadmap](../README.md#roadmap--help-wanted) for the full list.

## What is the simplest one-line answer?

Salvor is the version-controlled engineering memory layer for a codebase: the
part that lets every coding agent inherit the team's accumulated reasoning, not
just the files.

