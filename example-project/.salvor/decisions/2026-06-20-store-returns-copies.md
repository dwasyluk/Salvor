# Decision: the store returns copies, never internal references

- **Date:** 2026-06-20
- **Status:** Active
- **Related:** LF-1 (stale note reference) in [`../DOMAIN_REF.md`](../DOMAIN_REF.md)

## Context
`store.ts` keeps notes in an in-memory `Map`. Early on, `getNote()` / `listNotes()`
returned the *same* `Note` objects held in the Map. Callers that mutated a returned
note (e.g. trimming a title before responding) silently corrupted the stored copy —
which is what surfaced as **LF-1**.

## Decision
`getNote()` and `listNotes()` return **shallow copies** of the stored `Note` objects
(`{ ...note }`), never the internal references.

## Rationale
The store must be the single owner of its state. Handing out live references makes
every caller a potential mutator, and the resulting corruption is non-local and hard
to trace (LF-1 took a postmortem to pin down).

## Invariant
**No accessor may return an object that is still referenced inside the store's Map.**
Do not "optimize" the copy away — returning the internal object *is* the LF-1 bug.

## Coupling / blast radius
- `api/src/store.ts` — the copy happens here.
- Every reader of a `Note` (`api/src/server.ts` handlers, `web/src/main.ts` render). If
  you change the store to return references, any of them can corrupt state.
- Before touching the `store.ts` accessors, run a GitNexus impact check on `getNote` /
  `listNotes` when the GitNexus MCP is active; otherwise inspect callers with the
  best available structural search/review fallback.

## Alternatives rejected
- **Deep clone** — unnecessary; notes are flat. Extra cost for no benefit.
- **`Object.freeze` the stored notes** — pushes the failure to runtime (silent no-op
  writes, or throws in strict mode) instead of preventing it; copies are simpler.
