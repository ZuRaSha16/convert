import { defineConfig } from "@playwright/test";

const baseURL = process.env.LAYOUT_BASE_URL || "http://localhost:3100";

export default defineConfig({
  testDir: "./tests/layout",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: {
    baseURL,
    channel: "chrome",
    viewport: { width: 390, height: 900 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run start -- --port ${new URL(baseURL).port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "mobile-motion", use: { reducedMotion: "no-preference" } },
    { name: "mobile-reduced-motion", use: { reducedMotion: "reduce" } },
  ],
});
