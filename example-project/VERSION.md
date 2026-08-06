<!-- {"version":"0.1.0","api":2,"web":2} -->
# Notebook VERSION MANIFEST
## Current State
- **Project Version:** v0.1.0
- **Build IDs:** API:02 | WEB:02
- **Last Updated:** 2026-08-05

---

## Version History

| Date | Build IDs | Summary |
|------|-----------|---------|
| 2026-08-05 | API:02 WEB:02 | Protocol migration to Salvor v1.0.0-beta (no component logic changed — counters unchanged). Knowledge IDs moved to slugs (`LF:stale-note-reference`, `deferred:no-persistence`) with structured Subject/Claim headers; RULES extended to §0–§10 incl. the [EXPERIMENTAL] §10.5–§10.6 defaults-off sections; `.salvor/archive/` scaffolded; `Salvor-Protocol: v1.0.0-beta` stamp added; L1 gained the `Last Brain Audit` footer. |
| 2026-07-27 | API:02 WEB:02 | Final soft-launch fixture sync. Routed the API startup name through `APP_NAME` and the static web title/heading through the root `data-app-name` configuration; qualified Serena/GitNexus rules so optional enhanced tools are required only when their MCPs respond; aligned capture indexes with their one-owner artifact classes. |
| 2026-06-22 | API:01 WEB:01 | Initial Salvor scaffold. Hub-and-spoke CLAUDE.md, L1/L2 cache, RULES.md (nine-section scaffold at the time; migrated to §0–§10 on 2026-08-05), VERSION.md, per-component spokes (api/web), DEFERRED_TODOS, domain-learnings + postmortems scaffolds. Worked example: in-memory Notes REST API + static web client. |
