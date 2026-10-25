import { readFile, mkdir, writeFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { chromium } from "@playwright/test";

const source = await readFile(new URL("../lib/welcome-email.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const context = { exports: {}, URL };
runInNewContext(compiled, context);
const logo = await readFile(new URL("../public/icon.png", import.meta.url));
const output = new URL("../artifacts/welcome-email/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const language of ["en", "ka"]) {
    const { html } = context.exports.buildWelcomeEmail(language, "https://convert-ten-roan.vercel.app");
    // Inline the existing logo for a self-contained local preview, with no network requests.
    const preview = html.replace(/https:\/\/convert-ten-roan.vercel.app\/icon.png/g,
      `data:image/png;base64,${logo.toString("base64")}`);
    await writeFile(new URL(`${language}.html`, output), preview);
    for (const width of [640, 375]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      await page.setContent(preview);
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) {
        throw new Error(`Email overflows at ${width}px (${language})`);
      }
      await page.screenshot({ path: fileURLToPath(new URL(`${language}-${width}.png`, output)), fullPage: true });
      await page.close();
    }
  }
} finally {
  await browser.close();
}
console.log("Created English and Georgian welcome email previews in artifacts/welcome-email.");
