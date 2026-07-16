import { expect, test } from "@playwright/test";

const viewports = [
  ["desktop", { width: 1440, height: 1000 }],
  ["tablet", { width: 768, height: 1024 }],
  ["phone", { width: 390, height: 844 }],
  ["narrow", { width: 320, height: 568 }],
];

for (const [name, viewport] of viewports) {
  test(`${name} renders without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("SALVOR");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("mobile navigation is real and keyboard accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open menu" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "USE", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("the burn starts on the hero background without stealing text or links", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const hero = page.locator("[data-burn-hero]");
  await expect(hero).toHaveAttribute("data-burn-state", "ready");
  const box = await hero.boundingBox();
  await page.mouse.click(box.x + box.width * 0.82, box.y + box.height * 0.42);
  await expect(hero).toHaveAttribute("data-burn-state", "burning");
  const selection = await page.locator("h1").evaluate((node) => {
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
