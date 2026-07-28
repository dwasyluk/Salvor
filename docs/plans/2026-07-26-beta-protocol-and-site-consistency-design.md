# Salvor v1.0.0-beta Protocol, Documentation, and Site Consistency Design

**Date:** 2026-07-26
**Branch:** `ghpage/burntest`
**Milestone base:** `951b351` (`improved hero burn reveal`)
**Status:** Design approved; implementation completed and visually approved
**Deployment:** Out of scope until separately approved

## 1. Objective

Prepare Salvor for a credible `v1.0.0-beta` soft launch by making the repository's
canonical protocol, internal `.salvor/` records, public documentation, generated
templates, example project, release metadata, and GitHub Pages presentation agree
with one another.

This work also completes the approved hero and site refinements without changing the
approved hero's starting or completed visual states:

- retain the milestone WebGL burn implementation and its WF/M layers;
- slightly lighten the smoke;
- correct wrapped hero-bullet alignment;
- keep the WF tagline non-selectable until the burn completes;
- make hero copy selectable after the completed reveal while preserving navigation,
  button, pointer, tap, and drag interactions;
- add and strengthen vendor-agnostic and vendor-portability explanations;
- position Serena and GitNexus as optional but highly recommended for best results;
- restore and verify the Salvor diagrams.

No work in this design authorizes a commit, merge, push, deployment, cleanup of
untracked files, or changes to the separate primary checkout.

## 2. Source-of-truth model

The update follows Salvor's existing one-owner model:

| Concern | Canonical owner | Mirrors / consumers |
| --- | --- | --- |
| Protocol behavior and generated scaffold | `SETUP_PROMPT.md`, `RULES.md` | example project, adapters, public docs |
| Product positioning and public claims | `README.md`, `SETUP_PROMPT.md`, `docs/VENDOR_ADAPTERS.md` | `site/`, spokes, FAQ, architecture |
| Current product facts and failure registry | `.salvor/DOMAIN_REF.md` | L1/L2 summaries, spokes, Serena retrieval pointers |
| Current operational state | `.salvor/active_state.md` (L1) | `CLAUDE.md` current-state pointer |
| Curated recovery history | `.salvor/active_state_verbose.md` (L2) | concise summaries only |
| Release identity and component counters | `VERSION.md` | package metadata, changelog, site metadata, tests |
| Machine-derived code structure | GitNexus index | concise hand-authored routing note in `CLAUDE.md` |
| Symbol retrieval pointers | Serena memories | never a competing knowledge store |
| Site presentation and interactions | `site/` | deployed GitHub Pages artifact |

Canonical protocol and positioning changes must land before their site mirrors. This
prevents visually polished copy from disagreeing with the protocol it advertises.

## 3. Two-pass `.salvor` and protocol consistency audit

### Pass 1 — discovery before edits

Build an explicit inventory of current and generated surfaces before changing copy:

1. **Taxonomy**
   - Search for `domain-tuning`, `domain tuning`, deprecated capture labels, stale
     directory names, and obsolete prompt wording.
   - Treat `Domain Learning` and `.salvor/domain-learnings/` as the operator-confirmed
     canonical term and path. Any `domain-tuning` wording or path is stale drift.
   - The initial discovery found no live `domain-tuning` occurrence on this branch.

2. **Capture contract**
   - Compare the three capture classes, exact approval prompts, destinations, and
     Learned Failure handling across root `RULES.md`, `SETUP_PROMPT.md`, root hub,
     the example project, `.salvor/` indexes, and Serena pointers.
   - Preserve the required individual approval gates; do not collapse or batch them.

3. **Canonical ownership**
   - Verify `.salvor/` owns durable engineering knowledge.
   - Verify vendor adapters are thin routers, Serena memories are concise retrieval
     pointers, and GitNexus owns only machine-derived structure.
   - Remove or revise language that makes `CLAUDE.md`, a vendor memory system, or an
     enhanced integration appear co-canonical.

4. **Template and dogfood parity**
   - Compare the live root scaffold with the embedded templates in
     `SETUP_PROMPT.md`.
   - Compare both against `example-project/`, root `.salvor/`, root adapters, spokes,
     and `.serena/memories/`.
   - Classify differences as intentional project-specific examples or drift.

5. **Release semantics**
   - Inventory `VERSION.md`, `CHANGELOG.md`, package metadata, site metadata,
     release links, audit paths, generated asset metadata, tests, L1/L2, spokes, and
     Serena memories.
   - Separate Salvor release identity from unrelated dependency versions and
     scaffold/example versions.

6. **Vendor portability and enhanced tooling**
   - Verify the protocol can be used by any coding agent that can read repository
     Markdown.
   - Verify switching vendors does not require migrating the shared repository brain.
   - Verify Serena and GitNexus remain optional to Salvor Core while being described
     as highly recommended for the best code-grounded results.

Findings from Pass 1 become the implementation map. They are not silently persisted
as new `.salvor/decisions/` or domain-learning artifacts without the protocol's
required approval.

### Pass 2 — final parity gate

After implementation:

- rerun exact-term and stale-path scans with narrow allowlists;
- compare embedded scaffold templates with their live and example counterparts;
- assert capture-class names, prompts, destinations, and ownership claims;
- assert vendor-agnostic and vendor-portable language across canonical and public
  surfaces;
- assert optional/highly-recommended enhanced language across core docs and site;
- assert every Salvor-owned release reference is `v1.0.0-beta`;
- assert allowed exclusions remain unchanged;
- assert `VERSION.md` metadata, prose, counters, and history are internally coherent;
- assert all referenced site images load locally;
- run existing repository release, consistency, setup, brand, and site contracts.

## 4. Release identity

### Required beta conversion

Every Salvor-owned `v1.0.0` or `1.0.0` release reference becomes
`v1.0.0-beta` / `1.0.0-beta`, including:

- `VERSION.md` machine-readable header and project-version prose;
- root package metadata and lockfile package identity;
- README badges and release copy;
- changelog release heading and comparison/release links;
- site JSON-LD, eyebrow, footer, documentation links, and plugin-status copy;
- component spokes, root hub, L1/L2 current and historical Salvor release references;
- generated brand metadata, audit directory names, and audit-page headings;
- release-audit scripts, tests, comments, and Serena memories.

Historical prose does not retain an ambiguous Salvor `v1.0.0` identity during the
soft launch. Where a historical entry describes the same not-yet-official release,
its release identity changes to beta while its substantive history remains intact.

### Explicit exclusions

Do not change:

- scaffold/example project `0.1.0` values;
- unrelated dependency versions;
- GitNexus version references such as `v1.6.9` and `v1.6.3`;
- the future plugin target `v1.1.0`.

### Component counters

The completed implementation affects all three governed components:

- `CORE` for protocol, metadata, templates, and repository-internal consistency;
- `GHPAGE` for site copy, layout, selection state, imagery, and smoke;
- `DOCS` for public documentation and cross-surface positioning.

Each counter advances once in the final `VERSION.md` entry. L1, L2, root/component
spokes, and relevant Serena pointers are synchronized to the resulting state.

## 5. Vendor-agnostic and vendor-portable contract

Use the two terms deliberately:

- **Vendor-agnostic:** Salvor's canonical shared brain is repository-owned Markdown
  and is not controlled by one coding-agent vendor.
- **Vendor-portable:** thin entrypoint adapters let a team switch supported coding
  agents while retaining the same reviewed decisions, learnings, failures, deferred
  findings, and active state. No shared-memory migration is required.

The claim must remain calibrated:

- Claude Code is the most dogfooded path.
- Codex and Gemini-compatible entrypoints are generated and documented.
- Additional tools can integrate through thin adapters when they can read repository
  files.
- Vendor-specific private memory and behavior can differ; the portable guarantee is
  the repository-owned protocol and knowledge, not identical vendor execution.

Update this contract consistently in:

- `README.md`;
- `SETUP_PROMPT.md`;
- `RULES.md` where necessary for parity;
- `docs/ARCHITECTURE.md`;
- `docs/VENDOR_ADAPTERS.md`;
- `docs/FAQ.md`;
- `CLAUDE.md`, `AGENTS.md`, and `GEMINI.md`;
- component spokes and relevant `.salvor/`/Serena summaries;
- embedded templates and `example-project/`;
- the site sections described below.

## 6. Serena and GitNexus positioning

Canonical wording must communicate both facts without contradiction:

1. Serena and GitNexus are optional enhanced integrations; Salvor Core works without
   either.
2. They are highly recommended for the best results because Serena improves semantic
   symbol navigation and GitNexus improves relationship, flow, and impact grounding.

Preserve existing licensing and capability caveats:

- do not imply GitNexus is part of Salvor or covered by Salvor's MIT license;
- do not claim MCP functionality merely because a CLI or index exists;
- preserve pure-index ownership guidance and version-aware fallbacks;
- do not claim Serena memories are canonical.

On the site, the visible `Serena` and `GitNexus` foundation-card titles become links
to their official GitHub repositories:

- `https://github.com/oraios/serena`
- `https://github.com/abhigyanpatwari/GitNexus`

Links must retain clear focus states, ordinary text selection behavior, and external
link semantics consistent with the rest of the page.

## 7. Site information architecture and copy

### “3 Reasons” item 3

Replace the lock-in-only framing with an explicit combined benefit:

- title: **Vendor-agnostic and vendor-portable.**
- copy: repository-owned Markdown keeps the shared brain independent of a single
  vendor, while thin adapters allow switching agents without migrating reviewed
  project memory.

Local ownership and lack of a Salvor-hosted SaaS remain supporting facts, not the
sole definition of portability.

### “How Salvor Works”

Retain the existing sequence but correct and expand it:

1. Update **Hub & Spoke** to **Hub, Spokes & Adapters**.
   - The canonical hub and component spokes route context.
   - `.salvor/` owns durable knowledge.
   - `CLAUDE.md`, `AGENTS.md`, and `GEMINI.md` are thin entrypoints, not competing
     brains.

2. Retain **Two-Tier Memory**.

3. Retain **3 Capture Classes**.

4. Insert a new sixth-content concept immediately after capture classes:
   **Vendor-Agnostic & Portable**.
   - Any compatible coding agent can read the repository-owned protocol.
   - Switching vendors preserves the same reviewed shared brain.
   - Use a distinct bidirectional endpoint/adapter icon that matches the existing
     line-icon system.

5. Retain **Governed, Versioned Why**.

6. Retain **Serena + GitNexus**, with optional/highly-recommended language.

The result is six process cards in the order above. Wide layouts use three columns;
intermediate layouts use two; narrow mobile layouts use one. Connector rules must be
updated so no line implies the wrong sequence after wrapping.

### Code intelligence section

- Make the `Serena` and `GitNexus` titles themselves clickable.
- State that both are optional enhanced integrations and highly recommended for the
  best results.
- Explain their complementary roles without calling them canonical memory.
- Preserve GitNexus licensing and verified-capability caveats in the linked core docs.

## 8. Hero interaction and rendering

The milestone's WebGL burn remains the implementation base. Do not reintroduce the
removed legacy effects code or add a second rendering pipeline.

### Smoke

Change only the smoke tone from the current dark gray to a restrained lighter gray.
The initial target is the shader's neutral gray from approximately `vec3(0.42)` to
`vec3(0.50)`, subject to visual review on the existing background. Keep it neutral:
no difference blending, blue shift, chromatic fringe, or opaque white veil.

### Bullet wrapping

Represent each hero bullet as two layout columns:

- fixed marker column;
- flexible text column.

Wrapped lines align with the text column rather than returning under the marker.
The layout must hold at desktop, tablet, 390px, 360px, and 320px widths.

### Selection state

- WF and in-progress burn states: the hero tagline, including “Your repo remembers,”
  is non-selectable like the other WF hero copy.
- Completed reveal: all hero text becomes normally selectable.
- Navigation and buttons remain interactive throughout.
- Pointer/touch handling stays scoped to the burn surface; it must not intercept
  selecting completed hero text or activating links/buttons.
- Burn completion adds the selection-state change without replacing DOM content or
  shifting layout.

### State invariants

- Initial WF composition is unchanged except for the requested selection behavior.
- The burn reveals the M layer and changes text/buttons locally as the burn reaches
  them.
- Completed M composition and responsiveness remain unchanged.
- Clicking or dragging adds burn coverage and never resets existing coverage.
- Desktop mouse and mobile tap/drag remain supported.

## 9. Diagram assets

The Salvor loop diagrams already exist in the milestone commit:

- `site/assets/salvor-loop-with.svg`
- `site/assets/salvor-loop-without.svg`

The implementation must use these committed assets and verify their references. Do
not redraw, regenerate, or substitute them unless a separate visual change is
approved. Automated checks must fail for missing files, invalid references, or local
page-load errors.

## 10. Test strategy

Follow regression-first implementation for behavior and contracts:

1. Add or update failing tests for:
   - beta release metadata and allowed version exclusions;
   - forbidden Salvor-owned `v1.0.0` references;
   - six process-card count and order;
   - vendor-agnostic/portable copy contracts;
   - Serena/GitNexus title links and optional/highly-recommended wording;
   - hero bullet structure/alignment;
   - WF/in-progress/completed selection states;
   - lighter neutral smoke shader value;
   - diagram existence and successful loading.

2. Implement the smallest changes that satisfy those contracts.

3. Run:
   - unit and repository consistency tests;
   - setup/template safety tests;
   - release audit;
   - brand generation/check/audit as affected by beta metadata;
   - Playwright interaction and responsive checks.

4. Directly verify at minimum:
   - desktop wide;
   - 1024px/tablet landscape;
   - 768px/tablet;
   - 390px and 360px phones;
   - 320px narrow phone;
   - mouse click/drag;
   - touch tap/drag;
   - keyboard navigation;
   - selection before, during, and after completion;
   - reduced motion;
   - local resource loading and zero horizontal overflow.

5. Run `git diff --check` and final Pass 2 parity scans.

The preserved untracked `tests/burn-webgl.test.mjs` is user-owned and must not be
staged, deleted, or overwritten without explicit direction.

## 11. Implementation sequence

1. Complete and record the read-only Pass 1 inventory.
2. Add regression tests for protocol, version, site, and interaction contracts.
3. Update canonical protocol, release metadata, and public documentation.
4. Synchronize templates, example project, `.salvor/`, spokes, adapters, and Serena
   retrieval pointers.
5. Mirror approved claims into the site.
6. Apply the hero smoke, bullet, and selection refinements.
7. Verify the committed diagrams and site references.
8. Update `VERSION.md` counters/history plus L1/L2 current-state records.
9. Run the full verification matrix and Pass 2 audit.
10. Present the running site and diff for operator review.

No commit is created until explicitly requested after visual and content review. No
push, merge, or deployment occurs without separate explicit approval.

## 12. Acceptance criteria

The work is ready for operator review when:

- the protocol, `.salvor/`, templates, example, adapters, docs, site, tests, and
  memories use one internally consistent taxonomy and ownership model;
- no live or historical Salvor-owned release identity ambiguously says `v1.0.0`;
- all intended release surfaces say `v1.0.0-beta` / `1.0.0-beta`;
- allowed external, example, and future-version exclusions are unchanged;
- vendor-agnostic and vendor-portable meanings are explicit and calibrated;
- Serena and GitNexus are consistently optional but highly recommended;
- the site has six correctly ordered responsive process cards;
- foundation titles link to the official repositories;
- diagrams load without errors;
- the hero retains its approved start, local burn transition, completed state, and
  responsiveness;
- wrapped bullets align correctly;
- selection changes only when the burn completes;
- mouse, touch, navigation, and buttons work throughout;
- smoke is visibly lighter but remains neutral and restrained;
- all automated and direct verification gates pass;
- unrelated worktrees and untracked files remain untouched.
