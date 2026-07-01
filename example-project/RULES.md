# Notebook Development Rules

These rules are MANDATORY. They supplement CLAUDE.md and take precedence over default behavior.

---

## 0. CRITICAL: Task Termination Protocol
Before declaring any task "Complete" or "Done," you MUST verify and execute this checklist. **No task is complete until
VERSION.md is bumped, spokes are synced, and L1/L2 caches are updated.**

1. **Version Check:** If any logic in a component changed, increment its build ID in `VERSION.md` and update the "Last
   Updated" date. No hardcoded versions in source — they derive from VERSION.md at build time.
2. **L1 Sync (`.salvor/active_state.md`):** Dense technical shorthand. Keep under 50 lines.
3. **L2 Sync (`.salvor/active_state_verbose.md`):** Offload full reasoning, logs, and nuance here.
4. **Spoke Sync:** Update the changed component's spoke `CLAUDE.md`. Update `.salvor/DOMAIN_REF.md` if domain logic changed;
   `.salvor/INFRA.md` if infra changed. Do NOT edit root CLAUDE.md for component-specific changes.
5. **Production/Mirror Parity:** N/A — no live/mirror pair in this project.

## 1. Dementia Recovery Procedure
If I mention "Dementia" or you find yourself in a logic loop:
1. **Stop** all code generation.
2. **Re-read** `.salvor/active_state_verbose.md` from the beginning.
3. **Compare** current logic against "Learned Failures" in `.salvor/DOMAIN_REF.md` and L1/L2.
4. **Summarize** the source of the confusion before proceeding.

## 2. Continued Learning Protocol
Every domain discovery, hypothesis falsification, validation, vendor/model verdict, or parameter learning is a **mandatory
save checkpoint**. The discovery is not the end — persisting it across the stack is.

**Trigger:** any of — hypothesis tested with evidence (accepted OR falsified); multi-dataset matrix / bakeoff result;
vendor / dependency probe with a verdict; new technique validated; Learned Failure (LF#) registered or updated; taxonomy
clarification that will outlive the refactor.

**Mandatory prompt:** at the trigger moment, pause and ask me verbatim:

> "Save this as a domain-tuning artifact? (yes/no)"

Non-negotiable — it is the signal that the rule is working. Do not infer the answer, do not batch multiple discoveries
into one prompt, do not defer.

**On `yes` — execute the full stack update:**
1. **Dated artifact:** create `.salvor/domain-tuning/YYYY-MM-DD-[CATEGORY]-[OUTCOME].md` per `.salvor/domain-tuning/README.md`.
   Include hypothesis, evidence, dataset(s), verdict, cross-links.
2. **TOC update:** add a row to the chronological index in `.salvor/domain-tuning/README.md`.
3. **DOMAIN_REF.md:** update to reflect new authoritative state — new/updated LF# entry, parameter rationale, finding
   status. DOMAIN_REF is current truth; the artifact is the frozen audit trail.
4. **Stack evaluation — update if affected:** `CLAUDE.md` hub (only if project-wide context shifts); spoke `CLAUDE.md`;
   L1 (`.salvor/active_state.md`); L2 (`.salvor/active_state_verbose.md`); Serena memories (`.serena/memories/`); per-user
   auto-memory (if enabled — see §8).
5. **Confirmation report:** list which files were touched so I can verify end-to-end.

**On `no`:** acknowledge and continue. Do not silently save a partial version.

**Rationale:** analytical context is lost to chat rotation, compaction, and tool drift. A discovery not written to git +
propagated will be re-litigated next session. This rule makes propagation visible and user-gated so it cannot silently
fail.

## 3. Version Increment Rules
| Component | Source of Truth | Derived Constant |
|-----------|-----------------|------------------|
| api | `VERSION.md` -> `API:XX` | `API_BUILD` (build-time env / generated constant) |
| web | `VERSION.md` -> `WEB:XX` | `WEB_BUILD` (build-time env / generated constant) |

- A change in a component bumps its own counter and gets its own history row. Mixed commits bump all affected components
  independently.
- Each bump carries a bulleted change list. Multiple components → one block each.

**ALL version bumps MUST be logged in VERSION.md first. No hardcoded versions in source code.**

## 4. Search & Tools
1. **Search-Before-Read:** do not `read_file` on any file >100 lines without first using `grep`, `find_symbol`, or
   `get_symbols_overview` to find specific line ranges. Targeted reads only.
2. **Priority:** Serena MCP symbolic tools first (`find_symbol`, `get_symbols_overview`). Fall back to `grep`/`glob` only
   if Serena can't resolve.
3. **Impact before edits:** before modifying a function/class/method, run GitNexus impact analysis and report the blast
   radius. Run change-detection before committing.
4. **App Name:** never hardcode the project name — use `APP_NAME` or the build constant.

## 5. Infrastructure & Safety
1. **Docker / containers:** explicit permission required for `build`, `up/down`, or `restart`. Treat as destructive — the
   operator may run parallel sessions.
2. **Production endpoints / external APIs:** explicit permission required for any call that mutates external state, costs
   money, or touches shared infrastructure.

## 6. Coding required practices
1. Read root `CLAUDE.md`, the relevant spoke `CLAUDE.md`(s), and referenced L1/L2 state before coding any component.
2. Do NOT hardcode values that change often — versions, run modes, environment endpoints. Wire them to variables.
3. **Live ↔ Mirror parity:** N/A — no live/mirror pair in this project.
4. **Full code-path traversal.** When you change one area, follow every related code path and update it. Example: a new
   `Note` field must be added to the `api` types, the store, the server serialization, AND the `web` client's interface +
   render — never a half-wired value. Never work on assumptions; if uncertain, STOP AND ASK.
5. **Smoke-test before declaring a numerically-sensitive fix done.** Logic changes (id generation, sort order, copy
   semantics, validation) require an explicit smoke run before "done," or a stated reason it can't be smoke-tested.
   "Compiles, ship it" is not acceptable.
6. **Verify long-running / observability processes are alive before trusting output.** Liveness check (`ps`, `kill -0`,
   `wc -l`) before relying on a background tool's output; mid-run checkpoints for multi-hour runs.
7. **Identifier hygiene at external API boundaries.** Pass the domain-correct identifier at every external call site
   (note `id` is a string, not a number). When in doubt, grep the route handler.
8. **Cache key invariants.** Any cache key must include EVERY input that changes the output (schema version, etc.). Adding
   an input without bumping the key = silent staleness.
9. **LF# is the atomic unit of work.** Upgrading a fix (v1 → v2) updates every site listed under that LF# in DOMAIN_REF.md
   together. A new site = a new LF#-amendment commit, not a quiet one-liner.
10. **Production-affecting code requires explicit operator ack before deploy.** Any path touching shared infra — operator
    sees the diff first. Not "I think this is right, pushing."
11. **Delete merged branches in the same step as the merge.** After merge + push: `git branch -d <name>` AND
    `git push origin --delete <name>` in one task. Exception: long-lived integration branches need operator confirmation.

## 7. Out-of-scope finding capture (Deferred TODOs)
When in-progress work surfaces a bug, risk, tech-debt item, or other finding **not directly related to the current task**,
you MUST prompt me before doing anything else with it. Never silently ignore an unrelated finding (it gets lost), and
never silently log one (I own prioritization).

**Mandatory prompt:**

> "Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"

Bundle multiple findings that emerge together into one prompt. **On `yes`:**
1. Read `.salvor/DEFERRED_TODOS.md` first and **deduplicate** — if the finding (or a close relative) already exists, surface
   it and ask whether to augment rather than add a duplicate.
2. If new, append an entry with: title, **Where** (file/location), **What**, **Severity** (Low / Medium / High — judged
   as "impact if left ~6 months," not "broken today"), and **Suggested fix**.
3. Do not derail the current task to fix it — capture and continue.

When one is later fixed: delete its entry, and reference it in the fixing commit (`closes deferred #N` if numbered).

## 8. Memory layers (what's shared vs per-user)
- **Shared, canonical, git-tracked (the team brain):** everything in-repo — `CLAUDE.md` hub + spokes, `RULES.md`,
  `VERSION.md`, `docs/*` (L1, L2, DOMAIN_REF, INFRA, DEFERRED_TODOS, postmortems, domain-tuning), `.serena/memories/`,
  and the GitNexus index blocks. This is what every contributor's agent reads.
- **Per-user, optional, NOT shared (Claude Code only):** auto-memory at `~/.claude/projects/.../memory/`. Useful for
  personal/operator preferences, but it is not version-controlled and does not reach teammates. Never put shared truth
  there — that belongs in-repo.
