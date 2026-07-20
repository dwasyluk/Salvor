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
const readme = readFileSync(join(root, "README.md"), "utf8");

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

// --- Core vs Enhanced mode ------------------------------------------------
test("setup works without MCP tools (Core mode)", () => {
  assert.match(setup, /Core mode/i);
  assert.match(setup, /Enhanced/);
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
