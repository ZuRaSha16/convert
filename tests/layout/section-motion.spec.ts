import { expect, test, type Page } from "@playwright/test";

async function prepare(page: Page, width: number) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript(() => {
    localStorage.setItem("convert-language", "ka");
    localStorage.setItem("convert-theme", "light");
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".hero-phone")).toHaveCSS("opacity", "1");
  await page.addStyleTag({ content: ".hero-phone, .floating-card { animation: none !important; }" });
}

async function navLink(page: Page, hash: string) {
  if (hash === "#home") return page.locator(".site-header .brand");
  const desktop = page.locator(`.desktop-nav a[href='${hash}']`);
  if (await desktop.isVisible()) return desktop;
  await page.locator(".menu-toggle").click();
  await expect(page.locator(".mobile-nav")).toHaveCSS("opacity", "1");
  return page.locator(`.mobile-nav a[href='${hash}']`);
}

for (const width of [320, 390, 1440]) {
  test(`${width}px: section navigation and browser history keep direction and geometry`, async ({ page }, testInfo) => {
    await prepare(page, width);
    const reduced = testInfo.project.name === "mobile-reduced-motion";
    const geometry = () => page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      sections: [...document.querySelectorAll<HTMLElement>("main > section")].map(section => [section.offsetTop, section.offsetHeight]),
    }));
    const original = await geometry();

    for (const [hash, direction] of [["#features", 1], ["#how-it-works", 1], ["#home", -1]] as const) {
      const link = await navLink(page, hash);
      await link.focus();
      const [samples] = await Promise.all([
        page.evaluate(async hash => {
          const section = document.querySelector<HTMLElement>(hash)!;
          const content = section.querySelector<HTMLElement>(":scope > .container")!;
          const samples = [];
          const start = performance.now();
          do {
            const transform = getComputedStyle(content).transform;
            samples.push({
              y: transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42,
              width: document.documentElement.scrollWidth,
              height: document.documentElement.scrollHeight,
              sections: [...document.querySelectorAll<HTMLElement>("main > section")].map(section => [section.offsetTop, section.offsetHeight]),
            });
            await new Promise(requestAnimationFrame);
          } while (performance.now() - start < 600);
          return samples;
        }, hash),
        link.press("Enter"),
      ]);
      await expect(page).toHaveURL(new RegExp(`${hash}$`));
      await expect(page.locator(hash)).toHaveAttribute("data-motion-direction", String(direction));
      expect(samples.every(sample => sample.width <= width && sample.height === original.height)).toBe(true);
      expect(samples.every(sample => JSON.stringify(sample.sections) === JSON.stringify(original.sections))).toBe(true);
      expect(Math.abs(samples.at(-1)!.y)).toBeLessThan(0.1);
      if (reduced) expect(samples.every(sample => sample.y === 0)).toBe(true);
      else expect(samples.some(sample => sample.y * direction > 0.5)).toBe(true);
      expect(await geometry()).toEqual(original);
      expect(await page.locator(hash).evaluate(section => document.activeElement === section)).toBe(true);
      if (width <= 390) await expect(page.locator("#mobile-nav")).toHaveCount(0);
    }

    // Back goes from Home to How it works; forward returns toward Home.
    await page.goBack();
    await expect(page).toHaveURL(/#how-it-works$/);
    await expect(page.locator("#how-it-works")).toHaveAttribute("data-motion-direction", "1");
    await expect.poll(() => page.locator("#how-it-works").evaluate(section => Math.round(section.getBoundingClientRect().top)))
      .toBeLessThan(100);
    await page.goForward();
    await expect(page).toHaveURL(/#home$/);
    await expect(page.locator("#home")).toHaveAttribute("data-motion-direction", "-1");
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    expect(await geometry()).toEqual(original);
  });

  test(`${width}px: app views slide in both directions without blank frames or resizing`, async ({ page }, testInfo) => {
    await prepare(page, width);
    const reduced = testInfo.project.name === "mobile-reduced-motion";
    for (const model of [".hero-phone .phone", ".experience-phone-stage .phone"]) {
      const phone = page.locator(model);
      for (const [index, name, direction] of [[1, "timeline", 1], [2, "plan", 1], [0, "overview", -1]] as const) {
        const button = phone.locator(".phone-bottom-nav button").nth(index);
        await button.focus();
        const [samples] = await Promise.all([
          phone.evaluate(async (phone, name) => {
            const samples = [];
            const start = performance.now();
            do {
              const active = phone.querySelector<HTMLElement>(`.phone-view[data-preview-tab='${name}'][aria-hidden='false']`);
              const transform = active ? getComputedStyle(active).transform : "none";
              const panels = [...phone.querySelectorAll<HTMLElement>(".phone-view")];
              samples.push({
                x: transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m41,
                size: [(phone as HTMLElement).offsetWidth, (phone as HTMLElement).offsetHeight],
                pageWidth: document.documentElement.scrollWidth,
                opacity: panels.reduce((sum, panel) => sum + Number(getComputedStyle(panel).opacity), 0),
                exitingSafe: panels.filter(panel => panel.getAttribute("aria-hidden") === "true").every(panel => panel.inert && panel.tabIndex === -1),
              });
              await new Promise(requestAnimationFrame);
            } while (performance.now() - start < 550);
            return samples;
          }, name),
          button.press("Enter"),
        ]);
        expect(samples.every(sample => JSON.stringify(sample.size) === JSON.stringify(samples[0].size))).toBe(true);
        expect(samples.every(sample => sample.pageWidth <= width && sample.opacity > 0.2 && sample.exitingSafe)).toBe(true);
        if (reduced) expect(samples.every(sample => sample.x === 0)).toBe(true);
        else expect(samples.some(sample => sample.x * direction > 0.5)).toBe(true);
        await expect(phone.locator(".phone-view")).toHaveCount(1);
        await expect(phone.locator(".phone-view")).toHaveAttribute("data-preview-tab", name);
        await expect(phone.locator(".phone-view-stage")).toHaveAttribute("data-motion-direction", String(direction));
      }
    }

    const external = page.locator(".experience-tabs .experience-tab").nth(2);
    await external.focus();
    await external.press("Enter");
    const phone = page.locator(".experience-phone-stage .phone");
    const range = phone.locator("input[type='range']");
    await range.focus();
    await range.press("End");
    await expect(range).toHaveValue("1500");
    await expect(phone.locator(".plan-ring strong")).toHaveText("3");
    await phone.locator(".phone-bottom-nav button").nth(0).focus();
    await phone.locator(".phone-bottom-nav button").nth(0).press("Enter");
    await expect(phone.locator(".phone-view-stage")).toHaveAttribute("data-motion-direction", "-1");
    await expect(page.locator(".experience-tabs .experience-tab").nth(0)).toHaveAttribute("aria-pressed", "true");
    await expect(phone.locator(".phone-view")).toHaveCount(1);
  });

  test(`${width}px: rapid tab reversals settle on the latest view`, async ({ page }) => {
    await prepare(page, width);
    const original = await page.locator(".phone").evaluateAll(phones => phones.map(phone => [
      (phone as HTMLElement).offsetWidth,
      (phone as HTMLElement).offsetHeight,
    ]));

    // Reverse before an entrance has finished, including returning to a view
    // whose exit is still running. Buttons stay usable throughout the sequence.
    for (const model of [".hero-phone .phone", ".experience-phone-stage .phone"]) {
      const phone = page.locator(model);
      await phone.evaluate(async phone => {
        const buttons = phone.querySelectorAll<HTMLButtonElement>(".phone-bottom-nav button");
        for (const index of [1, 2, 0, 2, 1]) {
          buttons[index].click();
          await new Promise(resolve => setTimeout(resolve, 45));
        }
      });
      await expect(phone.locator(".phone-view")).toHaveCount(1);
      await expect(phone.locator(".phone-view")).toHaveAttribute("data-preview-tab", "timeline");
      await expect(phone.locator(".phone-view")).toHaveAttribute("aria-hidden", "false");
      await expect(phone.locator(".phone-view")).toHaveCSS("opacity", "1");
      const view = phone.locator(".phone-view");
      await view.focus();
      await view.press("End");
      await expect.poll(() => view.evaluate(view => view.scrollTop)).toBeGreaterThan(0);
    }
    expect(await page.locator(".phone").evaluateAll(phones => phones.map(phone => [
      (phone as HTMLElement).offsetWidth,
      (phone as HTMLElement).offsetHeight,
    ]))).toEqual(original);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test("enabling reduced motion during navigation immediately stops entrances", async ({ page }) => {
  await prepare(page, 390);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const link = await navLink(page, "#features");
  await link.click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#features")).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.getAnimations()
    .filter(animation => animation.id.startsWith("convert-entry")).length)).toBe(0);

  const phone = page.locator(".experience-phone-stage .phone");
  await phone.locator(".phone-bottom-nav button").nth(2).focus();
  await phone.locator(".phone-bottom-nav button").nth(2).press("Enter");
  await expect(phone.locator(".phone-view")).toHaveCount(1);
  await expect(phone.locator(".phone-view")).toHaveCSS("transform", "none");
  await expect(phone.locator(".phone-view")).toHaveCSS("opacity", "1");
  expect(await page.locator("[data-motion-item]").evaluateAll(items => items.every(item => {
    const style = getComputedStyle(item);
    return style.opacity === "1" && style.translate === "none";
  }))).toBe(true);
});
