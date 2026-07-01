---
name: health
description: Lint the Salvor "brain" for staleness and drift — L1 over budget, stale deltas, unresolved LF#, aging deferred TODOs, broken links, spokes behind the code, drifted GitNexus block, missing version bumps, and L1/L2/DOMAIN_REF contradictions. Use when the user asks to check, audit, or health-check the memory.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Bash(ls:*), Bash(grep:*), Bash(git log:*), Bash(wc:*)
---

# Salvor — health

Run a **read-only** audit of this project's Salvor memory against the checklist,
then report findings + concrete fixes. Do NOT modify files — offer to fix, or
suggest `/salvor:capture` for anything worth persisting. If the Salvor files don't
exist, tell the user to run `/salvor:init` first.

Apply the rubric in the bundled checklist (inlined below):

!`cat "${CLAUDE_SKILL_DIR}/HEALTH_CHECKLIST.md"`

> If the inline above is empty, read `HEALTH_CHECKLIST.md` in this skill's own
> directory and apply it instead.

For each check, report **PASS / WARN / FAIL** with a one-line reason and a concrete
fix. End with a short summary (counts) and the single highest-priority fix.
