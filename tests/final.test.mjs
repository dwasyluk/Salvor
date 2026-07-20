// Final launch-corrections contract tests — lock the GitNexus flag-based
// index-only reality, Serena-memory freshness, ownership, Cline framing,
// topology, Core-vs-Strict, and section-count so they cannot regress.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const flat = (p) => read(p).replace(/\s+/g, " ");

const setup = read("SETUP_PROMPT.md");
const vendor = read("docs/VENDOR_ADAPTERS.md");
const rules = read("RULES.md");
const exampleRules = read("example-project/RULES.md");
const readme = read("README.md");
const faq = read("docs/FAQ.md");
const gitignore = read(".gitignore");
const ci = read(".github/workflows/ci.yml");

// --- GitNexus: verified flag-based index-only, not the inert config key ----
test("index-only default is the --skip-agents-md flag, not an indexOnly config claim", () => {
  assert.match(setup, /--skip-agents-md/);
  assert.match(vendor, /--skip-agents-md/);
  // no current-state doc may present {"indexOnly": true} as the working default
  assert.doesNotMatch(flat("SETUP_PROMPT.md"), /default[^.]{0,40}"indexOnly"\s*:\s*true/i);
});

test("generated skills are gitignored and community skills are opt-in", () => {
  assert.match(gitignore, /\.claude\/skills\/gitnexus\*/);
  assert.match(setup, /--skills/); // documented as opt-in
  assert.match(setup, /gitnexus-\*/); // skill-path shape documented
});

test("hooks/MCP config are opt-in via gitnexus setup only", () => {
  assert.match(setup, /gitnexus setup/);
  assert.match(flat("SETUP_PROMPT.md"), /never run global `?gitnexus setup`?/i);
});

test("the verbatim skill-path caveat is present", () => {
  assert.match(setup, /GitNexus may generate agent-specific skills under tool-specific directories/);
  assert.match(setup, /Paths and available integrations can vary/);
  assert.match(setup, /inspect the proposed changes before approving them/);
});

// --- Canonical ownership in the generated template ------------------------
test("SETUP_PROMPT uses the one-owner model, not blanket co-canonical", () => {
  assert.match(flat("SETUP_PROMPT.md"), /does not mean co-canonical/i);
  assert.doesNotMatch(setup, /Shared, canonical, git-tracked \(the team brain\): everything in-repo/i);
});

// --- RULES §0–§9 (dogfood aligned to the template) ------------------------
test("root and example RULES reach §9 (security & git-safe operation)", () => {
  assert.match(rules, /^## 9\. /m);
  assert.match(exampleRules, /^## 9\. /m);
  assert.doesNotMatch(read("example-project/README.md"), /§0[–-]§8/);
});

// --- Cline Memory Bank comparison ----------------------------------------
test("Cline Memory Bank is described as cross-tool, not extension-bound", () => {
  assert.match(flat("docs/FAQ.md"), /can be used across AI tools|usable across AI tools/i);
  assert.doesNotMatch(faq, /Memory Bank[^.]*only (works|usable)[^.]*extension/i);
});

// --- Session claim calibration -------------------------------------------
test("the categorical session-memory claim is calibrated", () => {
  assert.match(flat("README.md"), /Fresh sessions often lack a reviewed, team-shared record/);
  assert.doesNotMatch(flat("README.md"), /Every session starts without your project's accumulated reasoning/);
});

// --- Core vs Strict --------------------------------------------------------
test("per-component versioning is Strict/optional, not a Core requirement", () => {
  assert.match(readme, /[Oo]ptional per-component versioning/);
});

// --- Topology: no retired ghpages CI trigger or stale current-state wording -
test("CI no longer triggers on the retired ghpages branch", () => {
  assert.doesNotMatch(ci, /ghpages/);
});

test("no stale 'the ghpage' / ghpages branch current-state wording in key docs", () => {
  for (const p of ["docs/CLAUDE.md", "site/CLAUDE.md", ".salvor/INFRA.md"]) {
    assert.doesNotMatch(read(p), /ghpages\/v1\.0\.0/, `${p} references retired ghpages branch`);
    assert.doesNotMatch(read(p), /\bthe ghpage\b/i, `${p} uses stale "the ghpage" wording`);
  }
});

// --- Serena memories refreshed -------------------------------------------
test("root Serena memory reflects the real repo (root package.json + npm scripts)", () => {
  const cmds = read(".serena/memories/suggested_commands.md");
  assert.doesNotMatch(cmds, /no root package\.json/i);
  assert.match(cmds, /npm run test:unit|npm ci|npm test/);
});

test("example Serena memory reflects §0–§9 and .salvor paths", () => {
  const cs = read("example-project/.serena/memories/codebase_structure.md");
  assert.match(cs, /§0[–-]§9/);
  assert.doesNotMatch(cs, /§0[–-]§8/);
});
