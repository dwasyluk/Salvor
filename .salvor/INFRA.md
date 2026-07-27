# salvor Infrastructure

Operational reference for local work, deployment, environment variables, external tools, and observability.

## Local

- The canonical repository is primarily Markdown; this branch also has a root Node test harness for the site.
- Run `npm test` for site contracts/interactions and `npm run test:browser` for direct Playwright rendering.
- Run `npm run brand:build` to regenerate the canonical regular/small authored-SVG asset families, `npm run brand:check` for byte-level drift detection, and `npm run brand:audit` for a visual contact sheet under `/tmp/salvor-v1.0.0-beta-brand-audit/`.
- `example-project/api` and `example-project/web` are separate TypeScript regression fixtures; inspect their package manifests before running fixture commands.
- Use the narrowest structural, link/path, diff, and Markdown checks appropriate to the change.

## Deployment

- The deployable static site is `site/` on `main`. `.github/workflows/pages.yml` deploys `site/` from `main` via GitHub Actions (source = GitHub Actions); pushing/deploying remain operator-controlled.
- A source-of-truth sync must stop for design review when new page elements are required and must run Playwright directly at desktop, tablet, Galaxy-S25-Edge-like small-phone, and 320px narrow viewports before completion. Verify the six-card process grid resolves to 3/2/1 columns and the hero retains mouse/touch burn input, selection-state behavior, and interactive controls.
- Brand outputs are owned by immutable `assets/brand/reference/LOGO.svg` and `LOGO-SM.svg` masters plus `scripts/generate-brand-assets.mjs`; generated SVG/PNG files are checked in, while audit evidence stays outside the release tree. Logo-only changes must leave tracked hero background images byte-identical.

## Environment Variables and Build IDs

- `APP_NAME` — application name; defaults to `salvor`.
- `CORE_BUILD`, `GHPAGE_BUILD`, `DOCS_BUILD` — derived from `VERSION.md`; never maintained as independent hardcoded versions.

## External Tools

- Serena MCP provides semantic and symbolic repository intelligence.
- GitNexus CLI/MCP provides the code knowledge graph, impact analysis, and change detection; pure index mode does not inject routing context, skills, or hooks.
- Both Enhanced integrations are optional but highly recommended for the best code-grounded results. Neither tool's documented core indexing workflow requires an account or API key.

## Observability

- Use `git status`, `git diff`, and `git diff --check` for change state and integrity.
- Use `gitnexus status` for index freshness and symbol/relationship/flow counts.
- Treat direct Playwright results—not CSS inspection—as the responsive-health evidence for every `site/` source-of-truth sync before deploy-from-main; include desktop, tablet, small-phone, and 320px narrow consumers.
- Verify long-running processes are alive before trusting their output.
