import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`${width}px: both mockups hide scrollbar UI and still scroll`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.addStyleTag({ content: ".hero-phone, .floating-card { animation: none !important; } html { scroll-behavior: auto !important; }" });

    for (const model of [".hero-phone .phone", ".experience-phone-stage .phone"]) {
      const phone = page.locator(model);
      for (const tab of [1, 2, 0]) {
        // Keyboard activation also works where decorative desktop widgets overlap.
        const button = phone.locator(".phone-tabs button").nth(tab);
        await button.focus();
        await button.press("Enter");
        const content = phone.locator([".balance-card", ".timeline-view", ".plan-view"][tab]);
        await expect(content).toBeVisible();
        const view = phone.locator(".phone-view");
        const scrollbar = await view.evaluate(view => {
          const style = getComputedStyle(view);
          const webkit = getComputedStyle(view, "::-webkit-scrollbar");
          return {
            standard: style.scrollbarWidth,
            webkitDisplay: webkit.display,
            webkitWidth: webkit.width,
            gutter: style.scrollbarGutter,
          };
        });
        expect(scrollbar).toEqual({ standard: "none", webkitDisplay: "none", webkitWidth: "0px", gutter: "auto" });

        if (tab === 1) {
          await view.focus();
          await view.press("End");
          await expect.poll(() => view.evaluate(view => view.scrollTop)).toBeGreaterThan(0);
        }
      }
    }
  });
}
