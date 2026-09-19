#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

function verifyReleaseArchive() {
  const archiveFlag = process.argv.indexOf("--archive");
  const archiveArgument = process.argv
    .slice(archiveFlag + 1)
    .find((argument) => !argument.startsWith("--"));
  assert.ok(archiveArgument, "usage: npm run release:verify-archive -- <archive.zip> [--browser] [--keep]");

  const archivePath = resolve(root, archiveArgument);
  assert.ok(existsSync(archivePath), `release archive does not exist: ${archivePath}`);
  assert.equal(extname(archivePath), ".zip", "release archive must be a .zip file");

  const keep = process.argv.includes("--keep");
  const browser = process.argv.includes("--browser");
  const extractionRoot = mkdtempSync(join(tmpdir(), "salvor-release-artifact-"));

  try {
    execFileSync("unzip", ["-t", archivePath], { stdio: "inherit" });
    execFileSync("unzip", ["-q", archivePath, "-d", extractionRoot], { stdio: "inherit" });
    assert.ok(existsSync(join(extractionRoot, "package.json")), "archive must extract its release root directly");

    const archiveFiles = execFileSync("unzip", ["-Z1", archivePath], { encoding: "utf8" })
      .split("\n")
      .filter((entry) => entry && !entry.endsWith("/"));
    execFileSync("git", ["init", "-q"], { cwd: extractionRoot, stdio: "inherit" });
    for (let offset = 0; offset < archiveFiles.length; offset += 100) {
      execFileSync("git", ["add", "-f", "--", ...archiveFiles.slice(offset, offset + 100)], {
        cwd: extractionRoot,
        stdio: "inherit",
      });
    }
    execFileSync("git", ["commit", "-q", "--no-gpg-sign", "-m", "release fixture baseline"], {
      cwd: extractionRoot,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "Salvor Release Verifier",
        GIT_AUTHOR_EMAIL: "release-verifier@localhost",
        GIT_COMMITTER_NAME: "Salvor Release Verifier",
        GIT_COMMITTER_EMAIL: "release-verifier@localhost",
      },
      stdio: "inherit",
    });

    const validationCommands = [
      ["npm", ["ci"]],
      ["npm", ["run", "test:unit"]],
      ["npm", ["run", "release:audit"]],
      ["npm", ["run", "brand:check"]],
      ["npm", ["audit", "--audit-level=high"]],
    ];
    if (browser) validationCommands.push(["npm", ["run", "test:browser"]]);
    validationCommands.push(["git", ["diff", "--check"]]);

    for (const [command, args] of validationCommands) {
      console.log(`\n$ ${command} ${args.join(" ")}`);
      execFileSync(command, args, { cwd: extractionRoot, stdio: "inherit" });
    }

    console.log(`\nRelease archive validation passed: ${archivePath}`);
    console.log(`EXTRACTED_RELEASE_PATH=${extractionRoot}`);
  } finally {
    if (!keep) rmSync(extractionRoot, { recursive: true, force: true });
    else console.log(`Preserved extracted release at ${extractionRoot}`);
  }
}

function runReleaseAudit() {
const files = git("ls-files", "--cached", "--others", "--exclude-standard", "-z").split("\0").filter(Boolean).filter((file) => existsSync(join(root, file)));
const fileSet = new Set(files);
const textExtensions = new Set(["", ".css", ".html", ".js", ".json", ".md", ".mjs", ".svg", ".txt", ".yml", ".yaml"]);
const failures = [];
const checks = [];

function check(name, action) {
  try {
    const detail = action();
    checks.push({ name, status: "pass", detail });
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    checks.push({ name, status: "fail", detail: error.message });
  }
}

function tracked(pattern) {
  return files.filter((file) => pattern.test(file));
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(join(root, path))).digest("hex");
}

check("release-candidate JSON parses", () => {
  const json = tracked(/\.json$/);
  for (const file of json) JSON.parse(read(file));
  return `${json.length} files`;
});

check("release-candidate SVG is well-formed XML", () => {
  const svgs = tracked(/\.svg$/);
  for (const file of svgs) execFileSync("xmllint", ["--noout", join(root, file)], { stdio: "pipe" });
  return `${svgs.length} files`;
});

check("internal Markdown links resolve", () => {
  let count = 0;
  for (const file of tracked(/\.md$/)) {
    const source = read(file);
    for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].trim().replace(/^<|>$/g, "");
      if (!target || /^(?:https?:|mailto:|#)/i.test(target)) continue;
      const path = decodeURIComponent(target.split("#")[0].split("?")[0]);
      if (!path || path.includes("\n")) continue;
      const destination = resolve(root, dirname(file), path);
      assert.ok(destination.startsWith(root), `${file}: link escapes repository: ${target}`);
      assert.ok(existsSync(destination), `${file}: missing ${target}`);
      count += 1;
    }
  }
  return `${count} local links`;
});

check("local HTML and CSS resources resolve", () => {
  let count = 0;
  for (const file of tracked(/\.(?:html|css)$/)) {
    const source = read(file);
    const refs = [
      ...[...source.matchAll(/(?:src|href)=["'](\.\/[^"'#?]+)["']/g)].map((match) => match[1]),
      ...[...source.matchAll(/url\(["']?(\.\/[^)'"?#]+)["']?\)/g)].map((match) => match[1]),
    ];
    for (const ref of refs) {
      const destination = resolve(root, dirname(file), ref);
      assert.ok(existsSync(destination), `${file}: missing ${ref}`);
      count += 1;
    }
  }
  return `${count} references`;
});

check("release-candidate PNG files have valid IHDR dimensions", () => {
  const pngs = tracked(/\.png$/);
  for (const file of pngs) {
    const bytes = readFileSync(join(root, file));
    assert.equal(bytes.subarray(1, 4).toString(), "PNG", `${file}: invalid signature`);
    assert.ok(bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0, `${file}: invalid dimensions`);
  }
  return `${pngs.length} files`;
});

check("no credential-shaped secrets are in the release candidate", () => {
  const secret = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|password|secret|access[_-]?token)\s*[:=]\s*["'][A-Za-z0-9_\-\/+=]{16,}["']/i;
  for (const file of files.filter((path) => textExtensions.has(extname(path)))) {
    assert.doesNotMatch(read(file), secret, `${file}: credential-shaped value`);
  }
  return `${files.length} candidate paths scanned`;
});

check("retired brand families are absent from production surfaces", () => {
  const retiredPath = /^(?:brand|wireframe_variants|docs\/brand-drafts)\/|salvor-v10-node-sigil|salvor-logo-final-source|salvor-logo-badge|^assets\/salvor-logo\.svg$|^assets\/brand\/source\/salvor-mark-geometry\.json$|\/salvor-mark-(?:full|core)-/i;
  const offenders = files.filter((file) => retiredPath.test(file));
  assert.deepEqual(offenders, []);
  const historicalOrEnforcement = /^(?:\.salvor\/|CHANGELOG\.md$|VERSION\.md$|tests\/|scripts\/audit-release\.mjs$|assets\/brand\/BRAND_ASSETS\.md$)/;
  const retiredDirection = /salvor-v10-node-sigil|salvor-logo-final-source|salvor-logo-badge|broad-artifact|faceted gem|octahedron|Midjourney|DALL[·-]?E/i;
  for (const file of files.filter((path) => textExtensions.has(extname(path)) && !historicalOrEnforcement.test(path))) {
    assert.doesNotMatch(read(file), retiredDirection, file);
  }
  return "no retired paths, public references, or gem-generation directions";
});

check("v1.0.0-beta contains no plugin implementation or generated GitNexus index", () => {
  const forbidden = files.filter((file) => /(^|\/)(?:plugins?|marketplace|\.gitnexus|\.claude\/skills\/gitnexus[^/]*)(\/|$)/i.test(file) && file !== ".gitnexusrc");
  assert.deepEqual(forbidden, []);
  return "plugin/index paths absent";
});

check("release metadata and public licensing agree", () => {
  const version = JSON.parse(read("VERSION.md").match(/<!--\s*({[^\n]+})\s*-->/)[1]);
  const pkg = JSON.parse(read("package.json"));
  assert.equal(version.version, "1.0.0-beta");
  assert.equal(pkg.version, version.version);
  assert.match(read("LICENSE"), /MIT License/);
  assert.match(read("TRADEMARKS.md"), /does not (?:restrict|change|limit|affect)[^\n]*(?:MIT|code)/i);
  assert.doesNotMatch(read("docs/VENDOR_ADAPTERS.md"), /GitNexus[^.\n]*\bMIT\b/i);
  return `v${version.version} CORE:${String(version.core).padStart(2, "0")} GHPAGE:${String(version.ghpage).padStart(2, "0")} DOCS:${String(version.docs).padStart(2, "0")}`;
});

check("social metadata uses canonical absolute URLs and exact assets", () => {
  const html = read("site/index.html");
  assert.match(html, /<link rel="canonical" href="https:\/\/dwasyluk\.github\.io\/salvor\/"/);
  assert.match(html, /property="og:image" content="https:\/\/dwasyluk\.github\.io\/salvor\/assets\/social\/salvor-social-card\.png"/);
  assert.match(html, /name="twitter:image" content="https:\/\/dwasyluk\.github\.io\/salvor\/assets\/social\/salvor-social-card\.png"/);
  return "canonical, Open Graph, and Twitter URLs agree";
});

check("generated brand manifest covers every declared output", () => {
  const manifest = JSON.parse(read("assets/brand/generated/manifest.json"));
  assert.deepEqual(manifest.canonicalLogos, {
    regular: {
      path: "assets/brand/reference/LOGO.svg",
      sha256: "b9e7aec604dc072c8619853de109c68d74a10036223cf209938d6436443df615",
    },
    small: {
      path: "assets/brand/reference/LOGO-SM.svg",
      sha256: "05dabb5f372c1e9ab09d3be4cf267bb7234bbc69e64a0dd95a7d84b1cc25aa7a",
    },
  });
  assert.ok(Object.keys(manifest.generated).length >= 40);
  assert.equal(manifest.canonicalTextOutlines, "assets/brand/source/salvor-text-outlines.json");
  for (const [file, expectedHash] of Object.entries(manifest.generated)) {
    const normalized = normalize(file);
    assert.ok(fileSet.has(normalized), `${file}: generated output is outside the release candidate`);
    assert.equal(sha256(normalized), expectedHash, `${file}: manifest hash drift`);
  }
  return `${Object.keys(manifest.generated).length} generated outputs with matching hashes`;
});

for (const item of checks) console.log(`${item.status === "pass" ? "PASS" : "FAIL"} ${item.name}: ${item.detail}`);
if (failures.length) {
  console.error(`\n${failures.length} release audit failure(s):\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nRelease integrity audit passed (${checks.length} gates).`);
}
}

if (process.argv.includes("--archive")) verifyReleaseArchive();
else runReleaseAudit();
