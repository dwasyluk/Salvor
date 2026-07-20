<div align="center">

<img src="assets/salvor-logo-badge.png" width="120" alt="Salvor — the Prime Radiant"/>

# Salvor

### A repo-native engineering memory and governance protocol for coding agents.

[![release](https://img.shields.io/badge/release-v1.0.0-blue)](https://github.com/dwasyluk/salvor/releases)
[![license: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![works with](https://img.shields.io/badge/works%20with-Claude%20Code%20·%20Codex%20·%20Gemini%20CLI%20%2F%20Antigravity-8A2BE2)](./docs/VENDOR_ADAPTERS.md)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](./CONTRIBUTING.md)

*Salvage your project's knowledge before it's lost to the next session.*

</div>

---

## The problem

Code shows an agent what exists. It rarely preserves *why*.

A fresh coding-agent session can rediscover functions and dependencies. It
cannot reliably recover why an architecture was chosen, which plausible
approaches already failed, what a teammate validated earlier, or what was
intentionally deferred. Every session starts without your project's
accumulated reasoning — and re-derives, re-litigates, or quietly loses it.

Salvor gives that engineering knowledge a durable, reviewable home in the
repository.

## Salvor's answer

Salvor is a **repo-native engineering memory and governance protocol for
coding agents**. It preserves human-approved decisions, domain learnings,
failed approaches, and deferred findings in Git — so fresh sessions and
distributed teammates can continue from reviewed knowledge instead of
reconstructing it.

It is **prompt-first**: paste one setup prompt, answer four setup questions, and
your project gains a hub-and-spoke context layer, a two-tier persisted memory,
a rules protocol, and user-approved capture gates that record knowledge *and
the reasoning behind it* as you work. Everything lives as plain Markdown in
your repo — reviewable in PRs, diffable, branchable, vendor-neutral. No hosted
service, no additional account.

## The three capture classes

Salvor's defining move: the agent **notices** knowledge worth keeping and
**asks you, verbatim, before saving it**. Durable capture is user-approved —
never silent, never automatic. (Routine L1/L2 operational state updates the
agent maintains automatically; those are working memory, not durable capture.)

| Capture class | What it preserves | The agent asks… | Lands in |
|---|---|---|---|
| **Decision / Domain Learning** | **Design Decision** — an architecture or design choice + its rationale. **Domain Learning** — a validated discovery about your domain or system. | `"Record this as a design decision? (yes/no)"` · `"Save this as a domain learning? (yes/no)"` | `.salvor/decisions/` · `.salvor/domain-learnings/` |
| **Learned Failure (LF#)** | A disproven approach or recurring failure mode + root cause — so no future session retries it. | *(via the same capture flow)* | `DOMAIN_REF.md` LF# registry + `.salvor/postmortems/` |
| **Deferred Finding** | An out-of-scope observation or risk — parked, not dropped. | `"Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"` | `.salvor/DEFERRED_TODOS.md` |

"What we decided," "how we failed," and "what we noticed but parked" are
different kinds of knowledge — Salvor gives each its own home.

## What gets generated: the `.salvor/` tree

The scaffold Salvor creates in your repo:

```text
.salvor/
├── active_state.md            # L1 — concise current state (auto-maintained working memory)
├── active_state_verbose.md    # L2 — deep archive: reasoning, history, rejected hypotheses
├── DOMAIN_REF.md              # domain reference + Learned Failure (LF#) registry
├── INFRA.md                   # infrastructure & operations notes
├── DEFERRED_TODOS.md          # deferred findings, parked not dropped
├── README.md                  # explains this directory to humans
├── decisions/                 # user-approved design decisions
├── domain-learnings/          # user-approved domain learnings
└── postmortems/               # learned-failure postmortems
```

Plus vendor entrypoints at the repo root — `CLAUDE.md` (canonical hub) with
thin `AGENTS.md` (Codex) and `GEMINI.md` pointer files — and `RULES.md` +
`VERSION.md` for the governance protocol.

## Quickstart

```text
1. Open your coding agent in the project you want to give a memory to (new or existing).
2. Paste the contents of SETUP_PROMPT.md.
3. The agent inspects your existing files first, then asks its four setup questions
   (1. project name · 2. components + stack hints · 3. optional paired-path parity
   · 4. whether to enable optional Strict engineering defaults).
4. It scaffolds the Salvor structure, then OFFERS a reviewed commit — it never
   auto-commits and never runs a blanket `git add -A`. You review, you approve.
5. Done — your repo now carries its own reviewed engineering memory.
```

Setup works in **Core mode** even if no MCP tools are present — see
[Core vs Enhanced](#core-vs-enhanced-mode) below. The whole installer is one
file: **[`SETUP_PROMPT.md`](./SETUP_PROMPT.md)**.

## See it populated

**[View a populated example → `example-project/`](./example-project/)** — a
tiny, real, runnable two-component app with Salvor fully applied: the hub +
spokes, L1/L2, `VERSION.md`, a populated `.salvor/` tree with real decisions,
a domain-learning artifact, a postmortem, and deferred findings, plus real
code for the Enhanced-mode tools to index.

## Core vs Enhanced mode

| | What it is | What you get |
|---|---|---|
| **Salvor Core** | Repository files + vendor entrypoints only. No MCP servers required. | Persistent, Git-reviewed engineering memory: capture classes, L1/L2 state, hub-and-spoke context, rules protocol. Optional per-component versioning when the Strict defaults profile is enabled. |
| **Salvor Enhanced** | Core **plus** [Serena](https://github.com/oraios/serena) and [GitNexus](https://github.com/abhigyanpatwari/GitNexus). | Adds semantic symbol navigation (Serena) and graph impact analysis before edits (GitNexus). |

Every memory and governance claim in this README holds in **Core** mode.
Claims about symbol-level navigation, "what breaks if I change this?" impact
analysis, and code-graph awareness require **Enhanced** mode.

## Lifecycle: the Salvor Loop

Each session starts by loading the hub and L1 state — the compressed,
reviewed "now" of the project. As work proceeds, the agent navigates code
(Enhanced mode adds symbol- and graph-level intelligence), and when it
surfaces something durable, a capture gate asks you before anything is saved.
Finishing a task means updating L1/L2, the affected component spoke, and the
version record — so the memory stays tied to the code it describes. Salvor is
designed so the next session starts from reviewed knowledge instead of
reconstruction.

<p align="center">
  <img src="assets/salvor-loop.svg" width="900" alt="The Salvor Loop: nine phases build context, act, and feed durable knowledge back into the repository brain, contrasted with an agent that starts cold without Salvor."/>
</p>

*Every approved capture gives the next session more context.*

Full write-up of the five pillars in
**[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)**.

## Enhanced mode: Serena + GitNexus

Two optional local tools add code intelligence to Salvor Core to pair with
Salvor's memory. Neither is affiliated with Salvor; both run locally for their
documented core workflows.

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

Salvor's memory travels the same way your code does: through Git.

- **Distributed teammates** — a colleague's agent in another timezone reads
  the same reviewed decisions, learned failures, and deferred findings you
  approved, because they're in the repo, not in someone's local tool state.
- **Mixed vendors** — `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` entrypoints are
  generated by default, so Claude Code, Codex, and Gemini CLI / Antigravity CLI
  — Google's coding-agent entrypoint using the compatible `GEMINI.md`
  project-context file — teammates all inherit one canonical hub. Switch
  vendors next year; the memory stays.
- **Parallel agents** — capture gates keep concurrent sessions from silently
  overwriting each other's knowledge: durable writes are explicit, reviewed,
  and land as ordinary diffs you can merge like any other change.
- **Review as governance** — because capture artifacts are files, a PR review
  of the memory *is* the team's approval process. Bad captures get caught the
  same way bad code does.

## Spec Kit coexistence

[GitHub Spec Kit](https://github.com/github/spec-kit) and Salvor solve
adjacent problems and work well together: Spec Kit governs the future-facing
spec → plan → tasks → implement workflow for *what should be built*; Salvor
preserves the longitudinal engineering memory accumulated while the system
evolves. Use Spec Kit to drive a feature forward; use Salvor so the reasoning,
failures, and validated learnings from building it survive into every later
session. More in **[`docs/FAQ.md`](./docs/FAQ.md)**.

## How Salvor relates to other tools

Not "another AI second brain" — a different job. Most memory tools serve a
person or a runtime; Salvor serves a repository. By job-to-be-done:

| Tool | Primary job | Relationship to Salvor |
|---|---|---|
| [GitHub Spec Kit](https://github.com/github/spec-kit) | Future-facing spec → plan → tasks → implement workflow | Complementary: Spec Kit governs what should be built; Salvor preserves the longitudinal engineering memory accumulated while the system evolves. |
| [Serena](https://github.com/oraios/serena) | Semantic code intelligence, with an optional memory substrate | Salvor decides *what gets promoted* to durable memory and owns the canonical artifacts; Serena's memories serve as retrieval pointers. |
| [GitNexus](https://github.com/abhigyanpatwari/GitNexus) | Code knowledge graph + impact analysis | GitNexus remembers how the code is connected. Salvor preserves why the team made it that way. |
| Vendor memory (Claude Code / Codex / Gemini project instructions & memories) | Personal, tool-specific continuity and preferences | Salvor is the repository's reviewed, shared record — it survives vendor switches and is diffable in PRs. Use both. |
| [Cline Memory Bank](https://docs.cline.bot/prompting/cline-memory-bank) | Structured repo-memory methodology for an agent | Closest cousin. Salvor adds explicit capture approval, distinct knowledge classes, learned-failure retention, canonical ownership, and team governance. |
| [Obsidian](https://obsidian.md) | General knowledge vault shaped around a person or team | Salvor is a repo-local protocol with capture gates and code-intelligence integration, not a general vault. |
| [Google ADK](https://google.github.io/adk-docs/) | Runtime framework for *building* agents | Orthogonal: Salvor helps teams retain repo reasoning while building software — including ADK software. |

Deeper comparisons (RAG, plain `CLAUDE.md`, memory runtimes, and more) in
**[`docs/FAQ.md`](./docs/FAQ.md)**.

## Who it's for — honestly

Salvor pays off where knowledge compounds:

- **Repeated agent use in the same repo** — the memory grows with every session.
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
shared project memory. See [`SECURITY.md`](./SECURITY.md) for reporting and
details.

## Contributing & roadmap

Salvor v1 is the foundation, not the finish line. The point of open-sourcing
it is to build the harder pieces together — issues tagged
[`help wanted`](https://github.com/dwasyluk/salvor/labels/help%20wanted) and
[`good first issue`](https://github.com/dwasyluk/salvor/labels/good%20first%20issue):

- **🧬 L1/L2 as embeddings** — a pluggable vector-DB backend for
  similarity-based retrieval of prior reasoning, with Markdown remaining the
  git-shared source of truth.
- **🌲 First-class git-worktree support** — merge-friendly conventions so
  parallel agents across worktrees don't clobber the shared memory.
- **🧠 Sub-brains → master brain** — scoped per-agent ledgers that roll durable
  learnings up to the project's shared L1/L2, gated by the same capture classes.
- **🩺 Salvor health checks** — lint the memory for stale L1 lines, unresolved
  LF# entries, broken links, aging deferred findings, drifted GitNexus blocks,
  and component spokes that fell behind the code.
- **📥 Existing-repo adoption/import** — scan ADRs, READMEs, postmortems, and
  existing agent instruction files, then propose the initial Salvor structure.
- **🔌 More vendor adapters** — harden the Codex & Gemini entrypoints; add
  Cursor / OpenCode / others.
- **🧩 Vendor plugins** — a Claude Code plugin (a convenience wrapper over the
  same universal `SETUP_PROMPT.md`) is coming soon. Always a wrapper, never a
  replacement for the paste-anywhere floor that keeps Salvor vendor-agnostic.
  Codex and Gemini equivalents are open for contributors.

Contributions welcome beyond the roadmap too:

- 🐛 **Issues** and 💡 **feature requests** — [open one](https://github.com/dwasyluk/salvor/issues).
- 💬 **Questions / ideas** — [Discussions](https://github.com/dwasyluk/salvor/discussions).
- 🔧 **PRs** — especially new **vendor adapters** and **example projects** in
  other stacks. See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Why "Salvor"?

A *salvor* is one who salvages — someone who recovers what would otherwise be
lost. For the [Foundation](https://en.wikipedia.org/wiki/Foundation_(TV_series))
fans: Salvor Hardin kept the Foundation alive through its first crisis with
knowledge rather than force, and the Prime Radiant — the faceted gem in our
logo — is the device that carries the accumulated plan across generations. A
version-controlled record that preserves a codebase's reasoning across resets
is the same idea, scaled down to your repo. 🔷

## Docs

- [`SETUP_PROMPT.md`](./SETUP_PROMPT.md) — the one-shot installer
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — the five pillars
- [`docs/VENDOR_ADAPTERS.md`](./docs/VENDOR_ADAPTERS.md) — Codex, Gemini, and beyond
- [`docs/FAQ.md`](./docs/FAQ.md) — full comparisons and common questions

## License

[MIT](./LICENSE) © 2026 dwasyluk and Salvor contributors.

<div align="center">
<img src="assets/salvor-logo.svg" width="56" alt=""/>
<br/>
<sub>Salvage your knowledge before it's lost to the next session.</sub>
</div>
