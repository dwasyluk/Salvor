// Cross-surface consistency contract tests (Q4 completeness, Core-first
// quickstart, GitNexus/MCP honesty, vendor-portability, .salvor topology).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const flat = (p) => read(p).replace(/\s+/g, " ");

const site = read("site/index.html");
const setup = read("SETUP_PROMPT.md");
const readme = read("README.md");
const faq = read("docs/FAQ.md");
const vendor = read("docs/VENDOR_ADAPTERS.md");
const arch = read("docs/ARCHITECTURE.md");
const rootClaude = read("CLAUDE.md");
const rootRules = read("RULES.md");
const core = read("core/CLAUDE.md");
const changelog = read("CHANGELOG.md");

// 1-2 — public quickstart is Core-first; enhanced is optional -------------
test("site does not tell every user to install Serena and GitNexus", () => {
  assert.doesNotMatch(site, /Install Serena and GitNexus/i);
});
test("public quickstart presents both enhanced integrations as optional and highly recommended", () => {
  assert.match(
    flat("site/index.html"),
    /<li>[^<]*Serena[^<]*GitNexus[^<]*both[^<]*optional[^<]*highly recommended[^<]*best code-grounded results[^<]*<\/li>/i,
  );
});

// 3-8 — Q4 completeness in SETUP_PROMPT ------------------------------------
test("opening calls per-component versioning optional/Strict", () => {
  assert.match(flat("SETUP_PROMPT.md"), /optional[^.]{0,40}per-component versioning|per-component versioning[^.]{0,40}(when|optional).{0,20}[Ss]trict/i);
});
test("Q4=NO has no active requirement for component counters, can use an existing version source", () => {
  // both Q4 branches are documented
  assert.match(setup, /Q4\s*=\s*YES/);
  assert.match(setup, /Q4\s*=\s*NO/);
  // Q4=NO references an existing/established version source instead of a counter
  assert.match(flat("SETUP_PROMPT.md"), /(existing|established) version (source|mechanism)|package\.json[^.]{0,40}(remain|existing)/i);
  // and never scaffolds a nonexistent VERSION.md on the NO path
  assert.match(flat("SETUP_PROMPT.md"), /do NOT generate a `?VERSION\.md`?|VERSION\.md omitted|no per-component counters/i);
});
test("Q4=YES retains the Strict per-component VERSION.md manifest", () => {
  assert.match(flat("SETUP_PROMPT.md"), /Q4\s*=\s*YES[^]{0,400}?VERSION\.md/i);
});
test("L1 template has unambiguous Q4-specific headings", () => {
  assert.match(setup, /Active State — <COMP_ID_A>:01/); // Q4=YES heading
  assert.match(setup, /Active State — \(\[DATE\]\)/); // Q4=NO heading (no IDs)
});
test("L2 initialization summary is Q4-specific", () => {
  assert.match(flat("SETUP_PROMPT.md"), /Q4\s*=\s*NO[^]{0,300}?(existing version|minimal|project-history)/i);
});
test("the generated .salvor/README template has exactly one DOMAIN_REF.md table row", () => {
  // count only markdown TABLE rows whose first cell is `DOMAIN_REF.md`
  // (excludes the separate `### .salvor/DOMAIN_REF.md` section heading + prose refs)
  const rows = (setup.match(/^\|\s*`DOMAIN_REF\.md`\s*\|/gm) || []).length;
  assert.equal(rows, 1, `expected exactly one DOMAIN_REF.md table row, got ${rows}`);
});

// 10 — release docs describe conditional versioning -----------------------
test("CHANGELOG describes conditional (Strict) versioning, not universal VERSION.md", () => {
  assert.match(flat("CHANGELOG.md"), /when the optional Strict defaults are enabled[^.]{0,60}VERSION\.md|existing version source or a minimal/i);
});

// 11-13 — GitNexus block / skills / MCP honesty ---------------------------
test("no current-state 'drifted GitNexus blocks' wording in README/FAQ", () => {
  assert.doesNotMatch(readme, /drifted GitNexus blocks/i);
  assert.doesNotMatch(faq, /drifted GitNexus blocks/i);
});
test("root CLAUDE.md gates GitNexus MCP use and skills on availability", () => {
  assert.match(flat("CLAUDE.md"), /When the GitNexus MCP tools actually respond/i);
  assert.match(flat("CLAUDE.md"), /If you explicitly enabled generated skills/i);
  assert.match(flat("CLAUDE.md"), /never imply impact analysis ran when it did not/i);
});
test("RULES.md impact/search rules have MCP-unavailable fallbacks", () => {
  assert.match(flat("RULES.md"), /When the GitNexus MCP is active/i);
  assert.match(flat("RULES.md"), /never fabricate MCP results/i);
});

// 14-15 — VENDOR_ADAPTERS topology ----------------------------------------
test("VENDOR_ADAPTERS uses .salvor/ for the memory tree, not docs/", () => {
  assert.doesNotMatch(vendor, /everything in `?docs\/`?\s*\(L1\/L2/i);
  assert.match(flat("docs/VENDOR_ADAPTERS.md"), /\.salvor\/[^]{0,120}(DOMAIN_REF|domain-learnings|postmortems)/i);
});
test("docs do not call the GitNexus index canonical git-tracked memory", () => {
  assert.match(flat("docs/VENDOR_ADAPTERS.md"), /GitNexus[^.]{0,60}(gitignored|machine-derived)/i);
  assert.doesNotMatch(vendor, /the GitNexus index[^.\n]*(is )?just git-tracked/i);
});

// 16 — vendor-portable language, no absolute any-vendor guarantees --------
test("scoped vendor-portable language, no unqualified vendor-neutral claims", () => {
  for (const [name, doc] of [["README", readme], ["SETUP", setup], ["ARCHITECTURE", arch], ["VENDOR", vendor], ["core", core]]) {
    assert.doesNotMatch(doc, /vendor-neutral/i, `${name} still says vendor-neutral`);
    assert.doesNotMatch(doc, /no vendor to choose/i, `${name} still says no vendor to choose`);
    assert.doesNotMatch(doc, /any teammate's CLI works out of the box/i, `${name} still overclaims any-vendor`);
  }
  assert.match(flat("docs/VENDOR_ADAPTERS.md"), /vendor-portable/i);
});

test("current governance and lifecycle wording keeps versioning conditional", () => {
  const domain = read(".salvor/DOMAIN_REF.md");
  assert.match(flat("README.md"), /RULES\.md[^]{0,180}optional Strict defaults[^]{0,100}VERSION\.md/i);
  assert.match(flat("README.md"), /configured project-history or version artifact when applicable/i);
  assert.match(flat(".salvor/DOMAIN_REF.md"), /optional Strict[^]{0,100}per-component version/i);
  assert.doesNotMatch(domain, /future GitHub Pages site/i);
});

test("canonical docs define vendor-agnostic core and vendor portability separately", () => {
  for (const file of [
    "README.md",
    "SETUP_PROMPT.md",
    "docs/ARCHITECTURE.md",
    "docs/VENDOR_ADAPTERS.md",
  ]) {
    const source = flat(file);
    assert.match(source, /vendor-agnostic/i, file);
    assert.match(source, /vendor-portable|vendor portability/i, file);
    assert.match(source, /thin adapters?/i, file);
  }
});

test("public docs explain the vendor-named hub as a cross-vendor implementation detail", () => {
  for (const file of ["README.md", "docs/ARCHITECTURE.md", "docs/VENDOR_ADAPTERS.md"]) {
    const source = flat(file);
    assert.match(
      source,
      /`CLAUDE\.md`[^.]{0,100}canonical cross-vendor hub/i,
      `${file} must frame CLAUDE.md as the cross-vendor hub rather than a Claude-only brain`,
    );
    assert.match(
      source,
      /thin[^.]{0,80}`AGENTS\.md`[^.]{0,80}`GEMINI\.md`[^.]{0,160}(route|point)[^.]{0,100}(same|shared|canonical)/i,
      `${file} must explain how thin adapters route other supported agents to the same brain`,
    );
  }
});

test("enhanced integrations are optional and highly recommended", () => {
  for (const file of [
    "README.md",
    "SETUP_PROMPT.md",
    "docs/VENDOR_ADAPTERS.md",
    "docs/FAQ.md",
  ]) {
    const source = flat(file);
    assert.match(source, /optional/i, file);
    assert.match(source, /highly recommended|best results/i, file);
  }
});
