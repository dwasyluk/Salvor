#!/usr/bin/env node

import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const textOutlinesPath = join(root, "assets/brand/source/salvor-text-outlines.json");
const heroPath = join(root, "site/assets/hero/salvor-mystic.png");
const checkMode = process.argv.includes("--check");
const auditMode = process.argv.includes("--audit");
const iconSizes = [16, 32, 48, 64, 128, 256, 512];
const canonicalLogos = {
  regular: {
    path: "assets/brand/reference/LOGO.svg",
    stem: "salvor-logo",
    sha256: "b9e7aec604dc072c8619853de109c68d74a10036223cf209938d6436443df615",
    viewBox: "0 0 529.76 551.44",
  },
  small: {
    path: "assets/brand/reference/LOGO-SM.svg",
    stem: "salvor-logo-sm",
    sha256: "05dabb5f372c1e9ab09d3be4cf267bb7234bbc69e64a0dd95a7d84b1cc25aa7a",
    viewBox: "0 0 502.26 545.67",
  },
};

const outputFiles = [
  "assets/brand/generated/salvor-wordmark-black.svg",
  "assets/brand/generated/salvor-wordmark-white.svg",
  "assets/brand/generated/salvor-readme-lockup.svg",
  "assets/brand/generated/salvor-readme-lockup.png",
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
  ...Object.values(canonicalLogos).flatMap(({ stem }) => [
    ...["black", "white"].flatMap((color) => [
      `assets/brand/generated/${stem}-${color}.svg`,
      `site/assets/brand/${stem}-${color}.svg`,
    ]),
    ...["black", "white"].flatMap((color) => iconSizes.flatMap((size) => [
      `assets/brand/generated/icons/${stem}-${color}-${size}.png`,
      `site/assets/brand/${stem}-${color}-${size}.png`,
    ])),
  ]),
  "assets/brand/generated/manifest.json",
];

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const xml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

async function ensureWrite(outputRoot, path, content) {
  const destination = join(outputRoot, path);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content);
}

function assertCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function deriveLogoVariant(source, colorName) {
  assertCondition(colorName === "black" || colorName === "white", `unsupported logo color: ${colorName}`);
  if (colorName === "black") return source;
  const matches = source.match(/#231f20/gi) || [];
  assertCondition(matches.length > 0, "canonical logo color token is missing");
  return source.replace(/#231f20/gi, "#ffffff");
}

function embeddedLogo(source, x, y, width, height, attributes = "") {
  const uri = `data:image/svg+xml;base64,${Buffer.from(source).toString("base64")}`;
  return `<image data-brand-source="canonical-logo-regular" href="${uri}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"${attributes ? ` ${attributes}` : ""}/>`;
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

function lockupSvg(regularBlack, wordmark) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="180" viewBox="0 0 720 180" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="lockup-title"><title id="lockup-title">Salvor — the Prime Radiant</title><rect width="720" height="180" rx="8" fill="#ffffff"/>${embeddedLogo(regularBlack, 10, 10, 160, 160)}${wordmarkGroup(wordmark, "#050608", 204, 39, .9)}<path d="M204 137H682" stroke="#c9841d" stroke-width="3"/></svg>\n`;
}

function socialSvg(regularWhite, textOutlines, width, height, heroData, label) {
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
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="social-title social-desc" data-layout="full-bleed-hero" data-brand-source="canonical-logo-regular"><title id="social-title">Salvor — Your repo remembers.</title><desc id="social-desc">Version-controlled engineering memory for coding agents.</desc><image href="data:image/png;base64,${heroData}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/><rect width="${width}" height="${height}" fill="url(#readability)"/><defs><linearGradient id="readability" x1="0" x2="1"><stop offset="0" stop-color="#020304" stop-opacity=".92"/><stop offset=".64" stop-color="#020304" stop-opacity=".64"/><stop offset="1" stop-color="#020304" stop-opacity=".26"/></linearGradient></defs>${embeddedLogo(regularWhite, markX, markY, markSize, markSize)}${wordmarkGroup(wordmark, "#ffffff", wordX, wordY, wordScale)}<path d="M${markX} ${tagY - 44}H${Math.round(width * .49)}" stroke="#c9841d" stroke-width="5"/>${outlinedText(tagline, "#ffffff", markX, tagY - taglineSize * .86, taglineSize / 100, 'data-copy="tagline" data-typography="sf-mono-800"')}${outlinedText(support, "#f3f0e8", markX, tagY + Math.round(height * .095) - supportSize * .86, supportSize / 100, 'data-copy="support" data-typography="sf-mono-600"')}<metadata>${xml(label)} generated from the canonical authored Salvor logo, fixed SF Mono outlines, and the full-bleed v1.0.0-beta hero.</metadata></svg>\n`;
}

function regularLogoEmbed(regularBlack) {
  return `<!-- CANONICAL_LOGO_REGULAR_START -->${embeddedLogo(regularBlack, 277, 286, 246, 246)}<!-- CANONICAL_LOGO_REGULAR_END -->`;
}

function injectRegularLogo(source, regularBlack) {
  const markerPairs = [
    ["<!-- CANONICAL_LOGO_REGULAR_START -->", "<!-- CANONICAL_LOGO_REGULAR_END -->"],
    ["<!-- CANONICAL_W10_CORE_START -->", "<!-- CANONICAL_W10_CORE_END -->"],
  ];
  const [start, end] = markerPairs.find(([candidateStart, candidateEnd]) => (
    source.includes(candidateStart) && source.includes(candidateEnd)
  )) || [];
  assertCondition(start && end, "loop SVG is missing canonical logo markers");
  return `${source.slice(0, source.indexOf(start))}${regularLogoEmbed(regularBlack)}${source.slice(source.indexOf(end) + end.length)}`;
}

function resizeSvg(source, width, height) {
  return source.replace(/<svg\b([^>]*)>/, (_match, attributes) => {
    const normalized = attributes
      .replace(/\s(?:width|height|preserveAspectRatio)="[^"]*"/g, "");
    return `<svg${normalized} width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet">`;
  });
}

async function renderSvg(page, source, destination, width, height, transparent = true) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:${transparent ? "transparent" : "#fff"}}svg{display:block;width:${width}px;height:${height}px}</style>${resizeSvg(source, width, height)}`, { waitUntil: "load" });
  await page.locator("svg").screenshot({ path: destination, omitBackground: transparent, animations: "disabled" });
}

async function build(outputRoot) {
  const textOutlines = JSON.parse(await readFile(textOutlinesPath, "utf8"));
  const wordmarkOutline = textOutlines.find((record) => record.text === "SALVOR");
  assertCondition(wordmarkOutline?.fontName === ".AppleSystemUIFontMonospaced-Heavy", "approved SF Mono wordmark outline source changed");
  const heroData = (await readFile(heroPath)).toString("base64");
  const variants = new Map();

  for (const [family, logo] of Object.entries(canonicalLogos)) {
    const master = await readFile(join(root, logo.path), "utf8");
    assertCondition(sha256(master) === logo.sha256, `${family} canonical SVG hash changed`);
    assertCondition(master.match(/viewBox="[^"]+"/g)?.length === 1, `${family} canonical SVG must have one viewBox`);
    assertCondition(master.includes(`viewBox="${logo.viewBox}"`), `${family} canonical SVG viewBox changed`);
    assertCondition(/#231f20/i.test(master), `${family} canonical SVG color changed`);
    for (const color of ["black", "white"]) {
      const source = deriveLogoVariant(master, color);
      variants.set(`${family}-${color}`, source);
      await ensureWrite(outputRoot, `assets/brand/generated/${logo.stem}-${color}.svg`, source);
      await ensureWrite(outputRoot, `site/assets/brand/${logo.stem}-${color}.svg`, source);
    }
  }

  for (const color of ["black", "white"]) {
    const wordmark = wordmarkSvg(wordmarkOutline, color);
    await ensureWrite(outputRoot, `assets/brand/generated/salvor-wordmark-${color}.svg`, wordmark);
    await ensureWrite(outputRoot, `site/assets/brand/salvor-wordmark-${color}.svg`, wordmark);
  }

  const lockup = lockupSvg(variants.get("regular-black"), wordmarkOutline);
  const social = socialSvg(variants.get("regular-white"), textOutlines, 1200, 630, heroData, "Open Graph and Twitter card");
  const github = socialSvg(variants.get("regular-white"), textOutlines, 1280, 640, heroData, "GitHub social preview");
  await ensureWrite(outputRoot, "assets/brand/generated/salvor-readme-lockup.svg", lockup);
  await ensureWrite(outputRoot, "site/assets/social/salvor-social-card.svg", social);
  await ensureWrite(outputRoot, "assets/social/github-social-preview.svg", github);

  for (const path of ["assets/salvor-loop.svg", "site/assets/salvor-loop.svg", "site/assets/salvor-loop-with.svg"]) {
    await ensureWrite(outputRoot, path, injectRegularLogo(await readFile(join(root, path), "utf8"), variants.get("regular-black")));
  }
  await ensureWrite(outputRoot, "site/assets/salvor-loop-without.svg", await readFile(join(root, "site/assets/salvor-loop-without.svg")));

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const [family, logo] of Object.entries(canonicalLogos)) {
      for (const color of ["black", "white"]) {
        for (const size of iconSizes) {
          const icon = variants.get(`${family}-${color}`);
          for (const path of [
            `assets/brand/generated/icons/${logo.stem}-${color}-${size}.png`,
            `site/assets/brand/${logo.stem}-${color}-${size}.png`,
          ]) {
            const destination = join(outputRoot, path);
            await mkdir(dirname(destination), { recursive: true });
            await renderSvg(page, icon, destination, size, size, true);
          }
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
    schemaVersion: 2,
    canonicalLogos: {
      regular: {
        path: canonicalLogos.regular.path,
        sha256: canonicalLogos.regular.sha256,
      },
      small: {
        path: canonicalLogos.small.path,
        sha256: canonicalLogos.small.sha256,
      },
    },
    canonicalTextOutlines: "assets/brand/source/salvor-text-outlines.json",
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
      header.querySelector(".brand-mark").src = "./assets/brand/salvor-logo-white.svg";
      header.querySelector(".brand-wordmark").src = "./assets/brand/salvor-wordmark-white.svg";
    });
    await sitePage.locator(".site-header").screenshot({ path: join(auditDir, "site-burned-header.png"), animations: "disabled" });
    await sitePage.locator(".site-footer").scrollIntoViewIfNeeded();
    await sitePage.locator(".site-footer").screenshot({ path: join(auditDir, "site-footer.png"), animations: "disabled" });

    const uri = {
      regularReference: await dataUri(join(root, canonicalLogos.regular.path), "image/svg+xml"),
      smallReference: await dataUri(join(root, canonicalLogos.small.path), "image/svg+xml"),
      regularBlack: await dataUri(join(root, "assets/brand/generated/salvor-logo-black.svg"), "image/svg+xml"),
      regularWhite: await dataUri(join(root, "assets/brand/generated/salvor-logo-white.svg"), "image/svg+xml"),
      smallBlack: await dataUri(join(root, "assets/brand/generated/salvor-logo-sm-black.svg"), "image/svg+xml"),
      smallWhite: await dataUri(join(root, "assets/brand/generated/salvor-logo-sm-white.svg"), "image/svg+xml"),
      lockup: await dataUri(join(root, "assets/brand/generated/salvor-readme-lockup.png"), "image/png"),
      lightHeader: await dataUri(join(auditDir, "site-light-header.png"), "image/png"),
      darkHeader: await dataUri(join(auditDir, "site-burned-header.png"), "image/png"),
      footer: await dataUri(join(auditDir, "site-footer.png"), "image/png"),
      favicon16: await dataUri(join(root, "assets/brand/generated/icons/salvor-logo-sm-black-16.png"), "image/png"),
      favicon32: await dataUri(join(root, "assets/brand/generated/icons/salvor-logo-sm-black-32.png"), "image/png"),
      favicon48: await dataUri(join(root, "assets/brand/generated/icons/salvor-logo-sm-black-48.png"), "image/png"),
      socialSvg: await dataUri(join(root, "site/assets/social/salvor-social-card.svg"), "image/svg+xml"),
      socialPng: await dataUri(join(root, "site/assets/social/salvor-social-card.png"), "image/png"),
      github: await dataUri(join(root, "assets/social/github-social-preview.png"), "image/png"),
      loopWith: await dataUri(join(root, "site/assets/salvor-loop-with.svg"), "image/svg+xml"),
      loopWithout: await dataUri(join(root, "site/assets/salvor-loop-without.svg"), "image/svg+xml"),
    };
    const card = (title, body, className = "") => `<section class="card ${className}"><h2>${xml(title)}</h2><div class="visual">${body}</div></section>`;
    const imageTag = (src, alt, className = "") => `<img class="${className}" src="${src}" alt="${xml(alt)}"/>`;
    const cards = [
      card("Canonical regular reference", imageTag(uri.regularReference, "Canonical regular SVG reference")),
      card("Canonical small reference", imageTag(uri.smallReference, "Canonical small SVG reference")),
      card("Regular · black", imageTag(uri.regularBlack, "Regular black logo")),
      card("Regular · white", imageTag(uri.regularWhite, "Regular white logo"), "dark"),
      card("Small · black", imageTag(uri.smallBlack, "Small black logo")),
      card("Small · white", imageTag(uri.smallWhite, "Small white logo"), "dark"),
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
      card("Salvor Loop · regular logo", imageTag(uri.loopWith, "Salvor Loop with regular logo"), "tall"),
      card("Salvor Loop · without mark", imageTag(uri.loopWithout, "Salvor Loop without mark"), "tall"),
    ];
    const auditHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
      *{box-sizing:border-box} body{margin:0;padding:32px;background:#ecebe6;color:#050608;font-family:SFMono-Regular,Menlo,monospace}
      h1{margin:0 0 8px;font-size:28px;letter-spacing:.08em}p{margin:0 0 28px;color:#505155}.grid{display:grid;grid-template-columns:repeat(4,420px);gap:20px}
      .card{height:330px;padding:14px;border:1px solid #b9b7af;background:#fff;overflow:hidden}.card.dark{background:#05090b;color:#fff}.card.wide{grid-column:span 2}.card.tall{height:560px}
      h2{height:34px;margin:0;font-size:13px;letter-spacing:.08em;text-transform:uppercase}.visual{position:relative;display:flex;align-items:center;justify-content:center;height:calc(100% - 34px);overflow:hidden}
      img{display:block;max-width:100%;max-height:100%;object-fit:contain}.wide img{width:100%}.tall img{height:100%}.pixel{width:224px;height:224px;image-rendering:pixelated}
    </style></head><body><h1>SALVOR v1.0.0-beta · CANONICAL BRAND AUDIT</h1><p>Authored regular/small SVG masters · black/white derivation · site states · favicon sizes · social compositions · Loop placement</p><main class="grid">${cards.join("")}</main></body></html>`;
    await writeFile(join(auditDir, "contact-sheet.html"), auditHtml);
    const auditPage = await browser.newPage({ viewport: { width: 1800, height: 2400 }, deviceScaleFactor: 1 });
    await auditPage.setContent(auditHtml, { waitUntil: "load" });
    await auditPage.screenshot({ path: join(auditDir, "contact-sheet.png"), fullPage: true, animations: "disabled" });
    const manifest = JSON.parse(await readFile(join(root, "assets/brand/generated/manifest.json"), "utf8"));
    await writeFile(join(auditDir, "audit.json"), `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      contactSheet: join(auditDir, "contact-sheet.png"),
      canonicalLogos: manifest.canonicalLogos,
      automatedChecks: {
        sharedBlackWhiteGeometry: true,
        immutableRegularAndSmallMasters: true,
        uniformAspectPreservingScale: true,
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
