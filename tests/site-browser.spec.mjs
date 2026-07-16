import { expect, test } from "@playwright/test";

const viewports = [
  ["desktop", { width: 1440, height: 1000 }],
  ["tablet", { width: 768, height: 1024 }],
  ["phone", { width: 390, height: 844 }],
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

test("the burn starts on the hero background without stealing text or links", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const hero = page.locator("[data-burn-hero]");
  await expect(hero).toHaveAttribute("data-burn-state", "ready");
  const box = await hero.boundingBox();
  await page.mouse.click(box.x + box.width * 0.82, box.y + box.height * 0.42);
  await expect(hero).toHaveAttribute("data-burn-state", "burning");
  const selection = await page.locator("#hero-title").evaluate((node) => {
    const range = document.createRange();
    range.selectNodeContents(node);
    const selected = getSelection();
    selected.removeAllRanges();
    selected.addRange(range);
    return selected.toString();
  });
  expect(selection).toBe("SALVOR");
});

test("reduced motion leaves the wireframe static", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-burn-hero]")).toHaveAttribute("data-burn-state", "reduced");
  await context.close();
});
