
## 2026-08-18 — Benchmark subsystem (`feat/salvor-bench`) + dev-first branching SOP

### Branching SOP (`RULES.md` §6.12, merged to `dev` as 4ab0ee1)
Operator-specified cycle, introduced without violating itself (built on
`chore/dev-first-branch-flow`, merged, branch deleted by the reviewer role):
branch from `dev` → implement → **sync `dev` in and resolve conflicts before
review** → PR to `dev` → adjacent dev approves → **the reviewer merges and
deletes** → `dev` promotes to `main` in controlled feature groups.

Step 3 turned out to be the same moment as the existing §0.6/§10.2 pre-merge
Brain Reconcile, so §6.12 names that rather than describing it twice. §3's
integration branch became `dev`; §6.11 gained explicit reviewer ownership of
deletion; §10.2's target was renamed. Canonical rule in `RULES.md`, pointer in
`.serena/memories/branching_and_pr_sop.md`, rationale in
`DEC:dev-first-branch-flow`. Deliberately NOT added to `SETUP_PROMPT.md`'s
template or `example-project/RULES.md` — imposing a dev/main topology on every
adopter would be wrong. 162/162 unit + 140/140 contract stayed green, confirming
no root↔example parity test objected.

Correction worth keeping: the first draft put this in per-user Claude
auto-memory. That is barred by §8 (per-user memory must never hold team truth)
and would not travel with the repository. Repo SOP belongs in the repo.

### Upstream verification (done before building on it)
Rather than trusting the design doc, each load-bearing assumption was checked
against the installed source:
- `_build_claude_command` exists at `agents/claude_code/adapter.py:199` → imported, never forked, so all six arms share one flag surface.
- `backend = config.get("backend", "docker")` at `:446` → the Docker backend is the default; no Modal account needed.
- `COOPERBENCH_EXTERNAL_AGENTS` at `agents/registry.py:93` → the documented adapter hook; no fork required.
- Upstream's `parsers.py` reads only the terminal `result` event and the scalar `cache_creation_input_tokens`, and uses `total_cost_usd`. This confirmed the dual-extraction design: a timed-out unit emits no `result` event, so upstream bills it as **zero** — exactly the runs most likely to be expensive.

Curriculum parsed directly: pytest = 19 tasks, 19 distinct base commits, and the
order is difficulty-tiered rather than globally chronological (positions 1–5 all
`<15 min fix` 2019-05→2020-06; 17–19 `1-4 hours` 2019-08→2022-10). A regression
test now fails if that order is ever silently re-sorted by date.

### Pricing — the operator's correction was right, and verified
Rev-1 assumed Sonnet 5 would rise to $3/$15 on 2026-09-01 and billed
projections at that "standard" rate. The official pricing page states verbatim
that the $2/$10 introductory rate **is now the standard price** and the
scheduled increase **will not occur**. Rates pinned: $2 input, $10 output,
$2.50 5m-cache-write, $4.00 1h-cache-write, $0.20 cache-read. That is a 33%
lower cost basis than assumed, materially improving the odds the full 50-pair
CooperBench set fits under the $250 cap. Conservatism now comes from mechanisms
(measured probe, p95 admission, 30% contingency, $12 reserve, in-flight
watchdog) rather than from an inflated rate.

### Dependency repairs
- Hatchling rejected the pinned-SHA git dependency until `allow-direct-references = true`; a tag ref was rejected deliberately, since upstream moving mid-run could silently change the submission prompt or eval semantics.
- The resolver back-solved `datasets` to **1.1.1 (2020)**, which calls `pyarrow.PyExtensionType` — removed in pyarrow 25 — so every dataset import died. Floored to `datasets>=3.0`; resolved to 5.0.1.
- `scripts/pull-swebench-images.sh` used `mapfile`, absent from macOS bash 3.2. Rewritten with a portable read loop.

### Test that caught its own wrong invariant
`test_smaller_n_is_a_prefix_by_state_depth` failed because `choose()` returns a
sorted list, so "first per state" in sorted order is not the depth-0 pick. The
property that actually matters is **monotone nesting** — shrinking N must drop
pairs, never swap them — so a 20-pair run is a strict subset of the 25-pair run
and the two stay comparable. Test rewritten to assert that; the algorithm was
correct.

### Environment blocker (unresolved, well-diagnosed)
Registry link degraded. Symptoms, in the order they were isolated:
1. Daemon pull fails with `EOF`; host `curl` to `registry-1.docker.io` returns a healthy 401 → not host connectivity.
2. A *container* reaches the registry (401), but the *daemon's* pull path fails → the fault is on the daemon's proxy path (`http.docker.internal:3128`), which containers bypass. Five `utun` VPN interfaces are up, one at MTU 1414.
3. ghcr.io fails too, and gets through the manifest before dying on the **blob** → small requests succeed, large transfers die. MTU/TLS fragmentation signature.
4. `docker pull hello-world` **succeeds**, and alpine succeeds on retry → flaky, not blocked. Retry is the correct mitigation.
5. Measured host throughput to the registry: **166–348 KB/s**; general host throughput 0.15–1.3 MB/s.

Result: 1/19 eval images in 24 minutes (~3.84 GB each); 20 GB total is not
reachable on this link tonight. A 40-attempt retry loop continues in background.

**Not** treated as a Docker-restart candidate: `novacast-ai-redis-1` (another
project) is live, and RULES §5.1 protects parallel sessions. Starting a *new*
Redis for the benchmark on :6399 is in scope and was verified not to disturb it.

Everything else is preflight-green, including the execution-path bake-off:
arm64 SWE-bench images **do not exist** (Docker Hub 404; x86_64 only, confirmed
via the Hub API), amd64 emulation works, and the measured penalty is **~1.3×**
(679 ms vs 513 ms on an identical loop) — Rosetta, not QEMU's 5–20×. So the
amd64 path is correct and viable; only the download is blocked.

**No inference has run. No results exist. README and site are deliberately
unpopulated** — `summary.json` absent means the two result-derived contract
tests skip, and an incomplete run must never reach a public surface.

# salvor Active State — VERBOSE ARCHIVE

L2 cache. Detailed but curated: when this file exceeds ~1,500 lines or at release milestones, condense the oldest resolved sections — keep durable conclusions, evidence references, and commit/test/issue IDs; drop raw noise. Deep history of reasoning, rejected hypotheses, and detail pruned from L1. Update immediately after every L1 update. Read only when explicitly instructed or during context recovery.

---

## 2026-08-06 — Comprehensive pre-launch review pass (branch `feat/ghpage-sync`, still UNMERGED)

- **Process.** Two independent read-only review agents (cross-surface drift audit + market-positioning/professionalism) swept the whole repo; findings triaged and fixed on this branch. Both reviewers rated the protocol core tight — every real defect sat at a seam (site↔README, changelog↔docs, example↔template).
- **Version-story fix (was launch-blocking).** CHANGELOG had TWO protocols claiming v1.0.0-beta: a dated-but-never-published `[1.0.0-beta] — 2026-07-27` entry (numeric-LF era) plus everything new under `[Unreleased]` — which would have made the `Salvor-Protocol: v1.0.0-beta` stamp ambiguous and let a hypothetical 07-27 install skip §10 deltas as "stamp equal → repair-only." Since nothing was ever published, folded into ONE `[1.0.0-beta] — 2026-08-06` entry (canonical Added/Changed/Fixed order, protocol substance leading); the stale "numbered LF# in this release, slug IDs since" line corrected. v1.0.0-beta now uniquely = the current protocol; UPGRADING's "first stamped release" is true.
- **Claim calibration.** README "two developers can never allocate the same ID" (falsifiable — both can pick the same slug) → "never race the next number… Brain Reconcile catches slug overlap by subject at merge." Antigravity consumer-migration claim softened to the citable compatibility fact (SETUP_PROMPT + VENDOR_ADAPTERS; ratification tests still satisfied). Nonexistent `.claude/settings.json` `custom_instructions` key removed (→ CLAUDE.md directives + hooks). "tested entrypoints" → "contract-tested entrypoints".
- **AGENTS.md-as-standard defense.** Relabeled "(Codex)" → "(Codex and other AGENTS.md-compatible agents)" across README/SETUP_PROMPT/VENDOR_ADAPTERS table; new FAQ "Why is CLAUDE.md the hub instead of AGENTS.md?" (honest answer: dogfood depth + mechanical auto-load; hub↔pointer swap is a rename, not a migration). consistency.test regex widened ([^.] → [\s\S] bounded — label contains dots).
- **FAQ +4:** existing-repo install safety (adoption map, never blanket-stage), simultaneous teammate captures (§10 walkthrough), CLAUDE-vs-AGENTS hub, context/token overhead (L1 50-line budget, L2/archive not loaded).
- **Boilerplate dedupe:** "highly recommended for the best code-grounded results" reduced site 5→2 (kept the two test-pinned occurrences), README 3→1; lowercase `enhanced` at sentence start NOT changed — deliberate, test-enforced style (`beta-consistency` forbids \bEnhanced\b).
- **Example fixes:** dangling bad-merge sentence in hub GitNexus section; L2 role reverted to curated/condensed (was retired "raw tool outputs" wording that contradicts §9.1); never-persist bullet restored; "(memory loops)" legacy framing dropped; VERSION Last-Updated + 2026-08-05 migration history row (counters unchanged — no component logic) + 06-22 row de-retconned ("nine-section scaffold at the time"); L2 migration entry added; L1 header date synced; archive rows in README/serena tree.
- **Misc:** ARCHITECTURE + VENDOR_ADAPTERS `.salvor/` lists gain `archive/`; ARCHITECTURE §0 subject slip; site plugin card de-duplicated (v1.1.0 lives in the status pill only) + broken `#roadmap--help-wanted` anchor → `#contributing--roadmap`; README Docs list + Quickstart upgrade note gain UPGRADING link; Salvor's-answer upgrade-boundary sentence + SECURITY prompt-injection pointer; tagline bookends matched; paired-path parity glossed; plugin roadmap bullet harmonized to ships-with-v1.1.0; CONTRIBUTING protocol-PR checklist gains RULES.md + UPGRADING, "plan of record" claim dropped (file is gitignored); dogfood decisions index gains Invariant/Touches columns; internal design doc docs/plans/ untracked + gitignored (matches PLAN.md/superpowers policy). Tests updated in tandem; 160/160 unit+contract, 24/24 Playwright, 11/11 audit gates.
- **Operator-side launch ordering (cannot be fixed in-repo):** enable GitHub Discussions + create the five prefix categories; push main; create + push the `v1.0.0-beta` tag BEFORE the first Pages deploy (site CTAs pin `blob/v1.0.0-beta/...`); flip repo public (makes issue #1 + Discussions links live); optionally one workflow_dispatch CI/Pages dry run.

## 2026-08-07 — Soft-launch hitlist branch (bug/soft-launch-hitlist off dev; GHPAGE:19 DOCS:23 pre-assigned)

- **Topology (operator-directed):** `dev` cut from main as the go-forward working branch; `bug/soft-launch-hitlist` off dev carries the 7 final-audit fixes; `feat/claude-code-plugin-v1` restored from the pre-cleanup bundle (was branch `v1.1.0`, 6 commits — canonical plugin WIP). Four local branches total; nothing on the remote.
- **§3 deviation, documented:** build IDs pre-assigned on the branch (not `pending`) because the operator performs the bug→dev integration merge via a remote GitHub PR with no agent present to assign them in the merge commit.
- **Fixes:** gitignore enforcement for `*.ai/*.psd/*.psb` + recovered artwork; Pages `workflow_dispatch`-only (production deploys manual by SOP; dispatch from `dev` pre-verifies the workflow) + `configure-pages@v6`/`deploy-pages@v5` + CI on dev + new release-gate test; site tag-pinned links / self-allocating claim / tree README row / ROADMAP nav; example README documents all three adapters + brain index; 24 `RULES.md §…` references linkified per operator identifier-linking directive.
- **File preservation:** `.tmp/worktree-archived-files/codex-worktree-4ba914d0/` holds the archived codex-worktree files at original paths — incl. a `.psb` that DIFFERS from the working-tree copy (both kept), and six burn-experiment files recovered from Codex session transcripts (`.recovered-from-transcript.txt` provenance suffix) after the 2026-08-06 worktree removal destroyed the originals (pre-dated the stricter preservation directive; superseded by shipped `burn-reveal.js`). Full disclosure in `.tmp/worktree-archived-files/README.md`.

## 2026-08-06 — ghpage-sync branch merged to main (CORE:18 GHPAGE:18 DOCS:22 assigned at integration)

- Integration bump covers the whole branch: site semantic sync, the comprehensive pre-launch review pass, the brain/rationale copy pass, and the operator-review visual fixes (one-line tagline, header z-index above the panel post-burn, menu auto-close at the 900px crossing, 38ch process copy, stacked brain-summary). CORE included because the review pass edited `SETUP_PROMPT.md` (adapter labels, Antigravity claim softened, settings-key fix, contract-tested wording).
- Operator visual gate passed on the branch across desktop/tablet/mobile before merge. 161/161 unit+contract, 27/27 Playwright (burn suite untouched), 11/11 audit at merge time.

## 2026-08-05 — GH-page holistic sync + final pre-launch pass (branch `feat/ghpage-sync`, merged 2026-08-06 — see above)

- **Scope.** Present the three merged protocol advances (distributed brain, experimental agentic capture, upgrade path) on the public page as a semantic mirror — text-level edits inside existing sections ONLY, no new visual sections/interactions (the operator's live localhost review is the §6.3 design gate before any merge/deploy).
- **Site edits.** Reason card 2: slug IDs + merge/pull reconcile + recurring audit keep parallel branches single-truth. Brain summary: slug-ID/Subject-Claim header sentence (`LF:stale-note-reference` example) + experimental off-by-default agentic capture with item-by-item ratification (user-gate remains the headline). Loop `.salvor/` tree: `archive/` added. Primary-path card: upgrade-is-the-same-move + protocol stamp + knowledge-never-touched.
- **Cross-surface currency.** CHANGELOG [Unreleased] upgrade-path entry (was missing); Serena task_completion suite list refreshed (now names all 12 unit files); project_overview gains §10.5/§10.6 + issue #1 + stamp pointers. VERSION carries `GHPAGE:pending DOCS:pending` per §3 — assigned only if/when the operator merges.
- **Tests.** +3 site-contract tests (distributed-brain honesty, experimental-off-by-default framing, archive tree + upgrade copy). 160/160 unit+contract; browser + audit run in the final verification block.
- **Process note.** This branch is deliberately left UNMERGED with `npm run serve` running on localhost:4173 for the operator's go/no-go soft-launch call.

## 2026-08-05 — Version-aware upgrade path (merged; CORE:17 DOCS:21 assigned at integration)

- **Problem (operator-raised).** A v1.0.0-beta adopter facing a v1.1.0 release had no upgrade story: nothing recorded which Salvor version scaffolded an install, the update path wasn't delta-aware, and plugin-vs-prompt install compatibility was implicit. Adoption lives or dies on this transition being easy.
- **Mechanism.** SETUP_PROMPT header declares `Protocol version: v1.0.0-beta` (test-synced to package.json version); Step 2 writes `Salvor-Protocol: v1.0.0-beta` into generated `.salvor/README.md`; Step 0's update-not-install flow compares stamp vs prompt version — older → delta-scoped upgrade plan (protocol surfaces only), equal → repair-only, missing → full repair plan that adds the stamp. Customized RULES upgrade as a three-way merge (theirs / old template / new template), conflicts ALWAYS operator-decided per §10.2 — upgrading Salvor is itself a brain-reconcile-shaped operation. Stamp bumps inside the applied plan; Step 5 reports the transition + deltas.
- **Two-layer guarantee codified:** protocol layer (RULES text, templates, adapters, managed sections) = Salvor's, replaceable; knowledge layer (artifacts incl. `archive/`, L1/L2 content, DOMAIN_REF facts, deferred entries) = adopter's, NEVER touched by an upgrade. Experimental features are never enabled by an upgrade — enabling is always a separate explicit operator choice.
- **Docs.** `docs/UPGRADING.md` (mechanism, layers, stamp, per-version migration notes — v1.0.0-beta entry covers numeric→slug ID migration for pre-stamp installs); README Quickstart upgrade paragraph; FAQ "How do I upgrade Salvor when a new version ships?"; plugin-compat invariant restated (plugins wrap the byte-identical prompt → same detect/upgrade path; prompt install ≡ plugin install).
- **Tests.** `tests/upgrade-contract.test.mjs` (8): protocol-version declaration + package.json sync, template stamp, dogfood/example stamp sync, version-aware flow states, two-layer guarantee incl. archive in never-overwrite list, UPGRADING content, plugin-compat statements, Step 5 stamp reporting. 157/157 unit+contract.

## 2026-08-05 — [EXPERIMENTAL] Agentic provisional capture + archive (merged; CORE:16 DOCS:20 assigned at integration)

- **Design intent (operator-approved ideation).** Move the human gate from before-the-write to before-ratification, default OFF: agents may capture DL/LF/deferred autonomously (overnight runs, subagent fleets) but everything enters a lower trust tier that is explicitly identifiable and human-ratified. Invariant preserved: nothing becomes canonical truth without human approval — only the timing changes.
- **Mechanics.** §10.5: `AGENT_CAPTURE = off|provisional`; provenance = plain-Markdown `Contributed-by: agent — <vendor/model>, <date>` + `Review: unreviewed` header fields (vendor-agnostic by construction — trust state travels in the artifact across Anthropic/Google/OpenAI switches) + `Salvor-Contribution: agent` commit trailer (header↔trailer mismatch = audit red flag); per-class: DL/LF/deferred provisional w/ mandatory evidence, DEC `Review: proposed` only, RULES never agentic; consumption = hypothesis-not-invariant, ratified-wins auto-resolution, L1 `(prov)` anti-laundering tag; ratification enumerated by Brain Audit header-scan (no ledger file — derived, conflict-free), per-item gate "Ratify this agent contribution? (yes / no / archive)", bulk ratification explicitly discouraged. §10.6 archive: `.salvor/archive/` mirrors live layout, IDs+content preserved, live registries keep `Status: archived` pointers; `ARCHIVE_AFTER_DAYS = 90` aging gate; ratified never ages; agents never read archive unless instructed (attention optimization — git keeps bytes anyway); S3-style offloading left to community, core stays hook-free.
- **New EXPERIMENTAL tier** declared beside CORE/STRICT in Protocol Tiers (template + root + example) — beta, default OFF, config-line opt-in, may change on community feedback.
- **Files.** SETUP_PROMPT (tiers, §10.5/§10.6 template, archive/README scaffold template, .salvor table row, Step 4 rule 10 extension, Step 5 report incl. `AGENT_CAPTURE = off` confirmation); root + example RULES; root + example `.salvor/archive/README.md` + `.salvor/README.md` rows; DOMAIN_REF pillar 8 extension; README experimental section + tree row; ARCHITECTURE experimental paragraph; FAQ "Can agents add to the memory without asking me?"; CONTRIBUTING beta-feedback extension; CHANGELOG [Unreleased].
- **Graduation criteria** filed as github.com/dwasyluk/salvor/issues/1 (repo exists PRIVATE + EMPTY; issue creation leaks nothing pre-launch): over-capture calibration, rubber-stamp resistance, poisoning resistance, archive-window default, per-class policy, cross-vendor default-off compliance, L1 laundering, review SLA, telemetry-free measurement.
- **Tests.** New `tests/agentic-contract.test.mjs` (9 tests: EXPERIMENTAL+default-off everywhere, provenance identifiability, per-class policy, consumption rule, verbatim gates, archive never-discard/load-rule, scaffold+dogfood archive READMEs, public-surface honesty, Step-4 no-ungated-writes). 149/149 unit+contract.

## 2026-08-05 — Distributed-brain protocol (merged; CORE:15 DOCS:19 assigned at integration)

- **Problem.** Salvor claimed distributed-team readiness but had zero mechanism: LF# was a hand-allocated global integer (shipping in three inconsistent formats — `LF1` root, `LF-1`/`LF01` example, `LF##` template), deferred findings used positional `### N.` renumbered by delete-on-fix, VERSION counters were monotonic integers in dual representation mirrored into 7+ files and pinned as literals in 3 test files, and L1/L2/index tables conflicted same-line by construction. Semantically duplicate or contradictory captures under different names would merge silently — the harder failure, since a fresh session could then load falsified knowledge as truth.
- **Design (operator-approved).** (1) Slug IDs for every artifact class (`LF:`/`DL:`/`DEC:`/`PM:`/`deferred:`) — self-allocating, immutable after integration; slug collision at reconcile = probable duplicate, not error. (2) Structured header (ID / Subject tags / Claim / Evidence date / Status `live|superseded-by:`) as the machine-comparable semantic-dedupe key — operator explicitly rejected slug-collision-alone as sufficient dedupe (naming too subjective). (3) Brain Reconcile at merge/pull points: three-way diff → §10.4 subject-tag pairing → claim comparison → distinct/duplicate/overlapping/contradictory/supersedes, all knowledge merges operator-gated verbatim; contradictions resolve to exactly ONE live entry; L1 re-synthesized never text-merged; `.serena/memories/` re-derived; RULES conflicts always operator-decided. (4) Recurring Brain Audit, `AUDIT_INTERVAL_DAYS = 3` operator-tunable (beta community-feedback item per operator), tracked by the L1 `## Last Brain Audit:` footer, all-pairs sweep + header/link/staleness checks. (5) VERSION integration bump: counters advance only on the integration branch; feature branches write `pending` history rows; merge assigns one bump per component per integration (dogfooded: the branch carried `CORE:pending DOCS:pending`; the merge to `main` assigned CORE:15 DOCS:19 in the merge commit).
- **Files.** SETUP_PROMPT templates (all artifact READMEs, DOMAIN_REF, DEFERRED, L1 footer, RULES §0/§2/§3/§6.9/§7 + new §10, VERSION note, step 4 rule 10, step 5); root + example RULES/CLAUDE; dogfood brain (LF1→`LF:rendered-pixel-alignment`, missing DL artifact created, index ID+Subject columns); example brain (LF-1/LF01→`LF:stale-note-reference`, `DEFERRED #1`→`deferred:no-persistence`, artifact renamed via git mv w/ history); README teams section rewritten around the real mechanism; ARCHITECTURE distributed-brain section w/ worked duplicate+contradiction example; FAQ/CONTRIBUTING/CHANGELOG; §5.3→§9.1 in 4 files.
- **Tests.** New `tests/reconcile-contract.test.mjs` (11 tests). Un-pinned build-ID literals in beta-consistency + site-contract (now derived from the VERSION.md JSON header — pinned literals made every parallel bump a test conflict). final.test.mjs extended to §10. 140/140 unit+contract, 24/24 Playwright, 11/11 audit gates.
- **Dry-run evidence.** Two throwaway branches each captured an overlapping DL (`DL:polymarket-rate-limit-backoff` vs `DL:clob-429-throttling`, shared subject tags) + a `pending` VERSION row. Merge produced ZERO artifact-file conflicts (slug filenames), textual conflicts only in the index table + VERSION exactly as §10 predicts, resolved by the documented union rule; subject pairing classified the pair duplicate; redirect-stub supersede mechanics verified; 2 pending rows → 1 integration bump. Branches deleted.
- **Intentionally deferred (operator-directed).** No `site/` changes this pass — separate design-review pass after the team-friendly work completes. Historical records (VERSION.md history rows, L2 dated entries, CHANGELOG beta entry, `docs/PLAN.md` which self-declares period-accurate terminology) intentionally keep period-accurate `LF#` wording; living surfaces are fully migrated.

## 2026-07-30 — Existing-knowledge adoption public sync (CORE:14 GHPAGE:17 DOCS:18)

Phase 2 promotes semantic existing-knowledge adoption from a roadmap concept to
current `v1.0.0-beta` behavior and completes the public counterpart to the
Phase 1 structural preservation work.

- During setup, Salvor inventories `docs/`, READMEs, ADRs, architecture notes,
  CHANGELOGs, postmortems, runbooks, and agent instructions read-only, then
  asks whether the operator wants candidate content analyzed.
- The same workflow can be invoked later on demand. Both entry points classify
  coherent sections/snippets rather than whole files, because one document may
  contain decisions, Domain Learnings, Learned Failures, current domain truth,
  operations, deferred findings, and still-canonical reference material.
- Every mapping exposes source path/range, summary, classification, exact
  destination, canonical owner, ownership action, and proposed Markdown.
  Unrelated promotions retain their individual Salvor capture gates.
- Ownership actions are explicit: keep canonical in place + link, promote with
  provenance, migrate, or leave untouched. Originals stay unchanged by default;
  source mutation requires separate approval and no co-canonical copy is
  permitted.
- README, architecture, FAQ, vendor guidance, example, changelog, site Primary
  Path, roadmap materials, component spokes, domain truth, Serena routing
  memory, and contracts now describe the current behavior consistently.

TDD evidence: new setup/site/version contracts failed against CORE:13 /
GHPAGE:16 / DOCS:17 before implementation, then passed 49/49 after the
CORE:14 / GHPAGE:17 / DOCS:18 implementation. Final verification passed
131/131 unit tests, 109/109 contract tests, 24/24 Playwright checks across all
release viewports, all 11 release-audit gates, and `git diff --check`. The
soft-launch gate is GO for an operator-controlled push. No push, tag, release,
or deployment was performed.

---

## 2026-07-30 — Preservation-first existing-repository adoption (CORE:13)

The operator approved a load-bearing setup invariant for mature repositories:
Salvor adopts existing agent infrastructure in place instead of treating every
repo as an empty scaffold.

- Before any write, setup produces an adoption map with `reuse unchanged`,
  `add Salvor-managed section`, and
  `conflict — operator decision required`.
- Existing `.serena/` state is reused automatically. Setup does not rerun
  `serena init`, migrate/copy/import Serena memories into `.salvor/`, or modify
  a memory file unless that exact path and merge are approved. Case variants
  such as `.Serena/` stop as collisions.
- Existing GitNexus CLI/config/index state is reused. Fresh indexes are not
  rebuilt; stale indexes require an explicit refresh choice; `.gitnexusrc`
  merges preserve unrelated keys and are never whole-file replacements.
- An existing `CLAUDE.md` remains the hub; component spokes are discovered and
  reused. Existing `RULES.md` is preserved, equivalent rules are not
  duplicated, and genuine conflicts are shown side by side for operator choice.
- Existing `.claude/`, `CLAUDE.local.md`, hooks, settings, agents, skills,
  adapters, MCP configuration, and third-party managed sections remain
  unchanged unless the pre-write plan names and receives approval for the exact
  mutation.

Correctly mapped read-only reuse requires no extra prompt. The prompt boundary
is an ambiguous mapping, collision, stale-index refresh, genuine conflict, or
concrete mutation. Contract tests failed before the installer/example changes
and passed after them. Canonical rationale:
`.salvor/decisions/2026-07-30-preservation-first-existing-repository-adoption.md`.

Public README/docs/FAQ/CHANGELOG/GitHub Pages propagation is intentionally held
for a separately reviewed Phase 2 content plan. The soft-launch release gate
therefore remains NO-GO until that phase is approved, implemented, and fully
verified. The operator authorized a local Phase 1 CORE:13 commit while reviewing
that plan; push, tag, release, and deployment remain operator-controlled.

---

## 2026-07-28 — Soft-launch community routing (CORE:12 GHPAGE:16 DOCS:17)

The operator selected GitHub Discussions as Salvor's initial canonical
community hub after comparing it with X Communities, Reddit, Discord, and a
hosted forum. GitHub Issues and PRs remain the actionable engineering system;
the maintainer's lowercase X account `@blockchaindan` is a secondary path for
people who do not want to use GitHub.

Public routing now works as follows:

- `README.md` exposes a prominent `Community & feedback` section before the
  product overview, linking to GitHub Discussions and the lowercase X account.
- `CONTRIBUTING.md` routes questions, suspected bugs, early ideas, adapter
  exploration, and showcases to Discussions. Its all-caps topic prefixes are
  `[HELP]`, `[BUG]`, `[IDEA]`, `[ADAPTER]`, and `[SHOWCASE]`.
- Promotion into actionable GitHub work is explicit: validated bugs become
  `[BUG]`, accepted/scoped ideas become `[FEAT]`, and actionable adapter work
  becomes `[ADAPTER]`. `[IDEA]` intentionally does not survive promotion.
- GitHub issue-template title prefixes are consistently uppercase.
- GitHub Pages links directly to Discussions from desktop navigation, mobile
  navigation, and the footer. The site intentionally does not link to X.

Test-first evidence:

- New static contracts failed before implementation because the README section,
  three site links, contributor taxonomy, and uppercase issue prefixes were
  absent, then passed after the minimal content changes.
- A new Playwright navigation contract failed with zero Discussions links,
  then passed after implementation. It checks link count, desktop/mobile
  visibility, mobile menu operation, footer visibility, runtime errors, and
  horizontal overflow.
- `npm run test:unit`: 123/123 passed outside the macOS sandbox. The initial
  sandboxed run's only failure was Chromium Mach-port permission denial inside
  the deterministic brand check, not a product assertion.
- `SALVOR_TEST_PORT=4191 npm run test:browser`: 24/24 passed on an isolated
  localhost port, including desktop 1440×1000, compact desktop 1024×900, tablet
  768×1024, large phone 390×844, Galaxy-S25-Edge-like 360×780, and narrow
  320×568 rendering.
- `npm run release:audit`: all 11 integrity gates passed; release metadata is
  `v1.0.0-beta CORE:12 GHPAGE:16 DOCS:17`.

GitNexus was current at baseline commit `479304b` and responded, but its
pre-edit symbol lookup could not resolve static `site/index.html`, so the
reported blast radius was `UNKNOWN`; targeted structural search, repository
contracts, and the full responsive browser matrix supplied the verification
fallback. No push, tag, release, deployment, or external repository setting was
changed.

---

## 2026-07-28 — LF:rendered-pixel-alignment gate (captured as "LF1"; ID migrated 2026-08-05)

- **Failure.** More than six Code Intelligence alignment revisions used CSS/DOM box geometry as the review oracle and still rendered visibly pixel-incorrect. Element/line boxes do not prove glyph baselines, and SVG boxes include whitespace that does not represent the visible stroke.
- **Corrective method.** Playwright now screenshots each MCP heading/article, scales bitmap coordinates from the actual screenshot-root CSS dimensions, detects black/gold rendered ink, isolates the gold label's first contiguous line band, and reports signed title/label and icon/title pixel deltas. DOM rectangles only delimit scan regions.
- **Evidence.** The corrected test failed 6/6 release viewports before the CSS fix. Gold first-line baselines already measured `0px`; icon/title top deltas exposed the shared-offset error from `-2.99px` to `+3.97px`. Per-card offsets derived from those measurements then passed 6/6 at 1440/1024/768/390/360/320 with both visible-ink deltas ≤1 CSS px.
- **Invariant.** Never request visual alignment review from box geometry alone. Require the rendered-ink regression plus direct screenshot inspection. `LF:rendered-pixel-alignment` source: `.salvor/postmortems/2026-07-28-rendered-pixel-alignment-gate.md`.
- **Independent visual check.** Direct rendered screenshots at 1440, 768, and 320px confirm the title/label baseline, icon/title visible tops, right-column containment, and wrapped narrow labels match the numeric gate.
- **Full verification.** 120/120 unit and contract checks, 24/24 Chromium checks, the 11-gate release audit, and `git diff --check` pass. The IPv6 local server and final ngrok review URL both return HTTP 200.
- **Gate.** Automated and internal visual verification are green. The operator approved the ngrok-reviewed `LF:rendered-pixel-alignment` fix as materially better and authorized a local commit on `main`; push remains operator-controlled.

---

## 2026-07-27 — Final hierarchy, corner-border, and terminology polish (CORE:12 GHPAGE:15 DOCS:16)

- **Small-screen panel finish.** Added explicit 1px strokes to the top-right and bottom-left clipped corners in both WF and Mystic panel states. The same pseudo-element remains inside the existing browser-rendered UI snapshots, so the complete border continues to burn locally with the copy and panel fill.
- **Information hierarchy.** Replaced the capture-class bell with the operator-approved three-document stack, matched the Code Intelligence introduction to the same 13–16px body scale used by the Loop and Three Reasons, raised the actual linked Serena/GitNexus names to a dominant 24–30px desktop / 22–24px mobile scale, and reduced the gold function labels to compact 11–13px metadata that stays in a distinct right-hand column and bottom-aligns with each tool name. The Salvor Loop body copy uses the section width while its headline keeps the established readable measure. Narrow link/body styling is scoped away from heading links so the names cannot collapse back to the body-copy scale.
- **Integration guidance.** Differentiated the code-intelligence introduction from the quickstart: it names Serena MCP and GitNexus MCP, states that neither is required, recommends both, and describes improved token efficiency without promising a guaranteed reduction.
- **Terminology.** Standardized lowercase `enhanced` prose across current protocol, documentation, release history, example, tests, and site. Literal machine-state tokens `ENHANCED-READY` and `ENHANCED-ACTIVE` remain unchanged.
- **Verification.** 120/120 unit and contract checks pass. 24/24 direct Chromium checks pass on isolated port 4206 across desktop, compact desktop, tablet, large phone, Galaxy-S25-Edge-like small phone, and 320px, including adaptive favicons, zero overflow, pointer/touch accumulation, exact WF→M transition, WebGL fallback, reduced motion, body-scale parity, and the responsive MCP title hierarchy. The 11-gate release audit and deterministic brand audit pass. Direct 823px inspection confirms continuous WF/Mystic clipped-corner strokes and local panel burn integration; direct 1440px and 390px inspection confirms the stacked-document icon, full-width Loop body copy, dominant black MCP names, compact right-column gold function labels with exact bottom alignment, and zero section overflow. `git diff --check` passes.
- **Gate.** Changes remain uncommitted. Automated and internal visual checks are green; operator browser review is the remaining gate.

---

## 2026-07-27 — Responsive hero legibility and vendor-neutral Loop (CORE:11 GHPAGE:14 DOCS:15)

- **Small-screen reading surface.** Tablet and mobile hero copy now sits on a sharp, internally padded reading panel without changing copy geometry or the laptop/desktop presentation. The WF panel is translucent white; its Mystic counterpart is translucent black. Both are captured in the existing browser-rendered WebGL UI snapshots, so the panel and localized black→white text change burn together rather than appearing as a post-animation overlay. The prior non-enhanced blurred pseudo-panel and its snapshot suppression rule were removed.
- **Protocol-only Loop.** Removed the detached Serena/GitNexus enhanced pill, changed phase 2 to tool-neutral `navigate by symbol`, and replaced `CLAUDE.md HUB + SPOKES · VERSION.md` with `VENDOR-AGNOSTIC HUB + SPOKES`. enhanced integrations remain in their dedicated public section, where optionality, recommendation strength, MCP capabilities, and licensing have context.
- **Public vendor framing.** Removed direct `CLAUDE.md` references from the GitHub Pages copy. README and vendor docs now explicitly explain that the vendor-named `CLAUDE.md` file is the canonical cross-vendor hub implementation and that thin `AGENTS.md`/`GEMINI.md` adapters route other supported agents to the same repository-owned brain.
- **Verification.** 117/117 unit and contract checks pass. 18/18 direct Chromium checks pass on isolated port 4205 across desktop, compact desktop, tablet, large phone, Galaxy-S25-Edge-like small phone, and 320px, including responsive panel presence, Retina backing scale, pointer/touch accumulation, exact WF→M transition, WebGL fallback, and reduced motion. The 11-gate release audit, deterministic `brand:check`, visual `brand:audit`, both example typechecks, and `git diff --check` pass. Direct screenshots at 1440px, 823px, and 390px confirm no desktop panel, padded translucent WF/Mystic small-screen panels, and local panel burn behavior; the revised Loop is legible and protocol-only.
- **Gate.** Follow-on changes remain uncommitted. Automated and internal visual checks are green; operator visual/hardware review is the remaining gate.

---

## 2026-07-27 — Soft-launch visual polish and hardware gate (CORE:11 GHPAGE:13 DOCS:14)

- **Loop legibility.** Reduced and raised the embedded canonical regular mark so it clears the `.salvor/` brain label, moved the brain-copy stack down into clean space, and placed Serena + GitNexus in a separate `OPTIONAL ENHANCED` pill outside the stack. The generator now owns the corrected logo bounds across root and site Loop variants.
- **Favicon behavior.** Replaced competing media-qualified PNG favicon tags with one generated adaptive canonical SM SVG that switches black/white ink inside the asset under `prefers-color-scheme`, preceded by an unqualified black 32px PNG fallback. Canonical `LOGO-SM.svg` bytes and geometry remain unchanged; the black Apple touch icon remains unchanged.
- **enhanced guidance.** The visible Primary Path now states in one action that Serena and GitNexus are both optional and both highly recommended for the best code-grounded results, while preserving installation/license review and truthful capability detection.
- **Hero fidelity.** The WebGL canvas no longer renders below CSS-pixel resolution. It targets up to 2× density under a four-million-pixel cap, preserving the approved shader, smoke color, timing, input accumulation, text-selection threshold, WF/M states, and protected hero assets. Automated Chromium checks cover Retina backing scale plus existing desktop/mobile interaction behavior.
- **Verification.** 114/114 unit and contract checks pass, including deterministic brand drift, Loop clearance, adaptive-favicon geometry, Primary Path guidance, and render-scale policy. 18/18 direct Chromium checks pass on isolated port 4205 across desktop, compact desktop, tablet, large phone, Galaxy-S25-Edge-like small phone, and 320px, including real light/dark SVG raster behavior, Retina backing scale, pointer/touch accumulation, exact WF→M transition, WebGL fallback, and reduced motion. The 11-gate release audit passes across 196 candidate paths and 81 manifest outputs; deterministic `brand:check` and the inspected visual brand audit pass; both example typechecks, protected canonical-logo/hero hashes, and `git diff --check` pass.
- **Gate.** Automated release checks are green, and the operator's real mobile hardware review confirmed strong visual quality and performance. The milestone is GO and authorized for a local commit; push remains operator-controlled.

---

## 2026-07-27 — Final v1.0.0-beta release consistency gate (CORE:11 GHPAGE:12 DOCS:13)

- **Scope.** Audited tracked core, documentation, site, dogfooded `.salvor/` artifacts, the runnable example project, release metadata, brand consumers, CI/Pages configuration, and the manual GitHub Pages/DNS handoff. Ignored planning notes and operator-owned untracked visual source files are not release inputs and remain outside the commit set.
- **Canonical ownership.** Installer, adapter, FAQ, and example wording now consistently treat `.salvor/` artifacts as the canonical approved knowledge base. Thin vendor adapters and optional Serena memories are retrieval/routing aids, while GitNexus owns only its machine-derived, gitignored code index.
- **enhanced guidance.** Serena and GitNexus remain independently optional, never bundled prerequisites. Both are explicitly highly recommended for the best code-grounded results, with GitNexus licensing and MCP/CLI state boundaries preserved.
- **Release plumbing.** CI and Pages use current supported GitHub Action majors. The authored-logo migration and adaptive favicon behavior are part of the `v1.0.0-beta` release record rather than post-beta Unreleased work.
- **Verification.** 112/112 unit and contract tests pass. 17/17 direct Chromium checks pass on isolated port 4201 across desktop, compact desktop, tablet, large phone, Galaxy-S25-Edge-like small phone, and 320px, including adaptive favicons, responsive overflow, accessible navigation, mouse/touch burn accumulation, exact WF→M transition, WebGL fallback, and reduced motion. The 11-gate release audit passes across 194 candidate paths; deterministic `brand:check` and visual `brand:audit` pass; both canonical logo hashes and all three protected hero hashes remain exact. Root plus both example package audits report 0 vulnerabilities; both example typechecks and a live GET/POST/GET/OPTIONS/DELETE API smoke pass. GitNexus pure index refreshed to 632 nodes / 950 edges / 36 clusters / 38 flows and rates the complete change set low risk with no affected execution flow. `git diff --check` passes.

---

## 2026-07-27 — Theme-aware canonical favicons (GHPAGE:11)

- **Behavior.** Browser-tab favicons use the canonical SM black family under `prefers-color-scheme: light` and the canonical SM white family under `prefers-color-scheme: dark`. Each 16, 32, 48, and 64px size retains an unqualified black fallback for clients that ignore favicon media queries; the 128px Apple touch icon remains black and unqualified.
- **Boundary.** This is static metadata only: no JavaScript switching, new asset generation, regular-logo change, navigation-layout change, hero-background change, or WebGL change.
- **Regression contract.** Static brand coverage locks the fallback/light/dark matrix, while Playwright emulates both color schemes and verifies that the last eligible 64px favicon comes from the contrasting canonical family.
- **Verification.** Deterministic `brand:check` passes; the full suite passes 104/104 unit/contract tests and 17/17 Playwright checks, including the new real-browser light/dark selection contract plus the existing desktop/mobile hero, navigation, burn, touch, fallback, and reduced-motion coverage. The 11-gate release audit and `git diff --check` pass. Both canonical SVG hashes and all three protected hero-background hashes remain byte-identical.

---

## 2026-07-27 — Canonical authored SVG logo migration (GHPAGE:10 DOCS:12)

- **Authority.** The operator approved `assets/brand/reference/LOGO.svg` and `assets/brand/reference/LOGO-SM.svg` as immutable, tracked masters. The regular master owns every non-favicon placement; the small master owns favicons and touch icons.
- **Derivation.** The pipeline will generate black (`#231f20`) and white variants for both families at 16, 32, 48, 64, 128, 256, and 512 pixels. Only the canonical color token may differ; path/group/stroke/viewBox geometry stays unchanged. All resizing uses one scale factor for both axes, with transparent padding rather than distortion.
- **Migration.** Header/footer/burn states, README, structured metadata, social cards, Loop diagrams, and standalone brand assets use the regular family; favicon metadata uses the small family; the outlined SALVOR wordmark remains unchanged. Old W10 mark geometry and derivatives are retired as competing authority. Unrelated operator-owned untracked visual files remain untouched.
- **Hero boundary.** Only the hero navigation logo changed. `salvor-wireframe.png`, `salvor-mystic.png`, and `salvor-mystic.webp` retain their pre-migration SHA-256 values; the WebGL burn still captures the black regular mark and resolves it to true white in the revealed state.
- **Record.** User-approved design decision: `.salvor/decisions/2026-07-27-canonical-logo-svg-masters.md`.
- **Verification.** `brand:build`, byte-level `brand:check`, and the visual `brand:audit` pass; the generated contact sheet was reviewed for both families, both colors, favicon scale, README/social compositions, and Loop embedding. The full suite passes 104/104 unit/contract tests and 16/16 Playwright checks across desktop, compact desktop, tablet, large phone, Galaxy-S25-Edge-like small phone, and 320px narrow layouts, including touch/drag, navigation, exact WF/M transition, WebGL fallback, and reduced motion. The 11-gate release audit passes across 194 candidate paths, 10 JSON, 21 SVG, 64 PNG, 26 Markdown links, 16 HTML/CSS references, and all 79 manifest outputs; `git diff --check` is clean. The three hero background SHA-256 hashes match their pre-migration values exactly.

---

## 2026-07-26 — Early semantic selection unlock (GHPAGE:09)

- **Behavior.** The semantic hero copy becomes selectable once a burn reaches 80% of its padded completion radius. The WebGL renderer remains visible and continues through the same final smoke endpoint, so selection timing changes without altering the localized black→white visual transition or WF/M states.
- **SEO.** Hero headings, paragraphs, list copy, and links remain server-rendered semantic HTML for every client. `user-select` affects human interaction, not DOM availability; crawler-specific rendering and user-agent sniffing are intentionally absent.
- **Regression contract.** Unit coverage locks the 80% threshold and continued animation; Playwright locks selectable semantic copy during `burning` while the transparent DOM and visible WebGL canvas preserve the in-progress appearance.

## 2026-07-26 — v1.0.0-beta protocol, portability, and site consistency (CORE:10 GHPAGE:08 DOCS:11)

- **Release identity.** The soft-launch line is `v1.0.0-beta` across Salvor-owned metadata, public copy, URLs, history, scripts, brand audit output, state, and retrieval memories. Independent scaffold/example `v0.1.0`, dependency versions, GitNexus versions, and future plugin `v1.1.0` remain unchanged.
- **Protocol truth.** Domain Learning / `.salvor/domain-learnings/` is canonical. Salvor Core is vendor-agnostic because the shared brain is repository-owned Markdown; compatible thin adapters make it vendor-portable without memory migration. Claude remains the most dogfooded path, Codex/Gemini are wired and documented but less exercised, and other agents require compatible adapters.
- **enhanced guidance.** Serena and GitNexus remain optional, but both are highly recommended for the best code-grounded results. Licensing, MCP availability, safe GitNexus index-only behavior, and canonical-ownership caveats remain explicit.
- **Site/content.** The third reason and a new sixth process card cover vendor agnosticism and portability; “Hub, Spokes & Adapters” replaces Claude-only hub framing; process cards render 3/2/1 across wide/medium/mobile; Serena/GitNexus headings link upstream; standalone loop SVGs remain the production diagram sources.
- **Hero.** The single WebGL renderer remains the only burn implementation. Smoke uses the approved neutral base (`#9fa2a6`, exact normalized RGB channels); hero bullets use separate marker/copy columns; WF/in-progress hero copy is pointer-transparent and nonselectable; the fully revealed hero copy is selectable; nav/buttons remain interactive; accumulated mouse/touch drags retain prior burns; black→white UI transition stays localized to the burn boundary.
- **Verification contract.** New beta/protocol parity tests reject ambiguous final-release identity and retired tuning terminology while preserving independent versions. Site contracts lock six-card ordering, linked integrations, diagrams, and hanging-indent markup; Playwright locks 3/2/1 layout plus hero selection, input, and responsive behavior.

## 2026-07-21 — Hero burn truth-layer regression fixed (GHPAGE:07)

- **Symptom.** Burning the hero wireframe exposed only the near-black `.burn-truth` fallback instead of the full-color mystic artwork, on both desktop and mobile. The standalone tracked sources were still present: `site/assets/hero/salvor-mystic.png` and `.webp`, both 1672×941.
- **Root cause.** The burn script clones `<picture class="hero-mystic">` into `.burn-truth`. The global `.hero-mystic { opacity: 0; }` source-hiding rule therefore also applied to the clone, leaving only `.burn-truth { background: #020914; }` visible. The fix scopes that rule to the original direct child: `.hero-scene > .hero-mystic { opacity: 0; }`.
- **Regression coverage.** Playwright now checks the cloned truth layer at 1440×1000 and 390×844: opacity/visibility, successful WebP loading from the canonical mystic asset, 1672×941 natural dimensions, exact coverage of the rendered hero bounds, and `object-fit: cover`. Visual end-state inspection confirmed the blue/gold mystic composition on both viewports.
- **Safety.** No hero asset was regenerated or restored because none was missing. The operator-owned untracked `site/assets/hero/salvor-mystic-trace.psb` was not read, modified, moved, or deleted.

## 2026-07-20 — Canonical W10 brand system (GHPAGE:06 DOCS:10)

- **Authority/provenance.** The operator confirmed the displayed 1374×1492 screenshot is the approved final W10 reference and the requested-hash mismatch is a screenshot/transport artifact. Preserved bytes SHA-256 `085c7cf9b9133df9465d3fb6a91249272ca82eb9de094724a77638b0b10a6b51`; the original-prompt hash remains recorded in the brand manifest/documentation. The raster's ghosting, grid, asymmetry, rough joins, and stray `128px` mark are explicitly non-authoritative defects.
- **Ownership.** `assets/brand/source/salvor-mark-geometry.json` defines a square 1000-unit, x=500-centered mirrored model with named frame/structure/triangle/star/stem/rings layers. `assets/brand/source/salvor-text-outlines.json` captures the pre-migration Pages wordmark (SF Mono 800, `0.22em` tracking) and social copy as fixed filled outlines. `scripts/generate-brand-assets.mjs` produces stable full/core black/white masters, 16–512 exact-size PNGs, README lockup, site aliases, favicons, full-bleed social SVG/PNG compositions, GitHub preview, and canonical loop embedding; `manifest.json` records and verifies hashes. Core differs only by stem/rings omission.
- **Migration.** README, site light/burned header, footer, favicon links, structured metadata, social cards, and root/site Loop assets now consume generated W10 assets with square cells, `object-fit: contain`, and SVG `preserveAspectRatio="xMidYMid meet"`. Retired node-sigil/badge files and references were removed; exploratory/untracked drafts are excluded from committed objects/release packaging.
- **Governance.** Operator-requested design decision recorded at `.salvor/decisions/2026-07-20-canonical-w10-brand-system.md`; `assets/brand/BRAND_ASSETS.md` owns usage/regeneration policy. README root-governance/lifecycle wording and `.salvor/DOMAIN_REF.md` now keep VERSION/per-component counters conditional on Strict/Q4=YES and describe the live `site/` mirror accurately.
- **Independent-review remediation.** The first audit correctly rejected an invented thin technical wordmark, a stale gem/AI-image handoff, and a release scan that omitted untracked candidate files. Replaced the wordmark with exact filled SF Mono Pages outlines, outlined all static social copy for host-independent rendering, removed `assets/hero-prompt.md`, corrected README's Prime Radiant description, and expanded `release:audit` to inspect the full candidate, repository-wide public retired-brand direction, and every manifest hash. Regression tests cover each failure.
- **Final validation.** `npm ci` pass; `npm audit --audit-level=high` = 0 vulnerabilities; 92/92 unit/contract tests pass (10 brand contracts); 11/11 Playwright checks pass across 1440/1024/768/390/360/320 widths plus keyboard/mobile navigation, copy/burn interactions, touch, reduced motion, local resources, and zero horizontal overflow. `brand:build`, byte-level `brand:check`, visual `brand:audit`, `git diff --check`, and the 11-gate release audit pass across 154 candidate paths, 11 JSON, 17 SVG, 35 PNG, 24 Markdown links, 20 HTML/CSS references, secrets, licensing, canonical URLs, plugin/index absence, obsolete brands, and 49 manifest hashes. Contact sheet reviewed at `/tmp/salvor-v1.0.0-beta-brand-audit/contact-sheet.png`: geometry, symmetry, alignment, exact black/white topology, full/core omission, wordmark, site states, small icons, full-bleed SVG/PNG cards, and loop variants are coherent and professionally finished. No P0/P1 remains before commit/archive verification.

---

## 2026-07-20 — Cross-surface consistency pass (CORE:09 GHPAGE:05 DOCS:09)

Four launch-gating consistency issues from an independent ZIP audit, all resolved:

1. **Public quickstart is now genuinely Core-first.** `site/index.html` primary path no longer opens with "Install Serena and GitNexus (see README)" — that mandatory step is gone. New six-step flow: open agent → paste `SETUP_PROMPT.md` (four questions) → review diff → optionally enable Serena/GitNexus after reviewing each project's install + license terms → let setup detect GitNexus capabilities and offer the safest indexing mode → review + optionally commit only Salvor changes. Terminal-card design/effects preserved; GitNexus PolyForm disclosure untouched.
2. **Q4=NO completed across every template.** Opening description → "optional per-component versioning (when Strict enabled)". Existing-install detection uses `.salvor/README.md` + Salvor-managed markers as primary evidence (VERSION.md only when it exists). Step-2 file plan lists VERSION.md only when the selected Q4 path creates it — Q4=NO reuses an existing package.json/Cargo/etc. source or a minimal non-counter project-history file, and generates no broken VERSION.md references. `.salvor/README` template root-governance line, the L1 header (two explicit variants — with/without component IDs), and the L2 initialization summary are all Q4-conditional. `[STRICT]` §0.1/§3 rules stay present but inactive when Q4=NO; no active Core instruction requires a Strict-only artifact.
3. **Stale GitNexus-block + unconditional-skill assumptions removed.** "drifted GitNexus blocks" health-check wording (README roadmap + FAQ) → drift in the hand-authored routing note / unsafe `.gitnexusrc` changes / stale-or-missing index / unexpected context injection / unexpected skills-or-hooks. Root `CLAUDE.md` GitNexus paragraph made MCP-state-aware: use `gitnexus_*` MCP tools only when they actually respond; if CLI/index exists but MCP doesn't respond, report ENHANCED-READY/PARTIAL and fall back to normal search/navigation (never imply impact analysis ran when it didn't); `.claude/skills/gitnexus-*` referenced only conditionally (pure index mode generates none). `RULES.md` §4.3 (impact-before-edits) and §4.2 (Serena-first) gained truthful MCP-unavailable fallbacks — no fabricated MCP results.
4. **Vendor portability calibrated + `.salvor/` topology corrected.** `docs/VENDOR_ADAPTERS.md` opening had listed L1/L2/DOMAIN_REF/DEFERRED_TODOS/postmortems/domain-learnings under `docs/` and called the GitNexus index "git-tracked" — corrected to `.salvor/` ownership, VERSION.md-only-under-Strict, Serena memories as optional retrieval aids, GitNexus index as machine-derived + gitignored (not canonical), and Serena/GitNexus as optional enhanced integrations (not "git-tracked files plus two MCP servers"). Unqualified "vendor-neutral" / "no vendor to choose" / "any teammate's CLI works out of the box" replaced with scoped vendor-portable language (Claude Code most dogfooded; Codex/Google wired + documented but less exercised; others via thin adapters) across README, SETUP_PROMPT, ARCHITECTURE, VENDOR_ADAPTERS, core/CLAUDE. CHANGELOG now describes conditional versioning.

Bumped CORE:08→09, GHPAGE:04→05, DOCS:08→09. Tests extended; historical VERSION.md rows left as history.

## 2026-07-20 — Launch gate: licensing, social preview, release hardening (CORE:08 GHPAGE:04 DOCS:08)

- **Licensing (final).** Maintainer decision: stay standard MIT (adoption; no OSI license can bar commercial resale). LICENSE copyright → `Copyright (c) 2026 Dan Wasyluk` (body unchanged). Created `TRADEMARKS.md`: MIT governs code/docs; the Salvor name/logo/wordmark/official artwork are protected separately (forks need a distinct identity; truthful nominative references allowed; official screenshots/cards allowed; does NOT restrict MIT code rights; no "registered trademark" claim). README + CONTRIBUTING + site footer link it. GitNexus stays third-party PolyForm Noncommercial; Serena open-source — never covered by Salvor's MIT.
- **Social sharing.** Built an evergreen OG card from the real brand assets (white node sigil, SALVOR wordmark, "Your repo remembers." in gold, supporting line, the hero mystic artifact on the right; black/gold visual language). Rendered via headless Chromium (Playwright) at exact viewports: `site/assets/social/salvor-social-card.png` (1200×630, ~344 KB) and `assets/social/github-social-preview.png` (1280×640, ~402 KB, <1 MB); editable `site/assets/social/salvor-social-card.svg` source. Added full static OG + X/Twitter + canonical metadata to `site/index.html` head — canonical/og:url `https://dwasyluk.github.io/salvor/` (no CNAME → project Pages URL), og:image=twitter:image=`https://dwasyluk.github.io/salvor/assets/social/salvor-social-card.png`, image dims/type/alt, `twitter:creator=@blockchaindan`, no `twitter:site`. Title/OG title evergreen ("Salvor — Your repo remembers.") so cached previews don't stale at v1.1.0; hero eyebrow keeps `SALVOR v1.0.0-beta`.
- **Site copy.** `// BUILT ON OPEN FOUNDATIONS` → `// CODE INTELLIGENCE INTEGRATIONS` (GitNexus not implied OSI/MIT). Removed the unsafe public "Commit the scaffold. Run `gitnexus analyze`." step → safe version-aware enhanced step. Portability: "Every agent reads the same truth" → "Every supported agent starts from the same reviewed truth"; "Any vendor" / "no vendor to choose" reworded; vendor-neutral → vendor-portable.
- **SETUP_PROMPT.** Q4 now genuinely controls Strict versioning in generated output (Q4=NO: no per-component counters/derived constants, don't compete with package.json/Cargo/etc., minimal history or reference the existing mechanism; Core independent of Strict). Step 0 + final report separate CLI availability / index readiness / MCP configuration / MCP-tools-responding, with statuses CORE / ENHANCED-READY (PARTIAL) / ENHANCED-ACTIVE — never claim enhanced from mere CLI presence, never invoke MCP-only ops unless the MCP responds.
- **Docs.** `.gitnexusrc` legacy fallback documented as the `--skip-agents-md` CLI flag (not a persisted config key/promise); persisted default `{"indexOnly": true}`. Hand-authored routing note replaces "GitNexus block in the hub". FAQ: "Salvor Core is repository-local files and governance…" + model-provider privacy caveat. ARCHITECTURE: per-component versioning + APP_NAME framed as optional Strict, not Core.
- CHANGELOG v1.0.0-beta date → 2026-07-20. Bumped CORE:07→08, GHPAGE:03→04, DOCS:07→08.

## 2026-07-20 — GitNexus aligned to current published version v1.6.9 (CORE:07 DOCS:07)

The prior pass (CORE:06) tested GitNexus **1.6.3**, where `--index-only` did not exist, config keys were inert, and `analyze` always installed local skills — so it documented `--skip-agents-md` as the control. But `npm view gitnexus version` = **1.6.9** is what users install today. Upgraded the local CLI to 1.6.9 and re-verified LIVE (fixtures `/tmp/gnA`, `/tmp/gnB`, `/tmp/gn-enh`):

- `gitnexus analyze --index-only` — "Pure index mode: skip all file injection". Result: `CLAUDE.md`/`AGENTS.md`/`GEMINI.md` **unchanged**, **no** `.claude/` skills dir created, index built. `--skip-skills` also now exists.
- `.gitnexusrc {"indexOnly": true}` (config, no flag) — same clean result. Config keys are now honored in 1.6.9.

So the safe default is now **index-only** (flag or config), documented **version-aware**: agents detect via `gitnexus analyze --help`; use `--index-only` where present (v1.6.9+); fall back to `--skip-agents-md` on older versions (context-only — still generate local skills, which are gitignored, shown, and approved). Any "config keys not honored" statement is explicitly scoped to v1.6.3. Repo `.gitnexusrc` set to `{"indexOnly": true}`.

Reframed SETUP_PROMPT Options A–D (A = pure index recommended), `docs/VENDOR_ADAPTERS.md`, `docs/ARCHITECTURE.md`, root + example adapters (`AGENTS.md`/`GEMINI.md`/`CLAUDE.md` hub note), CHANGELOG, and root + example Serena memories. Adapter ownership corrected to: canonical engineering knowledge lives in its assigned `.salvor/` artifact; Serena memories and vendor adapters are concise retrieval/routing aids (not co-canonical); GitNexus owns machine-derived structure. Removed the stale auto-generated `gitnexus:start` block (hardcoded "161 symbols") from `example-project/CLAUDE.md`, replacing it with a hand-authored routing note. Skill-path wording is version-tolerant (`.claude/skills/gitnexus-*`; no nested `gitnexus/gitnexus-*` pattern). Bumped CORE:06→07, DOCS:06→07.

## 2026-07-20 — Final launch corrections (CORE:06 DOCS:06)

Bounded independent-review correction pass on the single `main` worktree (baseline `50949f7`).

- **GitNexus safe default — flag, not config (live-test correction; a Learned-Failure-grade finding).** The initial plan followed a web summary claiming `.gitnexusrc {"indexOnly": true}` "skips all file injection". A live `gitnexus analyze` against GitNexus **1.6.3 disproved this**: with `{"indexOnly": true}` — and separately `{"skipContextFiles": true, "skipSkills": true}`, both flat and nested under `analyze` — GitNexus STILL injected its block into `CLAUDE.md`/`AGENTS.md` and STILL installed skills. The `--skip-agents-md` FLAG is the verified control (both files unchanged after `gitnexus analyze --skip-agents-md`). `analyze` ALWAYS installs six local static skill dirs `.claude/skills/gitnexus-{cli,exploring,guide,debugging,impact-analysis,refactoring}/` regardless of flags/config — regenerable local artifacts; the repo `.gitignore` pattern was `**/.claude/skills/gitnexus/` which did NOT match `gitnexus-*/`, so it was fixed to `**/.claude/skills/gitnexus*/`. Hooks come only from `gitnexus setup`. Set `.gitnexusrc` to `{"skipAgentsMd": true}` for forward-compat but documented the FLAG as the control. Reworked SETUP_PROMPT + docs to Options A (`gitnexus analyze --skip-agents-md`, recommended) / B (`--skills`) / C (`gitnexus setup` hooks/MCP) / D (full) — all opt-in beyond A. Core remains fully functional without GitNexus.
- **Dogfood RULES §0–§8 → §0–§9.** The SETUP_PROMPT template already generates §0–§9 (§9 = Security & Git-safe operation), but the repo's own root + example `RULES.md` lagged at §0–§8. Added the §9 section to both, retitled §8 "Memory layers & canonical ownership", and turned the old §5.3 never-persist list into a pointer to §9 (single owner). Updated example README + example Serena memory from §0–§8 to §0–§9.
- **SETUP_PROMPT canonical ownership.** Replaced the two blanket "Shared, canonical, git-tracked: everything in-repo…" statements with the one-owner model + table; stated explicitly that Serena memory, GitNexus-generated context, and vendor adapters are NOT co-canonical, and spokes link rather than duplicate.
- **Serena memories refreshed.** Root: fixed the false "there is no root package.json" (there is: salvor-site v1.0.0-beta, MIT, with test scripts), dropped the stale "version-controlled brain" framing and `docs/PLAN.md` reference, corrected ghpage topology to site-on-main, and pointed memories at canonical artifacts (they are retrieval aids, not the canonical brain). Example: corrected memory-layer paths (`docs/` → `.salvor/`) and §-count.
- **Cline Memory Bank comparison** corrected in README + FAQ: a cross-tool structured-Markdown methodology (commands/integrations vary), not extension-bound. Salvor's real differences preserved.
- **Cleanup:** removed the obsolete `ghpages/**` CI push trigger; calibrated the categorical README session claim to "Fresh sessions often lack a reviewed, team-shared record of the project's accumulated reasoning"; swept residual `skipContextFiles`/"the ghpage" current-state wording to the `--skip-agents-md` flag / site.
- **Live GitNexus enhanced smoke test** (fixtures under `/tmp/salvor-gn*`): the final verified recipe `gitnexus analyze --skip-agents-md` builds the index and leaves `CLAUDE.md`/`AGENTS.md` unchanged; the always-installed `.claude/skills/gitnexus-*/` are gitignored; no hooks are installed; an unrelated `.gitnexusrc` key is preserved; no auto-commit, no staging.

## 2026-07-16 — Salvor self-scaffold initialized

Installed a concise canonical `CLAUDE.md` hub with thin `AGENTS.md` and `GEMINI.md` adapters so Claude Code, Codex, and Gemini CLI share one repository knowledge base. Added `core`, `web`, and `docs` spokes with initial build IDs `CORE:01`, `WEB:01`, and `DOCS:01`.

The web component is metadata-only on `main`; no GitHub Pages implementation was copied from the separate `ghpages/v1.0.0-beta` checkout. [SUPERSEDED 2026-07-19: the site now lives on `main` and deploys from `main`; the `ghpages/v1.0.0-beta` mirror branch is retired — see the 2026-07-19 consolidation entry below.] Canonical public product claims remain in `README.md`, `SETUP_PROMPT.md`, and `docs/VENDOR_ADAPTERS.md`. When site code is approved for `main`, its build must generate mapped public copy from those sources. Existing mapped copy may update automatically; new page sections, interactions, or visual elements require explicit operator design approval.

Created the shared `.salvor/` audit brain and made the five existing Serena project memories git-tracked. No `.claude/settings.json`, per-user memory, push, deployment, merge, or production action was performed.

## 2026-07-19 — GHPAGE:01 source-of-truth mirror sync

Merged `main` into `ghpages/v1.0.0-beta` as commit `d67b929`, taking main's framework and documentation as authoritative while preserving the branch's static presentation layer. Reconciled the page to the Domain Learnings taxonomy, multivendor default entrypoints, namespaced `.salvor/` brain and decisions, user-gated capture classes, governance/versioning, and future-only plugin status. Mirrored `assets/salvor-loop.svg` into the deployable site asset tree and embedded it prominently.

Registered the concrete Pages consumer as `GHPAGE:01`, replacing the metadata-only WEB placeholder in the current component set on this branch. [SUPERSEDED 2026-07-19: topology consolidated — site + core both live on `main`, Pages deploys `site/` from `main`, and the branch-specific mirror is retired; see the 2026-07-19 consolidation entry below.] A source-of-truth sync is not complete until Playwright is run directly against the rendered ghpage at desktop, tablet, Galaxy-S25-Edge-like small-phone, and 320px narrow viewport sizes. Each size must prove the hero remains visible and readable, local resources load, and the document has no horizontal overflow. CSS review or contract tests alone are not evidence of responsive health.

## 2026-07-19 — GHPAGE:02 responsive loop and burn-surface interaction

Preserved the approved public copy while splitting the combined Salvor Loop comparison into two site-only 800×960 SVG panels. The deployable page uses a wrapping flex container: the panels share a row on wide desktop consumers and stack at equal full width for tablet, 360px small-phone, and 320px narrow consumers. The canonical combined SVG remains unchanged for the README.

The canonical hero's non-slogan display copy is now both non-selectable and pointer-transparent. Pointer input over the large SALVOR title therefore reaches the existing hero-level burn surface and follows the normal click-and-drag zipper path; no text-specific handler exists. The slogan remains selectable, CTA controls remain interactive, and the canonical header/navigation remains selectable and clickable across its width. The generated visual burn clones stay pointer-inert so they cannot intercept those controls.

Direct Playwright verification covered 1440×1000 desktop, 768×1024 tablet, 360×780 Galaxy-S25-Edge-like small phone, and the additional 320×568 narrow guard. It asserted local loading and natural dimensions for both loop panels, desktop side-by-side placement, stacked equal-width placement below desktop, zero horizontal overflow, mouse drag through the title, actual Chromium touch drag through the title, and non-burn interaction on the selectable slogan. Playwright reports, traces, and screenshots remain local validation artifacts and must be deleted before commit.

## 2026-07-19 — CORE:04 DOCS:04 public-launch hardening sweep

Standardized the capture taxonomy on the umbrella term "capture classes" across RULES, the CLAUDE.md capture directive, docs, and the example project. The three classes: (1) Decision / Domain Learning, with subtypes Design Decision (prompt "Record this as a design decision? (yes/no)" → `.salvor/decisions/`) and Domain Learning (prompt "Save this as a domain learning? (yes/no)" → `.salvor/domain-learnings/`); (2) Learned Failure (`LF:<slug>` since 2026-08-05; previously numbered LF#), registered through the same flow; (3) Deferred Finding (prompt "Log this to .salvor/DEFERRED_TODOS.md? (yes/no)" → `.salvor/DEFERRED_TODOS.md`). "Trigger" survives as a verb; the classes are canonical. Root RULES §2 now carries both Decision/Learning prompts, matching the example project's RULES.

Renamed the RULES §1 recovery loop-breaker to "Context Recovery Procedure" in both RULES files, both CLAUDE.md hubs, and ARCHITECTURE.md, retiring the memory-loss-themed legacy name and replacing its prose everywhere with "context recovery."

Added a Protocol Tiers preamble to both RULES files splitting the Core Protocol (context loading, L1/L2 maintenance, capture approval, context recovery, security, git-safe operation, canonical ownership, vendor portability) from Optional Strict Engineering Defaults (build counters, env-var conventions, branch deletion, container permissions, impact-analysis-before-edit, >100-line read limit, mirror parity). The strict group is explicitly optional, editable, and project-specific; disabling it does not break Salvor Core. The example project keeps and now explicitly advertises the strict profile. Section numbering unchanged.

Rebounded L2: all "unbounded"/"no line limit" descriptions replaced with detailed-but-curated plus a rotation rule (condense oldest resolved sections past ~1,500 lines or at release milestones; keep durable conclusions, evidence references, commit/test/issue IDs; drop raw noise). Added the §5.3 never-persist security list to both RULES files (API keys, passwords, tokens, private keys, .env contents, credential URLs, customer PII, unredacted production logs, large raw dumps, hidden model reasoning); other sections reference it rather than restating it.

Docs accuracy: VENDOR_ADAPTERS gained the current Serena install (`uv tool install -p 3.13 serena-agent` + `serena init` + oraios/serena link), the Serena-memories-as-retrieval-aid vs `.salvor/`-as-canonical stance, and the GitNexus ownership contract (owns index/skills/hooks + the marked gitnexus block in the canonical hub only; `.gitnexusrc` `{"skipContextFiles": true}` opt-out with merge-never-overwrite; `.claude/skills/gitnexus/` generated locally and gitignored). FAQ gained Spec Kit and Google ADK entries, softened Obsidian/vendor-memory/Memory Bank comparisons to job-to-be-done framing, dropped the binary capability table, and replaced the absolute "nothing is uploaded" privacy claim with the no-hosted-service formulation. Calibration sweep removed "forgets everything" / "only Salvor" style claims. Fixed stale README roadmap anchor in FAQ and removed the nonexistent `docs/superpowers/` reference from docs/CLAUDE.md. Example-project README now points at real `.salvor/` paths (its Layout row previously said `docs/`), as does its RULES §8 memory-layers list.

## 2026-07-19 — Worktree + Pages-topology consolidation and final ratification

This entry supersedes all earlier prose describing a separate presentation mirror. **CURRENT STATE (unambiguous):** the two worktrees were consolidated into a single `main` worktree, and the site was moved onto `main`. GitHub Pages now deploys `site/` directly from `main` via `.github/workflows/pages.yml` (Pages source = GitHub Actions); pushing and deploying remain operator-controlled. The branch-specific presentation mirror is retired — there is no longer a `ghpages/v1.0.0-beta` deploy branch and no "merge canonical content into a Pages branch" step. The `ghpages/v1.0.0-beta` branch is vestigial/historical only.

Where earlier entries in this file say the "web component is metadata-only on `main`," "no site on main," or that the presentation layer lives on a separate `ghpages/v1.0.0-beta` checkout (see the 2026-07-16 and 2026-07-19 GHPAGE:01/02 entries), those statements are **SUPERSEDED by this entry** and describe a prior topology; they are retained as history, but the current state is: core + site both live on `main` and deploy from `main`.

Tagline change ratified: the Salvor Loop value-proposition line changed from "Every request makes the next one smarter." to "Every approved capture gives the next session more context." across `site/index.html`, both `site/assets/salvor-loop*.svg` copies (`<text>` and the `salvor-loop-with.svg` `<desc>`), and the canonical `assets/salvor-loop.svg`. The new string is longer, so the SVG value-prop `<text>` font-size dropped 20 → 16 to stay within the 800-wide panel (rendered span ≈ x117–x683, comfortable margins); all copies kept in sync.

Additional launch-ratification wording locked in this sweep: GitNexus positioned as license/optional (an optional local tool, not called "free"/MIT); Gemini terminology reconciled to "Gemini CLI / Antigravity" via the compatible `GEMINI.md`; the one-owner canonical model (single canonical CLAUDE.md hub, thin adapters); Core-vs-Strict protocol reconciliation (Core Protocol vs Optional Strict Engineering Defaults); root version set to v1.0.0-beta. L1 build counters advanced to CORE:05 / GHPAGE:03 / DOCS:05.
