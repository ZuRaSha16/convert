import { expect, test } from "@playwright/test";

test("all four feature cards have equal dimensions on desktop and mobile in both languages", async ({ page }) => {
  await page.goto("/");
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const language of ["en", "ka"]) {
      if (await page.locator("html").getAttribute("lang") !== language) await page.locator(".language-switch").click();
      await page.evaluate(() => document.fonts.ready);
      await page.locator(".feature-grid").scrollIntoViewIfNeeded();
      await expect.poll(() => page.locator(".feature-grid > .feature-card").evaluateAll(cards => {
        const sizes = cards.map(card => [card.clientWidth, card.clientHeight]);
        return sizes.length === 4 && sizes.every(([width, height]) => Math.abs(width - sizes[0][0]) <= 1 && Math.abs(height - sizes[0][1]) <= 1);
      }), { message: `${width}px / ${language}: equal card dimensions` }).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});
