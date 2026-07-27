# Project Overview

> Serena memories are retrieval aids / pointers, not canonical truth. Canonical knowledge lives in `.salvor/` artifacts + the hub (`CLAUDE.md`) and spokes. Keep this short; verify against canon before trusting.

Salvor (v1.0.0-beta soft launch, MIT) is repo-native engineering memory plus a governance protocol: a prompt/docs product that installs a disciplined, vendor-agnostic git-tracked shared knowledge structure into any repo so AI coding agents across vendors, sessions, and teammates share accumulated project knowledge under explicit rules. Compatible thin adapters make that brain vendor-portable without a memory migration. Core pieces: hub/spokes/adapters, L1/L2 persisted state (`.salvor/active_state.md` + verbose), RULES.md enforcement, user-gated capture, and versioned rationale. Framing: "Every approved capture gives the next session more context."

## Modes
- **Core mode** — files only (hub/spokes + `.salvor/` + RULES.md). No MCP dependency.
- **Enhanced mode** — optionally adds Serena + GitNexus MCP substrate; both are highly recommended for the best code-grounded results. GitNexus safe default = `gitnexus analyze --index-only` (v1.6.9+; pure index, no context files/skills/hooks); merge `.gitnexusrc {"indexOnly": true}` for persistence. Older CLIs fall back to `--skip-agents-md`. Detect via `gitnexus analyze --help`.

## Capture taxonomy (three CAPTURE CLASSES)
1. Decision / Domain Learning
2. Learned Failure (LF#)
3. Deferred Finding

## One-owner canonical model
`.salvor/` artifacts + hub/spokes own their knowledge. Serena memories are retrieval aids/pointers, never the canonical source.

## Primary files
README.md, SETUP_PROMPT.md (canonical installer), docs/ARCHITECTURE.md, docs/VENDOR_ADAPTERS.md, docs/FAQ.md, CONTRIBUTING.md, LICENSE. `example-project/` is the rendered runnable demonstration + regression fixture for prompt changes. Brand routing: immutable `assets/brand/reference/LOGO.svg` owns regular uses; `LOGO-SM.svg` owns favicon/touch icons; see `assets/brand/BRAND_ASSETS.md` and `.salvor/decisions/2026-07-27-canonical-logo-svg-masters.md`.

Pointers:
- Canonical architecture: ../../docs/ARCHITECTURE.md
- Canonical current state: ../../.salvor/active_state.md
- Canonical rules: ../../RULES.md
- Canonical integration policy: ../../docs/VENDOR_ADAPTERS.md
