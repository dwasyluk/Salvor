# salvor Active State — VERBOSE ARCHIVE

L2 cache. Detailed but curated: when this file exceeds ~1,500 lines or at release milestones, condense the oldest resolved sections — keep durable conclusions, evidence references, and commit/test/issue IDs; drop raw noise. Deep history of reasoning, rejected hypotheses, and detail pruned from L1. Update immediately after every L1 update. Read only when explicitly instructed or during context recovery.

---

## 2026-07-16 — Salvor self-scaffold initialized

Installed a concise canonical `CLAUDE.md` hub with thin `AGENTS.md` and `GEMINI.md` adapters so Claude Code, Codex, and Gemini CLI share one repository knowledge base. Added `core`, `web`, and `docs` spokes with initial build IDs `CORE:01`, `WEB:01`, and `DOCS:01`.

The web component is metadata-only on `main`; no GitHub Pages implementation was copied from the separate `ghpages/v1.0.0` checkout. Canonical public product claims remain in `README.md`, `SETUP_PROMPT.md`, and `docs/VENDOR_ADAPTERS.md`. When site code is approved for `main`, its build must generate mapped public copy from those sources. Existing mapped copy may update automatically; new page sections, interactions, or visual elements require explicit operator design approval.

Created the shared `.salvor/` audit brain and made the five existing Serena project memories git-tracked. No `.claude/settings.json`, per-user memory, push, deployment, merge, or production action was performed.

## 2026-07-19 — GHPAGE:01 source-of-truth mirror sync

Merged `main` into `ghpages/v1.0.0` as commit `d67b929`, taking main's framework and documentation as authoritative while preserving the branch's static presentation layer. Reconciled the page to the Domain Learnings taxonomy, multivendor default entrypoints, namespaced `.salvor/` brain and decisions, user-gated capture classes, governance/versioning, and future-only plugin status. Mirrored `assets/salvor-loop.svg` into the deployable site asset tree and embedded it prominently.

Registered the concrete Pages consumer as `GHPAGE:01`, replacing the metadata-only WEB placeholder in the current component set on this branch. A source-of-truth sync is not complete until Playwright is run directly against the rendered ghpage at desktop, tablet, Galaxy-S25-Edge-like small-phone, and 320px narrow viewport sizes. Each size must prove the hero remains visible and readable, local resources load, and the document has no horizontal overflow. CSS review or contract tests alone are not evidence of responsive health.

## 2026-07-19 — GHPAGE:02 responsive loop and burn-surface interaction

Preserved the approved public copy while splitting the combined Salvor Loop comparison into two site-only 800×960 SVG panels. The deployable page uses a wrapping flex container: the panels share a row on wide desktop consumers and stack at equal full width for tablet, 360px small-phone, and 320px narrow consumers. The canonical combined SVG remains unchanged for the README.

The canonical hero's non-slogan display copy is now both non-selectable and pointer-transparent. Pointer input over the large SALVOR title therefore reaches the existing hero-level burn surface and follows the normal click-and-drag zipper path; no text-specific handler exists. The slogan remains selectable, CTA controls remain interactive, and the canonical header/navigation remains selectable and clickable across its width. The generated visual burn clones stay pointer-inert so they cannot intercept those controls.

Direct Playwright verification covered 1440×1000 desktop, 768×1024 tablet, 360×780 Galaxy-S25-Edge-like small phone, and the additional 320×568 narrow guard. It asserted local loading and natural dimensions for both loop panels, desktop side-by-side placement, stacked equal-width placement below desktop, zero horizontal overflow, mouse drag through the title, actual Chromium touch drag through the title, and non-burn interaction on the selectable slogan. Playwright reports, traces, and screenshots remain local validation artifacts and must be deleted before commit.

## 2026-07-19 — CORE:04 DOCS:04 public-launch hardening sweep

Standardized the capture taxonomy on the umbrella term "capture classes" across RULES, the CLAUDE.md capture directive, docs, and the example project. The three classes: (1) Decision / Domain Learning, with subtypes Design Decision (prompt "Record this as a design decision? (yes/no)" → `.salvor/decisions/`) and Domain Learning (prompt "Save this as a domain learning? (yes/no)" → `.salvor/domain-learnings/`); (2) Learned Failure (LF#), registered through the same flow; (3) Deferred Finding (prompt "Log this to .salvor/DEFERRED_TODOS.md? (yes/no)" → `.salvor/DEFERRED_TODOS.md`). "Trigger" survives as a verb; the classes are canonical. Root RULES §2 now carries both Decision/Learning prompts, matching the example project's RULES.

Renamed the RULES §1 recovery loop-breaker to "Context Recovery Procedure" in both RULES files, both CLAUDE.md hubs, and ARCHITECTURE.md, retiring the memory-loss-themed legacy name and replacing its prose everywhere with "context recovery."

Added a Protocol Tiers preamble to both RULES files splitting the Core Protocol (context loading, L1/L2 maintenance, capture approval, context recovery, security, git-safe operation, canonical ownership, vendor portability) from Optional Strict Engineering Defaults (build counters, env-var conventions, branch deletion, container permissions, impact-analysis-before-edit, >100-line read limit, mirror parity). The strict group is explicitly optional, editable, and project-specific; disabling it does not break Salvor Core. The example project keeps and now explicitly advertises the strict profile. Section numbering unchanged.

Rebounded L2: all "unbounded"/"no line limit" descriptions replaced with detailed-but-curated plus a rotation rule (condense oldest resolved sections past ~1,500 lines or at release milestones; keep durable conclusions, evidence references, commit/test/issue IDs; drop raw noise). Added the §5.3 never-persist security list to both RULES files (API keys, passwords, tokens, private keys, .env contents, credential URLs, customer PII, unredacted production logs, large raw dumps, hidden model reasoning); other sections reference it rather than restating it.

Docs accuracy: VENDOR_ADAPTERS gained the current Serena install (`uv tool install -p 3.13 serena-agent` + `serena init` + oraios/serena link), the Serena-memories-as-retrieval-aid vs `.salvor/`-as-canonical stance, and the GitNexus ownership contract (owns index/skills/hooks + the marked gitnexus block in the canonical hub only; `.gitnexusrc` `{"skipContextFiles": true}` opt-out with merge-never-overwrite; `.claude/skills/gitnexus/` generated locally and gitignored). FAQ gained Spec Kit and Google ADK entries, softened Obsidian/vendor-memory/Memory Bank comparisons to job-to-be-done framing, dropped the binary capability table, and replaced the absolute "nothing is uploaded" privacy claim with the no-hosted-service formulation. Calibration sweep removed "forgets everything" / "only Salvor" style claims. Fixed stale README roadmap anchor in FAQ and removed the nonexistent `docs/superpowers/` reference from docs/CLAUDE.md. Example-project README now points at real `.salvor/` paths (its Layout row previously said `docs/`), as does its RULES §8 memory-layers list.
