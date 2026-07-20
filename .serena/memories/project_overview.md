# Project Overview

> Serena memories are retrieval aids / pointers, not the canonical brain. The canonical knowledge lives in `.salvor/` artifacts + the hub (`CLAUDE.md`) and spokes. Keep this short; verify against canon before trusting.

Salvor (v1.0.0, released, MIT) is a prompt/docs product that installs a disciplined, git-tracked shared memory structure into any repo so AI coding agents across vendors, sessions, and teammates share accumulated project knowledge. Core pieces: hub-and-spoke context, L1/L2 persisted memory (`.salvor/active_state.md` + verbose), RULES.md enforcement, user-gated capture, and versioned rationale. Tagline framing: "Every approved capture gives the next session more context."

## Modes
- **Core mode** — files only (hub/spokes + `.salvor/` + RULES.md). No MCP dependency.
- **Enhanced mode** — adds Serena + GitNexus MCP substrate. GitNexus safe default = `.gitnexusrc {"indexOnly": true}`.

## Capture taxonomy (three CAPTURE CLASSES)
1. Decision / Domain Learning
2. Learned Failure (LF#)
3. Deferred Finding

## One-owner canonical model
`.salvor/` artifacts + hub/spokes own their knowledge. Serena memories are retrieval aids/pointers, never the canonical source.

## Primary files
README.md, SETUP_PROMPT.md (canonical installer), docs/ARCHITECTURE.md, docs/VENDOR_ADAPTERS.md, docs/FAQ.md, CONTRIBUTING.md, LICENSE. `example-project/` is the rendered runnable demonstration + regression fixture for prompt changes.

Pointers:
- Canonical architecture: ../../docs/ARCHITECTURE.md
- Canonical current state: ../../.salvor/active_state.md
- Canonical rules: ../../RULES.md
