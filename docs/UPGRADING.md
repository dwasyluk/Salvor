# Upgrading Salvor

Upgrading is the same operation as installing, and just as vendor-agnostic:
**paste the newer `SETUP_PROMPT.md` into your coding agent from the repo root**
— Claude Code, Codex, or Gemini CLI / Antigravity CLI, whichever you happen to
be using that day. Step 0 detects the existing install and switches to a
version-aware upgrade instead of a reinstall. When vendor plugins ship (e.g.
the Claude Code plugin's `/salvor:init`), they wrap this exact same prompt and
hit this exact same path — a prompt install and a plugin install are the same
install, so nothing about how you installed constrains how you upgrade.

## The two layers (why upgrades are safe)

| Layer | Contents | On upgrade |
|---|---|---|
| **Protocol** | [`RULES.md`](../RULES.md) text, artifact-folder READMEs/templates, hub directives, vendor adapters, Salvor-managed sections | Refreshed — Salvor owns it |
| **Knowledge** | Your artifacts (`decisions/`, `domain-learnings/`, `postmortems/`, `archive/`), L1/L2 content, `DOMAIN_REF.md` facts, deferred entries | Preserved by default — any identifier, header, link, or metadata migration is separately proposed and operator-approved |

An upgrade refreshes Salvor's instructions and is designed to preserve your
team's accumulated project knowledge. It never silently rewrites knowledge
claims; when a release requires a schema, identifier, header, link, or metadata
migration, the exact edits are part of the operator-approved plan. Where you
have customized generated RULES text (Strict defaults are
explicitly editable), the upgrade is proposed as a three-way merge — your
version vs the old template vs the new template — and any conflict is yours to
decide, per the [`RULES.md`](../RULES.md) §10.2 governance rule. Nothing is written without
your approval of the plan.

## The protocol stamp

`.salvor/README.md` carries a one-line stamp:

```
Salvor-Protocol: v1.0.0-beta
```

It records which Salvor version scaffolded (or last upgraded) the install.
A newer prompt compares its own **Protocol version** header against the stamp
and proposes only the deltas between the two — and bumps the stamp as part of
the applied plan. Installs that predate the stamp are treated as potentially
stale across the whole protocol layer and offered the full repair/update plan
(which adds the stamp).

## Migration notes by version

### → v1.0.0-beta

First stamped release. If you are upgrading an install scaffolded from a
pre-beta copy of the prompt, the notable protocol migrations the upgrade plan
will propose:

- **Slug knowledge IDs** ([`RULES.md`](../RULES.md) §10.1): numeric Learned-Failure IDs
  (`LF1` / `LF-1` / `LF01`) become `LF:<kebab-slug>` registry entries, and
  positional deferred entries (`### 1.`) become `deferred:<kebab-slug>`
  headings. Your artifact *content* is untouched; registry headings, index
  rows, and cross-references are renamed with your approval.
- **Structured artifact headers** (ID / Subject / Claim / Evidence date /
  Status) added to artifact templates; existing artifacts can be back-filled
  opportunistically (the Brain Audit flags missing headers).
- **RULES §10** (Brain Reconcile + Brain Audit), the **[EXPERIMENTAL]
  §10.5–§10.6** agentic-capture/archive sections (default OFF — enabling is
  always a separate, explicit operator choice, never part of an upgrade), the
  `Last Brain Audit` L1 footer line, and the `.salvor/archive/` scaffold.

## Removing Salvor

Salvor setup installs no service and no global configuration. Any hook or
settings change happens only with your approval. What remains is files in your
repository, so removing Salvor is a normal reviewed change. The same
two layers apply in reverse: the **protocol layer** is Salvor's and can go,
while the **knowledge layer** is yours, so decide what to keep before deleting
anything.

1. **Find what the install changed.** The setup commit is the exact checklist:
   ```sh
   git log --diff-filter=A --format='%h %ad %s' --date=short -- .salvor/README.md
   git show --stat <that-commit>
   ```
   Also look at later upgrade commits and any commit carrying the
   `Salvor-Contribution: agent` trailer. Setup lists pre-existing files as
   "files to modify". Don't assume those edits sit only inside
   `<!-- salvor:start --> … <!-- salvor:end -->`: an adoption can also rewrite
   lines around them, for example turning an older memory file into pointers.
2. **Keep the knowledge you want.** `.salvor/DOMAIN_REF.md` (Learned
   Failures), `DEFERRED_TODOS.md`, `decisions/`, `domain-learnings/`,
   `postmortems/` and `INFRA.md` hold what your team learned. Move whatever you
   still want into your own docs, issues or ADRs. Everything stays in git
   history either way. Code comments and tests may still cite knowledge IDs
   (`LF:<slug>`, `DEC:<slug>`, `deferred:<slug>`, or legacy `LF1`/`LF-1`).
   Find them with
   `git grep -n -E "\b(LF|DL|DEC|PM|deferred):[a-z0-9-]+|\bLF-?[0-9]+\b"`
   and compare with the same search at `<setup-commit>^`: IDs that were
   already there before setup belong to your own records, not to Salvor. For
   the rest, keep the entries they point to or reword the comments.
3. **Remove the protocol layer.** Remove `.salvor/`, plus `RULES.md`,
   `VERSION.md`, `AGENTS.md`, `GEMINI.md`, the hub `CLAUDE.md` and component
   `CLAUDE.md` spokes, but only where setup created them. Where setup modified
   an existing file, remove the managed block and restore any adoption edits
   from the setup diff (`git diff <setup-commit>^ <setup-commit> -- <file>`).
   If every Salvor commit changed only Salvor files, `git revert` of those
   commits (newest first) does steps 3 and 4 in one go.
4. **Check the side files.** Setup may have added ignore entries (for example
   `.tmp/`, `.gitnexus/`, `.serena/cache/`) to `.gitignore`, set `indexOnly`
   in `.gitnexusrc`, written or changed `.serena/memories/` pointer files, or
   added a `.claude/settings.json` hook if you approved one. Untracked
   GitNexus output (`.gitnexus/`, `.claude/skills/gitnexus-*/`) isn't removed
   by `git revert`, so delete it by hand if you don't keep GitNexus. Serena and
   GitNexus are separate tools. Keep or uninstall them independently. Salvor
   never changes global or client MCP configuration without your approval, so
   undo only the changes you approved then.
5. **Claude Code plugin**, if you installed the pre-release plugin:
   `/plugin uninstall salvor`, using the same scope you installed it with
   (e.g. `claude plugin uninstall salvor --scope project`). If you added the
   marketplace only for Salvor, also run `/plugin marketplace remove salvor`.
6. **Verify.** `git grep -n -i "salvor"` and the knowledge-ID search above
   should return only what you chose to keep. Then start a fresh agent session
   and confirm that it no longer reads `RULES.md` or `.salvor/`.

Questions or a migration that didn't go cleanly? Open a
[`[HELP]` discussion](https://github.com/dwasyluk/salvor/discussions).
