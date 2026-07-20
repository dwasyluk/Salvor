// Ratification contract tests — lock in the independent-review corrections so
// they cannot silently regress before or after the v1.0.0 soft launch.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const readme = read("README.md");
const setup = read("SETUP_PROMPT.md");
const version = read("VERSION.md");
const pkg = read("package.json");
const rules = read("RULES.md");
const exampleRules = read("example-project/RULES.md");
const vendor = read("docs/VENDOR_ADAPTERS.md");
const faq = read("docs/FAQ.md");
const pages = read(".github/workflows/pages.yml");
const gemini = read("GEMINI.md");
const security = read("SECURITY.md");

// --- Item 1: Pages topology deploys site/ from main -----------------------
test("Pages workflow deploys site/ from main, not a separate branch", () => {
  assert.match(pages, /branches:\s*\["main"\]/);
  assert.match(pages, /path:\s*\.\/site/);
  assert.doesNotMatch(pages, /ghpages\/v1\.0\.0/);
});

test("no current-state doc claims the site lives only on a ghpages branch", () => {
  for (const [name, doc] of [["README", readme], ["VENDOR_ADAPTERS", vendor], ["RULES", rules]]) {
    assert.doesNotMatch(doc, /ghpages\/v1\.0\.0/, `${name} still references a ghpages branch`);
    assert.doesNotMatch(doc, /does not deploy the site/, `${name} still says main does not deploy`);
  }
});

// --- Item 2: GitNexus licensing / Enhanced-mode "optional" not "free" ------
test("GitNexus is described as third-party PolyForm Noncommercial, never MIT/free", () => {
  for (const [name, doc] of [["README", readme], ["VENDOR_ADAPTERS", vendor], ["FAQ", faq]]) {
    assert.match(doc, /PolyForm\s+Noncommercial/, `${name} must state GitNexus's real license`);
  }
  assert.doesNotMatch(readme, /[Tt]wo free,? local tools/);
  // GitNexus must never be called MIT or unrestricted for commercial use
  assert.doesNotMatch(vendor, /GitNexus[^.\n]*\bMIT\b/);
});

// --- Item 3: GitNexus skipContextFiles ownership --------------------------
test("repo carries a skipContextFiles .gitnexusrc and setup documents it", () => {
  assert.ok(existsSync(join(root, ".gitnexusrc")), ".gitnexusrc must exist");
  const rc = JSON.parse(read(".gitnexusrc"));
  assert.equal(rc.skipContextFiles, true);
  assert.match(setup, /skipContextFiles/);
  // the brittle write-then-strip default must be gone from setup
  assert.doesNotMatch(setup, /strip (it|the .*block) back out of `?AGENTS\.md`?/i);
});

// --- Item 4: Gemini CLI / Antigravity wording -----------------------------
test("Google adapter reflects the Gemini CLI / Antigravity transition", () => {
  assert.match(gemini, /Antigravity/);
  assert.match(readme, /Antigravity/);
  assert.match(vendor, /Antigravity/);
  assert.match(setup, /Antigravity/);
});

// --- Item 6: one-owner canonical model in root + example rules -------------
test("root and example rules use one-owner model, not blanket co-canonical", () => {
  for (const [name, doc] of [["RULES", rules], ["example RULES", exampleRules]]) {
    assert.match(doc, /does not mean co-canonical/i, `${name} must state the one-owner model`);
    assert.doesNotMatch(doc, /everything in-repo\b(?![^\n]*link or summarize)/i, `${name} blanket co-canonical`);
  }
});

// --- Item 7: four setup questions + Core-vs-Strict -------------------------
test("setup enumerates four questions including the Strict-defaults choice", () => {
  assert.match(setup, /four setup questions/i);
  assert.match(setup, /[Ss]trict/);
  // per-component versioning must not be sold as a plain Core capability
  assert.match(readme, /[Oo]ptional per-component versioning/);
});

// --- Item 8: root release version is 1.0.0 ---------------------------------
test("root Salvor release metadata is v1.0.0 (template + example stay 0.1.0)", () => {
  assert.match(version, /"version"\s*:\s*"1\.0\.0"/);
  assert.match(version, /Project Version:\*\*\s*v1\.0\.0/);
  assert.match(pkg, /"version":\s*"1\.0\.0"/);
  // the scaffolded-template + example projects legitimately stay at 0.1.0
  assert.match(read("example-project/VERSION.md"), /v0\.1\.0/);
});

// --- Item 9: replacement tagline ------------------------------------------
test("the performance-style tagline is replaced everywhere it renders", () => {
  const surfaces = [
    "README.md",
    "site/index.html",
    "site/assets/salvor-loop.svg",
    "site/assets/salvor-loop-with.svg",
    "assets/salvor-loop.svg",
  ];
  for (const s of surfaces) {
    assert.doesNotMatch(read(s), /Every request makes the next one smarter/, `${s} keeps the old tagline`);
  }
  assert.match(readme, /Every approved capture gives the next session more context/);
  assert.match(read("site/index.html"), /Every approved capture gives the next session more context/);
});

// --- Item 10: Salvor Core security scoping --------------------------------
test("security wording is scoped to Salvor Core, not the whole toolchain", () => {
  const secFlat = security.replace(/\s+/g, " ");
  assert.match(secFlat, /Salvor Core itself introduces no hosted service, account, or telemetry/);
  assert.doesNotMatch(secFlat, /Nothing in Salvor phones home/);
});
