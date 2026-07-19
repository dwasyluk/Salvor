# salvor Infrastructure

Operational reference for local work, deployment, environment variables, external tools, and observability.

## Local

- The repository is primarily Markdown and has no root package manager or test runner.
- `example-project/api` and `example-project/web` are separate TypeScript regression fixtures; inspect their package manifests before running fixture commands.
- Use the narrowest structural, link/path, diff, and Markdown checks appropriate to the change.

## Deployment

- No website implementation exists on `main` in the initial self-scaffold.
- GitHub Pages work remains in a separate checkout and is not deployed or merged by scaffold tasks.
- When approved site code reaches `main`, its pipeline must generate mapped copy from canonical repository sources and stop for design review when new page elements are required.

## Environment Variables and Build IDs

- `APP_NAME` — application name; defaults to `salvor`.
- `CORE_BUILD`, `WEB_BUILD`, `DOCS_BUILD` — derived from `VERSION.md`; never maintained as independent hardcoded versions.

## External Tools

- Serena MCP provides semantic and symbolic repository intelligence.
- GitNexus CLI/MCP provides the code knowledge graph, impact analysis, change detection, and generated routing context.
- Neither tool's core indexing features require an account or API key.

## Observability

- Use `git status`, `git diff`, and `git diff --check` for change state and integrity.
- Use `gitnexus status` for index freshness and symbol/relationship/flow counts.
- Verify long-running processes are alive before trusting their output.
