// Benchmark drift prevention.
//
// Follows the repository's existing precedent (tests/beta-consistency.test.mjs):
// never pin a published number as a literal - derive it from the canonical
// artifact so a stale figure fails loudly instead of quietly shipping.
//
// The canonical artifact is benchmarks/results/beta/summary.json. Until a real
// run produces it, the result-dependent tests skip; the structural tests that
// protect integrity run unconditionally, because those are exactly the
// guarantees that must hold BEFORE anyone is tempted to publish a number.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFile(path.join(root, p), "utf8");
const exists = async (p) => { try { await access(path.join(root, p)); return true; } catch { return false; } };

const SUMMARY = "benchmarks/results/beta/summary.json";
const ARMS = ["S1", "S2", "S3", "C1", "C2", "C3"];

// ---------------------------------------------------------------- structural

test("the benchmark subsystem is isolated from normal Salvor use", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const scripts = JSON.stringify(pkg.scripts ?? {});
  assert.ok(!scripts.includes("benchmarks"),
    "root npm scripts must not reference benchmarks/ - cloning Salvor installs nothing");
  assert.ok(!JSON.stringify(pkg.dependencies ?? {}).includes("benchmark"));

  const ignore = await read(".gitignore");
  for (const rule of ["benchmarks/.env", "benchmarks/.venv/", "benchmarks/runs/"]) {
    assert.ok(ignore.includes(rule), `.gitignore must carry ${rule}`);
  }
});

test("the API key file can never be committed", async () => {
  const ignore = await read(".gitignore");
  assert.match(ignore, /^benchmarks\/\.env$/m);
  assert.equal(await exists("benchmarks/.env.example"), true);
  const example = await read("benchmarks/.env.example");
  assert.match(example, /ANTHROPIC_API_KEY=\s*$/m, ".env.example must never carry a value");
});

test("every declared condition has an isolation policy", async () => {
  const policy = await read("benchmarks/conf/mcp-policy.yaml");
  const conditions = await read("benchmarks/conf/conditions.yaml");
  for (const arm of ARMS) {
    assert.match(policy, new RegExp(`^\\s{2}${arm}:`, "m"), `${arm} needs an MCP policy`);
    assert.match(conditions, new RegExp(`id: ${arm}\\b`), `${arm} must be declared`);
  }
});

test("S2 is documented as a treatment arm, never as an MCP-clean baseline", async () => {
  // The correction this guards: a blanket "baselines have zero MCP calls" rule
  // would fail S2 by definition, since its memory server IS the mechanism.
  const policy = await read("benchmarks/conf/mcp-policy.yaml");
  const s2 = policy.slice(policy.indexOf("\n  S2:"), policy.indexOf("\n  S3:"));
  assert.match(s2, /mcp__clmem__\*/, "S2 must permit its memory namespace");
  assert.match(s2, /TREATMENT arm, not a baseline/i);

  const methodology = await read("benchmarks/METHODOLOGY.md");
  assert.match(methodology, /S2 is not an MCP-clean baseline/i);
});

test("baselines forbid the Salvor stack in every arm that must not have it", async () => {
  const policy = await read("benchmarks/conf/mcp-policy.yaml");
  for (const arm of ["S1", "S2", "C1", "C2"]) {
    const start = policy.indexOf(`\n  ${arm}:`);
    const rest = policy.slice(start + 1);
    const block = rest.slice(0, rest.search(/\n  [A-Z]\d:/) + 1 || rest.length);
    assert.match(block, /forbidden:.*serena/is, `${arm} must forbid Serena`);
    assert.match(block, /forbidden:.*gitnexus/is, `${arm} must forbid GitNexus`);
  }
});

test("methodology publishes the disclosures that make the result auditable", async () => {
  const m = await read("benchmarks/METHODOLOGY.md");
  for (const [claim, pattern] of [
    ["stack-not-core disclosure", /recommended Salvor stack.*as a system/is],
    ["evaluator never feeds memory", /must \*\*never\*\* enter memory/i],
    ["upstream harness not used for scoring", /simulated/i],
    ["availability gated vs utilisation recorded", /Availability is gated; utilisation is telemetry/i],
    ["outcome-blind subsetting", /outcome-blind|HMAC/i],
    ["named deviations", /Known deviations from upstream/i],
    ["incomplete runs are not published", /complete.*false/i],
  ]) {
    assert.match(m, pattern, `METHODOLOGY must state: ${claim}`);
  }
});

test("the pricing mirror matches the verified rate card", async () => {
  const conf = JSON.parse(await read("benchmarks/conf/pricing.json"));
  const py = await read("benchmarks/src/salvorbench/cost/pricing.py");
  const sonnet = conf.models["claude-sonnet-5"];
  assert.equal(sonnet.input, 2.0);
  assert.equal(sonnet.output, 10.0);
  assert.equal(sonnet.cache_write_5m, 2.5);
  assert.equal(sonnet.cache_write_1h, 4.0);
  assert.equal(sonnet.cache_read, 0.2);
  for (const [field, value] of Object.entries(sonnet)) {
    assert.ok(py.includes(`"${field}": Decimal("${value.toFixed(2)}")`),
      `pricing.py must agree with conf/pricing.json on ${field}`);
  }
  assert.ok(conf.retrieved_at, "the rate card must record when it was read");
});

test("the bench component is registered in VERSION, RULES and the hub", async () => {
  const header = JSON.parse((await read("VERSION.md")).match(/<!--\s*({[^\n]+})\s*-->/)[1]);
  assert.ok(Number.isInteger(header.bench), "VERSION.md JSON header needs a bench counter");
  const bench = String(header.bench).padStart(2, "0");
  assert.match(await read("VERSION.md"), new RegExp(`BENCH:${bench}`));
  assert.match(await read("RULES.md"), /\|\s*bench\s*\|.*BENCH:XX/);
  assert.match(await read("CLAUDE.md"), /\|\s*bench\s*\|.*benchmarks\/CLAUDE\.md/);
  assert.match(await read("benchmarks/CLAUDE.md"), new RegExp(`current build \`BENCH:${bench}\``));
});

// ------------------------------------------------------------- result-derived

test("published numbers derive from the canonical summary", async (t) => {
  if (!(await exists(SUMMARY))) {
    t.skip(`${SUMMARY} absent - no completed run yet; nothing may be published`);
    return;
  }
  const summary = JSON.parse(await read(SUMMARY));

  // An incomplete run must never reach a public surface.
  if (summary.complete !== true) {
    for (const surface of ["README.md", "site/index.html"]) {
      const text = await read(surface);
      assert.ok(!/salvorbench|SWE-Bench-CL|CooperBench/i.test(text),
        `${surface} must not present results while summary.complete is ${summary.complete}`);
    }
    return;
  }

  // Complete: every rendered figure must exist in the canonical artifact.
  const rates = new Set();
  for (const arm of ARMS) {
    const a = summary.conditions?.[arm];
    assert.ok(a, `summary must carry condition ${arm}`);
    assert.equal(a.completed, a.expected, `${arm} incomplete: ${a.completed}/${a.expected}`);
    if (typeof a.success_rate === "number") rates.add(a.success_rate.toFixed(1));
  }

  for (const surface of ["README.md", "site/index.html"]) {
    const text = await read(surface);
    for (const m of text.matchAll(/(\d{1,3}\.\d)\s?%/g)) {
      if (!/benchmark|swe-bench|cooperbench|salvor stack/i.test(
            text.slice(Math.max(0, m.index - 400), m.index + 200))) continue;
      assert.ok(rates.has(m[1]),
        `${surface} shows ${m[1]}% which is not in ${SUMMARY} - regenerate, don't hand-edit`);
    }
  }
});

test("the landing page presents every completed beta result and C3 telemetry faithfully", async () => {
  const summary = JSON.parse(await read(SUMMARY));
  assert.equal(summary.complete, true, "public benchmark copy requires a completed canonical summary");
  const site = (await read("site/index.html")).replace(/\s+/g, " ");

  assert.match(site, new RegExp(`${summary.conditions.S1.resolved}/${summary.conditions.S1.expected} <span>vs</span> ${summary.conditions.S2.resolved}/${summary.conditions.S2.expected}`));
  assert.match(site, new RegExp(`${summary.conditions.C1.success_rate.toFixed(0)}% <span>→</span> ${summary.conditions.C3.success_rate.toFixed(0)}%`));
  assert.match(site, /Across 100 C3 invocations: one brain read, zero writes, and zero MCP calls/i);
  assert.match(site, /One run per condition/i);
  assert.match(site, /saturated baseline/i);
  assert.match(site, /hash-chained cost and state ledgers/i);
  assert.match(site, /task-blind machine-built brains/i);
  assert.match(site, /leakage audits/i);
  assert.match(site, /third-party evaluators/i);
  assert.match(site, /longitudinal question open/i);
});

test("isolation and integrity gates passed in the published run", async (t) => {
  if (!(await exists(SUMMARY))) { t.skip("no completed run yet"); return; }
  const summary = JSON.parse(await read(SUMMARY));
  if (summary.complete !== true) { t.skip("run incomplete"); return; }

  assert.equal(summary.isolation?.namespace_policy_compliant, true,
    "every arm must satisfy its MCP namespace policy");
  assert.equal(summary.isolation?.availability_gates_passed, true,
    "Serena/GitNexus/Redis health must have been proven before task exposure");
  assert.equal(summary.integrity?.ledger_chain_verified, true);
  assert.equal(summary.integrity?.state_chain_verified, true);
  assert.equal(summary.integrity?.subset_frozen_before_results, true,
    "the subset must be frozen before any C-phase run");
  assert.ok(summary.disclosures?.stack_not_core,
    "the report must disclose that Salvor arms measure the full recommended stack");
});
