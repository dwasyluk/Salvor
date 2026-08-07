# Salvor FAQ

## Is Salvor just another AI second brain?

No. Most "AI second brain" projects are personal knowledge-management systems:
notes, life context, meetings, ideas, and retrieval. Salvor is for software
teams. It preserves the reasoning behind a codebase in git so coding agents,
across sessions and vendors, spend less time reconstructing context and are
less likely to retry previously disproven approaches.

The four-way intersection is Salvor:

**code-grounded + team-shared/git-versioned + governed + engineering-specific.**

That is the wedge. Salvor is not trying to be your personal memory palace. It is
the durable engineering memory layer for a repo.

## At a glance: where Salvor sits

Each of these tools does a different job well — the question is which job you're
hiring for:

- **Salvor** — for keeping a team's repository-specific engineering reasoning in
  git: user-approved capture, distinct capture classes, RULES governance,
  optional Strict per-component versioning, and optional enhanced orchestration
  of Serena + GitNexus for code grounding.
- **Obsidian + Claude** — for building and organizing a general knowledge vault:
  notes, research, and personal or shared knowledge graphs.
- **GBrain** — for running a full knowledge runtime: ingestion, retrieval,
  synthesis, and background jobs over a large knowledge base.
- **Vendor memory (Claude/Cursor/etc.)** — for personal or tool-specific
  continuity and preferences that follow you across sessions.
- **RAG / vector DBs** — for retrieval infrastructure over documents you already
  have.
- **Cline/Roo Memory Bank** — a structured, repository-local documentation
  methodology usable across AI tools (commands and integrations vary).

Salvor is built for the specific intersection of code-grounded, team-shared,
git-versioned, and governed engineering memory — that's the job it's designed
around.

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
versioned rationale, learned failures, deferred findings, and task termination
rules. Optional enhanced mode adds code intelligence through Serena and GitNexus;
both are highly recommended for the best code-grounded results.

Obsidian is a general knowledge vault — flexible enough to hold anything,
including code notes, for individuals or teams. Salvor's job is narrower: an
in-repo, reviewable engineering record that lives and merges with the code it
describes.

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

Salvor Core is repository-local files and governance. enhanced mode can optionally
add Serena and GitNexus integrations. Salvor adds no hosted memory service, SaaS
account, telemetry pipeline, or cloud synchronization. Repository memory and local
indexes remain under your control. Your selected coding agent may still transmit
code or context according to that provider's deployment and data-handling policies.
Salvor doesn't request calendar, email, or vault-wide scopes the way "wire your
whole life into an agent" setups do. Your reasoning stays in your repo, under your
version control.

## Isn't this just Cline/Roo's "Memory Bank"?

Memory Bank is the closest cousin, and a genuinely good one. Cline Memory Bank is
a structured repository-local documentation methodology that can be used across AI
tools, although commands and integrations vary — markdown files an agent maintains
per project, same sound instinct that project knowledge belongs in the repo. Cline
Memory Bank and Salvor both use structured repository-local Markdown for
continuity. Salvor additionally defines gated promotion into durable team
knowledge, separate decision/learning/failure/deferred lifecycles, canonical
ownership rules, and optional Serena/GitNexus orchestration. Concretely, Salvor
differentiates on: user-approved capture (the agent asks before persisting durable
knowledge), **three distinct capture classes** (decisions & domain learnings /
learned failures / deferred findings), a learned-failure registry,
deferred-finding capture, canonical-ownership rules, distributed-team Git review,
maintenance/recovery, team governance (Task Termination Protocol, per-component
versioning), thin vendor adapters, a Core/enhanced split, and orchestration of
Serena + GitNexus for code grounding.

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
answers "what did we learn, and why." Both integrations are optional, but highly
recommended for the best code-grounded results. Salvor uses them — it isn't them.

**GitNexus remembers how the code is connected. Salvor preserves why the team
made it that way.**

## How does Salvor relate to GitHub Spec Kit?

They're complementary. Spec Kit governs what should be built and how a feature
moves from specification to implementation. Salvor preserves the longitudinal
engineering memory accumulated while the system evolves: decisions, validated
domain knowledge, failed approaches, operational lessons, and intentionally
deferred findings. They coexist cleanly: `.specify/` and `specs/` stay canonical
for spec-driven work, and Salvor links to those artifacts rather than
duplicating them.

Spec Kit's extension ecosystem includes memory-related extensions. Salvor does not
depend on Spec Kit lacking memory; Salvor's distinction is that repository-wide
engineering-memory capture, ownership, failure retention, and governance are its
core protocol.

## What about Google ADK?

Orthogonal — ADK is an agent runtime, not a repo-memory discipline. Google ADK
helps developers build and run agents with sessions, state, memory, artifacts,
and tools. Salvor helps coding agents and engineering teams retain
repository-specific reasoning while developing software — including software
built with ADK.

## Isn't this just a folder of markdown files?

Yes — on purpose. Plain markdown in git is reviewable, diffable, branchable,
portable, and not locked to a single vendor. The value isn't a binary or a database; it's the
**protocol** around those files — what gets captured, when, with what reasoning,
and how it stays in sync with the code. The simplicity is the feature.

## Doesn't Claude or Cursor already have built-in memory?

Vendor memory is useful for personal or tool-specific continuity — preferences,
working style, light context that follows you. Salvor is intended for engineering
knowledge that should become part of the repository's reviewed, shared team
record: it lives in your repo, compatible agents can load it through thin
entrypoints, you can diff it in a PR, and it travels across branches and vendors.
Different jobs — use both.

## What does it cost, and is it only for teams?

Salvor itself is free and MIT. You pay only for the LLM you already use. The two
MCP servers are optional local tools that add code intelligence to Salvor Core:
Serena is open-source, while GitNexus is a third-party project with its own
license (its current community license is PolyForm Noncommercial — review the
upstream license or enterprise terms before anticipated commercial use). Salvor
Core does not require GitNexus. Salvor shines for teams (one shared brain), but it
compounds for solo devs too — it's your memory across your own sessions, machines,
and the models you'll switch to next.

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
`DOMAIN_REF.md`, postmortems, and domain learnings. They should make the
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
  `.salvor/domain-learnings/` artifacts, `.salvor/decisions/` (design rationale +
  invariants), and postmortems preserve the reasoning, evidence, rejected
  hypotheses, and history behind that truth.

That split keeps day-to-day context cheap while preserving the deeper audit trail
needed when an agent gets confused or a team needs to revisit a decision.

## Is it safe to install Salvor into a large existing repo — what will it touch?

Installation is preservation-first, and the setup prompt enforces it before
writing anything. Step 0 scans the repo and produces an **adoption map** —
every pre-existing file is classified `reuse unchanged`, `add Salvor-managed
section`, or `conflict — operator decision required` — and nothing is written
until you approve the plan. Existing `CLAUDE.md`/`AGENTS.md`/`GEMINI.md`
files are never replaced: Salvor merges a clearly marked managed section and
preserves everything else, including other tools' sections. Existing Serena
memories, GitNexus state, Spec Kit artifacts, and your own docs stay exactly
where they are. Setup never blanket-stages files and never commits without
asking. The additions are one `.salvor/` folder, root governance files, and
thin entrypoints — all shown as a diff you review first.

## Can Salvor adopt my existing project documentation?

Yes—during initial setup or later on demand. Both paths use the same
preservation-first, section-level mapping flow. Salvor first inventories
candidate `docs/`, READMEs, ADRs, postmortems, runbooks, and agent instructions
without writing. You then select what it should analyze.

A document is not forced into one artifact type. For example,
`docs/architecture.md` might contain:

- a database choice mapped to `.salvor/decisions/`;
- benchmark evidence mapped to `.salvor/domain-learnings/`;
- a failed migration mapped to `.salvor/postmortems/` and the LF registry;
- deployment instructions mapped to `.salvor/INFRA.md`; and
- API reference material that remains canonical in `docs/`, with Salvor adding
  only a concise pointer.

Salvor shows each source section, proposed destination, canonical owner,
ownership action, and exact content before writing. Each unrelated durable
promotion receives its own approval gate. The original documentation remains
untouched unless you separately approve changing it.

Existing Serena memories and vendor-specific agent notes follow the same
preservation boundary: Salvor may propose individually reviewed captures later,
or you can ask it at any time to preserve selected knowledge through the Salvor
loop, but it never automatically promotes those files into canonical memory.

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
review, diff, branch, and merge. For Salvor, that place is git — and [`RULES.md`](../RULES.md)
§10 defines how parallel branches merge the *knowledge* itself: collision-free
slug IDs, a semantic Brain Reconcile at merge/pull points, and a recurring
Brain Audit that sweeps for duplicates and contradictions.

## What happens when two teammates capture knowledge at the same time?

Nothing collides, and nothing merges silently. Every capture gets a
self-allocating slug ID with a structured Subject/Claim header, so there is
no shared counter for parallel branches to race ([`RULES.md`](../RULES.md) §10.1). At merge
and pull points, **Brain Reconcile** (§10.2) compares incoming knowledge
*semantically* — artifacts are paired by subject tags, their claims compared,
and each pair classified as distinct, duplicate, overlapping, contradictory,
or superseding, with every merge of durable knowledge gated on the operator.
Two teammates who capture the same discovery under different names get a
gated "merge these into one?" prompt; contradictory captures must resolve to
exactly one live entry. A recurring **Brain Audit** (§10.3) sweeps the whole
brain for anything a merge never saw.

## Why is `CLAUDE.md` the hub instead of `AGENTS.md`?

Honestly: because the hub filename follows the most deeply dogfooded adapter,
and Claude Code mechanically auto-loads `CLAUDE.md` (with `@`-imports) while
other agents load context by instruction. The knowledge itself is
vendor-neutral — the hub is a thin routing file over `.salvor/`, [`RULES.md`](../RULES.md),
and the spokes, and AGENTS.md-compatible agents get a first-class thin
pointer generated by default. If the ecosystem consolidates on `AGENTS.md`,
swapping which file is the hub and which is the pointer is a rename, not a
memory migration — the brain doesn't move. The vendor-named filename is an
implementation detail, not a boundary on which agents can use Salvor.

## How much context does Salvor add to each session?

Deliberately little at load time. What a session auto-loads is the thin hub,
the relevant component spoke, [`RULES.md`](../RULES.md), and the L1 state file — and L1 is
hard-capped at **50 lines** of dense shorthand. Everything heavy is
pull-on-demand: L2 is explicitly *not* read unless you ask or context
recovery runs, artifacts are read when their subject comes up, and the
archive is never loaded at all. The protocol's curation rules (L1 budget, L2
rotation, one-owner no-duplication, archive) exist precisely so the brain's
growth lands in reviewable files rather than in your context window.

## How do I upgrade Salvor when a new version ships?

Paste the newer `SETUP_PROMPT.md` into your agent from the repo root — same
operation as installing, in any supported vendor's CLI. Step 0 detects the
existing install via the `Salvor-Protocol:` stamp in `.salvor/README.md` and
proposes a delta-scoped upgrade plan covering only the **protocol layer**
(rules text, templates, adapters); your **knowledge layer** — artifacts,
L1/L2, domain facts, deferred findings — is never touched by an upgrade. If
you've customized generated rules, the plan is a three-way merge and conflicts
are yours to decide. Vendor plugins (coming) wrap the identical prompt and
path, so a prompt install and a plugin install upgrade the same way. See
[`docs/UPGRADING.md`](./UPGRADING.md).

## Can agents add to the memory without asking me?

By default, no — every durable capture requires your verbatim approval; that
gate is Salvor's defining move. An **experimental, off-by-default** mode
(`AGENT_CAPTURE = provisional`, [`RULES.md`](../RULES.md) §10.5) lets agents capture
learnings, failures, and deferred findings autonomously for workflows where
nobody is present to answer a gate (overnight runs, subagent fleets). The
protection moves rather than disappears: agent contributions are explicitly
flagged (provenance headers + a commit trailer), treated by every vendor's
agent as hypothesis rather than truth, unable to override ratified knowledge
or modify [`RULES.md`](../RULES.md), and queued for your item-by-item ratification via the
recurring Brain Audit. Rejected or stale ones are parked in
`.salvor/archive/` (never silently deleted). Nothing becomes canonical
without a human saying yes — the yes just happens after the write instead of
before it.

## Won't the memory go stale or drift from the code?

That's the failure mode Salvor is built to *surface*, not hide. A core doctrine:
preserve not just what's **known**, but what's **stale, contradicted, or missing**.
`DEFERRED_TODOS.md` parks open risks instead of dropping them, the `LF:` registry
records what *didn't* work, and L1 carries a "current delta vs. published behavior."
The Task Termination Protocol (RULES §0) makes updating L1/L2 + spokes + versioning
part of *finishing* work, so the memory stays tied to the code. And the recurring
**Brain Audit** (RULES §10.3 — due every 3 days by default, operator-tunable)
semantically sweeps the whole brain for near-duplicate artifacts, contradictions
against `DOMAIN_REF` current truth, stale L1 lines, and dangling links.

A first-class **`salvor health`** tooling pass — wrapping that Brain Audit and
additionally flagging drift in the hand-authored GitNexus routing note,
unsafe/unexpected `.gitnexusrc` changes, stale or missing index state, unexpected
context-file injection, and unexpected generated skills/hooks — is the top
roadmap item. See the
[Roadmap](../README.md#contributing--roadmap) for the full list.

## What is the simplest one-line answer?

Salvor is the version-controlled engineering brain for a codebase: every
coding agent inherits not just the files and the facts, but the *why* — the
team's accumulated reasoning, rationale, and learned failures — so it stops
re-deriving decisions and stops "fixing" code that is the way it is for a
reason.
