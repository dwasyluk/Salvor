# Dev-first branch flow

- **ID:** DEC:dev-first-branch-flow
- **Subject:** git, branching, integration, review, versioning
- **Claim:** `dev` is the integration branch and the only base for feature work; `main` is the release branch, reached only by promoting controlled feature groups.
- **Evidence date:** 2026-08-18
- **Status:** live

## Context

Until now the protocol named `main` as the integration branch (§3) and the
pre-merge reconcile target (§10.2), while the project had already grown a `dev`
branch in practice. The mismatch produced a concrete failure on 2026-08-18: a
completed feature branch (`bug/soft-launch-hitlist`) was merged straight into
`main`, leaving `dev` eight commits behind its own downstream branch and
inverting the intended promotion direction. The merge was clean and the history
was recoverable — `dev` fast-forwarded — but nothing in the written rules had
objected, because nothing in the written rules disagreed with what happened.

A second gap surfaced at the same time: `RULES.md` §6.11 assigned branch
deletion to "the same task after merge and push" without naming an owner. When
review and merge belong to a second person, an author who deletes their own
branch pre-empts the reviewer's merge.

## Decision

Adopt an explicit dev-first flow, recorded canonically in `RULES.md` §6.12:

1. Branch from `dev`, never `main`. Names are `feat/<slug>` or `bug/<slug>`;
   once a branch represents a GitHub issue, the name carries the issue ID
   (`feat/3_evaluate-agent-plugins-1.0`).
2. Implement on the branch.
3. Sync `dev` into the branch and resolve conflicts **before** requesting
   review. This is deliberately the same moment as the §0.6/§10.2 pre-merge
   Brain Reconcile: the author reconciles knowledge before a reviewer reads it.
4. Open a PR back to `dev`.
5. An adjacent developer reviews and approves.
6. **The reviewer** merges into `dev` and deletes the merged branch.
7. `dev` promotes to `main` in controlled feature groups.

Agents must refuse a direct feature-to-`main` merge and ask verbatim:
`"SOP is feature → dev → main. Merge into dev instead? (yes / no — override)"`.

## Rationale

- **The reconcile already wanted this shape.** §10.2 trigger 1 requires
  fetching the target and reconciling before the merge. Step 3 names the branch
  that requirement was always describing, so one action satisfies both the git
  workflow and the distributed-brain protocol instead of being described twice.
- **Counter races resolve at one place.** §3's integration-bump rule is only
  coherent if exactly one branch is the integration branch. Naming `dev` keeps
  `pending` rows on feature branches and assigns real build IDs once.
- **`main` stays releasable.** With promotion in feature groups, a tag on
  `main` describes a deliberate release rather than whatever merged last.
- **Review owns the merge.** Assigning merge-and-delete to the reviewer makes
  approval and integration a single accountable act, and prevents an author
  from deleting a branch a reviewer still needs.

## Invariant

Feature work never touches `main` directly, and build counters advance only on
`dev`.

## Coupling / blast radius

- `RULES.md` §3 (integration branch), §6.11 (deletion ownership), §6.12 (the
  rule), §0.6/§10.2 (reconcile target), Protocol Tiers (Strict list).
- `CLAUDE.md` hub directive — loads the flow every session.
- `.serena/memories/branching_and_pr_sop.md` — retrieval pointer, not canon.
- Product surfaces are deliberately **untouched**: `SETUP_PROMPT.md`'s RULES
  template and `example-project/RULES.md` keep the generic single-integration-
  branch language. This is Salvor's own project policy, not protocol imposed on
  every adopting repository.

## Alternatives rejected

- **Keep `main` as the integration branch.** Matches the pre-existing text but
  contradicts how the project actually releases, and leaves the promotion
  direction undefined.
- **Encode the SOP only as a Serena memory.** Rejected under the one-owner
  model (§8): Serena memories are retrieval pointers, never canonical, so the
  rule would have no enforceable home.
- **Encode it in per-user Claude auto-memory.** Rejected outright — §8 bars
  per-user memory from holding team truth, and a repo SOP must travel with the
  repository, not with one developer's machine.
- **Ship the rule in `SETUP_PROMPT.md`'s template.** Rejected: it would impose
  a `dev`/`main` topology on every Salvor adopter, many of whom run trunk-based
  or single-branch flows.
