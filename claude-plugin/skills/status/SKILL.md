---
name: status
description: Read-only snapshot of this repo's Salvor "brain" — current L1 state, build IDs, open deferred TODOs by severity, recent learned failures, and last-updated dates. Use when the user asks where the project's memory/state stands.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Bash(ls:*), Bash(grep:*), Bash(wc:*)
---

# Salvor — status

Give a concise, **read-only** snapshot of this project's Salvor state. Do NOT
modify any files. Skip any file that doesn't exist (and say so — if none exist,
tell the user to run `/salvor:init`).

Read:
- `docs/active_state.md` (L1) — current architecture line, the "Current Delta to
  Published Logic", open items, and any LEARNED FAILURES shorthand. Note its line
  count.
- `VERSION.md` — current build IDs + Last Updated date.
- `docs/DEFERRED_TODOS.md` — count open entries, grouped by Severity.
- `docs/DOMAIN_REF.md` — the most recent `LF#` entries (id + one-line).

Then print a compact summary:
- **State:** <one line from L1>
- **Versions:** <build IDs> (updated <date>)
- **Deferred:** N total — High:x Med:y Low:z
- **Recent LF#:** <ids>
- **Freshness:** flag anything obviously stale (L1 over 50 lines, dates far behind
  the last code change). For a full audit, suggest `/salvor:health`.
