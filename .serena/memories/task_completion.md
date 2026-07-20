# Task Completion

> Serena memories are retrieval aids, not the canonical brain. Canon: ../../RULES.md, ../../.salvor/active_state.md.

Before completing repo work, run the narrowest relevant verification. For docs-only naming/README work: review rendered Markdown, check links/paths touched, and inspect `git diff`.

For SETUP_PROMPT.md behavior changes: update/sync `example-project/` (the regression fixture for prompt drift).

Never overwrite unrelated user changes. Use `git status --short` and inspect diffs for touched files before final response.

## Release validation workflow (v1.0.0)
- Run the test suite: `npm run test:unit` (contract + interactions + burn-field + setup-safety + ratification) and `npm run test:browser` (Playwright), or `npm test` for both.
- `git diff --check` for whitespace/conflict-marker hygiene.
- Regenerate the release package when packaging changes.

## Site responsive check
The site lives in `site/` on `main` and deploys from `main` via `.github/workflows/pages.yml` (GitHub Actions) — there is no separate presentation-mirror branch. When the site changes, run Playwright directly against the rendered `site/` at desktop, tablet, small-phone (Galaxy-S25-Edge-like), and 320px narrow viewports. Confirm the hero and body copy stay readable, local assets load, and there is no horizontal overflow; never assume responsive health from CSS inspection alone.
