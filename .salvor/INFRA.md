# salvor Infrastructure

Operational reference for local work, deployment, environment variables, external tools, and observability.

## Local

- The canonical repository is primarily Markdown; this branch also has a root Node test harness for the ghpage.
- Run `npm test` for site contracts/interactions and `npm run test:browser` for direct Playwright rendering.
- `example-project/api` and `example-project/web` are separate TypeScript regression fixtures; inspect their package manifests before running fixture commands.
- Use the narrowest structural, link/path, diff, and Markdown checks appropriate to the change.

## Deployment

- The deployable static site is `site/` on `main`. `.github/workflows/pages.yml` deploys `site/` from `main` via GitHub Actions (source = GitHub Actions); pushing/deploying remain operator-controlled.
- A source-of-truth sync must stop for design review when new page elements are required and must run Playwright directly at desktop, tablet, Galaxy-S25-Edge-like small-phone, and 320px narrow viewports before completion.

## Environment Variables and Build IDs

- `APP_NAME` — application name; defaults to `salvor`.
- `CORE_BUILD`, `GHPAGE_BUILD`, `DOCS_BUILD` — derived from `VERSION.md`; never maintained as independent hardcoded versions.

## External Tools

- Serena MCP provides semantic and symbolic repository intelligence.
- GitNexus CLI/MCP provides the code knowledge graph, impact analysis, change detection, and generated routing context.
- Neither tool's core indexing features require an account or API key.

## Observability

- Use `git status`, `git diff`, and `git diff --check` for change state and integrity.
- Use `gitnexus status` for index freshness and symbol/relationship/flow counts.
- Treat direct Playwright results—not CSS inspection—as the responsive-health evidence for every `site/` source-of-truth sync before deploy-from-main; include desktop, tablet, small-phone, and 320px narrow consumers.
- Verify long-running processes are alive before trusting their output.
