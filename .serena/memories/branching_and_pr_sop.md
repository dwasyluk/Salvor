# Branching & PR SOP (dev-first)

> Serena memories are retrieval aids / pointers, not canonical truth. Canonical rule lives in `RULES.md` §6.12 (with §3, §6.11, §0.6/§10.2). Keep this short; verify against canon before trusting.

**Integration branch is `dev`. `main` is the release branch.** Never branch from `main`, never merge feature work into `main`.

## The cycle
1. Branch from `dev` — `feat/<slug>` or `bug/<slug>`, meaningful slug. Issue-backed branches carry the ID: `feat/3_evaluate-agent-plugins-1.0`.
2. Implement on the branch.
3. **Sync `dev` into the branch and resolve conflicts BEFORE requesting review.** This is the §0.6/§10.2 pre-merge Brain Reconcile trigger — dedupe lands before the textual conflict.
4. Open a PR back to base branch `dev`.
5. Adjacent developer reviews and approves.
6. **The reviewer merges and deletes the branch** (§6.11) — not the author. Solo work: the responsibility travels with the reviewer role.
7. `dev` → `main` in controlled feature groups.

## Gate
Asked to merge a feature branch straight into `main`? Do not proceed. Ask verbatim:

> "SOP is feature → dev → main. Merge into dev instead? (yes / no — override)"

## Coupling
- Build counters advance only on `dev` (§3). Feature branches record `pending` rows; the integration merge assigns real numbers.
- Long-lived branches (`dev`, `main`) are never deleted and need operator confirmation to create.
- Rationale: `.salvor/decisions/2026-08-18-dev-first-branch-flow.md` (`DEC:dev-first-branch-flow`).
