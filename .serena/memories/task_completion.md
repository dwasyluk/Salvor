# Task Completion

Before completing repo work, run the narrowest relevant verification. For docs-only naming/README work: review rendered Markdown mentally or with available markdown tooling, check links/paths touched, and inspect `git diff`.

For SETUP_PROMPT.md behavior changes: update/sync example-project/ and update CHANGELOG for user-visible changes.

Never overwrite unrelated user changes. Use `git status --short` and inspect diffs for touched files before final response.

For every canonical source-of-truth sync into the ghpage, run Playwright directly against the rendered site at desktop, tablet, Galaxy-S25-Edge-like small-phone, and 320px narrow viewports. Confirm the hero and body copy remain readable, local assets load, and there is no horizontal overflow; never assume responsive health from code or CSS inspection alone.
