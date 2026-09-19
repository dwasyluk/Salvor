// Upgrade-path contract tests — lock the protocol stamp, the version-aware
// Step 0 upgrade flow, and the two-layer (protocol vs knowledge) guarantee so
// the v-next upgrade story cannot silently regress.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const flat = (p) => read(p).replace(/\s+/g, " ");

const setup = read("SETUP_PROMPT.md");

test("SETUP_PROMPT declares its protocol version and it matches the package version", () => {
  const m = setup.match(/\*\*Protocol version: v([^*\s]+)\*\*/);
  assert.ok(m, "SETUP_PROMPT.md must declare **Protocol version: vX.Y.Z**");
  const pkg = JSON.parse(read("package.json"));
  assert.equal(m[1], pkg.version, "protocol version must match package.json version");
});

test("the generated .salvor/README template carries the Salvor-Protocol stamp", () => {
  assert.match(setup, /^Salvor-Protocol: v/m);
  assert.match(flat("SETUP_PROMPT.md"), /protocol stamp above records which Salvor version scaffolded/i);
});

test("dogfood and example installs are stamped, matching the declared protocol version", () => {
  const declared = setup.match(/\*\*Protocol version: v([^*\s]+)\*\*/)[1];
  for (const p of [".salvor/README.md", "example-project/.salvor/README.md"]) {
    const m = read(p).match(/^Salvor-Protocol: v(.+)$/m);
    assert.ok(m, `${p} missing Salvor-Protocol stamp`);
    assert.equal(m[1].trim(), declared, `${p} stamp out of sync with SETUP_PROMPT protocol version`);
  }
});

test("Step 0 upgrade flow is version-aware and delta-scoped", () => {
  const f = flat("SETUP_PROMPT.md");
  assert.match(f, /Version-aware upgrade \(the stamp\)/i);
  assert.match(f, /Stamp older than this prompt/i);
  assert.match(f, /Stamp equal to this prompt/i);
  assert.match(f, /Stamp missing \(pre-stamp install\)/i);
  assert.match(f, /delta-scoped \*\*upgrade plan\*\*/i);
  assert.match(f, /three-way merge/i);
  assert.match(f, /ALWAYS operator-decided/i);
});

test("the two-layer guarantee preserves knowledge and gates explicit migrations", () => {
  const f = flat("SETUP_PROMPT.md");
  assert.match(f, /\*\*knowledge layer\*\*[^.]*preserved by default/i);
  assert.match(f, /never silently rewrite knowledge claims/i);
  assert.match(f, /migration[^.]*separately approved/i);
  // the never-overwrite list includes the archive now
  assert.match(f, /`decisions\/`, `domain-learnings\/`, `postmortems\/`, `archive\/`/);
});

test("UPGRADING doc exists, is linked, and documents the stamp + layers + migrations", () => {
  assert.ok(existsSync(join(root, "docs/UPGRADING.md")));
  const up = flat("docs/UPGRADING.md");
  assert.match(up, /Salvor-Protocol: v/);
  assert.match(up, /Preserved by default/i);
  assert.match(up, /never silently rewrites knowledge claims/i);
  assert.match(up, /three-way merge/i);
  assert.match(up, /Migration notes by version/i);
  assert.match(up, /Slug knowledge IDs/i);
  // enabling the experimental feature is never part of an upgrade
  assert.match(up, /never part of an upgrade/i);
  assert.match(flat("README.md"), /docs\/UPGRADING\.md/);
  assert.match(flat("docs/FAQ.md"), /How do I upgrade Salvor when a new version ships\?/);
});

test("plugin compatibility is stated as wrapping the same prompt and path", () => {
  assert.match(flat("docs/UPGRADING.md"), /wrap this exact same prompt and hit this exact same path/i);
  assert.match(flat("docs/FAQ.md"), /prompt install and a plugin install upgrade the same way/i);
});

test("Step 5 report confirms the stamp (and stamp transition on upgrades)", () => {
  assert.match(flat("SETUP_PROMPT.md"), /carries the `Salvor-Protocol:` stamp/);
  assert.match(flat("SETUP_PROMPT.md"), /state the stamp transition and the applied protocol deltas/i);
});
