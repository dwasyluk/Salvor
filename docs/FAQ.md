# Salvor FAQ

## Is Salvor just another AI second brain?

No. Most "AI second brain" projects are personal knowledge-management systems:
notes, life context, meetings, ideas, and retrieval. Salvor is a **repo-native
engineering knowledge layer** for coding agents and software teams. It
externalizes and governs project knowledge so decisions, rationale, failures,
constraints, and provenance survive sessions, contributors, branches, and
vendors.

The four-way intersection is Salvor:

**code-grounded + team-shared/git-versioned + governed + engineering-specific.**

That is the wedge. Salvor is not trying to be your personal memory palace. It is
an institutional brain that lives with the code.

## What is persistent engineering cognition?

**Persistent engineering cognition** is Salvor's term for durable, governed
project knowledge that carries forward not just what happened, but what the
project learned — decisions, rationale, failures, constraints, rules, and
provenance. It is a proposed description for an emerging capability, not an
established industry-standard category.

Agent memory generally retains and recalls prior information. Salvor focuses
additionally on which project knowledge remains authoritative, why it matters,
who may promote it, how contradictions are reconciled, and how later knowledge
supersedes earlier truth without erasing provenance. Salvor does not change an
agent's intrinsic intelligence; it externalizes, governs, and preserves project
cognition.

## Isn't this already in Git?

Git preserves source state: files, commits, patches, branches, and history.
Engineering knowledge is a different form of project state. A commit rarely
captures why implementation A won over B, which plausible approach failed, what
an incident taught the team, or which constraint must survive the next
refactor.

**Git preserves what changed. Salvor preserves what the project learned.**

## Doesn't a large context window solve this?

A large window can hold more information during one invocation. It does not
decide which knowledge deserves to outlive that invocation, establish canonical
ownership, obtain review, resolve contradictions across branches, or preserve
provenance when the truth changes. Context capacity helps retrieval; it does
not replace a governed project-knowledge lifecycle.

## At a glance: where Salvor sits

Each of these tools does a different job well — the question is which job you're
hiring for:

- **Salvor** — an engineering knowledge layer for keeping a team's
  repository-specific reasoning in git: user-approved capture, distinct capture
  classes, RULES governance,
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
git-versioned, and governed engineering knowledge — that's the job it's
designed around.

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

Salvor gives a software repo a governed knowledge layer: component spokes,
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
durable, governed record of what the team has learned.

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
add Serena and GitNexus integrations. Salvor adds no hosted knowledge service, SaaS
account, telemetry pipeline, or cloud synchronization. Repository knowledge and local
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
use, with canonical project knowledge living in git so the whole team inherits it. They
operate at a different layer — you could even back Salvor's retrieval with one
someday (that's the embeddings roadmap).

## How does Salvor relate to MCP, Agent Skills, and the Agent Plugins standard?

They standardize **capabilities**; Salvor governs **knowledge**. MCP connects
an agent to tools, Agent Skills package reusable instructions, and the
published [Agent Plugins](https://agent-plugins.org/specification) format wraps
skills and MCP-server configuration in one portable folder — all answering
"what can this agent *do*?" None of them
say anything about memory, knowledge files, or context: "what has this team
*learned*, and *why* is the code the way it is?" That's Salvor's layer — a
repo-owned, human-governed brain with slug IDs, merge semantics, and capture
gates — and it's deliberately complementary: Salvor's optional tooling already
rides MCP (Serena, GitNexus), and the upcoming v1.1 plugin will evaluate
shipping in the Agent Plugins format so one package serves every supporting
client. Different layers, no conflict: they move the agent's hands; Salvor
carries the team's mind.

## Isn't this just Serena + GitNexus with extra steps?

Serena and GitNexus are the substrate: they tell the agent about your code *as it
is right now* — symbols, call graph, impact. Salvor is the engineering knowledge
layer *on top*: why decisions were made, what was tried and failed, what's
deferred, what changed and when. Code intelligence answers "what is this?"; Salvor
answers "what did we learn, and why." Both integrations are optional, but highly
recommended for the best code-grounded results. Salvor uses them — it isn't them.

**GitNexus remembers how the code is connected. Salvor preserves why the team
made it that way.**

## How does Salvor relate to GitHub Spec Kit?

They're complementary. Spec Kit governs what should be built and how a feature
moves from specification to implementation. Salvor preserves the longitudinal
engineering knowledge accumulated while the system evolves: decisions, validated
domain knowledge, failed approaches, operational lessons, and intentionally
deferred findings. They coexist cleanly: `.specify/` and `specs/` stay canonical
for spec-driven work, and Salvor links to those artifacts rather than
duplicating them.

Spec Kit's extension ecosystem includes memory-related extensions. Salvor does not
depend on Spec Kit lacking memory; Salvor's distinction is that repository-wide
engineering-knowledge capture, ownership, failure retention, and governance are its
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
compounds for solo developers too — it preserves project knowledge across their
own sessions, machines, and future model changes.

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
canonical project-knowledge record.

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

## When does Salvor become useful?

Salvor compounds as the project brain matures; installation time by itself is
not the measure.

- **Greenfield project:** the brain starts thin and grows alongside architecture
  decisions, implementation choices, failures, SOPs, and domain discoveries.
- **Mature repository with deliberate adoption:** committed READMEs, docs, ADRs,
  architecture notes, changelogs, postmortems, incident reports, runbooks, and
  project instructions can seed useful reviewed knowledge immediately.
- **Mature repository with minimal adoption:** Salvor starts with what setup can
  legitimately derive from available project state and what future engineering
  work teaches it. Undocumented historical rationale remains undocumented.

**Structure can often be derived. Rationale needs evidence. Salvor cannot
preserve knowledge it has never been given or had a chance to learn.**

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
candidate `docs/`, READMEs, ADRs, architecture/design notes, CHANGELOGs,
postmortems/incident reports, runbooks, and agent instructions without writing.
You then select what it should analyze.

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

Repository analysis can suggest structure, modules, tests, conventions,
dependencies, and likely knowledge sources. It cannot safely invent why a team
made a historical decision. **Structure can often be derived. Rationale needs
evidence.**

Existing Serena memories and vendor-specific agent notes follow the same
preservation boundary: Salvor may propose individually reviewed captures later,
or you can ask it at any time to preserve selected knowledge through the Salvor
loop, but it never automatically promotes those files into canonical memory.

## Why the name Salvor instead of "brain"?

A *salvor* recovers what would otherwise be lost, which describes the practical
job: preserving project knowledge through context resets, team turnover, vendor
changes, and forgotten decisions. The name is also an unofficial nod to Salvor
Hardin from Isaac Asimov's *Foundation* series, a story interested in how
knowledge survives changing people and systems. The engineering goal is much
humbler than psychohistory, and no association or endorsement is implied.

## Is Salvor trying to replace GBrain, Obsidian, or vendor memory?

No. These layers can coexist:

- Use GBrain or Obsidian for personal/company knowledge.
- Use vendor memory for preferences and lightweight continuity.
- Use Salvor for canonical engineering knowledge inside the repo.

The boundary matters. Canonical project truth belongs somewhere the team can
review, diff, branch, and merge. For Salvor, that place is git — and [`RULES.md`](../RULES.md)
§10 defines how parallel branches merge the *knowledge* itself: collision-free
slug IDs, a semantic Brain Reconcile at merge/pull points, and a recurring
Brain Audit that sweeps for duplicates and contradictions.

## What happens when two teammates capture knowledge at the same time?

There is no shared numeric counter for parallel branches to race, but concurrent
knowledge can still overlap or conflict and therefore never merges silently.
Every capture gets a self-allocating slug ID with a structured Subject/Claim
header ([`RULES.md`](../RULES.md) §10.1). At merge
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

## Were the benchmark brains preloaded with answers?

No. Every T0 brain is built inside the task container by the shipped
`SETUP_PROMPT.md`, driven by a fixed scripted operator, reading only the
repository checkout itself — before any task text exists anywhere in the
container. Provenance for each brain records a structural scan, drive
transcript, ratifier decisions, and a content hash. Every chain link is
additionally shingle-audited against all *future* task texts; an overlap that
cannot be traced to the repository fails the run. See
[`benchmarks/METHODOLOGY.md`](../benchmarks/METHODOLOGY.md).

## Why not start the benchmark brains empty?

An empty brain unrealistically handicaps a persistent-memory system (no real
project starts a session with zero context), while a hand-curated "mature"
brain invites the accusation that answers were planted. The repository-derived
T0 is the defensible middle: task-blind, machine-built, usefulness-probed, and
auditable. The genuinely mature-brain case — knowledge earned across many
sessions — needs longitudinal benchmarks. [RFC #5](https://github.com/dwasyluk/salvor/issues/5)
proposes testing accumulation across evolving releases, sessions,
requirements, dependencies, and collaborating agents rather than hand-seeding
a supposedly mature brain.

## Do the baseline arms get Serena and GitNexus too?

No — and that is disclosed rather than hidden: the Salvor arms measure the
**recommended stack as a system** (Salvor + Serena + GitNexus), not Salvor
core isolated. Component ablation is on the post-beta roadmap. Each arm's
allowed/forbidden MCP namespaces are a committed policy
([`benchmarks/conf/mcp-policy.yaml`](../benchmarks/conf/mcp-policy.yaml)),
enforced by verification, with one deliberate nuance: S2's memory server is
its *treatment*, so S2 is never described as an MCP-clean baseline.

## Why did Salvor not beat the baselines in the beta benchmark?

The benchmark did not establish an uplift. In the single-agent curriculum, the
stateless S1 arm resolved 19/19 while S2 and S3 each resolved 18/19. With one
run per condition, that one-task observed difference does not estimate a
reliable treatment effect, and the saturated stateless arm left essentially no
positive-resolution headroom at this model capability.

In CooperBench, solo C1 resolved 27/50 while both cooperative C2 and
Salvor-treated C3 resolved 7/50. Salvor recovered none of the coordination gap,
and C3 cost more and took longer. Telemetry also showed only one brain read,
zero writes, and no MCP calls across 100 C3 invocations. **Availability is not
utilization**, but low utilization does not change the scored negative result.

## What remains unvalidated, and what does the longitudinal RFC test?

Short coding benchmarks can demonstrate memory effects when earlier knowledge
is deliberately made relevant later. This beta instead tested short,
cold-start conditions with minutes-old, task-blind brains. It did not naturally
create mature project history: old failures resurfacing, rationale surviving
many refactors, project aging, changing dependencies, or multi-vendor teams
working across long periods.

The scored null and negative results remain binding for the treatment that ran.
They do not answer whether accumulated, governed engineering knowledge improves
fresh-agent performance as real projects evolve. The open
[advanced benchmarking RFC](https://github.com/dwasyluk/salvor/issues/5)
defines a protocol-neutral longitudinal experiment for that still-open
question; it is research, not a shipped capability.

## Were any benchmark runs cherry-picked or rerun until favorable?

No. Every attempted unit is preserved (failed attempts are archived in the
run tree, not deleted), every attempt is billed in a tamper-evident hash-chained
cost ledger, infrastructure failures are classified separately from benchmark
negatives under committed rules, and deterministic benchmark failures are
never retried. `summary.json` is stamped incomplete until every arm's frozen
population is fully evaluated, and the public surfaces are contract-tested to
show nothing until it is.

## What is the simplest one-line answer?

Salvor is a repo-native engineering knowledge layer — an institutional brain
for the codebase — so future agents inherit reviewed decisions, rationale,
failures, constraints, and provenance instead of reconstructing what the
project already learned.
