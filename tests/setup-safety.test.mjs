// Contract tests: installer safety + capture-taxonomy consistency (launch gate).
// These fail if SETUP_PROMPT.md or README.md regress on Git-safe setup behavior,
// silent-overwrite protections, or the canonical capture-class prompts.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const setup = readFileSync(join(root, "SETUP_PROMPT.md"), "utf8");
const normalizedSetup = setup.replace(/\s+/g, " ");
const readme = readFileSync(join(root, "README.md"), "utf8");
const exampleReadme = readFileSync(join(root, "example-project/README.md"), "utf8");

// --- Git safety -----------------------------------------------------------
test("setup prompt never blanket-stages files", () => {
  assert.doesNotMatch(setup, /git add -A/, "SETUP_PROMPT.md must not contain `git add -A`");
  assert.doesNotMatch(setup, /git add \.(\s|$)/m, "SETUP_PROMPT.md must not contain bare `git add .`");
});

test("setup prompt never uses destructive git commands", () => {
  assert.doesNotMatch(setup, /git reset --hard/);
  assert.doesNotMatch(setup, /git clean -fd/);
  assert.doesNotMatch(setup, /git checkout -- \./);
});

test("commit is offered, reviewed, and optional — never unconditional", () => {
  assert.match(
    setup,
    /Would you like me to stage only the Salvor-related[\s>]+files/,
    "the verbatim commit offer must be present"
  );
  assert.match(setup, /git diff --cached/, "staged diff must be shown before any commit");
});

// --- Existing-repository preflight ---------------------------------------
test("preflight inspects the existing repository before writing", () => {
  assert.match(setup, /git status --short/, "preflight must check working-tree state");
  for (const marker of [".specify/", "CLAUDE.local.md", ".gitnexusrc", "AGENTS.md", "GEMINI.md"]) {
    assert.ok(setup.includes(marker), `preflight detection list must include ${marker}`);
  }
});

test("no silent overwrites; managed sections are delimited", () => {
  assert.match(setup, /[Nn]ever overwrite/, "explicit never-overwrite rule required");
  assert.match(setup, /salvor:start/, "salvor-managed sections must be delimited");
});

test("re-running setup is treated as update, not reinstall", () => {
  assert.match(setup, /`\.salvor\/` already exists, this is an update, not an install/i);
  assert.match(setup, /(repair|update|migrat)/i);
});

test("existing Serena state is reused without reinitialization or automatic memory migration", () => {
  assert.match(
    normalizedSetup,
    /If `\.serena\/` already exists[\s\S]*reuse (?:that|the existing) project state/i,
    "setup must reuse the existing Serena project"
  );
  assert.match(
    normalizedSetup,
    /do not (?:re-?run|run) `serena init`/i,
    "setup must not reinitialize an existing Serena project"
  );
  assert.match(
    normalizedSetup,
    /never (?:copy|migrate|import)[^.\n]*Serena memor(?:y|ies)[^.\n]*into `\.salvor\/`/i,
    "setup must not automatically promote Serena memories into canonical Salvor memory"
  );
  assert.match(
    normalizedSetup,
    /each proposed `\.serena\/memories\/`[^.\n]*file[^.\n]*pre-write plan[^.\n]*approval/i,
    "every proposed Serena-memory change must be individually planned and approved"
  );
  assert.match(
    normalizedSetup,
    /case variant[^.\n]*`\.Serena\/`[^.\n]*collision/i,
    "case-variant Serena directories must stop setup instead of creating a second tree"
  );
});

test("existing GitNexus state is reused and only stale indexes trigger a refresh choice", () => {
  assert.match(
    normalizedSetup,
    /If GitNexus is already present[\s\S]*reuse (?:its|the existing) CLI, configuration, and index/i,
    "setup must reuse the existing GitNexus installation"
  );
  assert.match(
    normalizedSetup,
    /fresh index[^.\n]*no migration[^.\n]*no rebuild/i,
    "a fresh existing index must remain untouched"
  );
  assert.match(
    normalizedSetup,
    /stale index[^.\n]*explicit refresh choice/i,
    "a stale index must trigger an explicit refresh choice"
  );
  assert.match(
    normalizedSetup,
    /preserve any unrelated existing `\.gitnexusrc` keys[^.\n]*never replace the file/i,
    "existing GitNexus configuration must be merged, not replaced"
  );
});

test("existing agent architecture is adopted in place instead of duplicated", () => {
  assert.match(normalizedSetup, /adoption map/i, "setup must produce an adoption map");
  for (const category of [
    "reuse unchanged",
    "add Salvor-managed section",
    "conflict — operator decision required",
  ]) {
    assert.ok(setup.includes(category), `adoption map must include: ${category}`);
  }
  assert.match(
    normalizedSetup,
    /existing `CLAUDE\.md`[^.\n]*(?:remains|stays)[^.\n]*canonical hub/i,
    "an existing hub must remain the hub"
  );
  assert.match(
    normalizedSetup,
    /existing component spokes[^.\n]*(?:discover|map|reuse)[^.\n]*never create competing/i,
    "existing spokes must be reused rather than duplicated"
  );
  assert.match(
    normalizedSetup,
    /equivalent existing rules[^.\n]*reuse[^.\n]*not duplicate/i,
    "equivalent rules must not be duplicated"
  );
  assert.match(
    normalizedSetup,
    /conflicting rules[^.\n]*side by side[^.\n]*operator decision/i,
    "rule conflicts must be shown explicitly instead of silently resolved"
  );
  assert.match(
    normalizedSetup,
    /existing `\.claude\/`[^.\n]*`CLAUDE\.local\.md`[^.\n]*(?:hooks|settings|agents|skills)[^.\n]*unchanged[^.\n]*exact mutation[^.\n]*approval/i,
    "existing Claude infrastructure must remain unchanged unless an exact mutation is approved"
  );
});

test("the worked example explains update-mode preservation", () => {
  const normalizedExample = exampleReadme.replace(/\s+/g, " ");
  assert.match(
    normalizedExample,
    /running setup again.{0,220}reuse.{0,120}`\.serena\/`.{0,120}hub.{0,120}spokes.{0,120}`RULES\.md`/i,
    "the regression fixture must explain which existing project structures setup reuses"
  );
  assert.match(
    normalizedExample,
    /does not.{0,80}migrate.{0,80}Serena memories.{0,120}does not.{0,80}duplicate.{0,80}rules/i,
    "the regression fixture must state the memory and rule-preservation boundary"
  );
});

// --- Core vs enhanced mode ------------------------------------------------
test("setup works without MCP tools (Core mode)", () => {
  assert.match(setup, /Core mode/i);
  assert.match(setup, /enhanced/);
});

// --- GitNexus ownership ----------------------------------------------------
test("gitnexus ownership contract is documented", () => {
  assert.match(setup, /--index-only/, "the pure-index default must be documented");
  assert.match(setup, /--skip-agents-md/, "the legacy fallback must remain documented");
});

// --- Capture taxonomy: canonical prompts, byte-identical everywhere -------
const PROMPTS = [
  "Record this as a design decision? (yes/no)",
  "Save this as a domain learning? (yes/no)",
  "Log this to .salvor/DEFERRED_TODOS.md? (yes/no)",
];

test("canonical capture prompts appear verbatim in SETUP_PROMPT.md", () => {
  for (const p of PROMPTS) assert.ok(setup.includes(p), `missing prompt: ${p}`);
});

test("canonical capture prompts appear verbatim in README.md", () => {
  for (const p of PROMPTS) assert.ok(readme.includes(p), `missing prompt: ${p}`);
});

test("capture classes are named consistently", () => {
  for (const doc of [setup, readme]) {
    assert.match(doc, /Domain Learning/);
    assert.match(doc, /Learned Failure/);
    assert.match(doc, /Deferred Finding/);
  }
});

// --- Terminology hygiene ---------------------------------------------------
test("retired terminology is absent", () => {
  for (const doc of [setup, readme]) {
    assert.doesNotMatch(doc, /[Dd]ementia/);
    assert.doesNotMatch(doc, /domain[- ]tuning/i);
  }
});

test("no stale Serena install command", () => {
  assert.doesNotMatch(setup, /uvx --from git\+/);
  assert.doesNotMatch(readme, /uvx --from git\+/);
});
