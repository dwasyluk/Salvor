<div align="center">

<h1><img src="assets/brand/generated/salvor-readme-lockup.png" width="520" alt="Salvor"/></h1>

**A repo-native engineering knowledge layer for coding agents and software teams.**

[![release](https://img.shields.io/static/v1?label=release&message=v1.0.0-beta&color=blue)](https://github.com/dwasyluk/salvor/releases)
[![license: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![works with](https://img.shields.io/badge/works%20with-Claude%20Code%20·%20Codex%20·%20Gemini%20CLI%20%2F%20Antigravity-8A2BE2)](./docs/VENDOR_ADAPTERS.md)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](./CONTRIBUTING.md)

*Git preserves what changed. Salvor preserves what the project learned.*

</div>

---

## The engineering problem

The models are getting very good at coding. Re-teaching every fresh session
what the project already learned is still a terrible engineering workflow.

A new agent can inspect functions, dependencies, commits, and tests. It can
still miss that a plausible approach failed three sessions ago, an odd-looking
implementation protects a vendor quirk, an architectural constraint must
survive the next refactor, or a teammate already investigated the same issue.
Context rotation, subagents, handoffs, parallel branches, new contributors, and
vendor changes all create another opportunity to rediscover, re-litigate, or
quietly lose that knowledge. Fresh sessions often lack a reviewed, team-shared
record of the project's accumulated reasoning.

**Source state and engineering knowledge are different forms of project state.**
Git is excellent at preserving code, commits, patches, branches, and file
history. Those artifacts do not reliably preserve why implementation A won
over B, which failure should never be retried, what was learned from an
incident, which constraint was established experimentally, or what work was
deliberately deferred. Salvor gives that engineering knowledge a durable,
reviewable home alongside the source it explains.

## Salvor's answer

Salvor is a **repo-native engineering knowledge layer and governance protocol
for coding agents** — an institutional brain that lives with the code. It
preserves human-approved decisions, domain learnings, failed approaches,
operational lessons, SOPs, and deferred findings, including the rationale
behind them. Fresh sessions, subagents, and distributed teammates can continue
from reviewed project knowledge instead of reconstructing the project's mental
model from source and chat fragments.

That is broader than generic agent memory. Agent memory is generally
optimized to retain and recall prior information. We use **persistent
engineering cognition** to describe the durable, governed project knowledge
that lets humans and agents carry forward not just what happened, but what the
project learned — decisions, rationale, failures, constraints, rules, and
provenance — across sessions, contributors, branches, and models. It governs
which project knowledge remains authoritative, why it matters, how it changes,
and how it survives the people or agents that first learned it. Salvor
externalizes that project cognition; it does not modify an agent's intrinsic
reasoning or intelligence.

Broadly, RAG retrieves external information, agent memory retains prior
experience, and context engineering curates what enters the active context.
Salvor focuses additionally on what durable project knowledge should exist,
when it may be promoted, how that promotion is approved and reviewed, how
contradictions are reconciled, and which version remains authoritative. That
lifecycle includes provenance, rationale, branch and team propagation,
contradiction handling, supersession, and retrieval by later sessions. This is
an emerging field; “persistent engineering cognition” is Salvor's term for the
capability, not an asserted industry standard.

It is **prompt-first**: paste one setup prompt, answer four setup questions, and
your project gains a hub-and-spoke context layer, a two-tier persisted memory,
a rules protocol, and user-approved capture gates that record knowledge *and
the reasoning behind it* as you work. Upgrades honor the same boundary:
a newer setup prompt refreshes Salvor's protocol layer and is designed to
preserve accumulated project knowledge; any approved schema, metadata, link,
or identifier migration remains explicit and reviewable. The shared brain is vendor-agnostic:
everything lives as plain Markdown in your repo, owned by no LLM vendor and
reviewable in PRs, diffable, and branchable. Thin adapters make that same brain
vendor-portable, so teams can switch supported agents without migrating their
project knowledge. Setup generates contract-tested entrypoints for Claude Code,
Codex, and GEMINI.md-compatible clients. Claude Code remains the most deeply
dogfooded path; Codex and Google entrypoints are covered by the shared adapter
contracts and documented for the beta, with less real-project dogfooding to
date. No hosted service, no additional account.

The important question is no longer whether an agent can remember. The question
is which engineering knowledge becomes durable, who owns it, how it is reviewed,
and whether it survives a change of agent or vendor. Salvor does not claim to be
the first or only answer. It is one opinionated attempt to make the
repository-knowledge layer coherent:
repository-local canonical truth, Git-native review, structured knowledge
classes, governed capture, explicit merge/reconcile semantics, thin vendor
adapters, and a clean boundary between canonical knowledge, retrieval aids,
and machine-derived code intelligence. The claims are meant to stay
inspectable — and falsifiable.

## Salvor compounds

**Salvor is only as useful as the engineering knowledge available to it.** Its
value depends on the maturity of the project brain, not simply how long Salvor
has been installed:

- **Greenfield project** — Salvor starts thin and grows alongside the code as
  architecture decisions, implementation choices, failures, SOPs, and domain
  discoveries emerge. Knowledge begins compounding from the first real work.
- **Mature repository, deliberate adoption** — existing READMEs, documentation,
  ADRs, changelogs, postmortems, runbooks, and project instructions can seed the
  brain immediately. Setup inventories committed sources, proposes reviewed
  section-level mappings, preserves source ownership, and asks before promotion
  or mutation. The operator can supply missing context during that review.
- **Mature repository, minimal adoption** — Salvor begins with what setup can
  legitimately derive from repository structure and what future work teaches
  it. Undocumented historical rationale remains undocumented until someone
  supplies it or engineering work rediscovers it.

**Structure can often be derived. Rationale needs evidence. Salvor cannot
preserve knowledge it has never been given or had a chance to learn.**

[Adopt the knowledge your project already has →](#adopt-the-knowledge-you-already-have)

## The three capture classes

Salvor's defining move: the agent **notices** knowledge worth keeping and,
in the default mode, **asks you, verbatim, before ratifying it as durable
project knowledge**. Routine L1/L2 operational state updates are maintained
automatically as working memory. The experimental provisional mode described
later may write explicitly unreviewed captures, but they do not become
authoritative without human ratification.

| Capture class | What it preserves | The agent asks… | Lands in |
|---|---|---|---|
| **Decision / Domain Learning** | **Design Decision** — an architecture or design choice + its rationale. **Domain Learning** — a validated discovery about your domain or system. | `"Record this as a design decision? (yes/no)"` · `"Save this as a domain learning? (yes/no)"` | `.salvor/decisions/` · `.salvor/domain-learnings/` |
| **Learned Failure (`LF:<slug>`)** | A disproven approach or recurring failure mode + root cause — so no future session retries it. | *(via the same capture flow)* | `DOMAIN_REF.md` `LF:` registry + `.salvor/postmortems/` |
| **Deferred Finding** | An out-of-scope observation or risk — parked, not dropped. | `"Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"` | `.salvor/DEFERRED_TODOS.md` |

"What we decided," "how we failed," and "what we noticed but parked" are
different kinds of knowledge — Salvor gives each its own home.

## What gets generated: the `.salvor/` tree

The scaffold Salvor creates in your repo:

```text
.salvor/
├── active_state.md            # L1 — concise current state (auto-maintained working memory)
├── active_state_verbose.md    # L2 — deep archive: reasoning, history, rejected hypotheses
├── DOMAIN_REF.md              # domain reference + Learned Failure (LF:) registry
├── INFRA.md                   # infrastructure & operations notes
├── DEFERRED_TODOS.md          # deferred findings, parked not dropped
├── README.md                  # explains this directory to humans
├── decisions/                 # user-approved design decisions
├── domain-learnings/          # user-approved domain learnings
├── postmortems/               # learned-failure postmortems
└── archive/                   # EXPERIMENTAL — parked (never discarded) unratified agent contributions
```

Plus vendor entrypoints at the repo root: `CLAUDE.md` is the canonical
cross-vendor hub, while thin `AGENTS.md` (Codex and other AGENTS.md-compatible
agents) and `GEMINI.md` adapters
route other supported agents to that same shared brain. [`RULES.md`](./RULES.md) provides
the governance protocol. When the optional Strict defaults are enabled,
Salvor also generates per-component counters in `VERSION.md`; otherwise it
uses the project's established version source or a minimal history artifact.
The vendor-named hub filename is an implementation detail of the most deeply
dogfooded adapter, not a boundary on which models can use Salvor.

## Quickstart

```text
1. Open your coding agent in the project where you want to add Salvor (new or existing).
2. Paste the contents of SETUP_PROMPT.md.
3. The agent inspects your existing files first, then asks its four setup questions
   (1. project name · 2. components + stack hints · 3. optional paired-path parity —
   a live↔mirror file pair that must always change together
   · 4. whether to enable optional Strict engineering defaults).
4. In an existing repo, it inventories likely knowledge sources and can map
   selected sections now—or later on demand—without changing the originals.
5. It scaffolds the Salvor structure, then OFFERS a reviewed commit — it never
   auto-commits and never runs a blanket `git add -A`. You review, you approve.
6. Done — your repo now carries the Salvor knowledge layer and can begin
   accumulating reviewed engineering knowledge as the project evolves.
```

Setup works in **Core mode** even if no MCP tools are present — see
[Core vs enhanced](#core-vs-enhanced-mode) below. The whole installer is one
file: **[`SETUP_PROMPT.md`](./SETUP_PROMPT.md)**.

**Upgrading is the same move:** paste a newer `SETUP_PROMPT.md` and Step 0
reads the `Salvor-Protocol:` stamp in your `.salvor/README.md`, then proposes
only the protocol deltas. The process is designed to preserve accumulated
project knowledge; any identifier, header, link, or metadata migration is
proposed separately, and customized rules are merged with your approval. Works from any supported
vendor's CLI; future plugins wrap the same path. Details:
**[`docs/UPGRADING.md`](./docs/UPGRADING.md)**.

## Adopt the knowledge you already have

Existing project documentation does not need to be rewritten or moved into a
new Salvor-owned `docs/` folder. During setup—or later, whenever you ask—Salvor
can inventory selected `docs/`, READMEs, ADRs, architecture/design notes,
CHANGELOGs, postmortems/incident reports, runbooks, and agent instructions,
then propose a reviewed **section-level adoption map**.

One source document may contain several kinds of knowledge. Salvor maps each
relevant section independently: a decision can become a decision artifact, an
empirical finding a Domain Learning, a failed approach a postmortem/LF entry,
operational material an `INFRA.md` update, and mature project documentation can
remain canonical exactly where it is with only a link from Salvor.

Each proposed mapping shows the source section, destination, canonical owner,
ownership action, and exact Markdown before anything is written. Unrelated
promotions are approved individually through the existing capture gates.
Original files remain untouched unless you separately approve their mutation.
For example:

> “Adopt project knowledge from `docs/architecture.md` and
> `docs/incidents/`, but leave the source files unchanged.”

## See it populated

**[View a populated example → `example-project/`](./example-project/)** — a
tiny, real, runnable two-component app with Salvor fully applied: the hub +
spokes, L1/L2, `VERSION.md`, a populated `.salvor/` tree with real decisions,
a domain-learning artifact, a postmortem, and deferred findings, plus real
code for the enhanced-mode tools to index.

## Core vs enhanced mode

| | What it is | What you get |
|---|---|---|
| **Salvor Core** | Repository files + vendor entrypoints only. No MCP servers required. | Persistent, Git-reviewed engineering knowledge: capture classes, L1/L2 state, hub-and-spoke context, rules protocol. Optional per-component versioning when the Strict defaults profile is enabled. |
| **Salvor enhanced** | Core **plus** [Serena](https://github.com/oraios/serena) and [GitNexus](https://github.com/abhigyanpatwari/GitNexus). | Adds semantic symbol navigation (Serena) and graph impact analysis before edits (GitNexus). |

Every claim about Salvor's engineering knowledge and governance in this README
holds in **Core** mode.
Claims about symbol-level navigation, "what breaks if I change this?" impact
analysis, and code-graph awareness require **enhanced** mode. Serena and
GitNexus are optional and recommended when those capabilities fit the work.

## Lifecycle: the Salvor Loop

At the product level, Salvor's loop is: adopt existing knowledge, learn through
engineering work, preserve ratified knowledge as repository state, retrieve it
for future sessions, and supersede or reconcile it when the truth changes —
without erasing provenance.

Each session starts by loading the hub and L1 state — the compressed,
reviewed "now" of the project. As work proceeds, the agent navigates code
(enhanced mode adds symbol- and graph-level intelligence), and when it
surfaces something durable, a capture gate asks you before anything is saved.
Finishing a task means updating L1/L2, the affected component spoke, and the
configured project-history or version artifact when applicable — so the
project knowledge stays tied to the code it describes. Salvor is designed so
the next session can start from reviewed knowledge instead of reconstructing
it from scratch.

<p align="center">
  <img src="assets/salvor-loop.svg" width="900" alt="The Salvor Loop: nine phases build context, act, and feed durable knowledge back into the repository brain, contrasted with an agent that starts cold without Salvor."/>
</p>

*Every approved capture gives the next session more context.*

Full write-up of the five pillars in
**[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)**.

## Salvor on Salvor

This repository carries its own Salvor brain. That is an inspectable
dogfooding example, not a benchmark or an independent performance claim. It
shows the practical handoff Salvor is designed to preserve:

| Engineering event | Durable project knowledge | What a later session inherits |
|---|---|---|
| A feature was merged directly to the release branch and inverted the intended promotion flow. | [`RULES.md`](./RULES.md) now carries the dev-first branch/PR SOP; [`DEC:dev-first-branch-flow`](./.salvor/decisions/2026-08-18-dev-first-branch-flow.md) preserves why. | Branch from `dev`, reconcile before review, merge back to `dev`, and let the reviewer delete the branch — without rediscovering the policy. |
| Installing into a mature repository risked overwriting the knowledge Salvor was meant to protect. | The [preservation-first adoption decision](./.salvor/decisions/2026-07-30-preservation-first-existing-repository-adoption.md) records the approved invariant. | Reuse existing hubs, rules, Serena/GitNexus state, and docs in place; show an adoption map before mutation. |
| GitNexus versions differed in whether analysis injected context files or generated skills. | [`SETUP_PROMPT.md`](./SETUP_PROMPT.md) and the project hub retain the tested capability-detection and index-only rationale. | Detect `--index-only`; use pure indexing when supported; never let a derived code index silently rewrite the canonical brain. |

These examples matter not because Salvor knew them at installation, but because
the repository accumulated them through actual engineering work and later
sessions inherited them.

The pattern is the product: engineering work produces a decision, learning, or
failure; the repository keeps its reviewed rationale; the next agent receives
it when relevant. That reduces rediscovery and regression risk. It does not, by
itself, prove a universal performance uplift.

## Longitudinal validation

Salvor's core hypothesis is longitudinal: reviewed engineering knowledge
accumulated across sessions, contributors, decisions, failures, and project
history should remain useful to later work.

Long-horizon agent-memory evaluation is evolving rapidly. Existing methods
cover important adjacent settings, including coding and multi-session
reliability, but we have not yet established Salvor's effect with an evaluation
that directly reproduces its mature-repository, repository-governed knowledge
model. As suitable coding-oriented longitudinal methods mature, we will publish
reproducible results here.

Earlier exploratory short-horizon experiments remain archived under
[`benchmarks/`](./benchmarks/) for reproducibility and transparency. They are
not presented as validation of Salvor's longitudinal value proposition. See the
[`methodology`](./benchmarks/METHODOLOGY.md),
[`exploratory beta report`](./benchmarks/results/beta/REPORT.md), and live
[`advanced benchmarking RFC`](https://github.com/dwasyluk/salvor/issues/5).

## enhanced mode: Serena + GitNexus

Two optional local tools add code intelligence to Salvor Core to pair with
Salvor's knowledge layer. Neither is affiliated with Salvor; both run locally
for their documented core workflows.

### 🧠 Serena — semantic symbol navigation

Lets your agent navigate code **by symbol** (definitions, callers,
references) and make targeted edits instead of re-reading whole files.

```bash
uv tool install -p 3.13 serena-agent
serena init
```

Then follow the [Serena README](https://github.com/oraios/serena) for your
client's MCP configuration. Serena also has its own optional memory feature:
in a Salvor project, `.serena/memories/` holds **retrieval pointers** into the
codebase, while `.salvor/` stays the **canonical** engineering record.

### 🕸️ GitNexus — graph impact analysis

Builds a knowledge graph of your code (symbols, relationships, execution
flows) so the agent can ask **"what breaks if I change this?"** before
editing.

```bash
npm install -g gitnexus
```

GitNexus is a third-party project with its own license. Its current community
license is PolyForm Noncommercial; review the upstream license or enterprise
terms before anticipated commercial use. Salvor Core does not require GitNexus.

No account is needed for core indexing and impact analysis. (The optional
`gitnexus wiki` doc generator wants an LLM API key.) Docs:
[github.com/abhigyanpatwari/GitNexus](https://github.com/abhigyanpatwari/GitNexus).

## Multi-agent & distributed teams

Salvor's project knowledge travels the same way your code does: through Git —
and the protocol defines what happens when two branches grow the brain in
parallel.

- **Distributed teammates** — a colleague's agent in another timezone reads
  the same reviewed decisions, learned failures, and deferred findings you
  approved, because they're in the repo, not in someone's local tool state.
- **Mixed vendors** — `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` entrypoints are
  generated by default, so Claude Code, Codex, and Gemini CLI / Antigravity CLI
  — Google's coding-agent entrypoint using the compatible `GEMINI.md`
  project-context file — teammates all inherit one canonical hub. Switch
  vendors next year; the project knowledge stays.
- **Self-allocating knowledge IDs** — every capture gets a self-allocating slug
  ID (`LF:stale-note-reference`, `DEC:store-returns-copies`,
  `deferred:no-persistence`) with a structured Subject/Claim header. No
  sequential counters, so parallel branches never race "the next number" —
  and if two developers do pick similar slugs for the same discovery, Brain
  Reconcile catches the overlap by subject at merge time ([`RULES.md`](./RULES.md)
  §10.1–§10.2).
- **Brain Reconcile** — at merge and pull points, incoming knowledge is
  compared *semantically* against what's already there: paired by subject
  tags, classified as distinct / duplicate / overlapping / contradictory /
  superseding, and every merge of durable knowledge is operator-gated.
  Contradictions must resolve to exactly one live entry — the brain never
  carries two conflicting truths ([`RULES.md`](./RULES.md) §10.2, §10.4).
- **Brain Audit** — a recurring semantic self-audit (default every 3 days,
  operator-tunable) sweeps the whole brain for near-duplicates,
  contradictions, stale state, and dangling links that no single merge could
  see ([`RULES.md`](./RULES.md) §10.3).
- **Review as governance** — because capture artifacts are files, a PR review
  of the project knowledge *is* the team's approval process. Bad captures get
  caught the same way bad code does.

### 🧪 Experimental: agentic provisional capture (off by default)

Salvor's capture gates normally require your verbatim approval *before* any
durable write. The experimental `AGENT_CAPTURE = provisional` mode
([`RULES.md`](./RULES.md) §10.5) moves that approval from **before the write** to **before
ratification**: agents may capture Domain Learnings, Learned Failures, and
Deferred Findings autonomously — useful for overnight runs and subagent
fleets — but everything they write is explicitly identifiable
(`Contributed-by: agent — <vendor/model>` provenance headers, a
`Salvor-Contribution: agent` commit trailer) and enters a visibly lower trust
tier (`Review: unreviewed`): treated by every agent as hypothesis rather than
invariant, unable to override ratified knowledge or touch [`RULES.md`](./RULES.md), and
surfaced item-by-item for human ratification by the recurring Brain Audit.
Nothing is ever silently discarded — rejected or aged-out contributions move
to `.salvor/archive/` (default 90 days, tunable), which agents never load.
It is **off by default**, vendor-agnostic like everything else (the trust
state travels in the Markdown, not in any vendor's tooling), and its
graduation criteria are tracked in
[issue #1](https://github.com/dwasyluk/salvor/issues/1) — field reports
welcome.

## Spec Kit coexistence

[GitHub Spec Kit](https://github.com/github/spec-kit) and Salvor solve
adjacent problems and work well together: Spec Kit governs the future-facing
spec → plan → tasks → implement workflow for *what should be built*; Salvor
preserves the longitudinal engineering knowledge accumulated while the system
evolves. Use Spec Kit to drive a feature forward; use Salvor so the reasoning,
failures, and validated learnings from building it survive into every later
session. More in **[`docs/FAQ.md`](./docs/FAQ.md)**.

## How Salvor relates to other tools

Not "another AI second brain" — a different job. Most memory tools serve a
person or a runtime; Salvor serves a repository. By job-to-be-done:

| Tool | Primary job | Relationship to Salvor |
|---|---|---|
| [GitHub Spec Kit](https://github.com/github/spec-kit) | Future-facing spec → plan → tasks → implement workflow | Complementary: Spec Kit governs what should be built; Salvor preserves the longitudinal engineering knowledge accumulated while the system evolves. |
| [Serena](https://github.com/oraios/serena) | Semantic code intelligence, with an optional memory substrate | Salvor decides *what gets promoted* to durable engineering knowledge and owns the canonical artifacts; Serena's memories serve as retrieval pointers. |
| [GitNexus](https://github.com/abhigyanpatwari/GitNexus) | Code knowledge graph + impact analysis | GitNexus remembers how the code is connected. Salvor preserves why the team made it that way. |
| [Claude Code Projects (beta)](https://code.claude.com/docs/en/claude-projects) | Claude-native long-running development orchestration and coordination: one conversation coordinates parallel Claude Code cloud threads, each on its own branch | Shared Project memory across threads plus Project instructions and files; strong orchestration that Salvor does not replace. It is a Claude-native control plane rather than a cross-vendor repo-owned memory protocol. The relationship is complementary with overlap: Projects coordinates ongoing Claude work and maintains shared Project memory; Salvor provides repo-owned engineering knowledge that is Git-reviewed, provenance-aware, and portable across supported tools. Project memory remains separate from repository `CLAUDE.md`. |
| Other vendor memory (Codex / Gemini / Copilot and similar project instructions & memories) | Tool- or workspace-specific continuity, facts, and preferences | Useful alongside Salvor. Salvor's concern is selected engineering knowledge that should be repository-owned, Git-reviewed, provenance-aware, and portable across supported tools. |
| [Cline Memory Bank](https://docs.cline.bot/prompting/cline-memory-bank) | Structured, repository-local documentation methodology usable across AI tools (commands and integrations vary) | Adjacent approach — both use structured repository-local Markdown for continuity. Salvor additionally defines gated promotion into durable team knowledge, separate decision/learning/failure/deferred lifecycles, canonical ownership rules, and optional Serena/GitNexus orchestration. |
| [Obsidian](https://obsidian.md) | General knowledge vault shaped around a person or team | Salvor is a repo-local protocol with capture gates and code-intelligence integration, not a general vault. |
| [Google ADK](https://google.github.io/adk-docs/) | Runtime framework for *building* agents | Orthogonal: Salvor helps teams retain repo reasoning while building software — including ADK software. |

Deeper comparisons (RAG, plain `CLAUDE.md`, memory runtimes, and more) in
**[`docs/FAQ.md`](./docs/FAQ.md)**.

## Who it's for — honestly

Salvor pays off where knowledge compounds:

- **Repeated agent use in the same repo** — project knowledge grows with every
  session.
- **Long-lived, multi-component codebases** — where "why is it like this?" is a
  daily question.
- **Distributed teams** — reviewed knowledge instead of tribal knowledge.
- **Vendor switchers** — the record outlives any one tool.

It is honestly unnecessary for disposable prototypes, one-off scripts, or
repos you'll only ever open in a single session. If there's no second session,
there's nothing to salvage.

## Security & privacy

Salvor introduces no hosted service or additional account. Serena and GitNexus
operate locally for their documented core workflows. Your selected coding
agent and model provider may still process repository content according to
their configuration and data-handling policies.

Never store secrets, credentials, or keys in `.salvor/` — it is committed,
shared project knowledge. And because Salvor files are agent-readable
instructions, review PRs that touch them with the same rigor as code. See
[`SECURITY.md`](./SECURITY.md) for the trust boundaries, prompt-injection
guidance, and reporting details.

## Community & feedback

Salvor v1.0.0-beta is an intentionally early release. Bugs, rough edges,
questions, suggestions, and real-world results are all useful.

Join the shared conversation in
[GitHub Discussions](https://github.com/dwasyluk/salvor/discussions). Follow
[`@SalvorKnows`](https://x.com/SalvorKnows) on X for project updates, release
notes, community discussion, and ongoing Salvor development. Actionable bugs
and scoped features move into
[GitHub Issues](https://github.com/dwasyluk/salvor/issues); pull requests are
welcome.

**SALVOR** — Official Salvor token on Solana · [`4KxtNWc5XTL3cuyc8PJMchqB6RYggvEFeMub727GBAGS`](https://solscan.io/token/4KxtNWc5XTL3cuyc8PJMchqB6RYggvEFeMub727GBAGS) · [Bags](https://bags.fm/4KxtNWc5XTL3cuyc8PJMchqB6RYggvEFeMub727GBAGS)

Any other token claiming affiliation with Salvor is unofficial.

## Contributing & roadmap

Salvor v1 is the foundation, not the finish line. The point of open-sourcing
it is to build the harder pieces together — issues tagged
[`help wanted`](https://github.com/dwasyluk/salvor/labels/help%20wanted) and
[`good first issue`](https://github.com/dwasyluk/salvor/labels/good%20first%20issue):

- **🧬 L1/L2 as embeddings** — a pluggable vector-DB backend for
  similarity-based retrieval of prior reasoning, with Markdown remaining the
  git-shared source of truth.
- **🌲 First-class git-worktree support** — the [`RULES.md`](./RULES.md) §10 Brain Reconcile
  conventions now define merge-friendly behavior across branches; remaining
  work is a helper that automates reconciliation across live worktrees.
- **🧠 Sub-brains → master brain** — scoped per-agent ledgers that roll durable
  learnings up to the project's shared L1/L2, gated by the same capture classes
  and deduplicated through the same §10.4 semantic comparison.
- **🩺 Salvor health checks** — a tooling wrapper for the [`RULES.md`](./RULES.md) §10.3
  Brain Audit: lint project knowledge for semantic duplicates/contradictions, stale L1
  lines, unresolved
  `LF:` entries, broken links, aging deferred findings, drift in the hand-authored
  GitNexus routing note, unsafe/unexpected `.gitnexusrc` changes, stale or missing
  index state, unexpected context-file injection, unexpected generated skills/hooks,
  and component spokes that fell behind the code.
- **🔌 More vendor adapters** — harden the Codex & Gemini entrypoints; add
  Cursor / OpenCode / others.
- **🧩 Vendor plugins** — a Claude Code plugin (a convenience wrapper over the
  same universal `SETUP_PROMPT.md`) is targeted for v1.1.0. Always a wrapper,
  never a replacement for the paste-anywhere floor that keeps Salvor
  vendor-portable. The project will also evaluate packaging against the
  emerging cross-vendor
  [Agent Plugins](https://agent-plugins.org/specification) standard (skills +
  MCP servers in one portable folder) to reduce duplication across clients
  that support it, while retaining vendor-specific wrappers where required.
  Codex and Gemini equivalents are open for contributors. **P1 validation:**
  exercise the Claude Code plugin inside Claude Code Projects cloud threads,
  including repository `.salvor/` and `CLAUDE.md` loading, plugin behavior, and
  the availability boundaries for optional Serena/GitNexus capabilities.

Contributions welcome beyond the roadmap too:

- 🐛 **Validated bugs and scoped features** — [open an issue](https://github.com/dwasyluk/salvor/issues).
- 💬 **Questions, early ideas, help, and showcases** — join
  [GitHub Discussions](https://github.com/dwasyluk/salvor/discussions), or see
  [Community & feedback](#community--feedback) for the X option.
- 🔧 **PRs** — especially new **vendor adapters** and **example projects** in
  other stacks. See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Why "Salvor"?

A *salvor* is someone who recovers what would otherwise be lost. The name is
also an unofficial nod to Salvor Hardin from Isaac Asimov's
[*Foundation* series](https://en.wikipedia.org/wiki/Foundation_series) — a
story deeply interested in how knowledge survives as people, systems, and
circumstances change. At repository scale, the ambition is humbler than
psychohistory: keep the project's hard-won engineering knowledge alive long
enough for the next agent to use it. No association or endorsement is implied.

<p align="center">
  <img
    src="assets/brand/reference/foundation_ref_assets/salvor_artifact_expansion.png"
    alt="Salvor Hardin accessing a psychohistory artifact — a Foundation-inspired visual reference for durable project knowledge carried forward across time."
    width="960">
</p>

<p align="center">
  <em>Foundation-inspired visual reference: Salvor Hardin accessing the artifact — an echo of project knowledge carried forward in a durable, inspectable form.</em>
</p>

## Docs

- [`SETUP_PROMPT.md`](./SETUP_PROMPT.md) — the one-shot installer
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — the five pillars
- [`docs/UPGRADING.md`](./docs/UPGRADING.md) — the protocol stamp and version-aware upgrades
- [`docs/VENDOR_ADAPTERS.md`](./docs/VENDOR_ADAPTERS.md) — Codex, Gemini, and beyond
- [`docs/FAQ.md`](./docs/FAQ.md) — full comparisons and common questions

## License

[MIT](./LICENSE) © 2026 Dan Wasyluk.

Salvor's code and documentation are MIT licensed. The Salvor name, logo,
wordmark, and official brand artwork are governed by
[TRADEMARKS.md](./TRADEMARKS.md).

Serena and GitNexus are third-party projects that keep their own licenses —
GitNexus's current community license is PolyForm Noncommercial. Review their
upstream terms before commercial use.

<div align="center">
<img src="assets/brand/generated/salvor-logo-black.svg" width="72" height="72" alt=""/>
<br/>
<sub>Salvage your knowledge before it's lost to the next session.</sub>
</div>
