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

// --- GitNexus: index-only primary (v1.6.9+), version-aware fallback --------
test("index-only is the documented primary default, with a version-aware fallback", () => {
  assert.match(setup, /--index-only/);
  assert.match(vendor, /--index-only/);
  // capability detection via CLI help
  assert.match(setup, /gitnexus analyze --help/);
  // --skip-agents-md remains documented as the legacy fallback
  assert.match(setup, /--skip-agents-md/);
  // any "config keys inert" claim must be scoped to a tested version, never blanket
  assert.doesNotMatch(flat("SETUP_PROMPT.md"), /config keys[^.]{0,30}are inert(?![^.]{0,40}1\.6\.3)/i);
});

test("skill paths are version-tolerant (no obsolete nested pattern) and gitignored", () => {
  assert.match(gitignore, /\.claude\/skills\/gitnexus\*/);
  assert.match(setup, /--skills/); // community skills opt-in
  assert.match(setup, /gitnexus-\*/); // documented shape
  // the obsolete nested layout must not be documented
  for (const doc of [setup, vendor]) assert.doesNotMatch(doc, /\.claude\/skills\/gitnexus\/gitnexus-\*/);
});

test("example project has no stale auto-generated GitNexus block", () => {
  const ex = read("example-project/CLAUDE.md");
  assert.doesNotMatch(ex, /gitnexus:start/);
  assert.doesNotMatch(ex, /161 symbols/); // the old hardcoded counts
  assert.match(ex, /--index-only/); // hand-authored routing note names the safe default
});

test("vendor adapters are routing aids, not co-owners", () => {
  for (const p of ["AGENTS.md", "GEMINI.md"]) {
    assert.match(flat(p), /retrieval and routing aids|routing\/retrieval aids|retrieval\/routing aids/i);
    assert.doesNotMatch(read(p), /Shared truth belongs in `CLAUDE\.md`, the spokes, `\.salvor\/`, and `\.serena\/memories\/` — including the GitNexus code-intelligence block/);
  }
});

test("hooks/MCP config are opt-in via gitnexus setup only", () => {
  assert.match(setup, /gitnexus setup/);
  assert.match(flat("SETUP_PROMPT.md"), /never run global `?gitnexus setup`?/i);
});

test("the verbatim skill-path caveat is present", () => {
  assert.match(setup, /GitNexus may generate agent-specific skills under tool-specific directories/);
  assert.match(setup, /can vary by GitNexus and coding-agent version/);
  assert.match(setup, /inspect the proposed changes before approving/i);
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
  assert.doesNotMatch(vendor, /VERSION\.md exists only under[^.]*minimal-history/i);
  assert.match(
    flat("docs/VENDOR_ADAPTERS.md"),
    /VERSION\.md.*optional Strict.*Q4=NO.*existing version source.*minimal project-history/i,
  );
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

// --- Final soft-launch ownership + optional-tool consistency ---------------
test("capture artifacts update their matching index and Domain Learning does not own decisions", () => {
  for (const p of ["SETUP_PROMPT.md", "RULES.md", "example-project/RULES.md"]) {
    const source = flat(p);
    assert.match(
      source,
      /TOC update:.*matching chronological index.*domain-learnings\/README\.md.*findings.*decisions\/README\.md.*design decisions/i,
      p,
    );
  }

  for (const p of [
    "SETUP_PROMPT.md",
    ".salvor/domain-learnings/README.md",
    "example-project/.salvor/domain-learnings/README.md",
  ]) {
    assert.doesNotMatch(read(p), /`ARCH` — architectural decision/i, p);
    assert.match(read(p), /`ARCH` — empirical architecture/i, p);
  }
});

test("the Strict example keeps Enhanced tools conditional on responding MCPs", () => {
  const exRules = flat("example-project/RULES.md");
  const exHub = flat("example-project/CLAUDE.md");
  const exDecisionTemplate = flat("example-project/.salvor/decisions/README.md");
  const exCommands = flat("example-project/.serena/memories/suggested_commands.md");

  assert.match(exRules, /Serena MCP.*when.*respond.*fall back/i);
  assert.match(exRules, /GitNexus MCP.*when.*respond.*unavailable/i);
  assert.match(exHub, /Only when GitNexus.*MCP tools.*respond/i);
  assert.match(exDecisionTemplate, /when the GitNexus MCP is active.*otherwise/i);
  assert.match(exCommands, /when its MCP tools respond.*otherwise/i);
});

test("the Strict example routes its runtime display name through configuration", () => {
  const server = read("example-project/api/src/server.ts");
  const webMain = read("example-project/web/src/main.ts");
  const webHtml = read("example-project/web/index.html");
  const exampleVersion = read("example-project/VERSION.md");

  assert.match(server, /const APP_NAME = process\.env\.APP_NAME \?\? "Notebook"/);
  assert.doesNotMatch(server, /`Notebook API listening/);
  assert.match(webHtml, /data-app-name="Notebook"/);
  assert.doesNotMatch(webHtml, /<title>Notebook<\/title>|<h1>Notebook<\/h1>/);
  assert.match(webMain, /dataset\.appName/);
  assert.match(webMain, /document\.title = APP_NAME/);
  assert.match(exampleVersion, /"api"\s*:\s*2/);
  assert.match(exampleVersion, /"web"\s*:\s*2/);
  assert.match(exampleVersion, /API:02 \| WEB:02/);
  assert.match(read("example-project/.salvor/active_state.md"), /API:02 WEB:02/);
  assert.match(read("example-project/README.md"), /API:02 \| WEB:02/);
});

test("vendor-portability copy does not overclaim universal automatic loading", () => {
  for (const p of [
    "SETUP_PROMPT.md",
    ".salvor/README.md",
    "example-project/.salvor/README.md",
    "docs/ARCHITECTURE.md",
    "docs/FAQ.md",
    "docs/VENDOR_ADAPTERS.md",
  ]) {
    assert.doesNotMatch(read(p), /every contributor's (?:coding )?agent reads|every teammate's agent reads/i, p);
  }
  assert.doesNotMatch(vendor, /Any teammate's CLI works out of the box|no vendor choice/i);
});
