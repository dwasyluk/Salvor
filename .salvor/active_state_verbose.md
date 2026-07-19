# salvor Active State — VERBOSE ARCHIVE

L2 cache. No line limit. Append-only deep history of reasoning, rejected hypotheses, raw tool outputs, and detail pruned from L1. Update immediately after every L1 update. Read only when explicitly instructed or during dementia recovery.

---

## 2026-07-16 — Salvor self-scaffold initialized

Installed a concise canonical `CLAUDE.md` hub with thin `AGENTS.md` and `GEMINI.md` adapters so Claude Code, Codex, and Gemini CLI share one repository knowledge base. Added `core`, `web`, and `docs` spokes with initial build IDs `CORE:01`, `WEB:01`, and `DOCS:01`.

The web component is metadata-only on `main`; no GitHub Pages implementation was copied from the separate `ghpages/v1.0.0` checkout. Canonical public product claims remain in `README.md`, `SETUP_PROMPT.md`, and `docs/VENDOR_ADAPTERS.md`. When site code is approved for `main`, its build must generate mapped public copy from those sources. Existing mapped copy may update automatically; new page sections, interactions, or visual elements require explicit operator design approval.

Created the shared `.salvor/` audit brain and made the five existing Serena project memories git-tracked. No `.claude/settings.json`, per-user memory, push, deployment, merge, or production action was performed.

## 2026-07-19 — GHPAGE:01 source-of-truth mirror sync

Merged `main` into `ghpages/v1.0.0` as commit `d67b929`, taking main's framework and documentation as authoritative while preserving the branch's static presentation layer. Reconciled the page to the Domain Learnings taxonomy, multivendor default entrypoints, namespaced `.salvor/` brain and decisions, user-gated capture triggers, governance/versioning, and future-only plugin status. Mirrored `assets/salvor-loop.svg` into the deployable site asset tree and embedded it prominently.

Registered the concrete Pages consumer as `GHPAGE:01`, replacing the metadata-only WEB placeholder in the current component set on this branch. A source-of-truth sync is not complete until Playwright is run directly against the rendered ghpage at desktop, tablet, Galaxy-S25-Edge-like small-phone, and 320px narrow viewport sizes. Each size must prove the hero remains visible and readable, local resources load, and the document has no horizontal overflow. CSS review or contract tests alone are not evidence of responsive health.

## 2026-07-19 — GHPAGE:02 responsive loop and burn-surface interaction

Preserved the approved public copy while splitting the combined Salvor Loop comparison into two site-only 800×960 SVG panels. The deployable page uses a wrapping flex container: the panels share a row on wide desktop consumers and stack at equal full width for tablet, 360px small-phone, and 320px narrow consumers. The canonical combined SVG remains unchanged for the README.

The canonical hero's non-slogan display copy is now both non-selectable and pointer-transparent. Pointer input over the large SALVOR title therefore reaches the existing hero-level burn surface and follows the normal click-and-drag zipper path; no text-specific handler exists. The slogan remains selectable, CTA controls remain interactive, and the canonical header/navigation remains selectable and clickable across its width. The generated visual burn clones stay pointer-inert so they cannot intercept those controls.

Direct Playwright verification covered 1440×1000 desktop, 768×1024 tablet, 360×780 Galaxy-S25-Edge-like small phone, and the additional 320×568 narrow guard. It asserted local loading and natural dimensions for both loop panels, desktop side-by-side placement, stacked equal-width placement below desktop, zero horizontal overflow, mouse drag through the title, actual Chromium touch drag through the title, and non-burn interaction on the selectable slogan. Playwright reports, traces, and screenshots remain local validation artifacts and must be deleted before commit.
