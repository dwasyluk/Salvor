# Suggested Commands

> Serena memories are retrieval aids, not canonical truth. See ../../RULES.md and ../../.salvor/active_state.md for canon.

Repo discovery: `rg --files`, `rg <pattern>`, `git status --short`, `git diff -- <file>`.

## Root (there IS a root package.json — name `salvor-site`, v1.0.0-beta, private, MIT)
- `npm ci` — install dependencies.
- `npm run test:unit` — node `--test` suite (contract + site-interactions + burn-field + setup-safety + ratification + final). See package.json `test:unit` for the current file list/count.
- `npm run test:contract` — narrower node `--test` contract subset (site-contract + setup-safety + ratification + final).
- `npm run test:browser` — Playwright browser tests.
- `npm test` — runs unit + browser.
- `npm run serve` — serve the `site/` directory locally (`python3 -m http.server 4173 -d site`).

Exact test file lists and totals: see the `scripts` block in the root `package.json` (source of truth), not a hardcoded number here.

## Example project
Commands live under `example-project/api` and `example-project/web`; inspect those package.json files. Strict-profile "Notebook" demo — see example-project/.serena/memories/suggested_commands.md.

For docs-only README/branding work, verification is Markdown review plus link/path sanity checks. For prompt/template changes, compare SETUP_PROMPT.md with rendered `example-project/` and sync the example if needed.
