# Deferred TODOs

Out-of-scope findings intentionally **not** addressed when they surfaced — real, but not worth derailing the task they
were found in. Captured here so they don't slip into "I'll remember." Severity reflects "impact if left ~6 months," not
"broken today." See `RULES.md` §7 for the capture protocol.

<!-- Template for new entries (self-allocating slug ID — never a sequential number; RULES §10.1):

### deferred:<kebab-slug> — <short title>
- **Subject**: <tags: system / vendor / component the finding is about>
- **Where**: <file / location>
- **What**: <the issue>
- **Severity**: <Low | Medium | High>
- **Suggested fix**: <actionable suggestion>
- **Why deferred**: <why it was safe to skip now>
-->

### deferred:no-persistence — Notes are lost on API restart
- **Subject**: api, store, persistence
- **Where**: `api/src/store.ts`
- **What**: The store is a process-local in-memory `Map` with a module-level `nextId` counter. Restarting the api loses
  every note and resets ids to `1`. There is no durability of any kind.
- **Severity**: Medium
- **Suggested fix**: Persist behind the existing `store.ts` function signatures (deliberately storage-agnostic) — e.g. a
  SQLite table or a JSON file flushed on write. No caller changes required.
- **Why deferred**: Fine for a demo / local use, which is the entire point of this example. Promoting Notebook to anything
  real makes this urgent.

## How this file is maintained
1. When an entry is fixed, delete it and reference the stable slug ID in the fixing commit (`closes deferred:<slug>`).
2. When you discover a NEW out-of-scope risk during related work: prompt me (RULES §7), and if I agree, add it here —
   don't let it slip into chat.
3. When something here becomes urgent (impact observed): promote it to a real ticket and link back.
