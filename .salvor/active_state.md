# salvor Active State — CORE:03 GHPAGE:01 DOCS:03 (2026-07-19)
## Architecture: Markdown prompt/docs product; canonical CLAUDE hub + Codex/Gemini adapters; core/docs/ghpage spokes
## Pipeline: SETUP_PROMPT protocol + README/docs truth → `ghpages/v1.0.0` semantic presentation mirror
## DEPLOYMENT: main remains canonical; `ghpages/v1.0.0` carries the GHPAGE presentation mirror and Pages workflow; this task does not push or deploy
## Current Delta to Published Logic: main merged at d67b929; GHPAGE:01 mirrors current framework claims, exposes Domain Learnings + decisions, keeps plugins future-only, and embeds the Salvor Loop
## THIN-ADAPTER RULE (dogfooded): GitNexus code-intel block lives ONLY in canonical CLAUDE.md hub. `gitnexus analyze` mirrors it into AGENTS.md — strip it back out so pointers stay thin. Never fork knowledge into an adapter.
## RELEASE-STAGING (copy discipline): main = v1.0.0 line = prompt + docs + site ONLY; the CC plugin is "in active development, ships with v1.1.0" — NO plugin commands / install copy / marketplace refs on main (verified: only mention is the README roadmap bullet, command-free). Plugin-as-shipped copy + commands live ONLY on the `v1.1.0` branch. When syncing ghpages/v1.0.0 off main, the page must say plugin = coming soon.
## CAPTURE TAXONOMY (naming, CORE:03): third trigger renamed "Domain Tuning"→"Domain Learnings" (folder `.salvor/domain-learnings/`, trigger `"Save this as a domain learning? (yes/no)"`) — twins with Learned Failures, drops HFT "tuning" residue. Four homes: domain-learnings/ (empirical findings + durable principles) · decisions/ (design rationale + Invariant/Coupling) · DOMAIN_REF LF# registry (failures) · DEFERRED_TODOS (parked). `docs/superpowers/` planning docs left as frozen history (candidate to gitignore before public launch).
## GHPAGE RESPONSIVE SYNC SOP: every source-of-truth sync runs Playwright directly at desktop, tablet, Galaxy-S25-Edge-like small-phone, and 320px narrow sizes; verify hero/readability, local assets, and zero horizontal overflow
## LEARNED FAILURES: None registered
## Open: Automate canonical public-content sync into the Pages branch; request design approval for new page elements
