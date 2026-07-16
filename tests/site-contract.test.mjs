import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("the site is scoped to v1.0.0 and does not claim the plugin is released", async () => {
  const html = await read("site/index.html");
  assert.match(html, /SALVOR v1\.0\.0/);
  assert.match(html, /v1\.1\.0\+/);
  assert.match(html, /future/i);
  assert.doesNotMatch(html, /official Claude plugin is available/i);
});

test("the production page exposes the approved sections and canonical actions", async () => {
  const html = await read("site/index.html");
  for (const id of ["top", "why", "how", "use", "claude", "foundations"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /COPY SETUP_PROMPT\.md/);
  assert.match(html, /github\.com\/dwasyluk\/salvor/);
});

test("all local HTML resources exist", async () => {
  const html = await read("site/index.html");
  const refs = [...html.matchAll(/(?:src|href)=["'](\.\/[^"'#?]+)["']/g)]
    .map((match) => path.join("site", match[1]));
  assert.ok(refs.length > 5);
  await Promise.all(refs.map((ref) => access(path.join(root, ref))));
});

test("V10 is the only production logo family and reduced motion is explicit", async () => {
  const [html, css] = await Promise.all([read("site/index.html"), read("site/styles.css")]);
  assert.match(html, /salvor-v10-node-sigil/);
  assert.doesNotMatch(html, /salvor-08|broad-artifact|logo-badge/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("production JavaScript has focused module boundaries", async () => {
  const html = await read("site/index.html");
  assert.match(html, /scripts\/site\.js/);
  assert.match(html, /scripts\/burn-reveal\.js/);
  await Promise.all([
    access(path.join(root, "site/scripts/site.js")),
    access(path.join(root, "site/scripts/burn-reveal.js")),
  ]);
});

test("repository surfaces use V10 and deploy only this versioned site", async () => {
  const [readme, workflow, ignore] = await Promise.all([
    read("README.md"),
    read(".github/workflows/pages.yml"),
    read(".gitignore"),
  ]);
  assert.match(readme, /site\/assets\/brand\/salvor-v10-node-sigil-black-128\.png/);
  assert.doesNotMatch(readme, /salvor-logo-badge/);
  assert.match(workflow, /branches:\s*\["ghpages\/v1\.0\.0"\]/);
  assert.match(workflow, /path:\s*\.\/site/);
  assert.match(ignore, /playwright-report\//);
  assert.match(ignore, /test-results\//);
});
