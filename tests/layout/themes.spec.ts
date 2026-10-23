import { expect, test, type Page } from "@playwright/test";

const themes = [
  { id: "dark", label: "Dark", color: "rgb(17, 27, 44)", hex: "#111b2c", scene: "#101f31" },
  { id: "light", label: "Light", color: "rgb(245, 239, 223)", hex: "#f5efdf", scene: "#e7edda" },
];

async function chooseTheme(page: Page, id: string) {
  const toggle = page.locator(".theme-toggle");
  const current = await page.locator("html").getAttribute("data-theme");
  await expect(toggle).toHaveAttribute("aria-pressed", String(current === "dark"));
  if (current !== id) await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", id);
}

async function contrastFailures(page: Page, selectors: string) {
  return page.locator(selectors).evaluateAll(elements => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const rgba = (color: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data];
    };
    const over = (front: number[], back: number[]) => front.slice(0, 3).map((n, i) => n * front[3] / 255 + back[i] * (1 - front[3] / 255));
    const luminance = (rgb: number[]) => rgb.slice(0, 3).map(n => {
      const value = n / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
    const scene = getComputedStyle(document.documentElement).getPropertyValue("--scene-end");
    return elements.filter(element => element.getClientRects().length).flatMap(element => {
      const chain: Element[] = [];
      for (let node: Element | null = element; node && node !== document.body; node = node.parentElement) chain.unshift(node);
      let background = rgba(scene);
      for (const node of chain) background = over(rgba(getComputedStyle(node).backgroundColor), background);
      const style = getComputedStyle(element);
      const foreground = over(rgba(style.color), background);
      const a = luminance(foreground), b = luminance(background);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
      return ratio >= (large ? 3 : 4.5) ? [] : [{ element: element.className, ratio: ratio.toFixed(2) }];
    });
  });
}

test("one icon toggle switches between blue Dark and cream Light and saves the choice", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await page.addStyleTag({ content: ".hero-phone, .floating-card { animation: none !important; }" });
  const toggle = page.getByRole("button", { name: "Dark mode", exact: true });
  await expect(toggle).toHaveCount(1);
  await expect(toggle).toHaveText("");
  await expect(toggle.locator("svg")).toHaveCount(2);
  await expect(page.locator(".theme-menu,.theme-swatch,.theme-selector,.theme-buttons,.theme-button")).toHaveCount(0);
  await page.locator(".hero-phone .phone-tabs button").nth(2).click();
  const geometry = () => page.locator(".phone,.hero-stage,.site-header").evaluateAll(nodes => nodes.map(node => [(node as HTMLElement).offsetWidth, (node as HTMLElement).offsetHeight]));
  const before = await geometry();

  for (const theme of themes) {
    await chooseTheme(page, theme.id);
    await expect(toggle).toHaveAttribute("aria-pressed", String(theme.id === "dark"));
    await expect(toggle).toHaveAttribute("title", theme.id === "dark" ? "Switch to light theme" : "Switch to dark theme");
    await expect(toggle.locator(`[data-mode="${theme.id}"]`)).toHaveAttribute("data-active", "true");
    await expect(toggle.locator('[data-active="true"]')).toHaveCount(1);
    await expect(page.locator("body")).toHaveCSS("background-color", theme.color);
    await expect(page.locator("html")).toHaveCSS("color-scheme", theme.id);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", theme.hex);
    await expect(page.locator(".hero-phone .plan-view")).toBeVisible();
    expect(await geometry()).toEqual(before);
    await expect(page.locator(".site-header .brand-period")).toHaveCSS("color", "rgb(110, 231, 183)");
    expect(await page.locator(".site-atmosphere").evaluate(node => getComputedStyle(node).getPropertyValue("--scene-end").trim())).toBe(theme.scene);
    const selectors = ".theme-mode-icon, h1, .hero-description, .pill-eyebrow, .desktop-nav, .hero-actions .glow-control, .hero-stage .widget-eyebrow, .floating-card strong, .feature-card > p, .notification-demo p, .planned-badge, .phone-tabs button, .phone-note, .plan-insight, .balance-top, .balance-bottom > span, .phone-bottom-nav button, .consent, .form-footnote, .footer-top p, .footer-bottom, .step p, .trust-principles p, .faq-item p, .email-field input";
    expect(await contrastFailures(page, selectors), theme.id).toEqual([]);
    await page.locator(".consent button").click();
    await expect(page.locator(".privacy-dialog")).toBeVisible();
    expect(await contrastFailures(page, ".privacy-dialog p,.privacy-dialog .button"), `${theme.id} privacy dialog`).toEqual([]);
    await page.locator(".dialog-close").click();
  }

  for (const theme of themes) {
    await chooseTheme(page, theme.id);
    expect(await page.evaluate(() => localStorage.getItem("convert-theme"))).toBe(theme.id);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme.id);
    await expect(toggle).toHaveAttribute("aria-pressed", String(theme.id === "dark"));
    const otherVisit = await page.context().newPage();
    await otherVisit.goto("/");
    await expect(otherVisit.locator("html")).toHaveAttribute("data-theme", theme.id);
    await otherVisit.close();
  }
  expect(errors).toEqual([]);
});

for (const [saved, id, color] of [
  ["dark", "dark", "#111b2c"], ["light", "light", "#f5efdf"],
  ["navy", "dark", "#111b2c"], ["cream", "light", "#f5efdf"], ["green", "dark", "#111b2c"],
]) {
  test(`saved ${saved} preference resolves to ${id} before React loads`, async ({ page }) => {
    await page.addInitScript(saved => localStorage.setItem("convert-theme", saved), saved);
    await page.route("**/_next/static/**/*.js*", route => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", id);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", color);
    expect(await page.evaluate(() => localStorage.getItem("convert-theme"))).toBe(id);
  });
}

for (const width of [320, 390, 1024]) {
  test(`${width}px: icon toggle fits in English and Georgian and supports keyboard activation`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    for (const language of ["en", "ka"]) {
      if (language === "ka") await page.getByRole("button", { name: "Switch to Georgian" }).click();
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      await chooseTheme(page, "light");
      for (const [id, key] of [["dark", "Enter"], ["light", "Space"]]) {
        const button = page.locator(".theme-toggle");
        await button.focus();
        await button.press(key);
        await expect(page.locator("html")).toHaveAttribute("data-theme", id);
        await expect(button).toBeFocused();
        await expect(button).toHaveAttribute("aria-pressed", String(id === "dark"));
      }
      const layout = await page.locator(".nav-container").evaluate(nav => {
        const items = [...nav.querySelectorAll<HTMLElement>(".brand,.theme-toggle,.language-switch,.menu-toggle,.nav-cta,.desktop-nav")]
          .filter(node => getComputedStyle(node).display !== "none").map(node => node.getBoundingClientRect());
        return {
          fits: items.every(rect => rect.left >= 0 && rect.right <= innerWidth),
          separated: items.every((rect, i) => items.every((other, j) => i === j || rect.right <= other.left || other.right <= rect.left)),
          pageFits: document.documentElement.scrollWidth <= innerWidth,
        };
      });
      expect(layout).toEqual({ fits: true, separated: true, pageFits: true });
    }
  });
}

test("system preference and other tabs sync without overriding an explicit choice", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.setItem("convert-theme", "invalid"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await chooseTheme(page, "dark");
  await chooseTheme(page, "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const other = await page.context().newPage();
  await other.goto("/");
  await chooseTheme(other, "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await other.close();
});

test("icon toggle works when browser storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("Storage unavailable"); };
    Storage.prototype.setItem = () => { throw new Error("Storage unavailable"); };
  });
  await page.goto("/");
  await chooseTheme(page, "dark");
  await chooseTheme(page, "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await chooseTheme(page, "dark");
});
