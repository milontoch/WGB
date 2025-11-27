// Playwright configuration for E2E tests
import { defineConfig, devices } from "@playwright/test";

const PORT = parseInt(process.env.PORT || "3000");
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: process.env.CI
    ? [
        ["html", { outputFolder: "playwright-report" }],
        ["junit", { outputFile: "test-results/e2e-junit.xml" }],
        ["json", { outputFile: "test-results/e2e-results.json" }],
      ]
    : [["html"], ["list"]],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL,

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "retain-on-failure",

    // Maximum time each action can take
    actionTimeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Mobile viewports
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },

    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: process.env.CI
    ? {
        command: "npm run build && npm run start",
        port: PORT,
        timeout: 120 * 1000,
        reuseExistingServer: false,
      }
    : {
        command: "npm run dev",
        port: PORT,
        timeout: 120 * 1000,
        reuseExistingServer: true,
      },
});
