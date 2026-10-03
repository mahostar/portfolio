import { defineConfig } from "@playwright/test";

const previewURL = process.env.PREVIEW_URL;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "artifacts/playwright-report" }]],
  outputDir: "artifacts/test-results",
  use: { baseURL: previewURL || "http://localhost:3000", channel: process.env.PLAYWRIGHT_CHANNEL || "chrome", headless: true, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: previewURL ? undefined : { command: "pnpm dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120000 },
});
