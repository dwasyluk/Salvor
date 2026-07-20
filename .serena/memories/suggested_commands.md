# Suggested Commands

> Serena memories are retrieval aids, not the canonical brain. See ../../RULES.md and ../../.salvor/active_state.md for canon.

Repo discovery: `rg --files`, `rg <pattern>`, `git status --short`, `git diff -- <file>`.

## Root (there IS a root package.json — name `salvor-site`, v1.0.0, private, MIT)
- `npm ci` — install dependencies.
- `npm run test:unit` — node `--test` suite: site-contract, site-interactions, burn-field, setup-safety, ratification (40 tests).
- `npm run test:browser` — Playwright Chromium browser tests (9 tests).
- `npm test` — runs unit + browser.
- `npm run serve` — serve the `site/` directory locally (`python3 -m http.server 4173 -d site`).

## Example project
Commands live under `example-project/api` and `example-project/web`; inspect those package.json files. Strict-profile "Notebook" demo — see example-project/.serena/memories/suggested_commands.md.

For docs-only README/branding work, verification is Markdown review plus link/path sanity checks. For prompt/template changes, compare SETUP_PROMPT.md with rendered `example-project/` and sync the example if needed.
