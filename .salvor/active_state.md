# salvor Active State — CORE:03 WEB:01 DOCS:02 (2026-07-19)
## Architecture: Markdown prompt/docs product; canonical CLAUDE hub + Codex/Gemini adapters; core/docs/web spokes
## Pipeline: SETUP_PROMPT protocol + README/docs truth → future generated GitHub Pages presentation mirror
## DEPLOYED: Repository framework only on main; web component metadata-only; no site deployment from this worktree
## Current Delta to Published Logic: Self-scaffold + framework improvements merged (feat/decisions → main 3d906dd: .salvor/decisions/, multivendor-OOTB, thin adapters). Self-dogfood applied (CORE:02): AGENTS.md stripped to thin pointer, duplicate GitNexus heading removed from hub. No product-protocol logic change.
## THIN-ADAPTER RULE (dogfooded): GitNexus code-intel block lives ONLY in canonical CLAUDE.md hub. `gitnexus analyze` mirrors it into AGENTS.md — strip it back out so pointers stay thin. Never fork knowledge into an adapter.
## CAPTURE TAXONOMY (naming, CORE:03): third trigger "Domain Tuning"→"Domain Learnings" (folder `.salvor/domain-learnings/`, trigger `"Save this as a domain learning? (yes/no)"`). Swept across framework + bundled plugin prompt + claude-plugin/ skills; sync-plugin-prompt.sh --check passes. Mirrors main 33d410b.
## LEARNED FAILURES: None registered
## Open: Implement generated public-content sync when approved website code reaches main; request design approval for new page elements
