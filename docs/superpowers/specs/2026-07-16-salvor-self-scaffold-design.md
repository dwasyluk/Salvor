# Salvor Self-Scaffold Design

**Date:** 2026-07-16  
**Target:** `main` at the Salvor v1.0.0 repository state  
**Canonical instructions:** Claude Code `CLAUDE.md`, with thin Codex and Gemini CLI adapters

## Goal

Install Salvor's own version-controlled institutional-memory framework in the Salvor repository without bringing the in-progress GitHub Pages implementation onto `main`.

## Project identity and component ownership

The application name is configured through `APP_NAME` and defaults to `salvor`; project code and documentation must not introduce hardcoded display-name copies where the configured value should be used.

| Component | Build ID | Owned scope | Initial state |
|-----------|----------|-------------|---------------|
| Core | `CORE:01` | Root `SETUP_PROMPT.md` | Existing source of truth for the universal setup protocol |
| Web | `WEB:01` | Future GitHub Pages implementation under `site/` | Metadata-only spoke; no website implementation lands in this scaffold |
| Docs | `DOCS:01` | Root `README.md` and `docs/` | Existing public and architectural documentation |

Changes to a component increment its own counter. A public-capability change spanning source documentation and the future website increments every affected counter.

## Hub-and-spoke architecture

Root `CLAUDE.md` is a concise project hub. It contains the project rationale, L1 import, component map, documentation map, `APP_NAME` contract, two-tier memory directive, three capture triggers, and the GitNexus context insertion point. Component-specific details remain out of the hub.

Three spokes provide deeper ownership guidance:

- `core/CLAUDE.md` documents the purpose, invariants, validation, and evolution of root `SETUP_PROMPT.md`.
- `site/CLAUDE.md` records the planned GitHub Pages architecture and synchronization contract. The directory contains no page implementation in this change.
- `docs/CLAUDE.md` governs root `README.md` and the complete `docs/` directory.

Root `RULES.md` is mandatory governance, and root `VERSION.md` is the sole source of component build IDs. All durable memory and audit material lives under `.salvor/`.

## Memory and knowledge capture

`.salvor/active_state.md` is the L1 cache and remains at or below 50 lines. `.salvor/active_state_verbose.md` is the unbounded L2 archive. Confirmed resolutions, milestones, and architectural shifts update L1 and L2 silently.

The remaining durable layers are:

- `.salvor/DOMAIN_REF.md` for current domain truth and the LF# registry.
- `.salvor/INFRA.md` for local operation, deployment, environment variables, APIs, and observability.
- `.salvor/DEFERRED_TODOS.md` for user-approved out-of-scope findings.
- `.salvor/domain-tuning/` for immutable, dated evidence artifacts.
- `.salvor/postmortems/` for incident learning that feeds LF# and deferred findings.

Continued learning and learned failures use the exact prompt `Save this as a domain-tuning artifact? (yes/no)`. Deferred findings use the exact prompt `Log this to .salvor/DEFERRED_TODOS.md? (yes/no)`. These prompts are user-gated and cannot be inferred or silently batched.

## Repository-to-website synchronization contract

Canonical public capability claims remain in root `README.md`, `SETUP_PROMPT.md`, and `docs/VENDOR_ADAPTERS.md`. The future GitHub Pages implementation is a presentation mirror, not an independent source of product truth.

When website code is later merged onto `main`, its build/deploy pipeline must generate explicitly mapped public copy from those canonical sources. Existing mapped content may update automatically. A canonical change that requires a new page section, interaction, or other design element must stop synchronization with a design-review-required failure; an agent must ask the operator before adding the new element.

This is semantic/generated parity rather than byte-for-byte file identity because Markdown source documentation and rendered website markup have intentionally different structures. Until the website lands on `main`, the contract is recorded in `RULES.md` and `site/CLAUDE.md` only.

## Vendor adapters

Root `CLAUDE.md` is the canonical instruction hub and uses native `@` imports. Root `AGENTS.md` and `GEMINI.md` are lightweight adapters that direct Codex and Gemini CLI to the same canonical hub, relevant component spoke, `RULES.md`, and `.salvor/active_state.md`. They do not duplicate the hub's substantive guidance, keeping multi-vendor maintenance lightweight while preserving one shared body of project knowledge.

No `.claude/settings.json` or per-user Claude auto-memory is created. Canonical shared knowledge remains in git-tracked repository files and is identical for Claude Code, Codex, and Gemini CLI.

## Safety and repository isolation

Implementation occurs in the isolated worktree `/private/tmp/salvor-main-v1.0.0` on branch `main`. The existing `ghpages/v1.0.0` checkout and all of its modified or untracked website files remain untouched. The scaffold does not push, deploy, merge, or copy website implementation onto `main`.

## Verification and delivery

Before the scaffold is declared complete:

1. Verify every required root file, `.salvor/` file, and component spoke exists.
2. Scan all scaffold files for unresolved project/component/template placeholders.
3. Verify L1 is no more than 50 lines and root `CLAUDE.md` remains concise.
4. Verify `RULES.md` contains the mandatory termination, recovery, capture, versioning, tooling, safety, coding, deferred-finding, and memory-layer rules.
5. Verify `VERSION.md` begins at `CORE:01 | WEB:01 | DOCS:01` with date `2026-07-16`.
6. Verify no website implementation files were introduced on `main`.
7. Commit the scaffold using the requested Salvor scaffold commit message.
8. Run `gitnexus analyze`, verify index status and symbol/relationship/execution-flow counts, and commit generated context separately.
9. Report created files, sizes or line counts, adapter choice, commit hashes, GitNexus counts, and acknowledgement of the eight operating rules.

No project-level test runner exists on `main`, so verification uses structural, content, line-limit, git-diff, and GitNexus checks.
