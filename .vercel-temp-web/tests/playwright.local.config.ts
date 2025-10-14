import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '../tests/e2e',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  use: {
    baseURL: process.env.PW_BASE_URL ?? 'http://127.0.0.1:3000',
    headless: true,
  },
  // Intentionally do NOT configure webServer here — assumes a dev server
  // is already running at baseURL. Use this config for local runs.
})
