import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — E2E do RC Bible.
 *
 * Pré-requisito: `supabase start` local ativo (ver e2e/README.md).
 * As specs em e2e/*.spec.ts NÃO são executadas pelo Vitest — o `include`
 * do vitest.config.ts está restrito a src/** e reforçado com `exclude: ["e2e/**"]`.
 */
export default defineConfig({
  testDir: "e2e",
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  webServer: {
    command: "bun run dev",
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
