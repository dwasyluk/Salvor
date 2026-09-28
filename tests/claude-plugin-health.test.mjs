// Claude Code plugin contract: manifests + skill structure, and the
// /salvor:health headless regression (issue #29 — inline `!` preprocessing
// terminated headless `claude -p` runs with 0 turns and an empty result).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const json = (p) => JSON.parse(read(p));

const pluginDir = "claude-plugin";
const skillsDir = join(pluginDir, "skills");

const frontmatter = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(m, "SKILL.md must open with YAML frontmatter");
  return Object.fromEntries(
    m[1].split("\n").map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
  );
};

// Manifests -----------------------------------------------------------------
test("plugin and marketplace manifests parse and point at the plugin", () => {
  const plugin = json(join(pluginDir, ".claude-plugin/plugin.json"));
  const market = json(".claude-plugin/marketplace.json");
  assert.equal(plugin.name, "salvor");
  assert.ok(existsSync(join(root, pluginDir, plugin.skills)), "plugin.skills path exists");
  assert.ok(existsSync(join(root, pluginDir, plugin.mcpServers)), "plugin.mcpServers path exists");
  json(join(pluginDir, ".mcp.json"));
  const entry = market.plugins.find((p) => p.name === plugin.name);
  assert.ok(entry, "marketplace lists the plugin");
  assert.equal(entry.source, `./${pluginDir}`);
});

// Skill structure -----------------------------------------------------------
const skills = readdirSync(join(root, skillsDir), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

test("every skill has a SKILL.md whose frontmatter name matches its directory", () => {
  assert.ok(skills.includes("health"));
  for (const name of skills) {
    const fm = frontmatter(read(join(skillsDir, name, "SKILL.md")));
    assert.equal(fm.name, name);
    assert.ok(fm.description, `${name} has a description`);
    assert.ok(fm["allowed-tools"], `${name} declares allowed-tools`);
  }
});

// Health: headless-safe checklist loading (issue #29) -----------------------
const healthPath = join(skillsDir, "health", "SKILL.md");
const health = read(healthPath);

test("health skill has no inline shell preprocessing", () => {
  assert.doesNotMatch(health, /!`/, "no !`command` preprocessing");
  assert.doesNotMatch(health, /^\s*```!/m, "no ```! preprocessing block");
});

test("health skill loads the bundled checklist through the Read tool", () => {
  const fm = frontmatter(health);
  const tools = fm["allowed-tools"].split(",").map((t) => t.trim());
  assert.ok(tools.includes("Read"), "Read is an allowed tool");
  assert.match(health, /Read tool to read `HEALTH_CHECKLIST\.md`/);
  assert.ok(existsSync(join(root, skillsDir, "health", "HEALTH_CHECKLIST.md")));
});

test("health skill keeps its read-only report contract", () => {
  assert.match(health, /\*\*read-only\*\*/);
  assert.match(health, /Do NOT modify files/);
  assert.match(health, /PASS \/ WARN \/ FAIL/);
  assert.match(health, /one-line reason/);
  assert.match(health, /concrete\s+fix/);
  assert.match(health, /summary \(counts\)/);
  assert.match(health, /single highest-priority fix/);
  assert.match(health, /\/salvor:init/);
});
