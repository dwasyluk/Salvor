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
| **Knowledge** | Your artifacts (`decisions/`, `domain-learnings/`, `postmortems/`, `archive/`), L1/L2 content, `DOMAIN_REF.md` facts, deferred entries | **Never touched** — you own it |

An upgrade replaces Salvor's instructions, never your team's accumulated
project knowledge. Where you have customized generated RULES text (Strict defaults are
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

Questions or a migration that didn't go cleanly? Open a
[`[HELP]` discussion](https://github.com/dwasyluk/salvor/discussions).
