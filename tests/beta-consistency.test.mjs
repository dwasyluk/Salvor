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

const currentReleaseProseFiles = [
  ".salvor/DOMAIN_REF.md",
  ".salvor/INFRA.md",
  ".salvor/active_state.md",
  ".salvor/active_state_verbose.md",
  ".serena/memories/project_overview.md",
  ".serena/memories/task_completion.md",
  "CHANGELOG.md",
  "CLAUDE.md",
  "CONTRIBUTING.md",
  "GEMINI.md",
  "README.md",
  "SECURITY.md",
  "SETUP_PROMPT.md",
  "VERSION.md",
  "docs/FAQ.md",
  "docs/VENDOR_ADAPTERS.md",
  "example-project/.salvor/active_state_verbose.md",
  "example-project/CLAUDE.md",
  "example-project/README.md",
  "example-project/VERSION.md",
  "site/CLAUDE.md",
  "site/index.html",
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

test("enhanced is lowercase throughout current release prose", async () => {
  for (const file of currentReleaseProseFiles) {
    assert.doesNotMatch(await read(file), /\bEnhanced\b/, file);
  }
});

test(".salvor ownership index keeps decisions and Domain Learnings separate", async () => {
  const index = await read(".salvor/README.md");
  assert.match(index, /\| `decisions\/` \|[^|]*design decisions/i);
  assert.match(index, /\| `domain-learnings\/` \|[^|]*empirical discoveries/i);
  assert.doesNotMatch(index, /domain-learnings\/` \|[^|]*decision and learning/i);
});

test("agent-routing and example surfaces keep Serena memories as retrieval aids", async () => {
  const surfaces = [
    "SETUP_PROMPT.md",
    "docs/VENDOR_ADAPTERS.md",
    "example-project/README.md",
    "example-project/CLAUDE.md",
    "example-project/RULES.md",
  ];
  for (const file of surfaces) {
    const source = await read(file);
    assert.doesNotMatch(source, /committed shared-brain notes/i, file);
    assert.doesNotMatch(source, /shared truth[^.\n]*\.serena\/memories|\.serena\/memories[^.\n]*shared truth/i, file);
  }
  assert.match((await read("example-project/README.md")).replace(/\s+/g, " "), /\.serena\/memories\/[^.]*retrieval aid/i);
  assert.match(await read("example-project/CLAUDE.md"), /^\| `\.serena\/memories\/` \| enhanced-mode retrieval/im);
  assert.doesNotMatch(await read("example-project/RULES.md"), /GitNexus[^.\n]*index blocks/i);
});

test("soft-launch component build IDs are synchronized across current state and spokes", async () => {
  const version = await read("VERSION.md");
  assert.match(version, /"core"\s*:\s*12/);
  assert.match(version, /"ghpage"\s*:\s*15/);
  assert.match(version, /"docs"\s*:\s*16/);
  assert.match(version, /CORE:12 \| GHPAGE:15 \| DOCS:16/);

  const currentSurfaces = [
    [".salvor/active_state.md", /CORE:12 GHPAGE:15 DOCS:16/],
    ["core/CLAUDE.md", /current build `CORE:12`/],
    ["site/CLAUDE.md", /current build `GHPAGE:15`/],
    ["docs/CLAUDE.md", /current build `DOCS:16`/],
  ];
  for (const [file, expected] of currentSurfaces) {
    assert.match(await read(file), expected, file);
  }
});

test("canonical-logo work ships in the beta changelog instead of Unreleased", async () => {
  const changelog = await read("CHANGELOG.md");
  assert.match(changelog, /## \[Unreleased\]\s+## \[1\.0\.0-beta\] — 2026-07-27/);
  const betaEntry = changelog.split("## [1.0.0-beta]")[1];
  assert.match(betaEntry, /operator-authored\s+`LOGO\.svg` regular master and `LOGO-SM\.svg` favicon master/);
  assert.match(betaEntry, /system-theme-aware canonical SM SVG favicon/);
});
