# salvor Domain Reference

Authoritative current truth for Salvor's product logic. Artifacts in `.salvor/domain-learnings/` are frozen audit trails; this file records what is currently true.

## Purpose

Salvor gives a repository a version-controlled institutional brain shared
across sessions, contributors, and LLM vendors. The shared brain is
vendor-agnostic because its canonical record is repo-owned Markdown, not one
vendor's private memory; compatible thin adapters make it vendor-portable
without a memory migration.

## Product Pillars

1. Concise canonical hub with component spokes.
2. Two-tier persisted memory: ≤50-line L1 plus a detailed-but-curated L2 (rotated at ~1,500 lines or release milestones).
3. Mandatory `RULES.md` enforcement and termination protocol.
4. Three user-gated capture classes: Decision / Domain Learning, Learned Failure (`LF:<slug>`), and Deferred Finding.
5. An auditable history of why; optional Strict installations add per-component version counters, while Core/Q4=NO uses the project's established version source or a minimal history artifact.
6. Optional enhanced mode adds Serena semantic/symbolic code intelligence and GitNexus relationship/impact intelligence; Core works without either tool, but both are highly recommended for the best code-grounded results.
7. Existing-repository adoption is preservation-first. Reuse Serena/GitNexus
   state, hubs, spokes, rules, adapters, and vendor infrastructure in place;
   list exact additions or conflicts before mutation. During setup—or later on
   demand—the same read-only knowledge-adoption workflow maps selected source
   sections independently to one canonical owner and exact proposed content.
   Mixed documents may yield multiple artifact types; originals remain
   untouched unless separately approved. Never auto-migrate Serena memories or
   duplicate equivalent rules.
8. Distributed-brain discipline (RULES §10): knowledge IDs are self-allocating
   slugs (`LF:` / `DL:` / `DEC:` / `PM:` / `deferred:`) with structured
   Subject/Claim headers; Brain Reconcile runs at merge/pull points and a
   recurring Brain Audit (3-day default) sweeps for semantic duplicates and
   contradictions. Exactly one `Status: live` entry per contested claim.
   EXPERIMENTAL tier (§10.5–§10.6, default OFF): agentic provisional capture
   with provenance headers + human ratification, and the never-discard
   `.salvor/archive/`.

## Canonical Public Sources

- `README.md` — public overview, support claims, quickstart, and roadmap.
- `SETUP_PROMPT.md` — universal installer and scaffold protocol.
- `docs/VENDOR_ADAPTERS.md` — vendor support and adapter behavior.

The approved existing-repository adoption invariant is recorded in
`.salvor/decisions/2026-07-30-preservation-first-existing-repository-adoption.md`.

The deployable GitHub Pages site in `site/` is a semantic presentation mirror of these sources, not an independent authority.

## Brand Authority

The operator-supplied `assets/brand/reference/LOGO.svg` and
`assets/brand/reference/LOGO-SM.svg` are the immutable canonical mark masters.
The small master owns favicon and touch-icon geometry; the regular master owns
every other mark placement. Black and white derivatives at supported sizes
preserve exact geometry and uniform scaling. The outlined SALVOR wordmark
remains separately canonical and unchanged.

## Learned Failures (LF:)

### LF:rendered-pixel-alignment (2026-07-28)

- **ID:** LF:rendered-pixel-alignment
- **Subject:** site, visual-alignment, playwright, release-gates
- **Claim:** Rendered screenshot ink — not DOM/CSS box geometry — is the only valid visual-alignment oracle.
- **Evidence date:** 2026-07-28
- **Status:** live

DOM/CSS rectangles may delimit screenshot scan regions, but they are not proof
that glyphs or SVG strokes align visually. Final visual-alignment gates must use
DPR-aware Playwright screenshots and visible-ink measurements: compare a black
title's lowest ink row with the first rendered line band's lowest gold-label row,
and compare the icon's topmost visible stroke with the title's topmost glyph
ink. Report signed deltas and allow at most one CSS pixel across the 1440, 1024,
768, 390, 360, and 320 release viewports. Wrapped labels stay in their
right-hand column and align from their first line. This rule exists because more
than six element-box-aligned revisions still rendered pixel-incorrect. See
`.salvor/postmortems/2026-07-28-rendered-pixel-alignment-gate.md`.
