import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (file) => readFile(file, "utf8");

const salvorReleaseFiles = [
  "VERSION.md",
  "package.json",
  "package-lock.json",
  "README.md",
  "CHANGELOG.md",
  "CLAUDE.md",
  "site/CLAUDE.md",
  "site/index.html",
  "scripts/audit-release.mjs",
  "scripts/generate-brand-assets.mjs",
  "assets/brand/BRAND_ASSETS.md",
  ".salvor/active_state.md",
  ".salvor/active_state_verbose.md",
  ".salvor/INFRA.md",
  ".serena/memories/project_overview.md",
  ".serena/memories/suggested_commands.md",
  ".serena/memories/task_completion.md",
];

test("every Salvor-owned release surface identifies v1.0.0-beta", async () => {
  const entries = await Promise.all(salvorReleaseFiles.map(async (file) => [
    file,
    await read(file),
  ]));
  for (const [file, source] of entries) {
    assert.doesNotMatch(
      source,
      /(?<![-.\d])v?1\.0\.0(?!-(?:beta|[A-Za-z])|\.\d)/,
      `${file} retains a non-beta final-release identity`,
    );
  }
  assert.match(await read("VERSION.md"), /"version"\s*:\s*"1\.0\.0-beta"/);
  assert.match(await read("package.json"), /"version"\s*:\s*"1\.0\.0-beta"/);
  assert.match(await read("site/index.html"), /SALVOR v1\.0\.0-beta/);
});

test("scaffold, example, tooling, and future-plugin versions are preserved", async () => {
  assert.match(await read("SETUP_PROMPT.md"), /"version":"0\.1\.0"/);
  assert.match(await read("example-project/VERSION.md"), /v0\.1\.0/);
  assert.match(await read("CLAUDE.md"), /v1\.6\.9/);
  assert.match(await read("site/index.html"), /v1\.1\.0/);
});

test("Domain Learning is the only live taxonomy", async () => {
  const files = [
    "RULES.md",
    "SETUP_PROMPT.md",
    "README.md",
    ".salvor/README.md",
    ".salvor/active_state.md",
    "example-project/RULES.md",
  ];
  for (const file of files) {
    const source = await read(file);
    assert.doesNotMatch(source, /domain[-_ ]tuning/i, file);
    assert.match(source, /domain[- ]learning/i, file);
  }
});

test(".salvor ownership index keeps decisions and Domain Learnings separate", async () => {
  const index = await read(".salvor/README.md");
  assert.match(index, /\| `decisions\/` \|[^|]*design decisions/i);
  assert.match(index, /\| `domain-learnings\/` \|[^|]*empirical discoveries/i);
  assert.doesNotMatch(index, /domain-learnings\/` \|[^|]*decision and learning/i);
});
