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
  assert.match(source, /^<svg[^>]+viewBox="0 0 1000 1000"/);
  assert.match(source, /preserveAspectRatio="xMidYMid meet"/);
  assert.doesNotMatch(source, /filter=|gradient|blur|scale\([^,]+,[^)]+\)/i);
  return source;
}

function geometrySignature(source) {
  return source
    .replace(/Salvor canonical (?:black|white)/g, "Salvor canonical COLOR")
    .replace(/(?:#050608|#ffffff)/gi, "COLOR")
    .replace(/\s+/g, " ")
    .trim();
}

test("approved W10 screenshot is preserved with verified transport provenance", () => {
  const reference = "assets/brand/reference/salvor-w10-reference.png";
  assert.ok(existsSync(join(root, reference)));
  assert.deepEqual(png(reference), { width: 1374, height: 1492 });
  assert.equal(hash(reference), "085c7cf9b9133df9465d3fb6a91249272ca82eb9de094724a77638b0b10a6b51");
});

test("canonical geometry is square, mirrored, and layer-owned", () => {
  const geometry = JSON.parse(read("assets/brand/source/salvor-mark-geometry.json"));
  assert.equal(geometry.viewBox, 1000);
  assert.equal(geometry.axisX, 500);
  assert.deepEqual(geometry.fullLayers, ["axis", "structure", "frame", "triangle", "star", "stem", "rings"]);
  assert.deepEqual(geometry.coreLayers, ["axis", "structure", "frame", "triangle", "star"]);
  assert.ok(geometry.leftSegments.length >= 8);
  for (const segment of geometry.leftSegments) {
    for (const point of segment.points) assert.ok(point[0] <= geometry.axisX, `${segment.id} must be left-owned`);
  }
  assert.equal(geometry.star.cx, geometry.axisX);
  assert.equal(geometry.stem.x, geometry.axisX);
  for (const ring of geometry.rings) assert.equal(ring.cx, geometry.axisX);
});

test("full and core SVG variants share geometry across colors", () => {
  const fullBlack = svg("assets/brand/generated/salvor-mark-full-black.svg");
  const fullWhite = svg("assets/brand/generated/salvor-mark-full-white.svg");
  const coreBlack = svg("assets/brand/generated/salvor-mark-core-black.svg");
  const coreWhite = svg("assets/brand/generated/salvor-mark-core-white.svg");
  assert.equal(geometrySignature(fullBlack), geometrySignature(fullWhite));
  assert.equal(geometrySignature(coreBlack), geometrySignature(coreWhite));
  assert.match(fullBlack, /data-layer="stem"/);
  assert.match(fullBlack, /data-layer="rings"/);
  assert.doesNotMatch(coreBlack, /data-layer="(?:stem|rings)"/);
  for (const layer of ["axis", "structure", "frame", "triangle", "star"]) {
    assert.match(fullBlack, new RegExp(`data-layer="${layer}"`));
    assert.match(coreBlack, new RegExp(`data-layer="${layer}"`));
  }
});

test("generated favicon and application PNGs are exact square exports", () => {
  for (const color of ["black", "white"]) {
    for (const size of [16, 32, 48, 64, 128]) {
      const path = `assets/brand/generated/icons/salvor-mark-full-${color}-${size}.png`;
      assert.deepEqual(png(path), { width: size, height: size });
    }
  }
});

test("black and white raster variants retain identical canonical alpha bounds", () => {
  for (const size of [16, 32, 48, 64, 128, 256, 512]) {
    const black = pngAlphaBounds(`assets/brand/generated/icons/salvor-mark-full-black-${size}.png`);
    const white = pngAlphaBounds(`assets/brand/generated/icons/salvor-mark-full-white-${size}.png`);
    assert.deepEqual(black, white, `${size}px black/white alpha geometry drift`);
    assert.ok(black.width / black.height > 0.75 && black.width / black.height < 1.05, `${size}px mark aspect drift`);
  }
});

test("README lockup and social canvases use canonical generated compositions", () => {
  assert.deepEqual(png("assets/brand/generated/salvor-readme-lockup.png"), { width: 720, height: 180 });
  assert.deepEqual(png("site/assets/social/salvor-social-card.png"), { width: 1200, height: 630 });
  assert.deepEqual(png("assets/social/github-social-preview.png"), { width: 1280, height: 640 });
  const social = read("site/assets/social/salvor-social-card.svg");
  assert.match(social, /data-layout="full-bleed-hero"/);
  assert.match(social, /data-brand-source="canonical-w10"/);
  assert.match(social, /data-wordmark="outlined"/);
  assert.match(social, /data-typography="sf-mono-800-0\.22em"/);
  assert.match(social, /Your repo remembers\./);
  assert.match(social, /Version-controlled engineering memory for coding agents\./);
  assert.doesNotMatch(social, /<text\b/);
  const wordmark = read("assets/brand/generated/salvor-wordmark-black.svg");
  assert.match(wordmark, /data-typography="sf-mono-800-0\.22em"/);
  assert.match(wordmark, /<path[^>]+fill="#050608"/);
  assert.doesNotMatch(wordmark, /stroke="#050608"/);
});

test("public surfaces consume only canonical W10 assets without distortion", () => {
  const html = read("site/index.html");
  const css = read("site/styles.css");
  const readme = read("README.md");
  assert.doesNotMatch(`${html}\n${css}\n${readme}`, /salvor-v10-node-sigil|salvor-logo-final-source|salvor-logo-badge/i);
  assert.match(readme, /assets\/brand\/generated\/salvor-readme-lockup\.png/);
  assert.match(html, /assets\/brand\/salvor-mark-full-black\.svg/);
  assert.match(html, /assets\/brand\/salvor-mark-full-white\.svg/);
  assert.match(css, /\.brand \.brand-mark[\s\S]*?object-fit:\s*contain/);
  assert.doesNotMatch(css, /\.brand \.brand-mark[\s\S]*?transform:\s*scale\([^)]*,/);
  for (const tag of html.match(/<img[^>]+salvor-mark[^>]+>/g) || []) {
    const width = tag.match(/width="(\d+)"/)?.[1];
    const height = tag.match(/height="(\d+)"/)?.[1];
    assert.equal(width, height, `logo placement must be square: ${tag}`);
  }
});

test("loop assets embed the generated core variant and without stays empty", () => {
  for (const path of ["assets/salvor-loop.svg", "site/assets/salvor-loop.svg", "site/assets/salvor-loop-with.svg"]) {
    const source = read(path);
    assert.match(source, /data-brand-source="canonical-w10-core"/);
    assert.doesNotMatch(source, /data-layer="(?:stem|rings)"/);
  }
  assert.doesNotMatch(read("site/assets/salvor-loop-without.svg"), /canonical-w10|data-layer="star"/);
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
  ]) assert.equal(existsSync(join(root, path)), false, `${path} must be retired`);
  assert.equal(existsSync(join(root, "assets/hero-prompt.md")), false, "retired generative-image handoff must not ship");
  assert.doesNotMatch(read("README.md"), /faceted gem|octahedron|salvor-logo\.svg|Midjourney|DALL[·-]?E/i, "README retains retired brand direction");
});
