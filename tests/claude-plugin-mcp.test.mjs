// Claude Code plugin contract: the bundled Serena MCP launch.
// Regression for the field report where `--project ${CLAUDE_PROJECT_DIR}` bound
// Serena to the launch folder (the user's home folder when Claude Code was
// started there), the deprecated `ide-assistant` context logged a rename warning,
// and the unpinned git source changed under users between installs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mcp = JSON.parse(readFileSync(join(root, "claude-plugin/.mcp.json"), "utf8"));
const serena = mcp.mcpServers.serena;
const args = serena.args;
const after = (flag) => args[args.indexOf(flag) + 1];

test("serena is pinned to an exact PyPI release", () => {
  assert.equal(serena.command, "uvx");
  assert.match(after("--from"), /^serena-agent==\d+\.\d+\.\d+$/);
});

test("serena uses the current claude-code context, not the deprecated alias", () => {
  assert.equal(after("--context"), "claude-code");
  assert.ok(!args.includes("ide-assistant"));
});

test("serena detects the project from the working directory", () => {
  // Exact tail: a positional project, `--project=…` or `--project <dir>` makes
  // Serena 1.7.0 exit with a UsageError when combined with --project-from-cwd.
  assert.deepEqual(args.slice(2), [
    "serena", "start-mcp-server", "--context", "claude-code", "--project-from-cwd",
  ]);
  assert.ok(!JSON.stringify(args).includes("CLAUDE_PROJECT_DIR"));
});

test("plugin version is bumped past 0.1.0 so existing installs pick up the new launch", () => {
  const plugin = JSON.parse(readFileSync(join(root, "claude-plugin/.claude-plugin/plugin.json"), "utf8"));
  const market = JSON.parse(readFileSync(join(root, ".claude-plugin/marketplace.json"), "utf8"));
  assert.notEqual(plugin.version, "0.1.0");
  assert.equal(market.metadata.version, plugin.version);
});
