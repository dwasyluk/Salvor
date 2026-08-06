// EXPERIMENTAL agentic-provisional-capture contract tests — lock RULES
// §10.5–§10.6 (default-off gate, provenance headers, per-class policy,
// ratification + archive ceremonies) into SETUP_PROMPT and both dogfooded
// RULES instances so the experimental feature can never silently become
// default-on or lose its identifiability guarantees.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const flat = (p) => read(p).replace(/\s+/g, " ");

const protocolSurfaces = [
  ["SETUP_PROMPT.md", read("SETUP_PROMPT.md")],
  ["RULES.md", read("RULES.md")],
  ["example-project/RULES.md", read("example-project/RULES.md")],
];

test("§10.5 and §10.6 exist everywhere, marked EXPERIMENTAL, default OFF", () => {
  for (const [file, doc] of protocolSurfaces) {
    assert.match(doc, /### 10\.5 \[EXPERIMENTAL\] Agentic provisional capture — default OFF/, file);
    assert.match(doc, /### 10\.6 \[EXPERIMENTAL\] Archive — `\.salvor\/archive\/`/, file);
    assert.match(doc, /`AGENT_CAPTURE = off`/, file);
    assert.match(doc, /`ARCHIVE_AFTER_DAYS = 90`/, file);
    // the EXPERIMENTAL tier is declared alongside CORE/STRICT
    assert.match(doc.replace(/\s+/g, " "), /\[EXPERIMENTAL\] Beta features/, file);
    // when off, nothing changes — the user gate remains absolute
    assert.match(doc.replace(/\s+/g, " "), /When `off` \(the default\), nothing changes/i, file);
  }
});

test("provenance is identifiable, vendor-agnostic Markdown data", () => {
  for (const [file, doc] of protocolSurfaces) {
    const f = doc.replace(/\s+/g, " ");
    assert.match(f, /`Contributed-by: agent — <vendor\/model>, <date>`/, file);
    assert.match(f, /`Review: unreviewed`/, file);
    assert.match(f, /`Contributed-by: operator-approved`/, file);
    assert.match(f, /Salvor-Contribution: agent/, file);
    assert.match(f, /never rely on vendor-specific state/i, file);
  }
});

test("per-class policy: DL/LF/deferred provisional, DEC proposal-only, RULES never", () => {
  for (const [file, doc] of protocolSurfaces) {
    const f = doc.replace(/\s+/g, " ");
    assert.match(f, /\*\*Deferred Findings\*\*, \*\*Domain Learnings\*\*, and \*\*Learned Failures\*\*/, file);
    assert.match(f, /no evidence, no capture/i, file);
    assert.match(f, /`Review: proposed`/, file);
    assert.match(f, /never becomes governing rationale without human ratification/i, file);
    assert.match(f, /RULES changes: never agentic/i, file);
  }
});

test("consumption rule: hypothesis not invariant; ratified always wins", () => {
  for (const [file, doc] of protocolSurfaces) {
    const f = doc.replace(/\s+/g, " ");
    assert.match(f, /hypothesis, not invariant/i, file);
    assert.match(f, /never let it relax a rule/i, file);
    assert.match(f, /resolves automatically in favor of the ratified entry/i, file);
    assert.match(f, /\(prov\)/, file);
  }
});

test("ratification and archive ceremonies carry the verbatim gates", () => {
  for (const [file, doc] of protocolSurfaces) {
    assert.match(doc, /"Ratify this agent contribution\? \(yes \/ no \/ archive\)"/, file);
    assert.match(doc, /"Archive N stale unreviewed contributions\? \(yes\/no\)"/, file);
    const f = doc.replace(/\s+/g, " ");
    assert.match(f, /bulk ratification defeats the tier/i, file);
    assert.match(f, /Ratified knowledge never ages out/i, file);
    assert.match(f, /no separate ledger/i, file);
  }
});

test("archive is never-discard, out of the load path, and hook-free", () => {
  for (const [file, doc] of protocolSurfaces) {
    const f = doc.replace(/\s+/g, " ");
    assert.match(f, /never silently discarded/i, file);
    assert.match(f, /never read `\.salvor\/archive\/` unless explicitly instructed/i, file);
    assert.match(f, /Salvor itself installs no hooks/i, file);
    assert.match(f, /`Status: archived` pointer/, file);
  }
});

test("archive README is scaffolded and dogfooded (root + example)", () => {
  assert.match(read("SETUP_PROMPT.md"), /### `\.salvor\/archive\/README\.md`/);
  for (const p of [".salvor/archive/README.md", "example-project/.salvor/archive/README.md"]) {
    assert.ok(existsSync(join(root, p)), `${p} missing`);
    const doc = flat(p);
    assert.match(doc, /EXPERIMENTAL — RULES §10\.6/, p);
    assert.match(doc, /do NOT read this folder unless explicitly instructed/i, p);
  }
  // and the .salvor index tables route to it
  for (const p of [".salvor/README.md", "example-project/.salvor/README.md"]) {
    assert.match(flat(p), /`archive\/`.*EXPERIMENTAL/, p);
  }
});

test("public surfaces present the feature as experimental and off by default", () => {
  const readme = flat("README.md");
  assert.match(readme, /Experimental: agentic provisional capture \(off by default\)/i);
  assert.match(readme, /off by default/i);
  const faq = flat("docs/FAQ.md");
  assert.match(faq, /Can agents add to the memory without asking me\?/);
  assert.match(faq, /By default, no/);
  assert.match(flat("docs/ARCHITECTURE.md"), /nothing becomes canonical truth without human approval/i);
  assert.match(flat("CONTRIBUTING.md"), /EXPERIMENTAL and off by default/i);
});

test("Step 4 ground rule forbids ungated durable writes unless the operator opted in", () => {
  assert.match(
    flat("SETUP_PROMPT.md"),
    /never write durable knowledge without the capture gate unless the operator explicitly set `AGENT_CAPTURE = provisional`/i,
  );
});
