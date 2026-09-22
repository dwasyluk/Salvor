# Deferred TODOs

Out-of-scope findings intentionally not addressed when they surfaced: real, but not worth derailing their originating task. Severity reflects impact if left for roughly six months, not whether something is broken today. See `RULES.md` §7.

<!-- Template for new entries (self-allocating slug ID — never a sequential number; RULES §10.1):

### deferred:<kebab-slug> — <short title>
- **Subject**: <tags: system / vendor / component the finding is about>
- **Where**: <file / location>
- **What**: <the issue>
- **Severity**: <Low | Medium | High>
- **Suggested fix**: <actionable suggestion>
- **Why deferred**: <why it was safe to skip now>
-->

## How This File Is Maintained

1. When an entry is fixed, delete it and reference the stable slug ID in the fixing commit (`closes deferred:<slug>`).
2. When a new out-of-scope risk appears, prompt per `RULES.md` §7 and add it only after approval.
3. When impact becomes urgent, promote it to a real ticket and link back.
