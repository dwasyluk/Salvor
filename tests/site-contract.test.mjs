import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("the README exposes GitHub Discussions and X feedback before the product overview", async () => {
  const readme = await read("README.md");
  const communityIndex = readme.indexOf("## Community & feedback");
  const problemIndex = readme.indexOf("## The problem");

  assert.ok(communityIndex > 0 && communityIndex < problemIndex);
  assert.match(readme, /\[GitHub Discussions\]\(https:\/\/github\.com\/dwasyluk\/salvor\/discussions\)/);
  assert.match(readme, /\[`@blockchaindan`\]\(https:\/\/x\.com\/blockchaindan\)/);
});

test("the site links directly to Discussions without presenting X as a site destination", async () => {
  const html = await read("site/index.html");
  const discussionLinks = html.match(
    /href="https:\/\/github\.com\/dwasyluk\/salvor\/discussions"/g,
  ) ?? [];

  assert.equal(discussionLinks.length, 3);
  assert.equal((html.match(/>COMMUNITY ↗<\/a>/g) ?? []).length, 2);
  assert.match(html, />Community ↗<\/a>/);
  assert.doesNotMatch(html, /href="https:\/\/x\.com\/blockchaindan"/);
});

test("contributor routing keeps community ideas separate from actionable GitHub work", async () => {
  const [contributing, issueConfig, bugTemplate, featureTemplate, adapterTemplate] = await Promise.all([
    read("CONTRIBUTING.md"),
    read(".github/ISSUE_TEMPLATE/config.yml"),
    read(".github/ISSUE_TEMPLATE/bug_report.md"),
    read(".github/ISSUE_TEMPLATE/feature_request.md"),
    read(".github/ISSUE_TEMPLATE/adapter_request.md"),
  ]);

  for (const category of ["HELP", "BUG", "IDEA", "ADAPTER", "SHOWCASE"]) {
    assert.match(contributing, new RegExp(`\\b${category}\\b`));
  }
  assert.match(contributing, /IDEA[\s\S]*\[FEAT\]/);
  assert.match(contributing, /BUG[\s\S]*\[BUG\]/);
  assert.match(contributing, /ADAPTER[\s\S]*\[ADAPTER\]/);
  assert.match(issueConfig, /https:\/\/github\.com\/dwasyluk\/salvor\/discussions/);
  assert.match(bugTemplate, /^title: "\[BUG\] "/m);
  assert.match(featureTemplate, /^title: "\[FEAT\] "/m);
  assert.match(adapterTemplate, /^title: "\[ADAPTER\] "/m);
});

test("the site is scoped to v1.0.0-beta and describes plugins only as future work", async () => {
  const html = await read("site/index.html");
  assert.match(html, /SALVOR v1\.0\.0-beta/);
  assert.match(html, /coming soon/i);
  assert.match(html, /SHIPS WITH v1\.1\.0/);
  assert.match(html, /in active development and is not part of the v1\.0\.0-beta release/i);
  assert.match(html, /Codex and Gemini plugin equivalents are open for contributors/i);
  assert.doesNotMatch(html, /domain[- ]tuning/i);
  assert.doesNotMatch(html, /\/salvor:(?:init|status|capture|health)/i);
  assert.doesNotMatch(html, /\/plugin install|marketplace add|install the (?:official )?Salvor plugin/i);
});

test("the site mirrors the canonical framework taxonomy and governance", async () => {
  const html = await read("site/index.html");
  const visibleText = html.replace(/<[^>]+>/g, " ");
  for (const claim of [
    /vendor-agnostic canonical hub/i,
    /thin multi-vendor adapters/i,
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

test("the site presents preservation-first knowledge adoption as current beta behavior", async () => {
  const html = await read("site/index.html");
  const visibleText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  assert.match(
    visibleText,
    /existing project[\s\S]{0,240}(?:docs|documentation|knowledge)[\s\S]{0,180}(?:section|snippet)[- ]level/i,
  );
  assert.match(
    visibleText,
    /(?:during|at) setup[^.]{0,180}(?:later|on demand)|(?:later|on demand)[^.]{0,180}(?:during|at) setup/i,
  );
  assert.match(visibleText, /originals? (?:stay|remain)[^.]{0,80}(?:untouched|unchanged)/i);
  assert.doesNotMatch(visibleText, /existing-repo adoption\/import[^.]{0,120}(?:roadmap|coming soon)/i);
});

test("the site presents six portable process steps and linked enhanced integrations", async () => {
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

test("the capture-class card uses the approved three-document foundation icon", async () => {
  const html = await read("site/index.html");
  const captureIcon = html.match(
    /<svg class="process-icon"[^>]*>([\s\S]*?)<\/svg>\s*<h2>3 Capture Classes<\/h2>/,
  )?.[1] ?? "";

  assert.equal((captureIcon.match(/<rect\b/g) ?? []).length, 3);
  assert.doesNotMatch(captureIcon, /<path\b[^>]*d="M17 42h22M20 36V23/);
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

test("tablet and mobile hero copy uses a burn-integrated reading panel without changing desktop", async () => {
  const [html, css] = await Promise.all([
    read("site/index.html"),
    read("site/styles.css"),
  ]);

  assert.equal((html.match(/class="hero-reading-panel"/g) ?? []).length, 1);
  assert.match(
    html,
    /class="hero-reading-panel"[\s\S]*class="eyebrow"[\s\S]*id="hero-title"[\s\S]*class="hero-tagline"[\s\S]*class="hero-points"[\s\S]*<\/div>\s*<div class="hero-actions">/,
  );
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /\.hero-reading-panel::before\s*\{[^}]*--panel-fill:\s*rgba\(255,\s*255,\s*255,/s);
  assert.match(css, /\.hero\.is-enhanced\[data-burn-state="revealed"\][^{]*\.hero-reading-panel::before\s*\{[^}]*--panel-fill:\s*rgba\((?:0|[1-9]\d?),/s);
  assert.match(css, /\.hero\.is-enhanced:not\(\[data-burn-state="revealed"\]\)[^{]*\.hero-reading-panel::before\s*\{[^}]*opacity:\s*0/s);
  assert.match(css, /\.hero-reading-panel::before\s*\{[^}]*--panel-stroke:\s*rgba\(/s);
  assert.match(
    css,
    /\.hero-reading-panel::before\s*\{[^}]*linear-gradient\([^;]*var\(--panel-stroke\)[^;]*\)\s*top right\s*\/\s*18px 18px no-repeat/s,
  );
  assert.match(
    css,
    /\.hero-reading-panel::before\s*\{[^}]*linear-gradient\([^;]*var\(--panel-stroke\)[^;]*\)\s*bottom left\s*\/\s*18px 18px no-repeat/s,
  );
  assert.doesNotMatch(css, /filter:\s*blur\(/i);

  const panelRuleIndex = css.indexOf(".hero-reading-panel::before");
  const tabletMediaIndex = css.lastIndexOf("@media (max-width: 900px)", panelRuleIndex);
  assert.ok(panelRuleIndex > tabletMediaIndex && tabletMediaIndex >= 0);
});

test("section hierarchy keeps the Loop copy full width and integration guidance explicit", async () => {
  const [html, css] = await Promise.all([
    read("site/index.html"),
    read("site/styles.css"),
  ]);

  assert.match(css, /\.loop-heading\s*\{[^}]*max-width:\s*none;/s);
  assert.match(css, /\.loop-heading h2\s*\{[^}]*max-width:\s*760px;/s);
  assert.match(css, /\.loop-heading > p:last-child\s*\{[^}]*max-width:\s*none;/s);

  assert.match(html, /Salvor can use Serena MCP and GitNexus MCP/);
  assert.match(html, /<em>Neither is required<\/em>/);
  assert.match(html, /<strong>both are highly recommended for the best results and improved token efficiency\.<\/strong>/);
});

test("the production site embeds two standalone Salvor Loop panels", async () => {
  const [html, css, rootLoop, withSalvor, siteLoop, withoutSalvor] = await Promise.all([
    read("site/index.html"),
    read("site/styles.css"),
    read("assets/salvor-loop.svg"),
    read("site/assets/salvor-loop-with.svg"),
    read("site/assets/salvor-loop.svg"),
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
  for (const loop of [rootLoop, withSalvor, siteLoop]) {
    assert.match(loop, /VENDOR-AGNOSTIC HUB \+ SPOKES/);
    assert.match(loop, /navigate by symbol/);
    assert.doesNotMatch(loop, /CLAUDE\.md|SERENA|GITNEXUS/i);
  }

  assert.match(withoutSalvor, /viewBox=["']0 0 800 960["']/);
  assert.match(withoutSalvor, /EMPTY VESSEL — COLD START EVERY SESSION/);
  assert.match(withoutSalvor, /The same ground is covered again\./);
  assert.doesNotMatch(withoutSalvor, /FULL CONTEXT|THE SALVOR LOOP/);
  assert.doesNotMatch(`${withSalvor}${withoutSalvor}`, /x1=["']800["'][^>]*x2=["']800["']/);
});

test("the public site describes the hub without exposing a vendor-named canonical filename", async () => {
  const html = await read("site/index.html");
  const visibleText = html.replace(/<[^>]+>/g, " ");

  assert.doesNotMatch(visibleText, /CLAUDE\.md/i);
  assert.match(visibleText, /vendor-agnostic canonical hub/i);
  assert.match(visibleText, /thin (?:multi-vendor )?(?:entrypoint )?adapters/i);
  assert.match(visibleText, /Serena MCP and GitNexus MCP/i);
  assert.match(visibleText, /Neither is required/i);
  assert.match(visibleText, /both are highly recommended for the best results and improved token efficiency/i);
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

test("authored regular and small logos are the only production families and reduced motion is explicit", async () => {
  const [html, css] = await Promise.all([read("site/index.html"), read("site/styles.css")]);
  assert.match(html, /salvor-logo-(?:black|white)/);
  assert.match(html, /salvor-logo-sm-black-(?:16|32|48|64|128)\.png/);
  assert.match(html, /salvor-wordmark-(?:black|white)/);
  assert.doesNotMatch(html, /salvor-mark-full|salvor-mark-core|salvor-v10-node-sigil|salvor-08|broad-artifact|logo-badge/);
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
  // Derive the ghpage build ID from VERSION.md's JSON header instead of a
  // pinned literal (RULES §10 / integration-bump: pinned counters conflict on
  // every parallel bump).
  const ghpage = String(JSON.parse(version.match(/<!--\s*({[^\n]+})\s*-->/)[1]).ghpage).padStart(2, "0");
  assert.match(version, new RegExp(`GHPAGE:${ghpage}`));
  assert.match(spoke, /VERSION\.md[^\n]*GHPAGE/);
  assert.match(l1, new RegExp(`GHPAGE:${ghpage}`));
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

test("the site presents the distributed brain honestly: slug IDs, reconcile, audit", async () => {
  const html = (await read("site/index.html")).replace(/\s+/g, " ");
  assert.match(html, /Collision-free slug knowledge IDs/i);
  assert.match(html, /reconcile at merge and pull points/i);
  assert.match(html, /recurring brain audit/i);
  assert.match(html, /LF:stale-note-reference/);
  assert.match(html, /duplicates and contradictions are surfaced for your decision, never shipped silently/i);
});

test("the site flags agentic capture as experimental and off by default", async () => {
  const html = (await read("site/index.html")).replace(/\s+/g, " ");
  assert.match(html, /experimental, off-by-default mode/i);
  assert.match(html, /ratified item-by-item by you/i);
  // the user gate remains the headline claim
  assert.match(html, /Every capture class is user-gated/);
});

test("the site tree includes the archive and the primary path mentions upgrades", async () => {
  const html = await read("site/index.html");
  assert.match(html, /├── postmortems\/\n└── archive\/<\/code>/);
  const flatHtml = html.replace(/\s+/g, " ");
  assert.match(flatHtml, /Upgrading later is the same move/i);
  assert.match(flatHtml, /protocol stamp/i);
  assert.match(flatHtml, /knowledge is never touched/i);
});
