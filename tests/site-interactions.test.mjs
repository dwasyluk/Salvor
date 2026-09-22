import assert from "node:assert/strict";
import test from "node:test";

import { copyPrompt, menuView } from "../site/scripts/site.js";

test("menuView exposes consistent accessible closed and open states", () => {
  assert.deepEqual(menuView(false), {
    expanded: "false",
    label: "Open menu",
    hidden: true,
  });
  assert.deepEqual(menuView(true), {
    expanded: "true",
    label: "Close menu",
    hidden: false,
  });
});

test("copyPrompt writes fetched prompt text", async () => {
  const writes = [];
  const result = await copyPrompt({
    url: "https://example.test/prompt.md",
    fetchText: async (url) => {
      assert.equal(url, "https://example.test/prompt.md");
      return "# Prompt\n";
    },
    writeText: async (value) => writes.push(value),
  });

  assert.deepEqual(result, { ok: true });
  assert.deepEqual(writes, ["# Prompt\n"]);
});

test("copyPrompt leaves the anchor fallback active after fetch or clipboard failure", async () => {
  for (const operation of [
    { fetchText: async () => { throw new Error("offline"); }, writeText: async () => {} },
    { fetchText: async () => "# Prompt", writeText: async () => { throw new Error("denied"); } },
    { fetchText: async () => "   ", writeText: async () => {} },
  ]) {
    const result = await copyPrompt({ url: "https://example.test/prompt.md", ...operation });
    assert.deepEqual(result, { ok: false });
  }
});
