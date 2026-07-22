import { defineConfig } from "@playwright/test";

const port = process.env.SALVOR_TEST_PORT || "4187";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: "site-browser.spec.mjs",
  fullyParallel: false,
  reporter: "line",
  timeout: 30_000,
  use: {
    baseURL,
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `python3 -m http.server ${port} -d site`,
    url: baseURL,
    reuseExistingServer: true,
  },
});
