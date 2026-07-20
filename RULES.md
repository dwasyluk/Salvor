# salvor Development Rules

These rules are MANDATORY. They supplement `CLAUDE.md` and take precedence over default behavior.

## Protocol Tiers

- **Core Protocol (always on):** context loading and hub/spoke reading (§6.1), L1/L2 memory maintenance (§0.2–0.3), user-gated capture approval (§2, §7), context recovery (§1), security and git-safe operation (§9), canonical ownership and memory layers (§8), and vendor portability via thin adapters. Salvor may update concise operational state as work progresses. It must ask before promoting a decision, domain learning, learned failure, or deferred finding into the repository's durable shared engineering record.
- **Optional Strict Engineering Defaults:** these defaults are optional, editable, and project-specific; disabling them does not break Salvor Core. They cover component build counters (§0.1, §3), env-var conventions (§4.4, §6.2), the branch-deletion rule (§6.11), container permission rules (§5.1), impact analysis before every edit (§4.3), the >100-line search-before-read limit (§4.1), and mirror parity (§0.5, §6.3).

---

## 0. CRITICAL: Task Termination Protocol

Before declaring any task complete, verify and execute this checklist. No task is complete until `VERSION.md` is bumped when required, spokes are synced, and L1/L2 are updated.

1. **Version Check:** If logic or owned content in a component changed, increment its build ID in `VERSION.md`, update the date, and add a component-specific history entry. Versions derive from `VERSION.md`; do not hardcode them in source.
2. **L1 Sync:** Update `.salvor/active_state.md` in dense shorthand and keep it under 50 lines.
3. **L2 Sync:** Update `.salvor/active_state_verbose.md` immediately after L1 with full reasoning, logs, and nuance. L2 is detailed but curated, not unbounded: when it exceeds ~1,500 lines or at release milestones, condense the oldest resolved sections — keep durable conclusions, evidence references, and commit/test/issue IDs; drop raw noise. Never persist material listed in §5.3.
4. **Spoke Sync:** Update the changed component's `CLAUDE.md`; update `.salvor/DOMAIN_REF.md` for domain logic and `.salvor/INFRA.md` for infrastructure. Do not put component-specific detail in root `CLAUDE.md`.
5. **Repository ↔ Website Parity:** Canonical public claims live in `README.md`, `SETUP_PROMPT.md`, and `docs/VENDOR_ADAPTERS.md`. The deployable static site is `site/` on `main`; `.github/workflows/pages.yml` deploys it from `main` via GitHub Actions. Before deploying site changes, run direct Playwright checks at desktop, tablet, small-phone, and 320px sizes; new page sections/interactions/visual elements require explicit operator design approval. Pushing/deploying remain operator-controlled. See §6.3.

## 1. Context Recovery Procedure

If the operator requests context recovery or a logic loop occurs:

1. Stop all code generation.
2. Re-read `.salvor/active_state_verbose.md` from the beginning.
3. Compare current logic against Learned Failures in `.salvor/DOMAIN_REF.md` and L1/L2.
4. Summarize the source of confusion before proceeding.

## 2. Continued Learning Protocol

This protocol covers the first two capture classes: **Decision / Domain Learning** and **Learned Failure (LF#)**. (The third class, **Deferred Finding**, is covered by §7.)

Every domain discovery, hypothesis falsification, validation, vendor/model verdict, parameter learning, evidence-backed bakeoff, dependency probe, technique validation, Learned Failure, deliberate design decision or load-bearing invariant, or durable taxonomy clarification is a mandatory save checkpoint.

At each trigger, pause and ask verbatim — the phrasing that matches the subtype:

> "Save this as a domain learning? (yes/no)" — an empirical finding (**Domain Learning** → `.salvor/domain-learnings/`)
>
> "Record this as a design decision? (yes/no)" — a design decision / invariant (**Design Decision** → `.salvor/decisions/`)

Do not infer the answer, batch unrelated discoveries, or defer the prompt.

On `yes`:

1. Create `.salvor/domain-learnings/YYYY-MM-DD-[CATEGORY]-[OUTCOME].md` following its README, including hypothesis, evidence, datasets, verdict, and cross-links — or, for a design decision, `.salvor/decisions/YYYY-MM-DD-[slug].md` (Context, Decision, Rationale, Invariant, Coupling, Alternatives).
2. Add it to the chronological index in `.salvor/domain-learnings/README.md`.
3. Update `.salvor/DOMAIN_REF.md` as current truth, including any new or revised LF#.
4. Update affected root context, component spoke, L1, L2, and `.serena/memories/`.
5. Report every touched file for end-to-end verification.

On `no`, acknowledge and continue without saving any partial artifact.

## 3. Version Increment Rules

| Component | Owned Scope | Source of Truth | Derived Constant |
|-----------|-------------|-----------------|------------------|
| core | `SETUP_PROMPT.md` | `VERSION.md` → `CORE:XX` | `CORE_BUILD` |
| ghpage | `site/` static site, deployed from `main` via `.github/workflows/pages.yml` | `VERSION.md` → `GHPAGE:XX` | `GHPAGE_BUILD` |
| docs | `README.md` and `docs/` | `VERSION.md` → `DOCS:XX` | `DOCS_BUILD` |

- A change bumps its owning component and receives its own history entry. Mixed changes bump every affected component independently.
- Each bump carries a bulleted change list.
- All version bumps are logged in `VERSION.md` first. No hardcoded component versions in source.

## 4. Search & Tools

1. **Search before read:** do not read any file over 100 lines without first using `rg`, `find_symbol`, or `get_symbols_overview` to target relevant ranges.
2. **Priority:** use Serena MCP symbolic tools first for code structure; fall back to `rg`/glob only when Serena cannot resolve the need.
3. **Impact before edits:** before modifying a function, class, or method, run GitNexus impact analysis and report blast radius. Run GitNexus change detection before committing.
4. **App name:** use `APP_NAME`, defaulting to `salvor`; do not add a separate hardcoded app-name constant.

## 5. Infrastructure & Safety

1. Docker/container build, up/down, or restart requires explicit operator permission because parallel sessions may be active.
2. Calls that mutate production or external state, cost money, or touch shared infrastructure require explicit operator permission.
3. See §9 for never-persist rules and git-safe operation.

## 6. Coding Required Practices

1. Read root `CLAUDE.md`, the relevant spoke, `RULES.md`, and L1 before changing a component.
2. Do not hardcode volatile values such as versions, run modes, or endpoints; wire them to variables or canonical manifests.
3. **Repository ↔ website parity:** repository documentation is authoritative and the site is its semantic presentation mirror. The deployable static site is `site/` on `main`; `.github/workflows/pages.yml` deploys it from `main` via GitHub Actions. If a canonical change needs a new page element, synchronization stops for explicit design approval. Before deploying site changes, run direct Playwright checks across desktop, tablet, small-phone, and 320px narrow consumers. Pushing/deploying remain operator-controlled.
4. Traverse every related code path. A new parameter or behavior must be wired into configuration, UI, reporting, import/export, and all consumers. Stop and ask when uncertain.
5. Numerically sensitive changes require an explicit smoke run before completion or a stated reason the smoke test cannot run.
6. Verify long-running and observability processes are alive (`ps`, `kill -0`, `wc -l`) before trusting output; use mid-run checkpoints for long jobs.
7. At external API boundaries, pass the domain-correct identifier (`slug` ≠ `id` ≠ `external-id`); consult documentation or proxy handlers when uncertain.
8. Every cache key includes every input that changes output, including model name, prompt-version hash, and schema version.
9. LF# is the atomic unit of work. Upgrade every registered fix site together; record new mirror sites as LF# amendments.
10. Production-affecting changes involving money, customer data, external mutations, or shared infrastructure require operator diff acknowledgement before deployment.
11. Delete merged branches locally and remotely in the same task after merge and push; long-lived integration branches require operator confirmation.

## 7. Out-of-Scope Finding Capture (Deferred Finding)

This is the third capture class: **Deferred Finding**. When work surfaces an unrelated bug, risk, or debt item, pause and ask verbatim:

> "Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"

Bundle only findings that emerge together. On `yes`, read the ledger and deduplicate first. If new, record title, location, issue, six-month severity, suggested fix, and reason deferred. Do not derail the current task. When fixed, delete the entry and reference it in the fixing commit.

## 8. Memory layers & canonical ownership [CORE]

- **Shared and Git-tracked does not mean co-canonical.** Every durable fact has one canonical owner; other shared files link or summarize. One-owner model: `.salvor/` artifacts own their engineering knowledge; L1 (`.salvor/active_state.md`) = concise current state; L2 (`.salvor/active_state_verbose.md`) = curated recovery history; `.salvor/DOMAIN_REF.md` = current domain facts + failure registry; decision artifacts (`.salvor/decisions/`) = design rationale; domain-learning artifacts (`.salvor/domain-learnings/`) = validated empirical discoveries; postmortems = incident/failure evidence; `.salvor/DEFERRED_TODOS.md` = deferred findings; GitNexus = machine-derived code structure; Serena = symbol retrieval + concise pointers (not a canonical fork); Spec Kit = its own specs/plans; vendor entrypoints (`CLAUDE.md`/`AGENTS.md`/`GEMINI.md`) route to canonical records and are NOT knowledge forks. This one-owner model is consistent with `SETUP_PROMPT.md` §8.
- **Per-user and optional:** Claude auto-memory under `~/.claude/projects/.../memory/`. It is not shared or canonical and must never hold team truth.

## 9. Security & Git-safe operation [CORE]

1. **NEVER persist** to any memory/knowledge file: API keys, passwords, tokens, private keys, cookies, `.env` contents, credential-bearing URLs, customer PII, production datasets, unredacted logs, dependency dumps, large build output, or hidden model reasoning. **Redact before writing.** Summarize command output — keep evidence, conclusions, and commit/test/issue IDs; drop the noise.
2. `.gitignore` does not remove already-committed data. If credentials were ever committed: revoke them AND remediate git history — ignoring the file afterward is not a fix.
3. **Git-safe operation:** never blanket-stage (no catch-all add flags, no staging `.`), never commit without explicit approval, never silently overwrite files or another tool's managed sections. Stage explicit path lists; show `git diff --cached` before any commit you were asked to make.
