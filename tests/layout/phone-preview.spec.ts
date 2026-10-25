import { expect, test } from "@playwright/test";

const models = [".hero-phone .phone", ".experience-phone-stage .phone"];
const views = [".balance-card", ".timeline-view", ".plan-view"];

test("desktop retains the original phone geometry with interactive widgets", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    localStorage.setItem("convert-language", "ka");
    localStorage.setItem("convert-theme", "light");
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ka");
  await page.evaluate(() => document.fonts.ready);
  const geometry = await page.locator(".phone,.hero-stage,.experience-grid").evaluateAll(elements => elements.map(element => {
    const node = element as HTMLElement;
    return [node.offsetWidth, node.offsetHeight];
  }));
  // Captured from the production build before the mobile-only fixes.
  expect(geometry).toEqual([[570, 730], [292, 660], [1280, 742], [320, 680]]);
  await expect(page.locator(".hero-widget-position")).toHaveCount(2);
  await expect(page.locator(".widget-drag-handle")).toHaveCount(0);
});

for (const width of [320, 375, 390, 430]) {
  for (const language of ["en", "ka"]) {
    for (const colorScheme of ["light", "dark"] as const) {
      test(`${width}px / ${language} / ${colorScheme}: both phones keep their dimensions`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme });
        await page.addInitScript(({ language, colorScheme }) => {
          localStorage.setItem("convert-language", language);
          localStorage.setItem("convert-theme", colorScheme);
        }, { language, colorScheme });
        await page.goto("/");
        await expect(page.locator("html")).toHaveAttribute("lang", language);
        await page.evaluate(() => document.fonts.ready);
        // Pause decorative floating only, so Playwright can target stable buttons.
        // React/Motion tab transitions remain enabled in the motion project.
        await page.addStyleTag({ content: ".hero-phone, .floating-card { animation: none !important; } html { scroll-behavior: auto !important; }" });

        const dimensions = () => page.locator(".phone").evaluateAll(phones => phones.map(phone => {
          const element = phone as HTMLElement;
          return [element.offsetWidth, element.offsetHeight];
        }));
        const initial = await dimensions();

        for (const model of models) {
          const phone = page.locator(model);
          // Visit Timeline first to reproduce the reported transition, then Plan and Overview.
          for (const tab of [1, 2, 0]) {
            await phone.locator(".phone-bottom-nav button").nth(tab).scrollIntoViewIfNeeded();
            const [samples] = await Promise.all([
              page.evaluate(async () => {
                const samples = [];
                const start = performance.now();
                do {
                  samples.push({
                    pageWidth: document.documentElement.scrollWidth,
                    phones: [...document.querySelectorAll<HTMLElement>(".phone")].map(phone => [phone.offsetWidth, phone.offsetHeight]),
                  });
                  await new Promise(requestAnimationFrame);
                } while (performance.now() - start < 800);
                return samples;
              }),
              phone.locator(".phone-bottom-nav button").nth(tab).click(),
            ]);
            await expect(phone.locator(views[tab])).toBeVisible();
            expect(samples.every(sample => sample.pageWidth <= width), "No horizontal page overflow during the transition").toBe(true);
            expect(samples.every(sample => JSON.stringify(sample.phones) === JSON.stringify(initial)), "Neither phone changes width or height during the transition").toBe(true);

            const layout = await phone.evaluate(phone => {
              const view = phone.querySelector<HTMLElement>(".phone-view")!;
              const content = phone.querySelector<HTMLElement>(".phone-content")!;
              const rect = phone.getBoundingClientRect();
              return {
                viewFits: view.scrollWidth <= view.clientWidth + 1,
                contentFits: content.scrollWidth <= content.clientWidth + 1,
                frameFits: rect.left >= -1 && rect.right <= innerWidth + 1,
              };
            });
            expect(layout, `${model}, tab ${tab}`).toEqual({ viewFits: true, contentFits: true, frameFits: true });

            if (language === "ka" && colorScheme === "light" && testInfo.project.name === "mobile-reduced-motion") {
              await phone.screenshot({ path: testInfo.outputPath(`${model.includes("hero") ? "hero" : "experience"}-${tab}.png`) });
            }
          }
          // Long detail text and reminder banners must also remain inside the frame.
          await phone.locator(".obligation").first().click();
          await phone.locator(".notification-button").click();
          expect(await dimensions()).toEqual(initial);
          expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
          const fits = await phone.locator(".phone-view").evaluate(view => view.scrollWidth <= view.clientWidth + 1);
          expect(fits).toBe(true);
        }
      });
    }
  }
}
