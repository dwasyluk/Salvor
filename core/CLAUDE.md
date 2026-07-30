# core — universal Salvor setup protocol

Markdown prompt protocol implemented by root `SETUP_PROMPT.md`. It scaffolds a
vendor-agnostic, repository-owned brain and makes it vendor-portable through
thin CLI-specific entrypoints.

## Key Files
- `../SETUP_PROMPT.md` — canonical one-shot installer and scaffold templates
- `../example-project/` — rendered regression fixture for prompt behavior
- `../CHANGELOG.md` — user-visible protocol history

## Architecture Notes
- Keep the installer vendor-agnostic and vendor-portable; thin adapter glue must
  never fork or take ownership of the shared brain.
- Scope questions are user-gated. Never invent components, stacks, or parity paths.
- Existing repositories use preservation-first adoption: reuse existing
  Serena/GitNexus state, hubs, spokes, rules, adapters, and vendor
  infrastructure; every exact mutation or conflict is planned and approved.
- A prompt behavior change must be reflected in `example-project/` and user-facing documentation.

## Validation
- Compare template requirements with `example-project/` after protocol changes.
- Scan for unresolved template tokens and verify all vendor adapters point to the same canonical core.

## Build
- No compilation. `VERSION.md` key: `CORE`; current build `CORE:13`; derived constant: `CORE_BUILD`.

Use Serena for repository structure, `.salvor/DOMAIN_REF.md` for product truth, and `.salvor/INFRA.md` for operational details.
