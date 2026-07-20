// Final launch-gate contract tests: licensing/brand, GitNexus public safety,
// social-sharing assets + metadata (dependency-free PNG IHDR reader), Q4 Strict,
// and version-state. Locks the launch corrections against regression.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
function png(p) {
  const b = readFileSync(join(root, p)); // PNG IHDR: width @16, height @20 (big-endian)
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), bytes: b.length };
}
const html = read("site/index.html");
const head = html.match(/<head[\s\S]*?<\/head>/i)[0];
function meta(prop) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i");
  const m = html.match(re);
  return m ? (m[0].match(/content=["']([^"']*)["']/i) || [])[1] ?? null : null;
}
const CANON = "https://dwasyluk.github.io/salvor/";
const CARD = "https://dwasyluk.github.io/salvor/assets/social/salvor-social-card.png";

// --- Licensing + brand ----------------------------------------------------
test("LICENSE is standard MIT © 2026 Dan Wasyluk", () => {
  const l = read("LICENSE");
  assert.match(l, /MIT License/);
  assert.match(l, /Copyright \(c\) 2026 Dan Wasyluk/);
  assert.match(l, /THE SOFTWARE IS PROVIDED "AS IS"/);
  assert.doesNotMatch(l, /non-?commercial|Commons Clause|Business Source/i);
});
test("brand policy exists and is linked from README + site", () => {
  assert.ok(existsSync(join(root, "TRADEMARKS.md")), "TRADEMARKS.md must exist");
  assert.match(read("README.md"), /TRADEMARKS\.md/);
  assert.match(html, /TRADEMARKS\.md/);
});
test("no text says MIT prohibits selling; brand policy doesn't restrict MIT code rights", () => {
  const readme = read("README.md"), tm = read("TRADEMARKS.md");
  for (const d of [readme, tm]) assert.doesNotMatch(d, /MIT[^.\n]*prohibit[^.\n]*(sell|commercial|resale)/i);
  assert.doesNotMatch(readme, /GitNexus[^.\n]*\bMIT\b/i);
  assert.match(tm, /does not (restrict|change|limit|affect)[^.\n]*(MIT|code)/i);
});

// --- GitNexus public safety ------------------------------------------------
test("site never recommends a bare unqualified `gitnexus analyze`", () => {
  assert.doesNotMatch(html, /<code>\s*gitnexus analyze\s*<\/code>/i);
  assert.doesNotMatch(html, /Run\s+<code>\s*gitnexus analyze\s*<\/code>/i);
  assert.doesNotMatch(html, /Commit the scaffold\. Run/i);
});
test("site has no BUILT ON OPEN FOUNDATIONS heading", () => {
  assert.doesNotMatch(html, /BUILT ON OPEN FOUNDATIONS/);
});

// --- .gitnexusrc doc accuracy ---------------------------------------------
test(".gitnexusrc ships indexOnly only; docs don't claim it carries skipAgentsMd", () => {
  const rc = JSON.parse(read(".gitnexusrc"));
  assert.equal(rc.indexOnly, true);
  assert.equal(rc.skipAgentsMd, undefined);
  assert.doesNotMatch(read("docs/VENDOR_ADAPTERS.md"), /\.gitnexusrc[^.\n]{0,40}(carries|contains|ships)[^.\n]{0,20}skipAgentsMd/i);
});

// --- Social metadata (static, absolute HTTPS, consistent) -----------------
test("Open Graph + Twitter metadata is correct and absolute HTTPS", () => {
  assert.equal(meta("og:type"), "website");
  assert.equal(meta("og:site_name"), "Salvor");
  assert.equal(meta("og:title"), "Salvor — Your repo remembers.");
  assert.equal(meta("og:description"), "Version-controlled engineering memory for coding agents.");
  assert.equal(meta("og:url"), CANON);
  assert.equal(meta("og:image"), CARD);
  assert.equal(meta("og:image:secure_url"), CARD);
  assert.equal(meta("og:image:type"), "image/png");
  assert.equal(meta("og:locale"), "en_US");
  assert.ok((meta("og:image:alt") || "").length > 10, "og:image:alt nonempty");
  assert.equal(meta("twitter:card"), "summary_large_image");
  assert.equal(meta("twitter:title"), "Salvor — Your repo remembers.");
  assert.equal(meta("twitter:image"), CARD);
  assert.ok((meta("twitter:image:alt") || "").length > 10, "twitter:image:alt nonempty");
  assert.equal(meta("twitter:creator"), "@blockchaindan");
  // canonical link present and equal to og:url
  const c = head.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  assert.ok(c && c[0].includes(CANON), "canonical link == og:url");
  // one primary image: og:image == twitter:image
  assert.equal(meta("og:image"), meta("twitter:image"));
  // no twitter:site, no dev hosts in the head
  assert.doesNotMatch(head, /twitter:site/);
  assert.doesNotMatch(head, /localhost|127\.0\.0\.1|file:\/\//);
});
test("social images exist at exact dimensions; dims metadata matches; source present", () => {
  const og = png("site/assets/social/salvor-social-card.png");
  assert.deepEqual([og.w, og.h], [1200, 630]);
  const gh = png("assets/social/github-social-preview.png");
  assert.deepEqual([gh.w, gh.h], [1280, 640]);
  assert.ok(gh.bytes < 1024 * 1024, "github preview < 1MB");
  assert.ok(og.bytes < 1024 * 1024, "og card < 1MB");
  assert.equal(meta("og:image:width"), String(og.w));
  assert.equal(meta("og:image:height"), String(og.h));
  assert.ok(existsSync(join(root, "site/assets/social/salvor-social-card.svg")), "editable SVG source present");
});

// --- Q4 genuinely controls Strict versioning ------------------------------
test("SETUP_PROMPT gives Q4=NO a non-Strict versioning path", () => {
  const s = read("SETUP_PROMPT.md");
  assert.match(s, /Q4\s*=\s*NO|If Q4 (is )?`?no`?/i);
  assert.match(s, /Q4\s*=\s*YES|If Q4 (is )?`?yes`?/i);
});
test("setup reports separate CLI/index/config/MCP-active states", () => {
  const s = read("SETUP_PROMPT.md");
  assert.match(s, /ENHANCED-ACTIVE/);
  assert.match(s, /ENHANCED-READY|PARTIAL ENHANCED/);
  assert.match(s, /\bCORE\b/);
});

// --- Version-state --------------------------------------------------------
test("site shows the plugin as coming in v1.1.0, no installable commands", () => {
  assert.match(html, /ships with v1\.1\.0|coming soon/i);
  assert.doesNotMatch(html, /\/salvor:(init|status|capture|health)/);
});
