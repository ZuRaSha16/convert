import { expect, test } from "@playwright/test";

test("first phone stays anchored on scroll and eases back after hover", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const phone = page.locator(".hero-phone");
  await expect(phone).toHaveCSS("opacity", "1");
  // Freeze only the decorative bob to isolate any movement tied to scrolling.
  await page.addStyleTag({ content: ".hero-phone { animation-play-state: paused !important; } html { scroll-behavior: auto !important; }" });
  await page.mouse.move(0, 0);
  const positionInSection = () => phone.evaluate(phone => phone.getBoundingClientRect().top - phone.parentElement!.getBoundingClientRect().top);
  const original = await positionInSection();
  const appearance = await phone.evaluate(phone => {
    const style = getComputedStyle(phone);
    return { rotate: style.rotate, animation: style.animationName };
  });
  if (testInfo.project.name === "mobile-motion") {
    expect(appearance.animation).toBe("scene-phone-float");
    expect(parseFloat(appearance.rotate)).toBeGreaterThanOrEqual(-8.25);
    expect(parseFloat(appearance.rotate)).toBeLessThanOrEqual(-5.75);
  } else {
    expect(appearance.rotate).toBe("-7deg");
  }

  for (const y of [100, 300, 0]) {
    await page.evaluate(y => window.scrollTo(0, y), y);
    await expect.poll(async () => Math.abs(await positionInSection() - original)).toBeLessThan(1);
  }

  const transform = () => phone.evaluate(phone => getComputedStyle(phone).transform);
  await expect.poll(transform).toBe("none");
  await phone.hover({ position: { x: 140, y: 280 } });
  if (testInfo.project.name === "mobile-motion") {
    await expect.poll(transform).not.toBe("none");
  } else {
    await expect.poll(transform).toBe("none");
  }
  await page.mouse.move(0, 0);
  await expect.poll(transform).toBe("none");
  await expect.poll(async () => Math.abs(await positionInSection() - original)).toBeLessThan(1);
});
