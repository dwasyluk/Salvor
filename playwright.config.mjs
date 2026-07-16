import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "site-browser.spec.mjs",
  fullyParallel: false,
  reporter: "line",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "python3 -m http.server 4173 -d site",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
