# Salvor — Extract the "AI institutional-memory framework" into a public repo

## Context

Two sibling production projects independently grew a discipline layer on top of an LLM coding CLI that makes project knowledge — **especially the *why*** — compound across sessions, developers, and even different LLM vendors, instead of evaporating on context rotation. Out of the box, a rationale captured 2 months ago by another dev in another session (or another vendor) is lost; here it is git-tracked and shared by every contributor's agent.

We are extracting that system, **fully anonymized** (no source-project- or domain-specific names), into a standalone public repo named **Salvor** (Foundation ref: Salvor Hardin preserves the Foundation through knowledge, not force; also "salvor" = one who salvages → rescues knowledge from loss). It is built from a blank repo.

Goal: a dev-audience repo that is read, **adopted into new OR existing projects via a self-contained one-shot prompt**, and **contributed back to**. Intended outcome: Salvor becomes a recognizable, sharable scaffold ("are you using Salvor?").

The framework's patterns were distilled from two battle-tested sibling projects; everything here is generalized so nothing domain-specific leaks into the public templates. (This file is the design-rationale record, kept in-repo as `docs/PLAN.md`.)

## Decisions locked (from Q&A)

1. **Adoption:** Prompt-driven, self-contained `SETUP_PROMPT.md` (Option 1). Neutral core + thin per-vendor adapter. Claude Code adapter fully built in v1; Codex/Gemini adaptation **documented, not hardened**.
2. **Example project:** one tiny **real, runnable** app, multi-component, fully wired with Salvor (so Serena + GitNexus have real symbols to index).
3. **Versioning:** keep `VERSION.md` as single source of truth + "why"-rich history rows, but **configurable per-component build IDs** — the setup prompt derives components from the target project (e.g. `API:01 / WEB:01`) instead of hardcoded `E/D/S/BT`.
4. **v1 modules beyond core + DEFERRED_TODOS:** **severity/priority fields on deferred items** + **postmortem structure**. (Review-finding traceability deferred to a later version.)

## The "light rethink" — three explicit, user-gated capture triggers

Salvor's keystone is that the model **self-identifies** knowledge worth persisting and **asks the user verbatim** before persisting (so it can never silently fail or silently bloat). Both source projects blur these; Salvor makes the **three distinct triggers** explicit, each with its own prompt and propagation path:

| Trigger | What it captures | Verbatim prompt | Lands in |
|---|---|---|---|
| **Continued Learning** | A discovery/decision + its *why* (hypothesis tested, verdict, rationale that will outlive the refactor) | `"Save this as a domain-tuning artifact? (yes/no)"` | dated artifact in `docs/domain-tuning/` + README TOC + `DOMAIN_REF.md` + L1/L2 + memories |
| **Learned Failure (LF#)** | A recurring/structural failure mode + root cause + fix sites | (registered as part of the above when the discovery *is* a failure) | `DOMAIN_REF.md` LF# registry + L1 shorthand + artifact |
| **Deferred TODO** (NEW) | An out-of-scope finding surfaced mid-task: real, but must not block/derail current work | `"Log this to docs/DEFERRED_TODOS.md? (yes/no)"` | `docs/DEFERRED_TODOS.md` (dedupe-first, then append; Severity + Suggested-fix fields) |

This trichotomy is the single biggest legibility upgrade over both source projects and becomes the framework's headline concept in the README.

## Target repo structure (v1)

```
salvor/
├── README.md                  # Clawbot/OpenClaw-family style (hero+badges → quickstart → features → 3-triggers concept → docs → community → license)
├── CONTRIBUTING.md             # light, PR-driven; issues encouraged; the SETUP_PROMPT ↔ example-project sync rule
├── CHANGELOG.md                # Keep-a-Changelog format; v1.0.0 as first entry
├── LICENSE                     # MIT (confirm at execution)
├── SETUP_PROMPT.md             # THE canonical, self-contained one-shot scaffolder (improved from user's draft) — single source of truth
├── .github/
│   ├── ISSUE_TEMPLATE/         # bug_report.md, feature_request.md, adapter_request.md (Codex/Gemini), config.yml (link to Discussions)
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── PLAN.md                 # copy of this plan
│   ├── ARCHITECTURE.md         # the 5 pillars + shared(in-repo) vs per-user(auto-memory) distinction
│   └── VENDOR_ADAPTERS.md      # Claude Code (built) + Codex/Gemini adaptation notes (the neutral-core + adapter pattern)
└── example-project/            # tiny REAL app with Salvor fully applied (the rendered output of SETUP_PROMPT)
    ├── CLAUDE.md (hub) + RULES.md + VERSION.md + AGENTS.md
    ├── api/CLAUDE.md  +  web/CLAUDE.md            # two component spokes
    ├── api/… web/…                                # minimal real source (a few files each, runnable)
    └── docs/{active_state.md, active_state_verbose.md, DOMAIN_REF.md, INFRA.md, DEFERRED_TODOS.md, postmortems/, domain-tuning/README.md}
```

## README structure (Clawbot/OpenClaw-family conventions)

Model the README on how popular terminal-agent projects (OpenClaw, OpenCode, Aider, Cline) present: **lead with the value prop and quickstart, not the philosophy.** Section order:

1. **Hero** — name + one-line tagline (e.g. *"Give your codebase a memory. A version-controlled brain your whole team's AI shares."*), optional subtle Foundation/salvage motif, and a badge row: **release (v1.0.0)**, license, "works with Claude Code · Codex · Gemini", PRs-welcome, GitHub stars/issues.
2. **What it is (3-4 sentences)** — the OOTB-amnesia problem → Salvor's git-shared brain that survives session/dev/vendor resets.
3. **Prerequisites — the MCP dependencies, briefly explained (NEW):** a short, friendly subsection so a dev knows *what they're installing and why* before running anything:
   - **Serena** — an MCP server giving the agent **symbolic / embeddings-based code intelligence** (find/navigate symbols, token-thrifty targeted reads) — the IDE-agnostic way to get Cursor-like understanding in any LLM CLI.
   - **GitNexus** — an MCP server that builds a **knowledge graph of your codebase** (symbols, relationships, execution flows) for impact analysis before edits — "know your code," not just keyword search.
   - For **each**: one-line "what it does," the **install command**, the official **docs link**, and an explicit **"Account / signup / API key needed?"** note (verified at execution — do not guess). Make clear which steps are mandatory vs optional, and that these are the only external moving parts.
4. **Quickstart (front and center)** — the "prompt-first" path: (a) install the Serena + GitNexus MCP deps (per Prerequisites), (b) paste `SETUP_PROMPT.md` into your LLM CLI, (c) answer 3–4 questions → your project now has hub-spoke + L1/L2 + RULES + the three capture triggers. ≤6 steps, copy-pasteable.
5. **Demo** — a short asciinema/GIF or a before/after snippet (placeholder in v1, real capture if quick).
6. **Features** — benefit-oriented bullets (token-thrifty hub-spoke context · two-tier persisted memory · three user-gated capture triggers · Serena symbol intelligence · GitNexus impact analysis · vendor-agnostic core).
7. **Core concept: the three capture triggers** — the headline table (Learning / LF# / Deferred TODO), each with its verbatim prompt.
8. **How it works / the 5 pillars** — short, links to `docs/ARCHITECTURE.md`.
9. **Try it** — point at `example-project/`.
10. **Docs** — links to ARCHITECTURE, VENDOR_ADAPTERS, SETUP_PROMPT.
11. **Contributing & Community** — issues + PRs + Discussions encouraged; link CONTRIBUTING.
12. **License.**

## CONTRIBUTING + community (light, PR-driven)

- **Light and welcoming.** Short CONTRIBUTING.md: how to propose a change (fork → branch → PR), what a good PR looks like, and the **one hard rule**: editing `SETUP_PROMPT.md` requires re-rendering `example-project/` to match (keep the worked example honest). Conventional-commit hint, no CLA, no heavy process.
- **Issues encouraged via GitHub.** Provide `.github/ISSUE_TEMPLATE/` (bug, feature, vendor-adapter request) + a `config.yml` routing open-ended questions to **GitHub Discussions**. PR template with a short checklist (anonymized? example-project synced? docs updated?).
- Explicitly invite contributions: new vendor adapters, new capture-trigger patterns, example projects in other stacks.

## Releases & versioning — two distinct layers (avoid confusion)

- **Layer 1 — Salvor's own repo releases:** standard **SemVer git tags + GitHub Releases**, first tag **`v1.0.0`**, tracked in `CHANGELOG.md` (Keep-a-Changelog). This versions the framework itself.
- **Layer 2 — the per-project `VERSION.md`** that Salvor *scaffolds into a target project* (configurable per-component build IDs like `API:01`). This is the adopting project's versioning, **not** Salvor's.
- README + ARCHITECTURE must state this distinction in one line so adopters don't conflate the two. v1 release process: tag `v1.0.0`, cut a GitHub Release from `CHANGELOG.md` (manual via `gh release create`; no CI gate required for v1).

**Templates are NOT a separate `/templates/` dir** (avoids drift): the canonical templates live **inline in `SETUP_PROMPT.md`** (so a dev can paste it into any repo with zero dependency on cloning Salvor), and `example-project/` is the **worked, rendered instance** of running it. CONTRIBUTING.md makes "edit SETUP_PROMPT.md → re-render example-project to match" the contribution rule.

## SETUP_PROMPT.md — improvements over the user's current draft

Start from the user's pasted prompt (it's already well-structured and already renamed `strategy-tuning`→`domain-tuning`, `STRATEGY_REF`→`DOMAIN_REF`, made build IDs configurable). Apply these upgrades:

1. **Add the 3rd capture trigger end-to-end:**
   - New generated file `docs/DEFERRED_TODOS.md` (header + entry schema: Title / Where / What / **Severity** / **Suggested fix** / Why-deferred; + a "How this file is maintained" footer: fix → delete entry → reference in commit; dedupe-before-append).
   - New **RULES.md §7 "Out-of-scope finding capture"** with the verbatim prompt and the dedupe-first-then-append protocol (ported/generalized from a sibling project's out-of-scope-capture rule).
2. **Add postmortem structure (chosen v1 module):**
   - Generated `docs/postmortems/README.md` (template: incident summary, timeline, root cause, findings → which become LF# entries and/or DEFERRED_TODOS).
   - RULES.md note linking postmortem findings into the LF# registry + DEFERRED_TODOS.
3. **Make the 3 triggers explicit** in both `CLAUDE.md` SYSTEM DIRECTIVE and RULES.md (replace the implicit single-trigger framing).
4. **Vendor-agnostic honesty:** wherever the draft hardcodes Claude Code specifics (`~/.claude/.../memory/`, `@import`, `--no-gpg-sign`, `npx gitnexus`, Skills), tag them as **Claude-Code adapter steps** and point to `docs/VENDOR_ADAPTERS.md`. Mark the **in-repo files as the shared canonical brain** and **per-user auto-memory as an optional CC-only enhancement** (corrects the "shared across all devs" claim).
5. **Step-1 questions:** keep the 3 (project name / components+stacks / live↔mirror parity pair). Add a 4th: **primary vendor** (Claude Code default) so the prompt wires the right adapter and conditionally includes/omits CC-only steps.
6. **Genericize residual domain language** in the rules examples (neutralize any domain-flavored phrasings in §6.5–6.8 to generic "numerically-sensitive / external-API / cache-key" wording).
7. Keep: hub-and-spoke, L1/L2 directive, §0 Termination Protocol, §2 Continued Learning, configurable per-component VERSION.md, `.gitignore` additions, GitNexus index step, Step-4 operating rules, Step-5 confirmation report.

## Example project spec

- **Tiny but real & runnable.** Recommend **two components** to exercise hub-and-spoke + per-component version IDs + spokes: `api/` and `web/` (single language, TypeScript, kept minimal — a handful of files each; a trivial "notes" service is enough). Polyglot is possible but unnecessary for v1; final stack confirmed at execution.
- Fully populated Salvor docs (hub+2 spokes, RULES, VERSION with `API:01 WEB:01`, L1/L2, DOMAIN_REF, INFRA, DEFERRED_TODOS with ≥1 sample entry, one sample postmortem, domain-tuning README with ≥1 sample dated artifact).
- Real enough that `npx gitnexus analyze` + Serena produce non-trivial symbol/relationship counts — this is what demonstrates the GitNexus/Serena value.

## Build sequence (after approval)

1. Scaffold repo skeleton in `/Users/dwasyluk/Development/salvor`: `.gitignore`, `LICENSE`, `CHANGELOG.md`, `docs/{PLAN.md,ARCHITECTURE.md,VENDOR_ADAPTERS.md}`, `.github/{ISSUE_TEMPLATE/*, PULL_REQUEST_TEMPLATE.md}`.
2. Author **`SETUP_PROMPT.md`** (the improved, self-contained scaffolder) — the core deliverable.
3. Build **`example-project/`** by effectively *running* SETUP_PROMPT against a tiny real 2-component app; commit the rendered result.
3b. **Verify Serena & GitNexus install + account requirements** (don't guess): confirm each one's actual install command, whether an account / signup / API key is required, and the official docs URL — from their real repos/docs. These verified facts feed the README Prerequisites subsection.
4. Write `README.md` (Clawbot/OpenClaw-family structure above, incl. the verified Prerequisites/MCP-explainer), `CONTRIBUTING.md` (light/PR-driven + the SETUP_PROMPT↔example sync rule), `docs/ARCHITECTURE.md` (5 pillars; shared-vs-per-user; the two version layers), `docs/VENDOR_ADAPTERS.md` (CC built; Codex/Gemini notes).
5. Initial commit; run `npx gitnexus analyze` on `example-project/`; commit generated blocks.
6. Seed `CHANGELOG.md` v1.0.0 entry; **tag `v1.0.0` and cut a GitHub Release** (`gh release create v1.0.0`) — with explicit operator go-ahead per RULES (push + release are outward-facing).

## Verification

- **Dogfood:** run the improved `SETUP_PROMPT.md` end-to-end against the example app and confirm every promised file is generated and populated (no unfilled `<PLACEHOLDERS>`).
- **MCP proof:** `npx gitnexus analyze` on `example-project/` returns non-zero symbols/relationships/flows; Serena `get_symbols_overview` resolves the example's components — demonstrating the "know your code" claim on real code.
- **Anonymization audit:** `grep -ri` over the whole repo for the source projects' names and domain-specific terms → zero hits in any shipped template or doc.
- **Triggers smoke:** confirm RULES.md contains all three verbatim prompts and that DEFERRED_TODOS + postmortem files + protocols exist and cross-link.
- **Vendor-agnostic honesty check:** `VENDOR_ADAPTERS.md` clearly separates neutral core from CC-only glue; README's shared-vs-per-user claim is accurate.
- **Fresh-eyes read:** README → SETUP_PROMPT → example-project is followable by a dev who has never seen the source projects; quickstart is copy-pasteable end-to-end.
- **Release hygiene:** `CHANGELOG.md` has a v1.0.0 entry, the two version layers are disambiguated, and `.github/` issue + PR templates render correctly on GitHub before tagging `v1.0.0`.
- **Prerequisites accuracy:** README's Serena/GitNexus explainer states verified install commands + docs links + an explicit account/signup/API-key answer for each (no guessed steps); a fresh dev can complete the Prerequisites block without surprises.

## Explicitly NOT in v1 (deferred)

- CLI scaffolder (`npx salvor init`) and Claude Code plugin — design the file layout so either can wrap SETUP_PROMPT later without rework.
- Review-finding traceability module; production-release automation; ticketing-system integration (all stack-specific to the source projects).
- Hardened/tested Codex & Gemini adapters (documented only in v1).
