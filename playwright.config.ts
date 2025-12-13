import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 600000, // 10 minutes for CI (Electron launch can be slow)
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0, // Disabled retries to see errors faster
  workers: 1,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
