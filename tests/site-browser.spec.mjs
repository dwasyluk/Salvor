import { expect, test } from "@playwright/test";

const viewports = [
  ["desktop", { width: 1440, height: 1000 }],
  ["compact-desktop", { width: 1024, height: 900 }],
  ["tablet", { width: 768, height: 1024 }],
  ["large-phone", { width: 390, height: 844 }],
  ["galaxy-s25-edge-small-phone", { width: 360, height: 780 }],
  ["narrow", { width: 320, height: 568 }],
];

async function overflowReport(page) {
  return page.evaluate(() => [...document.querySelectorAll("body *")]
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return { tag: element.tagName, className: element.className?.toString(), left: rect.left, right: rect.right };
    })
    .filter(({ left, right }) => left < -1 || right > innerWidth + 1)
    .sort((a, b) => Math.max(b.right - innerWidth, -b.left) - Math.max(a.right - innerWidth, -a.left))
    .slice(0, 12));
}

for (const [name, viewport] of viewports) {
  test(`${name} renders without horizontal overflow`, async ({ page }) => {
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });
    page.on("requestfailed", (request) => runtimeErrors.push(`${request.url()}: ${request.failure()?.errorText}`));
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("#hero-title")).toHaveText("SALVOR");
    await expect(page.locator(".burn-copy .hero-title-visual").first()).toBeVisible();
    await expect(page.locator(".hero-actions .button-primary").first()).toBeVisible();

    const readability = await page.evaluate(() => {
      const title = document.querySelector("#hero-title");
      const primaryAction = document.querySelector(".hero-actions .button-primary");
      const titleRect = title.getBoundingClientRect();
      const actionRect = primaryAction.getBoundingClientRect();
      return {
        titleFontSize: Number.parseFloat(getComputedStyle(title).fontSize),
        titleLeft: titleRect.left,
        titleRight: titleRect.right,
        actionLeft: actionRect.left,
        actionRight: actionRect.right,
      };
    });
    expect(readability.titleFontSize).toBeGreaterThanOrEqual(52);
    expect(readability.titleLeft).toBeGreaterThanOrEqual(0);
    expect(readability.titleRight).toBeLessThanOrEqual(viewport.width + 1);
    expect(readability.actionLeft).toBeGreaterThanOrEqual(0);
    expect(readability.actionRight).toBeLessThanOrEqual(viewport.width + 1);

    const loopPanels = page.locator("#loop .loop-panels > img");
    await expect(loopPanels).toHaveCount(2);
    await loopPanels.first().scrollIntoViewIfNeeded();
    for (const panel of await loopPanels.all()) {
      await expect(panel).toBeVisible();
      await expect.poll(() => panel.evaluate((image) => image.complete && image.naturalWidth)).toBe(800);
    }

    const [withBox, withoutBox] = await Promise.all([
      loopPanels.nth(0).boundingBox(),
      loopPanels.nth(1).boundingBox(),
    ]);
    if (viewport.width >= 1000) {
      expect(Math.abs(withBox.y - withoutBox.y)).toBeLessThanOrEqual(1);
      expect(withoutBox.x).toBeGreaterThan(withBox.x + withBox.width - 1);
    } else {
      expect(withoutBox.y).toBeGreaterThan(withBox.y + withBox.height - 1);
      expect(Math.abs(withBox.width - withoutBox.width)).toBeLessThanOrEqual(1);
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow, JSON.stringify(await overflowReport(page), null, 2)).toBeLessThanOrEqual(1);
    expect(runtimeErrors).toEqual([]);
  });
}

test("the enhanced hero uses the compact source and one semantic heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-burn-hero]")).toHaveAttribute("data-burn-state", "ready");
  expect(await page.locator("h1").count()).toBe(1);
  const heroAsset = await page.locator(".burn-truth > picture img").evaluate((image) => ({
    currentSrc: image.currentSrc,
    width: image.naturalWidth,
    height: image.naturalHeight,
  }));
  expect(heroAsset.currentSrc).toMatch(/salvor-mystic\.webp$/);
  expect(heroAsset).toMatchObject({ width: 1672, height: 941 });

  const decodedBytes = await page.evaluate(() => performance.getEntriesByType("resource")
    .reduce((total, entry) => total + entry.decodedBodySize, 0));
  expect(decodedBytes).toBeLessThan(800_000);
});

test("mobile navigation is real and keyboard accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open menu" });
  await toggle.click();
  const closeToggle = page.getByRole("button", { name: "Close menu" });
  await expect(closeToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "USE", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
});

test("hero copy passes mouse drags through to the burn surface while the slogan and navigation remain selectable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const hero = page.locator("[data-burn-hero]");
  await expect(hero).toHaveAttribute("data-burn-state", "ready");

  const interaction = await page.evaluate(() => Object.fromEntries([
    ["title", [getComputedStyle(document.querySelector("#hero-title")).userSelect, getComputedStyle(document.querySelector("#hero-title")).pointerEvents]],
    ["eyebrow", [getComputedStyle(document.querySelector(".eyebrow")).userSelect, getComputedStyle(document.querySelector(".eyebrow")).pointerEvents]],
    ["points", [getComputedStyle(document.querySelector(".hero-points")).userSelect, getComputedStyle(document.querySelector(".hero-points")).pointerEvents]],
    ["slogan", [getComputedStyle(document.querySelector("[data-burn-hero] > .hero-copy > .hero-tagline")).userSelect, getComputedStyle(document.querySelector("[data-burn-hero] > .hero-copy > .hero-tagline")).pointerEvents]],
    ["header", [getComputedStyle(document.querySelector("[data-burn-hero] > .site-header")).userSelect, getComputedStyle(document.querySelector("[data-burn-hero] > .site-header")).pointerEvents]],
    ["brand", [getComputedStyle(document.querySelector("[data-burn-hero] > .site-header .brand-wordmark")).userSelect, getComputedStyle(document.querySelector("[data-burn-hero] > .site-header .brand-wordmark")).pointerEvents]],
    ["nav", [getComputedStyle(document.querySelector("[data-burn-hero] > .site-header .desktop-nav a")).userSelect, getComputedStyle(document.querySelector("[data-burn-hero] > .site-header .desktop-nav a")).pointerEvents]],
  ]));
  expect(interaction).toEqual({
    title: ["none", "none"],
    eyebrow: ["none", "none"],
    points: ["none", "none"],
    slogan: ["text", "auto"],
    header: ["text", "auto"],
    brand: ["text", "auto"],
    nav: ["text", "auto"],
  });

  const titleBox = await page.locator("#hero-title").boundingBox();
  const start = { x: titleBox.x + titleBox.width * 0.3, y: titleBox.y + titleBox.height * 0.5 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 140, start.y + 8, { steps: 12 });
  await page.mouse.up();
  await expect(hero).toHaveAttribute("data-burn-state", "burning");

  await page.reload();
  await expect(hero).toHaveAttribute("data-burn-state", "ready");
  await page.locator("[data-burn-hero] > .hero-copy > .hero-tagline").click();
  await expect(hero).toHaveAttribute("data-burn-state", "ready");
});

test("touch input can tap and drag the burn surface through the large SALVOR text", async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 360, height: 780 },
  });
  const page = await context.newPage();
  await page.goto("/");
  const hero = page.locator("[data-burn-hero]");
  await expect(hero).toHaveAttribute("data-burn-state", "ready");
  const titleBox = await page.locator("#hero-title").boundingBox();
  const start = { x: titleBox.x + titleBox.width * 0.25, y: titleBox.y + titleBox.height * 0.5 };
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: start.x, y: start.y }],
  });
  for (let step = 1; step <= 10; step += 1) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: start.x + step * 9, y: start.y + step * 0.5 }],
    });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(hero).toHaveAttribute("data-burn-state", "burning");
  await context.close();
});

test("reduced motion leaves the wireframe static", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-burn-hero]")).toHaveAttribute("data-burn-state", "reduced");
  await context.close();
});
