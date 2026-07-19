<!-- {"version":"0.1.0","core":3,"web":1,"docs":2} -->
# salvor VERSION MANIFEST
## Current State
- **Project Version:** v0.1.0
- **Build IDs:** CORE:03 | WEB:01 | DOCS:02
- **Last Updated:** 2026-07-19

---

## Version History

| Date | Build IDs | Summary |
|------|-----------|---------|
| 2026-07-19 | CORE:03 WEB:01 DOCS:02 | Rename third capture trigger **"Domain Tuning" → "Domain Learnings"** (folder `.salvor/domain-tuning/` → `.salvor/domain-learnings/`, history preserved; verbatim trigger `"Save this as a domain learning? (yes/no)"`). Swept SETUP_PROMPT + RULES §2 (the protocol), docs, example, scaffold brain, and the bundled plugin prompt + `claude-plugin/` skill files; re-ran `sync-plugin-prompt.sh` (bundled copy byte-identical). Mirrors main `33d410b`. |
| 2026-07-16 | CORE:02 WEB:01 DOCS:01 | Self-dogfood the two adapter fixes shipped to the framework: strip the GitNexus block out of the thin `AGENTS.md` pointer (block lives only in the canonical `CLAUDE.md` hub) and remove the duplicate `# GitNexus` heading from the hub. Repo now follows its own thin-adapter rule. |
| 2026-07-16 | CORE:01 WEB:01 DOCS:01 | Initial Salvor self-scaffold. Canonical CLAUDE.md hub, thin Codex/Gemini adapters, L1/L2 cache, RULES.md, three component spokes, tracked Serena memories, deferred/domain-learnings/postmortem scaffolds, and metadata-only web contract. |
