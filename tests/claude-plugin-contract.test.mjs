// Static plugin contracts only: no Claude invocation, MCP startup, or network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

test("marketplace declares Salvor from the local plugin directory", () => {
  const marketplace = JSON.parse(read(".claude-plugin/marketplace.json"));
  assert.ok(Array.isArray(marketplace.plugins), "marketplace.plugins must be an array");
  const plugin = marketplace.plugins.find((entry) => entry.name === "salvor");
  assert.ok(plugin, "marketplace must declare salvor");
  assert.equal(plugin.source, "./claude-plugin");
  assert.ok(statSync(join(root, plugin.source)).isDirectory());
});

test("plugin manifest declares Salvor, skills, MCP, and repository metadata", () => {
  const plugin = JSON.parse(read("claude-plugin/.claude-plugin/plugin.json"));
  assert.equal(plugin.name, "salvor");
  assert.equal(plugin.skills, "./skills/");
  assert.equal(plugin.mcpServers, "./.mcp.json");
  for (const field of ["repository", "license"]) {
    assert.equal(typeof plugin[field], "string", `${field} must be a string`);
    assert.ok(plugin[field].trim(), `${field} must be nonempty`);
  }
});

for (const name of ["init", "status", "capture", "health"]) {
  test(`${name} skill exists and declares its essential frontmatter`, () => {
    const path = `claude-plugin/skills/${name}/SKILL.md`;
    const frontmatter = read(path).match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    assert.ok(frontmatter, `${path} must start with a frontmatter block`);
    // These skills use single-line scalar fields; this is not a YAML parser.
    const field = (key) => {
      const matches = [...frontmatter[1].matchAll(new RegExp(`^${key}:[ \\t]*(.*)$`, "gm"))];
      assert.equal(matches.length, 1, `${path} must declare ${key} once`);
      return matches[0][1].trim().replace(/^(["'])(.*)\1$/, "$2");
    };
    assert.equal(field("name"), name, `${path} name must match its directory`);
    assert.ok(field("description"), `${path} description must be nonempty`);
    assert.equal(field("user-invocable"), "true", `${path} must be user-invocable`);
  });
}

test("required skill companion files exist and are nonempty", () => {
  for (const path of [
    "claude-plugin/skills/init/SETUP_PROMPT.md",
    "claude-plugin/skills/health/HEALTH_CHECKLIST.md",
  ]) {
    assert.ok(read(path).trim(), `${path} must be nonempty`);
  }
});

test("MCP config declares Serena and GitNexus stdio servers", () => {
  const config = JSON.parse(read("claude-plugin/.mcp.json"));
  for (const name of ["serena", "gitnexus"]) {
    const server = config.mcpServers?.[name];
    assert.ok(server && typeof server === "object" && !Array.isArray(server), `${name} must exist`);
    assert.equal(typeof server.command, "string", `${name} command must be a string`);
    assert.ok(server.command.trim(), `${name} command must be nonempty`);
    assert.ok(Array.isArray(server.args), `${name} args must be an array`);
    assert.ok(server.args.every((arg) => typeof arg === "string"), `${name} args must be strings`);
  }
});

test("bundled setup prompt is byte-identical to the canonical installer", () => {
  const bundled = readFileSync(join(root, "claude-plugin/skills/init/SETUP_PROMPT.md"));
  const canonical = readFileSync(join(root, "SETUP_PROMPT.md"));
  assert.ok(
    bundled.equals(canonical),
    "Plugin prompt drift: run scripts/sync-plugin-prompt.sh",
  );
});
