---
name: capture
description: Persist a learning, a Learned Failure, or a deferred TODO into Salvor's git-tracked memory, running the full propagation. Use when the user says "save this", "remember this", "log that", or wants to record a decision, finding, or failure.
argument-hint: "[optional: what to capture]"
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Write, Edit, Bash(git log:*)
---

# Salvor — capture

The user wants to persist knowledge into Salvor's memory. This is the
**user-initiated** entry point to the capture protocol defined in this repo's
`RULES.md` (§2 Continued Learning, §7 Out-of-scope finding). Follow that protocol
exactly — do not invent a new one. If `RULES.md` doesn't exist yet, tell the user
to run `/salvor:init` first.

1. **Pick the flavor** (ask if unclear):
   - **Continued Learning** — a discovery/decision + its *why*. → RULES §2: ask me
     verbatim `"Save this as a domain-tuning artifact? (yes/no)"`, then on yes run
     the full stack propagation (dated artifact in `.salvor/domain-tuning/` +
     README/TOC + `DOMAIN_REF.md` + L1/L2, and memories if used).
   - **Learned Failure (LF#)** — a recurring/structural failure + root cause + fix
     sites. → register/update the `LF#` entry in `.salvor/DOMAIN_REF.md` plus the L1
     shorthand, as part of the §2 flow.
   - **Deferred TODO** — an out-of-scope finding to park. → RULES §7: ask me
     verbatim `"Log this to .salvor/DEFERRED_TODOS.md? (yes/no)"`, dedupe first, then
     append an entry with Where / What / Severity / Suggested fix.
2. **Execute** the propagation for the chosen flavor by following the authoritative
   steps in `RULES.md` (read the relevant section first).
3. **Report** which files were touched (the confirmation report the protocol
   requires).
