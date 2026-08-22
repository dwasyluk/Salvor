import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { inflateSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path, encoding = "utf8") => readFileSync(join(root, path), encoding);
const hash = (path) => createHash("sha256").update(read(path, null)).digest("hex");
const iconSizes = [16, 32, 48, 64, 128, 256, 512];
const logoFamilies = {
  regular: {
    source: "assets/brand/reference/LOGO.svg",
    stem: "salvor-logo",
    hash: "b9e7aec604dc072c8619853de109c68d74a10036223cf209938d6436443df615",
    viewBox: [0, 0, 529.76, 551.44],
  },
  small: {
    source: "assets/brand/reference/LOGO-SM.svg",
    stem: "salvor-logo-sm",
    hash: "05dabb5f372c1e9ab09d3be4cf267bb7234bbc69e64a0dd95a7d84b1cc25aa7a",
    viewBox: [0, 0, 502.26, 545.67],
  },
};

function png(path) {
  const bytes = read(path, null);
  assert.equal(bytes.subarray(1, 4).toString(), "PNG", `${path} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function pngAlphaBounds(path) {
  const bytes = read(path, null);
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  assert.equal(bytes[24], 8, `${path} must use 8-bit PNG channels`);
  assert.equal(bytes[25], 6, `${path} must use RGBA PNG color`);
  const chunks = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString();
    if (type === "IDAT") chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  const rows = [];
  let cursor = 0;
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < height; y += 1) {
    const filter = raw[cursor++];
    const row = Buffer.from(raw.subarray(cursor, cursor + stride));
    cursor += stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= 4 ? row[x - 4] : 0;
      const up = y > 0 ? rows[y - 1][x] : 0;
      const upperLeft = y > 0 && x >= 4 ? rows[y - 1][x - 4] : 0;
      if (filter === 1) row[x] = (row[x] + left) & 255;
      else if (filter === 2) row[x] = (row[x] + up) & 255;
      else if (filter === 3) row[x] = (row[x] + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) row[x] = (row[x] + paeth(left, up, upperLeft)) & 255;
      else assert.equal(filter, 0, `${path}: unsupported PNG filter ${filter}`);
    }
    rows.push(row);
  }
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    if (rows[y][x * 4 + 3] === 0) continue;
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  assert.ok(maxX >= minX && maxY >= minY, `${path}: empty alpha bounds`);
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function svg(path) {
  const source = read(path);
  assert.match(source, /<svg\b[^>]*viewBox="[^"]+"/);
  assert.doesNotMatch(source, /filter=|gradient|blur|scale\([^,]+,[^)]+\)/i);
  return source;
}

function geometrySignature(source) {
  return source
    .replace(/(?:#231f20|#ffffff)/gi, "COLOR")
    .replace(/\s+/g, " ")
    .trim();
}

function drawingGeometry(source) {
  return [...source.matchAll(/\b(?:d|points)="([^"]+)"/g)].map((match) => match[1]);
}

test("authored logo masters are byte-identical and retain their intrinsic viewBoxes", () => {
  for (const [name, logo] of Object.entries(logoFamilies)) {
    const source = svg(logo.source);
    assert.equal(hash(logo.source), logo.hash, `${name} canonical source hash`);
    assert.match(source, new RegExp(`viewBox="${logo.viewBox.join(" ")}"`));
    assert.match(source, /#231f20/i);
  }
});

test("black and white SVG families preserve the authored geometry", () => {
  for (const [name, logo] of Object.entries(logoFamilies)) {
    const canonical = svg(logo.source);
    const black = svg(`assets/brand/generated/${logo.stem}-black.svg`);
    const white = svg(`assets/brand/generated/${logo.stem}-white.svg`);
    assert.equal(black, canonical, `${name} black SVG must preserve the canonical source bytes`);
    assert.equal(geometrySignature(black), geometrySignature(white), `${name} black/white geometry`);
    assert.match(white, /#ffffff/i);
    assert.doesNotMatch(white, /#231f20/i);
  }
});

test("regular and small PNG families are exact square exports at every supported size", () => {
  for (const logo of Object.values(logoFamilies)) {
    for (const color of ["black", "white"]) {
      for (const size of iconSizes) {
        const rootPath = `assets/brand/generated/icons/${logo.stem}-${color}-${size}.png`;
        const sitePath = `site/assets/brand/${logo.stem}-${color}-${size}.png`;
        assert.deepEqual(png(rootPath), { width: size, height: size });
        assert.deepEqual(png(sitePath), { width: size, height: size });
        assert.equal(hash(sitePath), hash(rootPath), `${sitePath} must alias ${rootPath}`);
      }
    }
  }
});

test("black and white rasters retain identical geometry and proportional scaling", () => {
  for (const [name, logo] of Object.entries(logoFamilies)) {
    const expectedRatio = logo.viewBox[2] / logo.viewBox[3];
    for (const size of iconSizes) {
      const black = pngAlphaBounds(`assets/brand/generated/icons/${logo.stem}-black-${size}.png`);
      const white = pngAlphaBounds(`assets/brand/generated/icons/${logo.stem}-white-${size}.png`);
      assert.deepEqual(black, white, `${name} ${size}px black/white alpha geometry drift`);
      assert.ok(
        Math.abs(black.width / black.height - expectedRatio) <= 2 / size,
        `${name} ${size}px logo must retain its intrinsic aspect ratio`,
      );
    }
  }
});

test("README lockup and social canvases use canonical generated compositions", () => {
  assert.deepEqual(png("assets/brand/generated/salvor-readme-lockup.png"), { width: 720, height: 180 });
  assert.deepEqual(png("site/assets/social/salvor-social-card.png"), { width: 1200, height: 630 });
  assert.deepEqual(png("assets/social/github-social-preview.png"), { width: 1280, height: 640 });
  const social = read("site/assets/social/salvor-social-card.svg");
  assert.match(social, /data-layout="full-bleed-hero"/);
  assert.match(social, /data-brand-source="canonical-logo-regular"/);
  assert.doesNotMatch(social, /salvor-logo-sm|canonical-w10/i);
  assert.match(social, /data-wordmark="outlined"/);
  assert.match(social, /data-typography="sf-mono-800-0\.22em"/);
  assert.match(social, /Your repo remembers\./);
  assert.match(social, /Engineering knowledge layer for coding agents and software teams\./);
  assert.doesNotMatch(social, /<text\b/);
  const wordmark = read("assets/brand/generated/salvor-wordmark-black.svg");
  assert.match(wordmark, /data-typography="sf-mono-800-0\.22em"/);
  assert.match(wordmark, /<path[^>]+fill="#050608"/);
  assert.doesNotMatch(wordmark, /stroke="#050608"/);
});

test("public surfaces use the small logo only for favicons and the regular logo everywhere else", () => {
  const html = read("site/index.html");
  const css = read("site/styles.css");
  const readme = read("README.md");
  assert.doesNotMatch(`${html}\n${css}\n${readme}`, /salvor-v10-node-sigil|salvor-logo-final-source|salvor-logo-badge/i);
  assert.match(readme, /assets\/brand\/generated\/salvor-readme-lockup\.png/);
  assert.match(readme, /assets\/brand\/generated\/salvor-logo-black\.svg/);
  assert.match(html, /assets\/brand\/salvor-logo-black\.svg/);
  assert.match(html, /assets\/brand\/salvor-logo-white\.svg/);
  const faviconTags = html.match(/<link[^>]+rel="icon"[^>]*>/g) || [];
  assert.equal(faviconTags.length, 2, "favicon contract must expose one PNG fallback and one adaptive SVG");
  assert.match(faviconTags[0], /salvor-logo-sm-black-32\.png/);
  assert.doesNotMatch(faviconTags[0], /media=/);
  assert.match(faviconTags[1], /type="image\/svg\+xml"/);
  assert.match(faviconTags[1], /sizes="any"/);
  assert.match(faviconTags[1], /salvor-logo-sm-adaptive\.svg/);
  assert.doesNotMatch(faviconTags[1], /media=/);

  for (const path of [
    "assets/brand/generated/salvor-logo-sm-adaptive.svg",
    "site/assets/brand/salvor-logo-sm-adaptive.svg",
  ]) {
    assert.ok(existsSync(join(root, path)), `${path} must be generated`);
    if (!existsSync(join(root, path))) continue;
    const adaptive = read(path);
    assert.match(adaptive, /@media\s*\(prefers-color-scheme:\s*dark\)/);
    assert.match(adaptive, /stroke:\s*#ffffff/);
    assert.match(adaptive, /fill:\s*#ffffff/);
    assert.deepEqual(
      drawingGeometry(adaptive),
      drawingGeometry(read(logoFamilies.small.source)),
      `${path} must preserve the authored SM geometry`,
    );
  }
  assert.match(
    html,
    /<link[^>]+rel="apple-touch-icon"[^>]+salvor-logo-sm-black-128\.png[^>]*>/,
  );
  assert.doesNotMatch(
    html.match(/<link[^>]+rel="apple-touch-icon"[^>]*>/)?.[0] || "",
    /media=/,
  );
  const htmlWithoutIcons = html.replace(/<link[^>]+(?:rel="icon"|rel="apple-touch-icon")[^>]*>/g, "");
  assert.doesNotMatch(htmlWithoutIcons, /salvor-logo-sm/);
  assert.match(css, /\.brand \.brand-mark[\s\S]*?object-fit:\s*contain/);
  assert.doesNotMatch(css, /\.brand \.brand-mark[\s\S]*?transform:\s*scale\([^)]*,/);
  for (const tag of html.match(/<img[^>]+salvor-logo[^>]+>/g) || []) {
    const width = tag.match(/width="(\d+)"/)?.[1];
    const height = tag.match(/height="(\d+)"/)?.[1];
    assert.equal(width, height, `logo placement must be square: ${tag}`);
  }
});

test("loop assets embed the regular canonical logo and without stays empty", () => {
  for (const path of ["assets/salvor-loop.svg", "site/assets/salvor-loop.svg", "site/assets/salvor-loop-with.svg"]) {
    const source = read(path);
    assert.match(source, /data-brand-source="canonical-logo-regular"/);
    assert.doesNotMatch(source, /canonical-w10|salvor-logo-sm/i);
  }
  assert.doesNotMatch(read("site/assets/salvor-loop-without.svg"), /canonical-logo|canonical-w10/);
});

test("Salvor Loop center keeps the canonical logo clear of the brain labels", () => {
  for (const path of [
    "assets/salvor-loop.svg",
    "site/assets/salvor-loop.svg",
    "site/assets/salvor-loop-with.svg",
  ]) {
    const source = read(path);
    const logo = source.match(
      /data-brand-source="canonical-logo-regular"[^>]+y="(\d+)"[^>]+width="(\d+)"[^>]+height="(\d+)"/,
    );
    const label = source.match(
      /<text x="400" y="(\d+)"[^>]*>\.salvor\/<\/text>/,
    );
    assert.ok(logo, `${path} must expose the canonical logo bounds`);
    assert.ok(label, `${path} must expose the .salvor/ label baseline`);
    const logoBottom = Number(logo[1]) + Number(logo[3]);
    const labelTop = Number(label[1]) - 22;
    assert.ok(
      logoBottom <= labelTop - 12,
      `${path} logo must keep 12 units of clearance before .salvor/`,
    );
    assert.match(source, /VENDOR-AGNOSTIC HUB \+ SPOKES/);
    assert.match(source, /navigate by symbol/);
    assert.doesNotMatch(
      source,
      /CLAUDE\.md|SERENA|GITNEXUS/i,
      `${path} must keep the protocol diagram vendor- and tool-neutral`,
    );
  }
});

test("brand generator is deterministic and checked-in outputs have no drift", () => {
  execFileSync(process.execPath, ["scripts/generate-brand-assets.mjs", "--check"], { cwd: root, stdio: "pipe" });
});

test("retired official logo families are absent from tracked release paths", () => {
  for (const path of [
    "assets/salvor-logo.svg",
    "assets/salvor-logo-badge.png",
    "assets/salvor-logo-final-source.png",
    "site/assets/brand/salvor-v10-node-sigil-black.svg",
    "site/assets/brand/salvor-v10-node-sigil-white.svg",
    "assets/brand/source/salvor-mark-geometry.json",
    "assets/brand/generated/salvor-mark-full-black.svg",
    "assets/brand/generated/salvor-mark-full-white.svg",
    "assets/brand/generated/salvor-mark-core-black.svg",
    "assets/brand/generated/salvor-mark-core-white.svg",
  ]) assert.equal(existsSync(join(root, path)), false, `${path} must be retired`);
  assert.equal(existsSync(join(root, "assets/hero-prompt.md")), false, "retired generative-image handoff must not ship");
  assert.doesNotMatch(read("README.md"), /faceted gem|octahedron|salvor-logo\.svg|Midjourney|DALL[·-]?E/i, "README retains retired brand direction");
});
