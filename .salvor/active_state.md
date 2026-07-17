# salvor Active State — CORE:02 WEB:01 DOCS:02 (2026-07-16)
## Architecture: Markdown prompt/docs product; canonical CLAUDE hub + Codex/Gemini adapters; core/docs/web spokes
## Pipeline: SETUP_PROMPT protocol + README/docs truth → future generated GitHub Pages presentation mirror
## DEPLOYED: Repository framework only on main; web component metadata-only; no site deployment from this worktree
## Current Delta to Published Logic: Self-scaffold + framework improvements merged (feat/decisions → main 3d906dd: .salvor/decisions/, multivendor-OOTB, thin adapters). Self-dogfood applied (CORE:02): AGENTS.md stripped to thin pointer, duplicate GitNexus heading removed from hub. No product-protocol logic change.
## THIN-ADAPTER RULE (dogfooded): GitNexus code-intel block lives ONLY in canonical CLAUDE.md hub. `gitnexus analyze` mirrors it into AGENTS.md — strip it back out so pointers stay thin. Never fork knowledge into an adapter.
## RELEASE-STAGING (copy discipline): main = v1.0.0 line = prompt + docs + site ONLY; the CC plugin is "in active development, ships with v1.1.0" — NO plugin commands / install copy / marketplace refs on main (verified: only mention is the README roadmap bullet, command-free). Plugin-as-shipped copy + commands live ONLY on the `v1.1.0` branch. When syncing ghpages/v1.0.0 off main, the page must say plugin = coming soon.
## LEARNED FAILURES: None registered
## Open: Implement generated public-content sync when approved website code reaches main; request design approval for new page elements
