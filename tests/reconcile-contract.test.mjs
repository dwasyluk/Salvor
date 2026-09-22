// Distributed-brain contract tests — lock the RULES §10 protocol (slug IDs,
// structured headers, Brain Reconcile, Brain Audit, integration-bump
// versioning) into SETUP_PROMPT + both dogfooded RULES instances so it cannot
// silently regress to sequential numbering or merge-hostile counters.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const flat = (p) => read(p).replace(/\s+/g, " ");

const setup = read("SETUP_PROMPT.md");
const rules = read("RULES.md");
const exampleRules = read("example-project/RULES.md");
const protocolSurfaces = [
  ["SETUP_PROMPT.md", setup],
  ["RULES.md", rules],
  ["example-project/RULES.md", exampleRules],
];

// --- §10 exists everywhere -------------------------------------------------
test("RULES §10 Distributed Brain exists in the template and both dogfooded instances", () => {
  for (const [file, doc] of protocolSurfaces) {
    assert.match(doc, /^## 10\. Distributed Brain: IDs, Reconcile & Audit/m, file);
    assert.match(doc, /### 10\.1 Knowledge IDs/, file);
    assert.match(doc, /### 10\.2 Brain Reconcile/, file);
    assert.match(doc, /### 10\.3 Brain Audit/, file);
    assert.match(doc, /### 10\.4 Semantic comparison/, file);
  }
});

// --- Slug-ID grammar, never sequential ------------------------------------
test("knowledge IDs are self-allocating slugs across every artifact class", () => {
  for (const [file, doc] of protocolSurfaces) {
    const f = doc.replace(/\s+/g, " ");
    assert.match(f, /self-allocating slug ID/i, file);
    assert.match(f, /`LF:` \(Learned Failure\), `DL:` \(Domain Learning\), `DEC:` \(Design Decision\), `PM:` \(Postmortem\), `deferred:`/, file);
    assert.match(f, /Never a sequential number/i, file);
    assert.match(f, /no ID allocation may read shared state/i, file);
  }
  // deferred entries use the slug heading + stable commit reference
  for (const [file, doc] of protocolSurfaces) {
    assert.match(doc, /### deferred:<kebab-slug> — <short title>|`### deferred:<kebab-slug> — <short title>`/, file);
    assert.match(doc, /closes deferred:<slug>/, file);
    assert.doesNotMatch(doc, /closes deferred #N/, file);
  }
  // template artifact IDs named per class
  assert.match(setup, /artifact ID `DL:<kebab-slug>`/);
  assert.match(setup, /artifact ID `DEC:<kebab-slug>`/);
  assert.match(setup, /artifact ID `PM:<kebab-slug>`/);
  assert.match(setup, /### LF:<kebab-slug> \(YYYY-MM-DD\)/);
});

// --- Structured header (the semantic-dedupe key) ---------------------------
test("every artifact template requires the structured Subject/Claim header", () => {
  for (const [file, doc] of protocolSurfaces) {
    const f = doc.replace(/\s+/g, " ");
    assert.match(f, /\*\*ID\*\*[^.]*\*\*Subject\*\*[^.]*\*\*Claim\*\*[^.]*\*\*Evidence date\*\*[^.]*\*\*Status\*\*/, file);
    assert.match(f, /`live` \| `superseded-by: <id>`/, file);
  }
  // header requirement is wired into the capture flow and folder READMEs
  assert.match(flat("SETUP_PROMPT.md"), /ID \/ Subject \/ Claim \/ Evidence date \/ Status/);
  for (const p of [
    ".salvor/domain-learnings/README.md",
    ".salvor/decisions/README.md",
    ".salvor/postmortems/README.md",
  ]) {
    assert.match(flat(p), /ID \/ Subject \/ Claim/, p);
  }
});

// --- Reconcile ceremony ----------------------------------------------------
test("Brain Reconcile has both triggers and the verbatim gates", () => {
  for (const [file, doc] of protocolSurfaces) {
    assert.match(doc, /"Incoming brain changes detected — run brain reconcile\? \(yes\/no\)"/, file);
    assert.match(doc, /"Merge these two <class> artifacts into one\? \(yes\/no\)"/, file);
    const f = doc.replace(/\s+/g, " ");
    assert.match(f, /three-way diff \(merge base \/ ours \/ theirs\)/i, file);
    assert.match(f, /Pre-merge/i, file);
  }
});

test("the semantic comparison pairs by subject and names all five classifications", () => {
  for (const [file, doc] of protocolSurfaces) {
    const f = doc.replace(/\s+/g, " ");
    assert.match(f, /Subject overlap — not name similarity — is the pairing key/i, file);
    for (const cls of ["duplicate", "overlapping", "contradictory", "supersedes", "distinct"]) {
      assert.match(f, new RegExp(`\\*\\*${cls}\\*\\*`, "i"), `${file}: ${cls}`);
    }
    // single-live-truth rule for contradictions
    assert.match(f, /ONE `Status: live` entry/i, file);
  }
});

test("per-surface resolution covers L1 re-synthesis, RULES governance, and Serena re-derivation", () => {
  for (const [file, doc] of protocolSurfaces) {
    const f = doc.replace(/\s+/g, " ");
    assert.match(f, /NEVER textually merged — re-synthesize/i, file);
    assert.match(f, /ALWAYS operator-decided; never auto-merged/i, file);
    assert.match(f, /re-derive from the reconciled canonical artifacts/i, file);
  }
});

// --- Brain Audit -----------------------------------------------------------
test("the Brain Audit has a tunable 3-day default, an L1 tracking line, and a verbatim gate", () => {
  for (const [file, doc] of protocolSurfaces) {
    const f = doc.replace(/\s+/g, " ");
    assert.match(f, /AUDIT_INTERVAL_DAYS = 3/, file);
    assert.match(f, /operator-tunable/i, file);
    assert.match(doc, /"Brain audit is due \(last run N days ago\) — run it now\? \(yes\/no\)"/, file);
    assert.match(f, /## Last Brain Audit:|`## Last Brain Audit:`/, file);
  }
  // the dogfooded and example L1s carry the tracking line
  assert.match(read(".salvor/active_state.md"), /^## Last Brain Audit: \d{4}-\d{2}-\d{2}/m);
  assert.match(read("example-project/.salvor/active_state.md"), /^## Last Brain Audit: \d{4}-\d{2}-\d{2}/m);
  // the generated L1 template includes it
  assert.match(setup, /## Last Brain Audit: \[DATE\]/);
});

// --- Integration-bump versioning ([STRICT]) --------------------------------
test("VERSION counters advance only at integration; feature branches record pending", () => {
  for (const [file, doc] of protocolSurfaces) {
    const f = doc.replace(/\s+/g, " ");
    assert.match(f, /Counters advance only on the integration branch/i, file);
    assert.match(f, /:pending/, file);
    assert.match(f, /one bump per (affected )?component per integration/i, file);
  }
});

// --- No sequential-numbering stragglers ------------------------------------
test("no LF#/numeric-allocation or positional-deferred stragglers in living protocol surfaces", () => {
  const living = [
    "SETUP_PROMPT.md",
    "RULES.md",
    "CLAUDE.md",
    "README.md",
    "docs/ARCHITECTURE.md",
    "docs/FAQ.md",
    "example-project/RULES.md",
    "example-project/CLAUDE.md",
    "example-project/README.md",
    ".salvor/DOMAIN_REF.md",
    ".salvor/README.md",
    ".salvor/DEFERRED_TODOS.md",
    "example-project/.salvor/DOMAIN_REF.md",
    "example-project/.salvor/DEFERRED_TODOS.md",
  ];
  for (const p of living) {
    const doc = read(p);
    assert.doesNotMatch(doc, /LF#|LF##/, `${p} still uses numeric LF format`);
    assert.doesNotMatch(doc, /### N\. <short title>/, `${p} still carries the numeric deferred template`);
    // positional entry headings are only meaningful inside the deferred ledgers
    if (p.includes("DEFERRED_TODOS")) {
      assert.doesNotMatch(doc, /^### \d+\. /m, `${p} still uses positional deferred numbering`);
    }
  }
});
