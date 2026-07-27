import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("the site is scoped to v1.0.0-beta and describes plugins only as future work", async () => {
  const html = await read("site/index.html");
  assert.match(html, /SALVOR v1\.0\.0-beta/);
  assert.match(html, /coming soon/i);
  assert.match(html, /in active development, ships with v1\.1\.0/i);
  assert.match(html, /Codex and Gemini plugin equivalents are open for contributors/i);
  assert.doesNotMatch(html, /domain[- ]tuning/i);
  assert.doesNotMatch(html, /\/salvor:(?:init|status|capture|health)/i);
  assert.doesNotMatch(html, /\/plugin install|marketplace add|install the (?:official )?Salvor plugin/i);
});

test("the site mirrors the canonical framework taxonomy and governance", async () => {
  const html = await read("site/index.html");
  const visibleText = html.replace(/<[^>]+>/g, " ");
  for (const claim of [
    /CLAUDE\.md\s+is the canonical hub/i,
    /AGENTS\.md/i,
    /GEMINI\.md/i,
    /vendor-agnostic and vendor-portable/i,
    /through compatible thin adapters/i,
    /\.salvor\/domain-learnings\//i,
    /\.salvor\/decisions\//i,
    /Save this as a domain learning\? \(yes\/no\)/i,
    /Continued Learning/i,
    /Learned Failure/i,
    /Deferred Finding/i,
    /RULES\.md\s+keeps reviewed memory and component context synchronized/i,
    /Optional Strict defaults can also enforce project-specific version counters/i,
    /Serena \+ GitNexus/i,
  ]) {
    assert.match(visibleText, claim);
  }
});

test("the site presents six portable process steps and linked Enhanced integrations", async () => {
  const html = await read("site/index.html");
  const process = html.match(
    /<div class="process-grid">([\s\S]*?)<\/div>\s*<div class="brain-summary">/,
  )?.[1] ?? "";
  assert.equal((process.match(/<article>/g) ?? []).length, 6);
  assert.match(process, /Hub, Spokes &amp; Adapters/);
  assert.match(process, /Vendor-Agnostic &amp; Portable/);
  assert.ok(process.indexOf("Vendor-Agnostic") > process.indexOf("3 Capture Classes"));
  assert.ok(process.indexOf("Vendor-Agnostic") < process.indexOf("Governed, Versioned Why"));
  assert.match(html, /<h2><a href="https:\/\/github\.com\/oraios\/serena">Serena<\/a>/);
  assert.match(html, /<h2><a href="https:\/\/github\.com\/abhigyanpatwari\/GitNexus">GitNexus<\/a>/);
  assert.match(html, /optional[^.]*highly recommended|highly recommended[^.]*optional/i);
});

test("hero bullets use a separate marker column for wrapped copy", async () => {
  const [html, css] = await Promise.all([
    read("site/index.html"),
    read("site/styles.css"),
  ]);
  assert.equal((html.match(/class="hero-point-marker"/g) ?? []).length, 3);
  assert.equal((html.match(/class="hero-point-copy"/g) ?? []).length, 3);
  assert.match(css, /\.hero-points li\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:/s);
});

test("the production site embeds two standalone Salvor Loop panels", async () => {
  const [html, css, withSalvor, withoutSalvor] = await Promise.all([
    read("site/index.html"),
    read("site/styles.css"),
    read("site/assets/salvor-loop-with.svg"),
    read("site/assets/salvor-loop-without.svg"),
  ]);
  assert.match(html, /<section[^>]+id=["']loop["']/i);
  assert.match(html, /class=["']loop-panels["']/i);
  assert.match(html, /src=["']\.\/assets\/salvor-loop-with\.svg["']/i);
  assert.match(html, /src=["']\.\/assets\/salvor-loop-without\.svg["']/i);
  assert.doesNotMatch(html, /src=["']\.\/assets\/salvor-loop\.svg["']/i);

  assert.match(css, /\.loop-panels\s*\{[^}]*display:\s*flex;/s);
  assert.match(css, /\.loop-panels\s*\{[^}]*flex-wrap:\s*wrap;/s);
  assert.match(css, /\.loop-panels\s*\{[^}]*align-items:\s*flex-start;/s);
  assert.match(css, /\.loop-panels\s*>\s*img\s*\{[^}]*flex:\s*1 1 420px;/s);
  assert.match(css, /\.loop-panels\s*>\s*img\s*\{[^}]*max-width:\s*100%;/s);
  assert.match(css, /\.loop-panels\s*>\s*img\s*\{[^}]*width:\s*100%;/s);
  assert.match(css, /\.loop-panels\s*>\s*img\s*\{[^}]*height:\s*auto;/s);

  assert.match(withSalvor, /viewBox=["']0 0 800 960["']/);
  assert.match(withSalvor, /FULL CONTEXT, COMPOUNDING/);
  assert.match(withSalvor, /Every approved capture gives the next session more context\./);
  assert.doesNotMatch(withSalvor, /EMPTY VESSEL|WITHOUT SALVOR/);

  assert.match(withoutSalvor, /viewBox=["']0 0 800 960["']/);
  assert.match(withoutSalvor, /EMPTY VESSEL — COLD START EVERY SESSION/);
  assert.match(withoutSalvor, /The same ground is covered again\./);
  assert.doesNotMatch(withoutSalvor, /FULL CONTEXT|THE SALVOR LOOP/);
  assert.doesNotMatch(`${withSalvor}${withoutSalvor}`, /x1=["']800["'][^>]*x2=["']800["']/);
});

test("unpublished burn-hero experiment pages are absent", async () => {
  const files = await readdir(path.join(root, "site"));
  assert.deepEqual(files.filter((file) => /^burn-hero-.*\.html$/.test(file)), []);
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

test("canonical W10 is the only production logo family and reduced motion is explicit", async () => {
  const [html, css] = await Promise.all([read("site/index.html"), read("site/styles.css")]);
  assert.match(html, /salvor-mark-full-(?:black|white)/);
  assert.match(html, /salvor-wordmark-(?:black|white)/);
  assert.doesNotMatch(html, /salvor-v10-node-sigil|salvor-08|broad-artifact|logo-badge/);
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

test("the hero burn is one WebGL runtime with no legacy effect machinery", async () => {
  const [html, css, burnSource] = await Promise.all([
    read("site/index.html"),
    read("site/styles.css"),
    read("site/scripts/burn-reveal.js"),
  ]);

  assert.match(burnSource, /getContext\(["']webgl["']/);
  assert.match(burnSource, /BURN_FRAGMENT_SHADER/);
  assert.match(burnSource, /u_wireUi/);
  assert.match(burnSource, /u_mysticUi/);
  assert.match(burnSource, /foreignObject/);
  assert.match(css, /\.burn-webgl\s*\{/);
  assert.doesNotMatch(css, /mix-blend-mode:\s*difference/);
  for (const legacy of [
    "createBurnField",
    "createImageData",
    "toDataURL",
    "burn-edge",
    "burn-fx",
    "burn-copy",
    "burn-truth",
    "burn-wire",
  ]) {
    assert.doesNotMatch(`${burnSource}\n${css}`, new RegExp(legacy));
  }

  const stylesheetVersion = html.match(/href=["']\.\/styles\.css\?v=([^"']+)["']/)?.[1];
  const burnVersion = html.match(/src=["']\.\/scripts\/burn-reveal\.js\?v=([^"']+)["']/)?.[1];
  assert.ok(stylesheetVersion);
  assert.equal(burnVersion, stylesheetVersion);
});

test("repository surfaces include the canonical loop and deploy only this versioned site", async () => {
  const [readme, workflow, ignore] = await Promise.all([
    read("README.md"),
    read(".github/workflows/pages.yml"),
    read(".gitignore"),
  ]);
  assert.match(readme, /assets\/salvor-loop\.svg/);
  assert.match(workflow, /branches:\s*\["main"\]/);
  assert.match(workflow, /path:\s*\.\/site/);
  assert.match(ignore, /playwright-report\//);
  assert.match(ignore, /test-results\//);
});

test("the ghpage is independently versioned and its responsive sync SOP is shared memory", async () => {
  const [version, spoke, l1, l2, infra, completion] = await Promise.all([
    read("VERSION.md"),
    read("site/CLAUDE.md"),
    read(".salvor/active_state.md"),
    read(".salvor/active_state_verbose.md"),
    read(".salvor/INFRA.md"),
    read(".serena/memories/task_completion.md"),
  ]);
  assert.match(version, /"ghpage"\s*:\s*9/);
  assert.match(version, /GHPAGE:09/);
  assert.match(spoke, /VERSION\.md[^\n]*GHPAGE/);
  assert.match(l1, /GHPAGE:09/);
  // The responsive-check SOP lives in its canonical homes (L1, INFRA, L2), not
  // duplicated across every Serena memory — post-refresh, Serena memories are
  // concise pointers under the one-owner model.
  void spoke; void completion;
  for (const memory of [l1, infra, l2]) {
    assert.match(memory, /Playwright/i);
    assert.match(memory, /desktop/i);
    assert.match(memory, /tablet/i);
    assert.match(memory, /small[- ]phone/i);
  }
});
