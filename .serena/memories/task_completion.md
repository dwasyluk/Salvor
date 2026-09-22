# Task Completion

> Serena memories are retrieval aids, not canonical truth. Canon: ../../RULES.md, ../../.salvor/active_state.md.

Before completing repo work, run the narrowest relevant verification. For docs-only naming/README work: review rendered Markdown, check links/paths touched, and inspect `git diff`.

For SETUP_PROMPT.md behavior changes: update/sync `example-project/` (the regression fixture for prompt drift).

Never overwrite unrelated user changes. Use `git status --short` and inspect diffs for touched files before final response.

## Commit signing preference
- For this Salvor workspace, if the configured Secretive SSH signing agent
  refuses the commit operation, retry that local commit with
  `git commit --no-gpg-sign`; do not change repository or global Git signing
  configuration.

## Release validation workflow (v1.0.0-beta)
- Run the test suite: `npm run test:unit` (beta-consistency + site-contract + interactions + burn-field + setup-safety + ratification + final + release-gate + consistency + reconcile-contract + agentic-contract + upgrade-contract) and `npm run test:browser` (Playwright), or `npm test` for both. Exact file list per the root `package.json` scripts.
- `git diff --check` for whitespace/conflict-marker hygiene.
- Regenerate the release package when packaging changes.
- enhanced-mode work touching GitNexus: keep the safe default `gitnexus analyze --index-only` (v1.6.9+; `.gitnexusrc {"indexOnly": true}`), `--skip-agents-md` on older CLIs — index-only, no context/skill/hook writes into Salvor-owned entrypoints.

## Site responsive check
The site lives in `site/` on `main` and deploys from `main` via `.github/workflows/pages.yml` (GitHub Actions) — there is no separate presentation-mirror branch. When the site changes, run Playwright directly against the rendered `site/` at desktop, tablet, small-phone (Galaxy-S25-Edge-like), and 320px narrow viewports. Confirm the hero and body copy stay readable, local assets load, and there is no horizontal overflow; never assume responsive health from CSS inspection alone.

For visual alignment, follow `LF:rendered-pixel-alignment` in `.salvor/DOMAIN_REF.md`: DOM/CSS boxes may delimit screenshot regions but are not the oracle. Gate review on DPR-aware rendered-ink measurements with signed first-line title/label and visible SVG/title deltas ≤1 CSS px across all six release viewports.
