# Style And Conventions

> Serena memories are retrieval aids, not canonical truth. Canon: ../../RULES.md, ../../docs/ARCHITECTURE.md.

This repo is mostly Markdown and prompt text. Writing style is concise, developer-facing, and metaphor-friendly but practical. README uses short sections, badges, feature bullets, and explicit install snippets. Keep templates generic/anonymized and avoid project/company-specific assumptions.

Contributing rule: if SETUP_PROMPT.md changes, re-render/sync example-project/ because it is the regression test for prompt drift. User-visible behavior should update README/docs and CHANGELOG.

Example code under example-project is TypeScript with separate api and web packages, each with package.json/tsconfig.
