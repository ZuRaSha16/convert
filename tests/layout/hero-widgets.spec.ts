import { expect, test, type Page } from "@playwright/test";

async function prepare(page: Page, width = 1440, language = "en", theme = "light", pauseMotion = true) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript(({ language, theme }) => {
    localStorage.setItem("convert-language", language);
    localStorage.setItem("convert-theme", theme);
  }, { language, theme });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".hero-widget-reminder")).toHaveCSS("opacity", "1");
  if (pauseMotion) await page.addStyleTag({ content: ".hero-phone, .floating-card { animation-play-state: paused !important; }" });
}

async function offset(page: Page, kind: string) {
  return page.locator(`.hero-widget-${kind}`).evaluate(node => {
    const transform = getComputedStyle(node).transform;
    const matrix = new DOMMatrixReadOnly(transform === "none" ? undefined : transform);
    return { x: matrix.m41, y: matrix.m42 };
  });
}

test("widgets stay in place and expose no drag controls", async ({ page }) => {
  await prepare(page);
  await expect(page.locator(".widget-drag-handle,.widget-reset,.widget-move-hint")).toHaveCount(0);
  for (const kind of ["reminder", "progress"]) {
    const card = page.locator(`.hero-widget-${kind}`);
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + 30, box.y + 30);
    await page.mouse.down();
    await page.mouse.move(box.x - 70, box.y + 80, { steps: 8 });
    await page.mouse.up();
    expect(await offset(page, kind)).toEqual({ x: 0, y: 0 });
  }
});

test("reminder and breakdown actions give feedback without moving or resizing cards", async ({ page }) => {
  await prepare(page);
  const sizes = () => page.locator(".hero-widget-position").evaluateAll(nodes =>
    nodes.map(node => [(node as HTMLElement).offsetWidth, (node as HTMLElement).offsetHeight]));
  const original = await sizes();
  const reminder = page.locator(".widget-reminder-action");
  await reminder.click();
  await expect(reminder).toHaveAttribute("aria-pressed", "true");
  await expect(reminder).toHaveText("Reminder set");
  await reminder.click();
  await expect(reminder).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Show progress breakdown", exact: true }).click();
  await expect(page.locator(".widget-progress-action")).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("32% repaid · 68% to go", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Hide progress breakdown", exact: true }).click();
  await expect(page.getByText("32% repaid · 68% to go", { exact: true })).toBeHidden();
  expect(await sizes()).toEqual(original);
  expect(await offset(page, "reminder")).toEqual({ x: 0, y: 0 });
  expect(await offset(page, "progress")).toEqual({ x: 0, y: 0 });
});

test("idle motion and hover respect the live reduced-motion preference", async ({ page }, testInfo) => {
  await prepare(page, 1440, "en", "light", false);
  const surface = page.locator(".reminder-float");
  const reduced = testInfo.project.use.reducedMotion === "reduce";
  await expect(surface).toHaveCSS("animation-name", reduced ? "none" : "scene-card-jiggle");
  // Move the pointer directly: the idle float intentionally never becomes static.
  const box = (await surface.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(surface).toHaveCSS("scale", reduced ? "1" : "1.015");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(surface).toHaveCSS("animation-name", "none");
  await expect(surface).toHaveCSS("scale", "1");
  await expect(surface).toHaveCSS("transition-duration", "0s");

});

for (const language of ["en", "ka"]) {
  for (const theme of ["light", "dark"]) {
    test(`320px / ${language} / ${theme}: widgets stay readable and leave phone controls clear`, async ({ page }) => {
      await prepare(page, 320, language, theme);
      await page.addStyleTag({ content: ".hero-phone, .floating-card { animation: none !important; }" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
      const fit = await page.locator(".hero-widget-surface").evaluateAll(nodes => nodes.map(node => {
        const rect = node.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= innerWidth &&
          [...node.querySelectorAll<HTMLElement>(".widget-heading-copy,.widget-progress-detail,.widget-payment-row")]
            .every(text => text.scrollWidth <= text.clientWidth + 1);
      }));
      expect(fit).toEqual([true, true]);
      for (const tab of [1, 2, 0]) {
        await page.locator(".hero-phone .phone-tabs button").nth(tab).click();
      }
      await page.locator(".hero-phone .notification-button").click();

    });
  }
}
