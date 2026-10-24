import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { once } from "node:events";
import { chromium } from "@playwright/test";
import sharp from "sharp";

// Run after npm run build to refresh the share image from the real hero.
const port = 3101;
const origin = `http://localhost:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", String(port)], {
  windowsHide: true,
  stdio: "ignore",
});
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error("Preview server exited before becoming ready");
    try { ready = (await fetch(origin)).ok; } catch { /* Wait for startup. */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error("Preview server did not become ready");
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1560, height: 819 }, deviceScaleFactor: 2, colorScheme: "dark" });
  await page.addInitScript(() => {
    localStorage.setItem("convert-language", "en");
    localStorage.setItem("convert-theme", "dark");
  });
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      if (animation.effect?.getTiming().iterations === Infinity) {
        animation.currentTime = 0;
        animation.pause();
      }
    }
  });
  const screenshot = await page.screenshot({ animations: "allow" });
  await mkdir("public/social", { recursive: true });
  await sharp(screenshot).resize(1200, 630).png().toFile("public/social/convert-hero-dark.png");
  console.log("Updated public/social/convert-hero-dark.png from the actual dark hero.");
} finally {
  await browser?.close();
  if (server.exitCode === null) {
    const exited = once(server, "exit");
    server.kill();
    await exited;
  }
}
