<!-- {"version":"0.1.0","core":3,"web":1,"docs":3} -->
# salvor VERSION MANIFEST
## Current State
- **Project Version:** v0.1.0
- **Build IDs:** CORE:03 | WEB:01 | DOCS:03
- **Last Updated:** 2026-07-19

---

## Version History

| Date | Build IDs | Summary |
|------|-----------|---------|
| 2026-07-19 | CORE:03 WEB:01 DOCS:03 | Rename the third capture trigger/artifact type **"Domain Tuning" → "Domain Learnings"** (drops HFT "tuning" residue; twins with "Learned Failures"). Folder `.salvor/domain-tuning/` → `.salvor/domain-learnings/` (history preserved); verbatim trigger now `"Save this as a domain learning? (yes/no)"`. Swept SETUP_PROMPT, RULES §2, docs, example, scaffold brain. `DOMAIN_REF.md` unchanged (broader index). Internal `docs/superpowers/` planning docs intentionally left as frozen history. |
| 2026-07-16 | CORE:02 WEB:01 DOCS:02 | v1.0.0-line copy hygiene: README roadmap no longer treats the Claude Code plugin as shipped — reframed as "in active development, ships with v1.1.0" with no command names or install copy (those belong only to the v1.1.0 branch). Keeps the v1.0.0 public surface = prompt + docs + site, plugin coming-soon. |
| 2026-07-16 | CORE:02 WEB:01 DOCS:01 | Self-dogfood the two adapter fixes shipped to the framework: strip the GitNexus block out of the thin `AGENTS.md` pointer (block lives only in the canonical `CLAUDE.md` hub) and remove the duplicate `# GitNexus` heading from the hub. Repo now follows its own thin-adapter rule. |
| 2026-07-16 | CORE:01 WEB:01 DOCS:01 | Initial Salvor self-scaffold. Canonical CLAUDE.md hub, thin Codex/Gemini adapters, L1/L2 cache, RULES.md, three component spokes, tracked Serena memories, deferred/domain-learnings/postmortem scaffolds, and metadata-only web contract. |
