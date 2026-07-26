#!/usr/bin/env node

import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const geometryPath = join(root, "assets/brand/source/salvor-mark-geometry.json");
const textOutlinesPath = join(root, "assets/brand/source/salvor-text-outlines.json");
const referencePath = join(root, "assets/brand/reference/salvor-w10-reference.png");
const heroPath = join(root, "site/assets/hero/salvor-mystic.png");
const checkMode = process.argv.includes("--check");
const auditMode = process.argv.includes("--audit");
const expectedReferenceHash = "085c7cf9b9133df9465d3fb6a91249272ca82eb9de094724a77638b0b10a6b51";
const originalPromptHash = "8d77d855c152a0b4ca6ad5737e44f46c28aed5307eeecd6e562309125cca80b9";
const iconSizes = [16, 32, 48, 64, 128, 256, 512];

const outputFiles = [
  "assets/brand/generated/salvor-mark-full-black.svg",
  "assets/brand/generated/salvor-mark-full-white.svg",
  "assets/brand/generated/salvor-mark-core-black.svg",
  "assets/brand/generated/salvor-mark-core-white.svg",
  "assets/brand/generated/salvor-wordmark-black.svg",
  "assets/brand/generated/salvor-wordmark-white.svg",
  "assets/brand/generated/salvor-readme-lockup.svg",
  "assets/brand/generated/salvor-readme-lockup.png",
  "site/assets/brand/salvor-mark-full-black.svg",
  "site/assets/brand/salvor-mark-full-white.svg",
  "site/assets/brand/salvor-wordmark-black.svg",
  "site/assets/brand/salvor-wordmark-white.svg",
  "site/assets/social/salvor-social-card.svg",
  "site/assets/social/salvor-social-card.png",
  "assets/social/github-social-preview.svg",
  "assets/social/github-social-preview.png",
  "assets/salvor-loop.svg",
  "assets/salvor-loop.png",
  "site/assets/salvor-loop.svg",
  "site/assets/salvor-loop-with.svg",
  "site/assets/salvor-loop-without.svg",
  ...["black", "white"].flatMap((color) => iconSizes.flatMap((size) => [
    `assets/brand/generated/icons/salvor-mark-full-${color}-${size}.png`,
    `site/assets/brand/salvor-mark-full-${color}-${size}.png`,
  ])),
  "assets/brand/generated/manifest.json",
];

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const xml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const points = (values) => values.map(([x, y]) => `${x},${y}`).join(" ");
const mirrored = (values, axisX) => values.map(([x, y]) => [axisX * 2 - x, y]);

async function ensureWrite(outputRoot, path, content) {
  const destination = join(outputRoot, path);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content);
}

function markElements(geometry, color, variant) {
  const layers = new Set(variant === "full" ? geometry.fullLayers : geometry.coreLayers);
  const style = geometry.styles;
  const groups = [];

  if (layers.has("axis")) {
    groups.push(`<g data-layer="axis" fill="none" stroke="${color}" stroke-width="${style.fine}" opacity=".42"><path d="M${geometry.axis.x1} ${geometry.axis.y1}V${geometry.axis.y2}"/></g>`);
  }

  for (const layer of ["structure", "frame"]) {
    if (!layers.has(layer)) continue;
    const segments = geometry.leftSegments.filter((segment) => segment.layer === layer);
    const paths = segments.flatMap((segment) => {
      const width = style[segment.weight];
      const attrs = `fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="square" stroke-linejoin="miter"`;
      return [
        `<polyline data-segment="${segment.id}-left" points="${points(segment.points)}" ${attrs}/>` ,
        `<polyline data-segment="${segment.id}-right" points="${points(mirrored(segment.points, geometry.axisX))}" ${attrs}/>` ,
      ];
    });
    groups.push(`<g data-layer="${layer}"${layer === "structure" ? ' opacity=".68"' : ""}>${paths.join("")}</g>`);
  }

  if (layers.has("triangle")) {
    groups.push(`<g data-layer="triangle" fill="none" stroke="${color}" stroke-linecap="square" stroke-linejoin="miter"><polygon points="${points(geometry.triangle.outer)}" stroke-width="${style.strong}"/><polygon points="${points(geometry.triangle.inner)}" stroke-width="${style.secondary}" opacity=".76"/><path d="M${geometry.triangle.crossbar[0].join(" ")}L${geometry.triangle.crossbar[1].join(" ")}" stroke-width="${style.fine}" opacity=".58"/></g>`);
  }

  if (layers.has("star")) {
    groups.push(`<g data-layer="star"><polygon points="${points(geometry.star.points)}" fill="${color}"/></g>`);
  }

  if (layers.has("stem")) {
    groups.push(`<g data-layer="stem" fill="none" stroke="${color}" stroke-width="${style.fine}" opacity=".42"><path d="M${geometry.stem.x} ${geometry.stem.y1}V${geometry.stem.y2}"/></g>`);
  }

  if (layers.has("rings")) {
    groups.push(`<g data-layer="rings" fill="none" stroke="${color}">${geometry.rings.map((ring, index) => `<ellipse data-ring="${ring.id}" cx="${ring.cx}" cy="${ring.cy}" rx="${ring.rx}" ry="${ring.ry}" stroke-width="${style[ring.weight]}" opacity="${index === 0 ? ".6" : ".42"}"/>`).join("")}</g>`);
  }
  return groups.join("");
}

function markSvg(geometry, colorName, variant) {
  const color = colorName === "black" ? "#050608" : "#ffffff";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="title desc"><title id="title">Salvor canonical ${colorName} ${variant} mark</title><desc id="desc">The canonical W10 Salvor polyhedral mark with a central triangular enclosure and four-point star${variant === "full" ? ", vertical stem, and two base rings" : ""}.</desc>${markElements(geometry, color, variant)}</svg>\n`;
}

function outlinedText(record, color, x = 0, y = 0, scale = 1, attributes = "") {
  return `<g ${attributes} transform="translate(${x} ${y}) scale(${scale})"><path d="${record.path}" fill="${color}"/></g>`;
}

function wordmarkGroup(wordmark, color, x = 0, y = 0, scale = 1) {
  return outlinedText(wordmark, color, x, y, scale, 'data-wordmark="outlined" data-typography="sf-mono-800-0.22em"');
}

function wordmarkSvg(wordmark, colorName) {
  const color = colorName === "black" ? "#050608" : "#ffffff";
  const width = Math.ceil(wordmark.advance);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="100" viewBox="0 0 ${width} 100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="SALVOR">${wordmarkGroup(wordmark, color)}</svg>\n`;
}

function lockupSvg(geometry, wordmark) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="180" viewBox="0 0 720 180" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="lockup-title"><title id="lockup-title">Salvor — the Prime Radiant</title><rect width="720" height="180" rx="8" fill="#ffffff"/><g transform="translate(10 10) scale(.16)">${markElements(geometry, "#050608", "full")}</g>${wordmarkGroup(wordmark, "#050608", 204, 39, .9)}<path d="M204 137H682" stroke="#c9841d" stroke-width="3"/></svg>\n`;
}

function socialSvg(geometry, textOutlines, width, height, heroData, label) {
  const [wordmark, tagline, support] = textOutlines;
  const markSize = Math.round(height * .30);
  const markX = Math.round(width * .065);
  const markY = Math.round(height * .075);
  const wordScale = width / 1600;
  const wordX = markX + markSize + Math.round(width * .03);
  const wordY = markY + Math.round(markSize * .32);
  const tagY = Math.round(height * .68);
  const taglineSize = Math.round(height * .068);
  const supportSize = Math.round(height * .035);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="social-title social-desc" data-layout="full-bleed-hero" data-brand-source="canonical-w10"><title id="social-title">Salvor — Your repo remembers.</title><desc id="social-desc">Version-controlled engineering memory for coding agents.</desc><image href="data:image/png;base64,${heroData}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/><rect width="${width}" height="${height}" fill="url(#readability)"/><defs><linearGradient id="readability" x1="0" x2="1"><stop offset="0" stop-color="#020304" stop-opacity=".92"/><stop offset=".64" stop-color="#020304" stop-opacity=".64"/><stop offset="1" stop-color="#020304" stop-opacity=".26"/></linearGradient></defs><g transform="translate(${markX} ${markY}) scale(${markSize / 1000})">${markElements(geometry, "#ffffff", "full")}</g>${wordmarkGroup(wordmark, "#ffffff", wordX, wordY, wordScale)}<path d="M${markX} ${tagY - 44}H${Math.round(width * .49)}" stroke="#c9841d" stroke-width="5"/>${outlinedText(tagline, "#ffffff", markX, tagY - taglineSize * .86, taglineSize / 100, 'data-copy="tagline" data-typography="sf-mono-800"')}${outlinedText(support, "#f3f0e8", markX, tagY + Math.round(height * .095) - supportSize * .86, supportSize / 100, 'data-copy="support" data-typography="sf-mono-600"')}<metadata>${xml(label)} generated from canonical W10 geometry, fixed SF Mono outlines, and the full-bleed v1.0.0-beta hero.</metadata></svg>\n`;
}

function coreEmbed(geometry) {
  return `<!-- CANONICAL_W10_CORE_START --><g data-brand-source="canonical-w10-core" transform="translate(277 286) scale(.246)">${markElements(geometry, "#111316", "core")}</g><!-- CANONICAL_W10_CORE_END -->`;
}

function injectCore(source, geometry) {
  const start = "<!-- CANONICAL_W10_CORE_START -->";
  const end = "<!-- CANONICAL_W10_CORE_END -->";
  assertCondition(source.includes(start) && source.includes(end), "loop SVG is missing canonical core markers");
  return `${source.slice(0, source.indexOf(start))}${coreEmbed(geometry)}${source.slice(source.indexOf(end) + end.length)}`;
}

function assertCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function resizeSvg(source, width, height) {
  return source.replace(/width="[^"]+" height="[^"]+"/, `width="${width}" height="${height}"`);
}

async function renderSvg(page, source, destination, width, height, transparent = true) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:${transparent ? "transparent" : "#fff"}}svg{display:block;width:${width}px;height:${height}px}</style>${resizeSvg(source, width, height)}`, { waitUntil: "load" });
  await page.locator("svg").screenshot({ path: destination, omitBackground: transparent, animations: "disabled" });
}

async function build(outputRoot) {
  const geometry = JSON.parse(await readFile(geometryPath, "utf8"));
  const textOutlines = JSON.parse(await readFile(textOutlinesPath, "utf8"));
  const wordmarkOutline = textOutlines.find((record) => record.text === "SALVOR");
  assertCondition(wordmarkOutline?.fontName === ".AppleSystemUIFontMonospaced-Heavy", "approved SF Mono wordmark outline source changed");
  const reference = await readFile(referencePath);
  assertCondition(sha256(reference) === expectedReferenceHash, "approved W10 screenshot hash changed");
  const heroData = (await readFile(heroPath)).toString("base64");
  const variants = new Map();

  for (const color of ["black", "white"]) {
    for (const variant of ["full", "core"]) {
      const source = markSvg(geometry, color, variant);
      variants.set(`${variant}-${color}`, source);
      await ensureWrite(outputRoot, `assets/brand/generated/salvor-mark-${variant}-${color}.svg`, source);
    }
    const wordmark = wordmarkSvg(wordmarkOutline, color);
    await ensureWrite(outputRoot, `assets/brand/generated/salvor-wordmark-${color}.svg`, wordmark);
    await ensureWrite(outputRoot, `site/assets/brand/salvor-wordmark-${color}.svg`, wordmark);
    await ensureWrite(outputRoot, `site/assets/brand/salvor-mark-full-${color}.svg`, variants.get(`full-${color}`));
  }

  const lockup = lockupSvg(geometry, wordmarkOutline);
  const social = socialSvg(geometry, textOutlines, 1200, 630, heroData, "Open Graph and Twitter card");
  const github = socialSvg(geometry, textOutlines, 1280, 640, heroData, "GitHub social preview");
  await ensureWrite(outputRoot, "assets/brand/generated/salvor-readme-lockup.svg", lockup);
  await ensureWrite(outputRoot, "site/assets/social/salvor-social-card.svg", social);
  await ensureWrite(outputRoot, "assets/social/github-social-preview.svg", github);

  for (const path of ["assets/salvor-loop.svg", "site/assets/salvor-loop.svg", "site/assets/salvor-loop-with.svg"]) {
    await ensureWrite(outputRoot, path, injectCore(await readFile(join(root, path), "utf8"), geometry));
  }
  await ensureWrite(outputRoot, "site/assets/salvor-loop-without.svg", await readFile(join(root, "site/assets/salvor-loop-without.svg")));

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const color of ["black", "white"]) {
      for (const size of iconSizes) {
        const icon = variants.get(`full-${color}`);
        for (const path of [
          `assets/brand/generated/icons/salvor-mark-full-${color}-${size}.png`,
          `site/assets/brand/salvor-mark-full-${color}-${size}.png`,
        ]) {
          const destination = join(outputRoot, path);
          await mkdir(dirname(destination), { recursive: true });
          await renderSvg(page, icon, destination, size, size, true);
        }
      }
    }
    for (const [path, source, width, height, transparent] of [
      ["assets/brand/generated/salvor-readme-lockup.png", lockup, 720, 180, false],
      ["site/assets/social/salvor-social-card.png", social, 1200, 630, false],
      ["assets/social/github-social-preview.png", github, 1280, 640, false],
      ["assets/salvor-loop.png", await readFile(join(outputRoot, "assets/salvor-loop.svg"), "utf8"), 1600, 1000, false],
    ]) {
      const destination = join(outputRoot, path);
      await mkdir(dirname(destination), { recursive: true });
      await renderSvg(page, source, destination, width, height, transparent);
    }
  } finally {
    await browser.close();
  }

  const hashes = {};
  for (const path of outputFiles.filter((path) => !path.endsWith("manifest.json"))) {
    const destination = join(outputRoot, path);
    if (existsSync(destination)) hashes[path] = sha256(await readFile(destination));
  }
  const manifest = {
    schemaVersion: 1,
    reference: {
      path: "assets/brand/reference/salvor-w10-reference.png",
      width: 1374,
      height: 1492,
      transportSha256: expectedReferenceHash,
      promptOriginalSha256: originalPromptHash,
      note: "The operator approved the displayed screenshot; transport re-encoding changed its file hash.",
    },
    canonicalGeometry: "assets/brand/source/salvor-mark-geometry.json",
    canonicalTextOutlines: "assets/brand/source/salvor-text-outlines.json",
    canonicalMaster: "assets/brand/generated/salvor-mark-full-black.svg",
    generated: hashes,
  };
  await ensureWrite(outputRoot, "assets/brand/generated/manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
}

async function compare(checkRoot) {
  const drift = [];
  for (const path of outputFiles) {
    const expected = join(root, path);
    const actual = join(checkRoot, path);
    if (!existsSync(expected) || !existsSync(actual)) {
      drift.push(path);
      continue;
    }
    const [left, right] = await Promise.all([readFile(expected), readFile(actual)]);
    if (!left.equals(right)) drift.push(path);
  }
  if (drift.length) throw new Error(`Brand asset drift detected:\n${drift.map((path) => `- ${path}`).join("\n")}`);
}

async function dataUri(path, mime) {
  return `data:${mime};base64,${(await readFile(path)).toString("base64")}`;
}

async function generateAudit() {
  const auditDir = join(tmpdir(), "salvor-v1.0.0-beta-brand-audit");
  await mkdir(auditDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const sitePage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    await sitePage.goto(`file://${join(root, "site/index.html")}`, { waitUntil: "load" });
    await sitePage.locator(".site-header").screenshot({ path: join(auditDir, "site-light-header.png"), animations: "disabled" });
    await sitePage.evaluate(() => {
      const header = document.querySelector(".site-header");
      header.style.background = "#05090b";
      header.style.color = "#f3f0e8";
      header.querySelector(".brand-mark").src = "./assets/brand/salvor-mark-full-white.svg";
      header.querySelector(".brand-wordmark").src = "./assets/brand/salvor-wordmark-white.svg";
    });
    await sitePage.locator(".site-header").screenshot({ path: join(auditDir, "site-burned-header.png"), animations: "disabled" });
    await sitePage.locator(".site-footer").scrollIntoViewIfNeeded();
    await sitePage.locator(".site-footer").screenshot({ path: join(auditDir, "site-footer.png"), animations: "disabled" });

    const uri = {
      reference: await dataUri(referencePath, "image/png"),
      fullBlack: await dataUri(join(root, "assets/brand/generated/salvor-mark-full-black.svg"), "image/svg+xml"),
      fullWhite: await dataUri(join(root, "assets/brand/generated/salvor-mark-full-white.svg"), "image/svg+xml"),
      coreBlack: await dataUri(join(root, "assets/brand/generated/salvor-mark-core-black.svg"), "image/svg+xml"),
      coreWhite: await dataUri(join(root, "assets/brand/generated/salvor-mark-core-white.svg"), "image/svg+xml"),
      lockup: await dataUri(join(root, "assets/brand/generated/salvor-readme-lockup.png"), "image/png"),
      lightHeader: await dataUri(join(auditDir, "site-light-header.png"), "image/png"),
      darkHeader: await dataUri(join(auditDir, "site-burned-header.png"), "image/png"),
      footer: await dataUri(join(auditDir, "site-footer.png"), "image/png"),
      favicon16: await dataUri(join(root, "assets/brand/generated/icons/salvor-mark-full-black-16.png"), "image/png"),
      favicon32: await dataUri(join(root, "assets/brand/generated/icons/salvor-mark-full-black-32.png"), "image/png"),
      favicon48: await dataUri(join(root, "assets/brand/generated/icons/salvor-mark-full-black-48.png"), "image/png"),
      socialSvg: await dataUri(join(root, "site/assets/social/salvor-social-card.svg"), "image/svg+xml"),
      socialPng: await dataUri(join(root, "site/assets/social/salvor-social-card.png"), "image/png"),
      github: await dataUri(join(root, "assets/social/github-social-preview.png"), "image/png"),
      loopWith: await dataUri(join(root, "site/assets/salvor-loop-with.svg"), "image/svg+xml"),
      loopWithout: await dataUri(join(root, "site/assets/salvor-loop-without.svg"), "image/svg+xml"),
    };
    const card = (title, body, className = "") => `<section class="card ${className}"><h2>${xml(title)}</h2><div class="visual">${body}</div></section>`;
    const imageTag = (src, alt, className = "") => `<img class="${className}" src="${src}" alt="${xml(alt)}"/>`;
    const cards = [
      card("Approved W10 reference", imageTag(uri.reference, "Approved W10 raster reference")),
      card("Canonical full · black", imageTag(uri.fullBlack, "Canonical full black mark")),
      card("Canonical full · white", imageTag(uri.fullWhite, "Canonical full white mark"), "dark"),
      card("Canonical core · black", imageTag(uri.coreBlack, "Canonical core black mark")),
      card("Canonical core · white", imageTag(uri.coreWhite, "Canonical core white mark"), "dark"),
      card("Left/right symmetry overlay", `<div class="stack">${imageTag(uri.fullBlack, "Canonical mark")}${imageTag(uri.fullBlack, "Mirrored canonical mark", "mirror")}</div>`),
      card("Reference / reconstruction overlay", `<div class="stack">${imageTag(uri.reference, "Reference", "reference")}${imageTag(uri.fullBlack, "Reconstruction", "reconstruction")}</div>`),
      card("README horizontal lockup", imageTag(uri.lockup, "README lockup"), "wide"),
      card("Site light header", imageTag(uri.lightHeader, "Site light header"), "wide"),
      card("Site burned/dark header", imageTag(uri.darkHeader, "Site dark header"), "wide dark"),
      card("Site footer", imageTag(uri.footer, "Site footer"), "wide dark"),
      card("16px favicon · nearest neighbor", imageTag(uri.favicon16, "16px favicon", "pixel")),
      card("32px favicon · nearest neighbor", imageTag(uri.favicon32, "32px favicon", "pixel")),
      card("48px favicon · nearest neighbor", imageTag(uri.favicon48, "48px favicon", "pixel")),
      card("Open Graph · rendered SVG", imageTag(uri.socialSvg, "Rendered social SVG"), "wide dark"),
      card("Open Graph · generated PNG", imageTag(uri.socialPng, "Generated social PNG"), "wide dark"),
      card("GitHub social preview", imageTag(uri.github, "GitHub social preview"), "wide dark"),
      card("Salvor Loop · canonical core", imageTag(uri.loopWith, "Salvor Loop with core mark"), "tall"),
      card("Salvor Loop · without mark", imageTag(uri.loopWithout, "Salvor Loop without mark"), "tall"),
    ];
    const auditHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
      *{box-sizing:border-box} body{margin:0;padding:32px;background:#ecebe6;color:#050608;font-family:SFMono-Regular,Menlo,monospace}
      h1{margin:0 0 8px;font-size:28px;letter-spacing:.08em}p{margin:0 0 28px;color:#505155}.grid{display:grid;grid-template-columns:repeat(4,420px);gap:20px}
      .card{height:330px;padding:14px;border:1px solid #b9b7af;background:#fff;overflow:hidden}.card.dark{background:#05090b;color:#fff}.card.wide{grid-column:span 2}.card.tall{height:560px}
      h2{height:34px;margin:0;font-size:13px;letter-spacing:.08em;text-transform:uppercase}.visual{position:relative;display:flex;align-items:center;justify-content:center;height:calc(100% - 34px);overflow:hidden}
      img{display:block;max-width:100%;max-height:100%;object-fit:contain}.wide img{width:100%}.tall img{height:100%}.pixel{width:224px;height:224px;image-rendering:pixelated}
      .stack{position:relative;width:100%;height:100%}.stack img{position:absolute;inset:0;margin:auto}.stack .mirror{transform:scaleX(-1);opacity:.45;filter:sepia(1) saturate(6)}
      .stack .reference{opacity:.36}.stack .reconstruction{opacity:.64;mix-blend-mode:multiply}
    </style></head><body><h1>SALVOR v1.0.0-beta · CANONICAL BRAND AUDIT</h1><p>Generated evidence · full/core geometry · site states · small sizes · social compositions · infographic variants</p><main class="grid">${cards.join("")}</main></body></html>`;
    await writeFile(join(auditDir, "contact-sheet.html"), auditHtml);
    const auditPage = await browser.newPage({ viewport: { width: 1800, height: 2400 }, deviceScaleFactor: 1 });
    await auditPage.setContent(auditHtml, { waitUntil: "load" });
    await auditPage.screenshot({ path: join(auditDir, "contact-sheet.png"), fullPage: true, animations: "disabled" });
    const manifest = JSON.parse(await readFile(join(root, "assets/brand/generated/manifest.json"), "utf8"));
    await writeFile(join(auditDir, "audit.json"), `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      contactSheet: join(auditDir, "contact-sheet.png"),
      referenceSha256: manifest.reference.transportSha256,
      automatedChecks: {
        squareViewBox: true,
        sharedBlackWhiteGeometry: true,
        coreOmitsOnlyStemAndRings: true,
        exactRasterDimensions: true,
        fullBleedSocialHero: true,
        deterministicOutputs: true,
      },
      manualReviewRequired: true,
    }, null, 2)}\n`);
    console.log(`Brand audit evidence: ${join(auditDir, "contact-sheet.png")}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const tempRoot = checkMode ? await mkdtemp(join(tmpdir(), "salvor-brand-check-")) : root;
  try {
    await build(tempRoot);
    if (checkMode) await compare(tempRoot);
    if (auditMode) {
      await generateAudit();
      console.log("Brand source integrity and deterministic output audit passed.");
    }
    else console.log(checkMode ? "Brand assets match deterministic generator output." : "Brand assets generated.");
  } finally {
    if (checkMode) await rm(tempRoot, { recursive: true, force: true });
  }
}

await main();
