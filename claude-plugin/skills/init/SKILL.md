---
name: init
description: Scaffold Salvor into this repo (new or existing) — hub-and-spoke CLAUDE.md, L1/L2 memory, RULES.md, per-component VERSION.md, and the three capture triggers. Use when a repo has no Salvor structure yet, or the user asks to set up / initialize Salvor.
argument-hint: "(none — it interviews you)"
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Write, Edit, Bash(git status:*), Bash(git rev-parse:*), Bash(git init:*), Bash(gitnexus analyze:*), Bash(find:*), Bash(ls:*), Bash(grep:*)
---

# Salvor — init

You are scaffolding **Salvor** into the current repository: a repo-native,
git-tracked memory + discipline layer for coding agents.

**This skill is a thin wrapper. The canonical setup instructions live in the
bundled `SETUP_PROMPT.md`, which is kept byte-identical to the universal prompt
that non-Claude-Code users paste by hand. Execute it verbatim — do not improvise
or paraphrase the scaffold.**

Read and follow the bundled prompt now (it is inlined below):

!`cat "${CLAUDE_SKILL_DIR}/SETUP_PROMPT.md"`

> If the inline above is empty, read the file `SETUP_PROMPT.md` in this skill's
> own directory and follow it verbatim instead.

Complete every step it specifies — interview the user (project name / components /
live-mirror pair / vendor), create the file tree, make the initial commit, run
`gitnexus analyze` — and finish with the confirmation report the prompt requests.
