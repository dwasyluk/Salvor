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

- **Compiled truth:** `docs/active_state.md` and `docs/DOMAIN_REF.md` hold the
  current, compressed state an agent should rely on.
- **Append-only timeline:** `docs/active_state_verbose.md`, dated
  `docs/domain-tuning/` artifacts, and postmortems preserve the reasoning,
  evidence, rejected hypotheses, and history behind that truth.

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

## What should Salvor add next?

The strongest next addition is a health check:

```bash
salvor health
```

or an equivalent documented health pass that flags:

- stale L1 lines
- unresolved LF# entries
- broken links
- deferred TODOs aging into risk
- `docs/active_state.md` growing past its line budget
- component spokes that fell behind code changes
- drifted GitNexus index blocks
- missing version/rationale updates
- contradictions between `DOMAIN_REF.md`, L1, and L2

Other high-value roadmap items:

- **Embeddings as a derived index:** semantic retrieval over the git-tracked
  memory files, while Markdown remains canonical.
- **First-class worktree support:** merge-friendly conventions so parallel agents
  do not clobber the shared brain.
- **Sub-brains to master brain:** scoped per-agent ledgers that roll durable
  learnings up to the shared project memory.
- **Existing-repo import:** scan ADRs, READMEs, docs, postmortems, and existing
  agent instructions to propose an initial Salvor structure.
- **More vendor adapters:** harden Codex, Gemini, Cursor, OpenCode, and other
  MCP-capable environments.

## What is the simplest one-line answer?

Salvor is the version-controlled engineering memory layer for a codebase: the
part that lets every coding agent inherit the team's accumulated reasoning, not
just the files.

