# Preservation-first existing-repository adoption

**Date:** 2026-07-30
**Status:** Approved
**Scope:** Salvor setup protocol, existing Serena/GitNexus integrations, and
mature agent-instruction architectures

## Context

Salvor must be safe to introduce into repositories that already contain
valuable agent infrastructure: Serena project state and memories, GitNexus
configuration/indexes, a canonical `CLAUDE.md` hub with component spokes,
`RULES.md`, `.claude/` hooks/settings/agents/skills, thin vendor adapters, and
third-party managed sections.

Treating every repository like an empty scaffold would risk overwriting or
duplicating the exact knowledge Salvor exists to preserve. It would also create
ambiguous authority when a project already has rules or a hub-and-spoke system.

## Decision

Setup uses a preservation-first **adoption mode** whenever relevant files or
tool state already exist. Before any write it presents an adoption map with
three outcomes:

1. `reuse unchanged`
2. `add Salvor-managed section`
3. `conflict — operator decision required`

The adoption rules are:

- Inventory existing project knowledge sources read-only during setup and offer
  optional analysis then; the user may invoke the same workflow later on
  demand. Classify coherent sections/snippets rather than whole files because
  one document may contain multiple artifact types.
- For each candidate, show the source location, proposed destination, canonical
  owner, ownership action, and exact content. Confirm unrelated promotions
  independently through their applicable capture gates. Existing source files
  remain untouched unless their mutation receives separate approval.
- Reuse an existing `.serena/` project automatically. Do not rerun
  `serena init`; do not copy, migrate, import, or promote its memories into
  `.salvor/`. Every proposed `.serena/memories/` mutation is named file by file
  in the pre-write plan and requires approval. A case variant such as
  `.Serena/` is a collision that stops setup for operator direction.
- Reuse an existing GitNexus CLI, configuration, and fresh index. A stale index
  produces an explicit refresh choice. Any `.gitnexusrc` change merges only the
  approved key while preserving all unrelated keys; setup never replaces the
  file or runs `gitnexus setup` without separate approval.
- Keep an existing `CLAUDE.md` as the canonical hub and discover/map/reuse its
  component spokes. Do not generate a competing hub or duplicate spokes.
- Preserve `RULES.md` verbatim. Reuse equivalent requirements instead of
  duplicating them. Present real conflicts side by side and require the
  operator to choose; Salvor does not silently resolve them.
- Preserve `.claude/`, `CLAUDE.local.md`, hooks, settings, agents, skills,
  `.codex/`, `.gemini/`, MCP configuration, and third-party managed sections
  unless an exact mutation is separately listed and approved.

Correctly mapped reusable structures require no extra prompt. Setup asks only
when a mapping is ambiguous, a case/path collision exists, a stale index may be
refreshed, rules genuinely conflict, or a concrete mutation is proposed.

## Rationale

Salvor's value proposition is durable, operator-reviewed knowledge. An
installer that silently rewrites existing knowledge would contradict that
contract. Reusing in place also keeps third-party tool ownership clear:
`.serena/` remains Serena-owned project state, `.gitnexus/` remains
machine-derived GitNexus state, and `.salvor/` owns only Salvor's canonical
approved record.

The three-category adoption map makes the safety boundary inspectable before
files change. It avoids both destructive replacement and the subtler failure
of duplicating equivalent instructions into competing canonical sources.

## Invariant

Existing repository knowledge and tool state are preserved by default. No
existing memory, rule, hub, spoke, adapter, hook, setting, skill, managed
section, or integration configuration may be copied, migrated, duplicated,
rebuilt, or overwritten unless the pre-write plan names the exact mutation and
the operator approves it. Setup-time and later on-demand knowledge adoption use
one section-level mapping protocol; every approved durable fact has one
canonical owner, and the original source remains untouched unless a separate
source mutation is explicitly approved.

## Coupling / blast radius

- `SETUP_PROMPT.md` preflight, pre-write plan, merge policy, integration setup,
  and final report
- Setup safety and consistency contracts
- `example-project/` update-mode behavior
- README, architecture, vendor-adapter documentation, FAQ, changelog, and
  GitHub Pages messaging (planned as a separately reviewed public-content phase)
- Core build/state metadata and Serena retrieval pointers

## Alternatives rejected

- **Always regenerate Salvor's preferred hub/rules.** Rejected because it can
  overwrite or fork mature project authority.
- **Automatically import Serena memories into `.salvor/`.** Rejected because
  Serena memories are retrieval aids, may contain personal/tool-specific
  material, and are not automatically equivalent to approved canonical
  engineering knowledge.
- **Prompt before merely using an existing responding integration.** Rejected
  as needless friction; read-only reuse changes no state.
- **Silently deduplicate or choose between conflicting rules.** Rejected because
  semantic equivalence and precedence can be project-specific and require an
  operator decision.
