<div align="center">

# 🛟 Salvor

### Give your codebase a memory — a version-controlled brain your whole team's AI shares.

[![release](https://img.shields.io/badge/release-v1.0.0-blue)](https://github.com/dwasyluk/salvor/releases)
[![license: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![works with](https://img.shields.io/badge/works%20with-Claude%20Code%20·%20Codex%20·%20Gemini-8A2BE2)](./docs/VENDOR_ADAPTERS.md)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](./CONTRIBUTING.md)

*Salvage your project's knowledge before it's lost to the next session.*

</div>

---

## What is this?

Out of the box, an LLM coding CLI **forgets everything between sessions.** The
*why* behind a decision a teammate made two months ago — in another session, maybe
on another model — is gone. Re-derived. Re-litigated. Or quietly lost.

**Salvor is a disciplined structure you add to any repo** so that any AI agent —
any session, any contributor, even a different vendor — works against the same
accumulated, git-tracked knowledge. It is **prompt-first**: paste one prompt,
answer a few questions, and your project gains a hub-and-spoke context layer, a
two-tier persisted memory, a strict rules protocol, and three user-gated triggers
that capture knowledge *and the reasoning behind it* as you work. All in git, so
the whole team's agents share one compounding brain.

No SaaS. No lock-in. No account. Just files + two open-source MCP servers.

## Prerequisites — two MCP servers (and why)

Salvor stands on two free, open-source [MCP](https://modelcontextprotocol.io)
servers. Install them once; they work across Claude Code, Codex, Gemini CLI, and
Cursor.

### 🧠 Serena — *semantic code intelligence*
Lets your agent navigate code **by symbol** (find definitions, callers, references)
and make targeted edits, instead of re-reading whole files into context. It's the
IDE-agnostic way to get Cursor-like understanding in any CLI.

- **Install (Claude Code):**
  ```bash
  claude mcp add serena -- uvx --from git+https://github.com/oraios/serena \
    serena start-mcp-server --context ide-assistant --project "$(pwd)"
  ```
  (Requires [`uv`](https://docs.astral.sh/uv/). Other CLIs: see the
  [Serena README](https://github.com/oraios/serena).)
- **Account / API key?** ❌ None. Fully local and free.

### 🕸️ GitNexus — *codebase knowledge graph*
Builds a graph of your code (symbols, relationships, execution flows) so the agent
can run **impact analysis before it edits** — "what breaks if I change this?" — and
stop shipping blind changes to code you have to assume is untested.

- **Install:**
  ```bash
  npm i -g gitnexus && gitnexus setup
  ```
- **Account / API key?** ❌ None for core indexing/querying. *(Only the optional
  `gitnexus wiki` doc generator wants an LLM API key.)*
- **Docs:** [github.com/abhigyanpatwari/GitNexus](https://github.com/abhigyanpatwari/GitNexus)

## Quickstart

```text
1. Install the two MCP servers above (Serena + GitNexus).
2. Open your LLM CLI in the project you want to give a memory to (new or existing).
3. Paste the contents of SETUP_PROMPT.md.
4. Answer 4 questions: project name · components+stacks · live/mirror pair? · which CLI.
5. The agent scaffolds Salvor, makes the initial commit, and runs `gitnexus analyze`.
6. Done — your repo now has a shared, version-controlled brain.
```

👉 The whole installer is one file: **[`SETUP_PROMPT.md`](./SETUP_PROMPT.md)**.

## Features

- **🎯 Hub-and-spoke context** — load only the component you're touching; pay for
  the context you use.
- **🧊 Two-tier memory** — L1 (≤50-line dense current state) + L2 (unbounded deep
  archive). Cheap to read, complete to recover.
- **🔔 Three user-gated capture triggers** — learnings, failures, and deferred
  TODOs each get captured *with their reasoning*, only when you say so.
- **🧠 Serena** symbol intelligence + **🕸️ GitNexus** impact analysis, baked into
  the workflow.
- **🏷️ Per-component versioning** — `VERSION.md` as single source of truth, every
  bump carrying its *why*.
- **🔌 Vendor-agnostic core** — neutral files + a thin per-CLI adapter.

## The core idea: three capture triggers

Salvor's defining move — the agent **notices** knowledge worth keeping and **asks
you, verbatim, before saving it.** Never silent (so capture can't fail unnoticed),
never automatic (so your docs don't bloat without your say):

| Trigger | Captures | The agent asks… | Lands in |
|---|---|---|---|
| **Continued Learning** | a discovery + its *why* | `"Save this as a domain-tuning artifact? (yes/no)"` | dated artifact + `DOMAIN_REF.md` + L1/L2 |
| **Learned Failure (LF#)** | a recurring failure mode + root cause | *(via the same flow)* | `DOMAIN_REF.md` LF# registry |
| **Deferred TODO** | an out-of-scope finding, parked not dropped | `"Log this to docs/DEFERRED_TODOS.md? (yes/no)"` | `docs/DEFERRED_TODOS.md` |

"What we learned," "how we failed," and "what we noticed but parked" are different
kinds of knowledge — Salvor gives each its own home.

## How it works

Five pillars: hub-and-spoke context · two-tier persisted memory · a `RULES.md`
enforcement protocol · a versioned audit trail of the *why* · and the
Serena + GitNexus MCP substrate. Full write-up in
**[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)**.

## Try it

**[`example-project/`](./example-project/)** is a tiny, real, runnable two-component
app with Salvor fully applied — so you can see the populated `CLAUDE.md` hub +
spokes, L1/L2, `VERSION.md`, `DEFERRED_TODOS`, a sample postmortem and tuning
artifact, and real code for Serena + GitNexus to index.

## Docs

- [`SETUP_PROMPT.md`](./SETUP_PROMPT.md) — the one-shot installer
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — the five pillars + the
  shared-vs-per-user and Salvor-vs-your-project distinctions
- [`docs/VENDOR_ADAPTERS.md`](./docs/VENDOR_ADAPTERS.md) — using Salvor on Codex,
  Gemini, and beyond

## Contributing & community

Salvor gets better when more people use it on more kinds of projects.

- 🐛 **Issues** and 💡 **feature requests** — [open one](https://github.com/dwasyluk/salvor/issues).
- 💬 **Questions / ideas** — [Discussions](https://github.com/dwasyluk/salvor/discussions).
- 🔧 **PRs welcome** — especially new **vendor adapters** and **example projects**
  in other stacks. See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © 2026 dwasyluk and Salvor contributors.

<div align="center">
<sub>Named for Salvor Hardin — who preserved a civilization with knowledge, not force.</sub>
</div>
