# Notebook Development Rules

These rules are MANDATORY. They supplement CLAUDE.md and take precedence over default behavior.

## Protocol Tiers

This example project demonstrates the **optional strict profile** — every strict default enabled on top of the core.

- **Core Protocol (always on):** context loading and hub/spoke reading (§6.1), L1/L2 memory maintenance (§0.2–0.3), user-gated capture approval (§2, §7), context recovery (§1), security and git-safe operation (§9), canonical ownership and memory layers (§8), distributed-brain IDs, post-pull reconcile, and the recurring brain audit (§10), and vendor portability via thin adapters. Salvor may update concise operational state as work progresses. It must ask before promoting a decision, domain learning, learned failure, or deferred finding into the repository's durable shared engineering record.
- **Optional Strict Engineering Defaults:** these defaults are optional, editable, and project-specific; disabling them does not break Salvor Core. They cover component build counters (§0.1, §3), env-var conventions (§4.4, §6.2), the branch-deletion rule (§6.11), container permission rules (§5.1), impact analysis before every edit (§4.3), the >100-line search-before-read limit (§4.1), mirror parity (§0.5, §6.3), and the pre-merge brain reconcile (§0.6, §10.2).
- **[EXPERIMENTAL] Beta features:** agentic provisional capture and the archive (§10.5–§10.6) are beta, **default OFF**, and opt-in only by editing their config lines. They may change based on community feedback and are never required by Core or Strict behavior.

---

## 0. CRITICAL: Task Termination Protocol
Before declaring any task "Complete" or "Done," you MUST verify and execute this checklist. **No task is complete until
VERSION.md is bumped, spokes are synced, and L1/L2 caches are updated.**

1. **Version Check:** If any logic in a component changed, increment its build ID in `VERSION.md` and update the "Last
   Updated" date. No hardcoded versions in source — they derive from VERSION.md at build time. On a feature branch,
   record the history row with the literal build ID `pending` instead — real numbers are assigned at integration
   (§3, §10.2).
2. **L1 Sync (`.salvor/active_state.md`):** Dense technical shorthand. Keep under 50 lines.
3. **L2 Sync (`.salvor/active_state_verbose.md`):** Offload full reasoning, logs, and nuance here. L2 is detailed but
   curated, not unbounded: when it exceeds ~1,500 lines or at release milestones, condense the oldest resolved sections —
   keep durable conclusions, evidence references, and commit/test/issue IDs; drop raw noise. Never persist material
   listed in §9.1.
4. **Spoke Sync:** Update the changed component's spoke `CLAUDE.md`. Update `.salvor/DOMAIN_REF.md` if domain logic changed;
   `.salvor/INFRA.md` if infra changed. Do NOT edit root CLAUDE.md for component-specific changes.
5. **Production/Mirror Parity:** N/A — no live/mirror pair in this project.
6. **Brain Reconcile (feature branches):** if this task ends in a PR or a merge into the integration branch (`main`),
   fetch the target branch and run the §10.2 Brain Reconcile ceremony against it BEFORE the merge.

## 1. Context Recovery Procedure
If I ask for context recovery or you find yourself in a logic loop:
1. **Stop** all code generation.
2. **Re-read** `.salvor/active_state_verbose.md` from the beginning.
3. **Compare** current logic against "Learned Failures" in `.salvor/DOMAIN_REF.md` and L1/L2.
4. **Summarize** the source of the confusion before proceeding.

## 2. Continued Learning Protocol
This protocol covers the first two capture classes: **Decision / Domain Learning** and **Learned Failure (`LF:<slug>`)**. (The
third class, **Deferred Finding**, is covered by §7.) Its shared record is vendor-agnostic repository Markdown; thin
adapters make it vendor-portable without forking that record. Every domain discovery, hypothesis falsification, validation,
vendor/model verdict, or parameter learning is a **mandatory save checkpoint**. The discovery is not the end — persisting
it across the stack is.

**Trigger:** any of — hypothesis tested with evidence (accepted OR falsified); multi-dataset matrix / bakeoff result;
vendor / dependency probe with a verdict; new technique validated; Learned Failure (`LF:<slug>`) registered or updated; a
**deliberate design decision or load-bearing invariant**; or a taxonomy clarification that will outlive the refactor.

**Mandatory prompt:** at the trigger moment, pause and ask me verbatim — the phrasing that matches the kind:

> "Save this as a domain learning? (yes/no)"  — an empirical finding (**Domain Learning**)
>
> "Record this as a design decision? (yes/no)"  — a design decision / invariant (**Design Decision**)

Non-negotiable — it is the signal that the rule is working. Do not infer the answer, do not batch multiple discoveries
into one prompt, do not defer.

**On `yes` — execute the full stack update:**
1. **Dedupe by subject first:** search the matching registry/index (and `DOMAIN_REF.md`) by Subject tags — not just
   title or slug. If an artifact with overlapping subject and the same claim exists, surface it and ask whether to
   augment instead of duplicating (same contract as §7).
2. **Dated artifact:** create `.salvor/domain-learnings/YYYY-MM-DD-[CATEGORY]-[OUTCOME].md` (ID `DL:<kebab-slug>`, or
   `LF:<kebab-slug>` for a Learned Failure spec) following its README, including hypothesis, evidence, datasets,
   verdict, and cross-links — or, for a design decision, `.salvor/decisions/YYYY-MM-DD-[slug].md` (ID `DEC:<kebab-slug>`;
   Context, Decision, Rationale, Invariant, Coupling, Alternatives). Every artifact opens with the structured header —
   ID / Subject / Claim / Evidence date / Status (§10.1).
3. **TOC update:** add a row to the matching chronological index:
   `.salvor/domain-learnings/README.md` for empirical findings, or
   `.salvor/decisions/README.md` for design decisions.
4. **DOMAIN_REF.md:** update to reflect new authoritative state — new/updated `LF:<slug>` entry, parameter rationale,
   finding status. DOMAIN_REF is current truth; the artifact is the frozen audit trail.
5. **Stack evaluation — update if affected:** `CLAUDE.md` hub (only if project-wide context shifts); spoke `CLAUDE.md`;
   L1 (`.salvor/active_state.md`); L2 (`.salvor/active_state_verbose.md`); Serena memories (`.serena/memories/`); per-user
   auto-memory (if enabled — see §8).
6. **Confirmation report:** list which files were touched so I can verify end-to-end.

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
- **Counters advance only on the integration branch** (`main`). Work committed directly to it bumps immediately — the
  solo flow is unchanged. On a feature branch, add the history row with the literal build ID `pending` (e.g.
  `| 2026-08-05 | API:pending | change summary |`) and leave the JSON header, "Build IDs" line, L1 header, and spoke
  build lines untouched. The merge (§10.2 Brain Reconcile) assigns real numbers — one bump per affected component per
  integration — and rewrites the `pending` rows in the merge commit, so parallel branches never race on a counter.

**ALL version bumps MUST be logged in VERSION.md first. No hardcoded versions in source code.**

## 4. Search & Tools
1. **Search-Before-Read:** do not `read_file` on any file >100 lines without first using `grep`, `find_symbol`, or
   `get_symbols_overview` to find specific line ranges. Targeted reads only.
2. **Serena MCP priority:** when its tools respond in the current client, use symbolic tools first
   (`find_symbol`, `get_symbols_overview`); fall back to `grep`/`glob` when Serena cannot resolve the need or its MCP is
   unavailable, and never claim Serena results that did not run.
3. **GitNexus MCP impact:** when its tools respond in the current client, run impact analysis before modifying a
   function/class/method and change-detection before committing. When unavailable, state that explicitly, use the best
   available structural review fallback, and never fabricate GitNexus results.
4. **App Name:** never hardcode the project name — use `APP_NAME` or the build constant.

## 5. Infrastructure & Safety
1. **Docker / containers:** explicit permission required for `build`, `up/down`, or `restart`. Treat as destructive — the
   operator may run parallel sessions.
2. **Production endpoints / external APIs:** explicit permission required for any call that mutates external state, costs
   money, or touches shared infrastructure.
3. See §9 for never-persist rules and git-safe operation.

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
9. **The Learned Failure is the atomic unit of work.** Upgrade every fix site registered under an `LF:<slug>` entry in
   DOMAIN_REF.md together; record new mirror sites as LF amendments.
10. **Production-affecting code requires explicit operator ack before deploy.** Any path touching shared infra — operator
    sees the diff first. Not "I think this is right, pushing."
11. **Delete merged branches in the same step as the merge.** After merge + push: `git branch -d <name>` AND
    `git push origin --delete <name>` in one task. Exception: long-lived integration branches need operator confirmation.

## 7. Out-of-scope finding capture (Deferred Findings)
This is the third capture class: **Deferred Finding**.
When in-progress work surfaces a bug, risk, tech-debt item, or other finding **not directly related to the current task**,
you MUST prompt me before doing anything else with it. Never silently ignore an unrelated finding (it gets lost), and
never silently log one (I own prioritization).

**Mandatory prompt:**

> "Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"

Bundle multiple findings that emerge together into one prompt. **On `yes`:**
1. Read `.salvor/DEFERRED_TODOS.md` first and **deduplicate by subject** — if the finding (or a close relative) already
   exists, surface it and ask whether to augment rather than add a duplicate.
2. If new, record it under a self-allocating slug ID (`### deferred:<kebab-slug> — <short title>`; never a sequential
   number, §10.1) with subject tags, location (**Where**), issue (**What**), **Severity** (Low / Medium / High — judged
   as "impact if left ~6 months," not "broken today"), **Suggested fix**, and reason deferred.
3. Do not derail the current task to fix it — capture and continue.

When one is later fixed: delete its entry, and reference the stable ID in the fixing commit (`closes deferred:<slug>`).

## 8. Memory layers & canonical ownership [CORE]
- **Shared and Git-tracked does not mean co-canonical.** Every durable fact has one canonical owner; other shared files
  link or summarize rather than fork a second copy. The `.salvor/` artifacts own their knowledge:
  - **L1 (`.salvor/active_state.md`)** — concise current state.
  - **L2 (`.salvor/active_state_verbose.md`)** — curated recovery history.
  - **`.salvor/DOMAIN_REF.md`** — current domain facts + failure registry (`LF:`).
  - **`.salvor/decisions/`** — design rationale + load-bearing invariants.
  - **`.salvor/domain-learnings/`** — validated empirical discoveries.
  - **`.salvor/postmortems/`** — incident / failure evidence.
  - **`.salvor/DEFERRED_TODOS.md`** — deferred, out-of-scope findings.
  - **GitNexus** — machine-derived code structure in its regenerable, gitignored index.
  - **Serena (`.serena/memories/`)** — symbol retrieval + concise pointers into the canonical records above.
  - **Vendor entrypoints** (`CLAUDE.md` hub + spokes, `AGENTS.md`, `GEMINI.md`) route to those canonical records; they
    do not fork or duplicate the knowledge.
- **Per-user, optional, NOT shared (Claude Code only):** auto-memory at `~/.claude/projects/.../memory/`. Useful for
  personal/operator preferences, but it is not version-controlled and does not reach teammates. Never put shared truth
  there — that belongs in-repo.

## 9. Security & Git-safe operation [CORE]

1. **NEVER persist** to any memory/knowledge file: API keys, passwords, tokens, private keys, cookies, `.env` contents,
   credential-bearing URLs, customer PII, production datasets, unredacted logs, dependency dumps, large build output, or
   hidden model reasoning. **Redact before writing.** Summarize command output — keep evidence, conclusions, and
   commit/test/issue IDs; drop the noise.
2. `.gitignore` does not remove already-committed data. If credentials were ever committed: revoke them AND remediate git
   history — ignoring the file afterward is not a fix.
3. **Git-safe operation:** never blanket-stage (no catch-all add flags, no staging `.`), never commit without explicit
   approval, never silently overwrite files or another tool's managed sections. Stage explicit path lists; show
   `git diff --cached` before any commit you were asked to make.

## 10. Distributed Brain: IDs, Reconcile & Audit [CORE; §10.2 trigger 1 STRICT]

The brain travels through Git. Parallel branches, agents, and worktrees can capture semantically duplicate or contradictory knowledge under different names, and shared single-file surfaces conflict textually. This section keeps the brain single-truth with no central ID authority.

### 10.1 Knowledge IDs [CORE]

- Every durable knowledge artifact has a **self-allocating slug ID** — `<CLASS>:<kebab-slug>` — assigned at capture time: `LF:` (Learned Failure), `DL:` (Domain Learning), `DEC:` (Design Decision), `PM:` (Postmortem), `deferred:` (Deferred Finding). **Never a sequential number** — no ID allocation may read shared state.
- Every artifact opens with the **structured header** (the semantic-dedupe key): **ID** · **Subject** (tags: the system/vendor/component the claim is about) · **Claim** (one-line invariant) · **Evidence date** · **Status** (`live` | `superseded-by: <id>`).
- IDs are immutable once merged to the integration branch; renaming before merge (on the owning branch) is fine.
- Registries/indexes enforce slug uniqueness per class. A slug collision found at reconcile time is a probable duplicate (§10.4), not an error. Superseded artifacts keep their ID with `Status: superseded-by: <id>` — never delete an ID from a registry; references must not dangle.

### 10.2 Brain Reconcile (merge/pull ceremony)

**Triggers:** (1) **[STRICT] Pre-merge** — on a feature branch, before opening a PR or merging into `main`, fetch the target and reconcile against it (§0.6), so dedupe lands BEFORE the textual conflict. (2) **[CORE] Post-pull** — at session start, if incoming commits touched `.salvor/`, `VERSION.md`, `RULES.md`, or `.serena/memories/`, ask verbatim:

> "Incoming brain changes detected — run brain reconcile? (yes/no)"

**Procedure:** three-way diff (merge base / ours / theirs) over the brain surfaces → semantic comparison (§10.4) → per-surface resolution. Every merge/augment/supersede of durable knowledge is operator-gated, verbatim:

> "Merge these two <class> artifacts into one? (yes/no)"

| Surface | Resolution rule |
|---------|-----------------|
| Artifacts (DL / DEC / PM / LF specs) | Winner absorbs loser with a provenance block; loser becomes a one-line redirect stub (`superseded-by:`). |
| `.salvor/DOMAIN_REF.md` | Single current truth — contradictions resolve to ONE `Status: live` entry; loser marked superseded with date + why. |
| L1 (`.salvor/active_state.md`) | NEVER textually merged — re-synthesize from both sides' L2 + artifacts after resolution (≤50 lines). |
| L2 (`.salvor/active_state_verbose.md`) | Union both sides, normalize to chronological order, collapse duplicate sections. |
| Index READMEs + `DEFERRED_TODOS.md` | Union rows, re-sort, dedupe. (Optional `.gitattributes` `merge=union` convenience — reconcile normalizes regardless.) |
| `RULES.md` | Governance — conflicting edits to Salvor-managed sections are ALWAYS operator-decided; never auto-merged. |
| `.serena/memories/` | Derived views — re-derive from the reconciled canonical artifacts; never merge textually. |
| Spoke `CLAUDE.md` | Update knowledge references to the reconciled IDs; [STRICT] build lines per §3 integration bump. |
| `VERSION.md` | [STRICT] §3 integration bump: assign real numbers to `pending` rows — one bump per component per integration. |

End with the standard confirmation report (every touched file).

### 10.3 Brain Audit (recurring semantic self-audit)

Reconcile only sees what a merge brings in; duplicates also accrete on a single branch or pre-date the protocol.

- **Cadence:** due every **3 days** — `AUDIT_INTERVAL_DAYS = 3`, operator-tunable (beta default; feedback welcome on the default and its configurability). Tracked by the `## Last Brain Audit:` line in L1. At session start, if overdue, ask verbatim:

> "Brain audit is due (last run N days ago) — run it now? (yes/no)"

- **Sweep:** the §10.4 comparison run all-pairs across the whole brain, plus: contradiction check against DOMAIN_REF current truth; missing/empty Subject/Claim headers; stale L1 lines; dangling or superseded cross-links; aging deferred findings; L1 ≤50-line and L2 rotation checks.
- Findings route through the same classification + operator gates as §10.2. Update the L1 audit line and land the run as an ordinary commit.

### 10.4 Semantic comparison (never filename-only)

1. **Pair by Subject:** for each new/changed artifact, collect every existing artifact (any class, any date) sharing ≥1 Subject tag. Subject overlap — not name similarity — is the pairing key.
2. **Compare Claims** (read both artifacts in full): same claim, compatible evidence → **duplicate** (merge into one — keep the richer body, union evidence, one live ID); compatible claims, different facets → **overlapping** (augment the canonical one); incompatible claims → **contradictory** (operator decision required, presented with both evidence dates and a newest-evidence presumption; exactly ONE `Status: live` entry survives); one retests/upgrades the other → **supersedes** (v1 → v2 per §6.9 atomicity).
3. No pair → **distinct** — keep as-is.

### 10.5 [EXPERIMENTAL] Agentic provisional capture — default OFF

**Config: `AGENT_CAPTURE = off`** (operator-tunable: `off` | `provisional`). **Beta feature under active calibration** — graduation criteria are tracked publicly (see the Salvor project's CONTRIBUTING). When `off` (the default), nothing changes: ALL durable capture remains user-gated per §2/§7 — agents never write durable knowledge without the verbatim prompt.

When the operator sets `provisional`:

- **Trust tier.** Agents may create durable artifacts without the per-item gate, but every such artifact enters a visibly lower trust tier: its structured header carries `Contributed-by: agent — <vendor/model>, <date>` and `Review: unreviewed`. Human-gated captures carry `Contributed-by: operator-approved` and no `Review:` field (the capture gate itself is the ratification). Provenance is plain Markdown data — it must survive any vendor switch and never rely on vendor-specific state.
- **Per-class policy.** Allowed provisionally: **Deferred Findings**, **Domain Learnings**, and **Learned Failures** — with `Claim:` and evidence content mandatory (no evidence, no capture). **Design Decisions:** agents may only file proposals (`Review: proposed`); a `DEC:` never becomes governing rationale without human ratification. **RULES changes: never agentic** (§10.2 governance), under any setting.
- **Consumption rule (all vendors).** Treat `Review: unreviewed` knowledge as *hypothesis, not invariant*: cite its provenance when acting on it, never let it relax a rule, and never let it override ratified knowledge. An unreviewed↔ratified contradiction resolves automatically in favor of the ratified entry pending review.
- **L1 marking.** L1 shorthand derived from unreviewed knowledge carries a `(prov)` tag until ratification — L1 must never launder provisional claims into apparent truth.
- **Commit trailer.** Commits introducing agent contributions carry the trailer `Salvor-Contribution: agent`. Header and trailer must agree — a mismatch is an audit red flag.
- **Ratification.** The Brain Audit (§10.3) enumerates every `Review: unreviewed` / `Review: proposed` artifact by scanning headers (no separate ledger — derived, conflict-free) and presents each through the §10.4 classification with the verbatim gate:

> "Ratify this agent contribution? (yes / no / archive)"

`yes` → `Review: ratified`, drop the L1 `(prov)` tags; `no` → one-line redirect stub stays in place, full content moves to the archive (§10.6); `archive` → moved untouched for later review. Review each item individually — bulk ratification defeats the tier.

### 10.6 [EXPERIMENTAL] Archive — `.salvor/archive/`

Unreviewed knowledge is parked, never silently discarded — the same principle as deferred findings, one tier down.

- **Layout:** mirrors the live folder structure (`archive/domain-learnings/`, `archive/decisions/`, `archive/postmortems/`). An archived artifact keeps its ID and full content; the live registry keeps a one-line `Status: archived` pointer (never delete an ID — §10.1).
- **Aging:** `ARCHIVE_AFTER_DAYS = 90` (operator-tunable). The Brain Audit surfaces unreviewed contributions older than the window with the verbatim gate:

> "Archive N stale unreviewed contributions? (yes/no)"

**Ratified knowledge never ages out** — it lives until superseded.
- **Load rule:** agents never read `.salvor/archive/` unless explicitly instructed (same contract as L2). The archive optimizes attention, not disk — git history retains everything regardless.
- **Un-archive:** late ratification moves the artifact back and flips `Review:`; references never dangled because the ID persisted.
- **Offloading** (e.g. object storage) is out of core scope — community integrations welcome; Salvor itself installs no hooks.
