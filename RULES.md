# salvor Development Rules

These rules are MANDATORY. They supplement `CLAUDE.md` and take precedence over default behavior.

---

## 0. CRITICAL: Task Termination Protocol

Before declaring any task complete, verify and execute this checklist. No task is complete until `VERSION.md` is bumped when required, spokes are synced, and L1/L2 are updated.

1. **Version Check:** If logic or owned content in a component changed, increment its build ID in `VERSION.md`, update the date, and add a component-specific history entry. Versions derive from `VERSION.md`; do not hardcode them in source.
2. **L1 Sync:** Update `.salvor/active_state.md` in dense shorthand and keep it under 50 lines.
3. **L2 Sync:** Update `.salvor/active_state_verbose.md` immediately after L1 with full reasoning, logs, and nuance.
4. **Spoke Sync:** Update the changed component's `CLAUDE.md`; update `.salvor/DOMAIN_REF.md` for domain logic and `.salvor/INFRA.md` for infrastructure. Do not put component-specific detail in root `CLAUDE.md`.
5. **Repository ↔ Website Parity:** Canonical public claims live in `README.md`, `SETUP_PROMPT.md`, and `docs/VENDOR_ADAPTERS.md`. Once site implementation exists on `main`, mapped site copy is generated and lands with source changes in the same commit. New page sections, interactions, or visual elements require explicit operator design approval. See §6.3.

## 1. Dementia Recovery Procedure

If the operator mentions “Dementia” or a logic loop occurs:

1. Stop all code generation.
2. Re-read `.salvor/active_state_verbose.md` from the beginning.
3. Compare current logic against Learned Failures in `.salvor/DOMAIN_REF.md` and L1/L2.
4. Summarize the source of confusion before proceeding.

## 2. Continued Learning Protocol

Every domain discovery, hypothesis falsification, validation, vendor/model verdict, parameter learning, evidence-backed bakeoff, dependency probe, technique validation, Learned Failure, or durable taxonomy clarification is a mandatory save checkpoint.

At each trigger, pause and ask verbatim:

> "Save this as a domain learning? (yes/no)"

Do not infer the answer, batch unrelated discoveries, or defer the prompt.

On `yes`:

1. Create `.salvor/domain-learnings/YYYY-MM-DD-[CATEGORY]-[OUTCOME].md` following its README, including hypothesis, evidence, datasets, verdict, and cross-links.
2. Add it to the chronological index in `.salvor/domain-learnings/README.md`.
3. Update `.salvor/DOMAIN_REF.md` as current truth, including any new or revised LF#.
4. Update affected root context, component spoke, L1, L2, and `.serena/memories/`.
5. Report every touched file for end-to-end verification.

On `no`, acknowledge and continue without saving any partial artifact.

## 3. Version Increment Rules

| Component | Owned Scope | Source of Truth | Derived Constant |
|-----------|-------------|-----------------|------------------|
| core | `SETUP_PROMPT.md` | `VERSION.md` → `CORE:XX` | `CORE_BUILD` |
| web | future `site/` implementation | `VERSION.md` → `WEB:XX` | `WEB_BUILD` |
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

## 6. Coding Required Practices

1. Read root `CLAUDE.md`, the relevant spoke, `RULES.md`, and L1 before changing a component.
2. Do not hardcode volatile values such as versions, run modes, or endpoints; wire them to variables or canonical manifests.
3. **Repository ↔ website parity:** repository documentation is authoritative and the future site is a generated semantic mirror. Existing mapped copy updates automatically. If a canonical change needs a new page element, synchronization stops for explicit design approval. Once site code exists on `main`, source and mirror changes land together.
4. Traverse every related code path. A new parameter or behavior must be wired into configuration, UI, reporting, import/export, and all consumers. Stop and ask when uncertain.
5. Numerically sensitive changes require an explicit smoke run before completion or a stated reason the smoke test cannot run.
6. Verify long-running and observability processes are alive (`ps`, `kill -0`, `wc -l`) before trusting output; use mid-run checkpoints for long jobs.
7. At external API boundaries, pass the domain-correct identifier (`slug` ≠ `id` ≠ `external-id`); consult documentation or proxy handlers when uncertain.
8. Every cache key includes every input that changes output, including model name, prompt-version hash, and schema version.
9. LF# is the atomic unit of work. Upgrade every registered fix site together; record new mirror sites as LF# amendments.
10. Production-affecting changes involving money, customer data, external mutations, or shared infrastructure require operator diff acknowledgement before deployment.
11. Delete merged branches locally and remotely in the same task after merge and push; long-lived integration branches require operator confirmation.

## 7. Out-of-Scope Finding Capture

When work surfaces an unrelated bug, risk, or debt item, pause and ask verbatim:

> "Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"

Bundle only findings that emerge together. On `yes`, read the ledger and deduplicate first. If new, record title, location, issue, six-month severity, suggested fix, and reason deferred. Do not derail the current task. When fixed, delete the entry and reference it in the fixing commit.

## 8. Memory Layers

- **Shared and canonical:** root `CLAUDE.md`, thin `AGENTS.md`/`GEMINI.md`, component spokes, `RULES.md`, `VERSION.md`, `.salvor/`, `.serena/memories/`, and GitNexus context blocks. All are git-tracked and available to every contributor and supported vendor.
- **Per-user and optional:** Claude auto-memory under `~/.claude/projects/.../memory/`. It is not shared or canonical and must never hold team truth.
