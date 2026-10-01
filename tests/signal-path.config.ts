import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "signal-path.spec.ts",
  workers: 1,
  timeout: 60000,
  outputDir: "../artifacts/signal-path/test-results",
  reporter: "list",
  use: {
    baseURL: process.env.AUDIT_URL || "http://localhost:3001",
    channel: "chrome",
    headless: true,
    trace: "retain-on-failure",
  },
});
