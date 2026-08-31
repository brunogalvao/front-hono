import { defineConfig, devices } from 'playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173';
const authFile = 'e2e/.auth/user.json';

export default defineConfig({
  testDir: './e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['blob'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'auth-setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'mobile-320',
      testIgnore: /auth\.setup\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: authFile, viewport: { width: 320, height: 720 } },
    },
    {
      name: 'mobile-390',
      testIgnore: /auth\.setup\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: authFile, viewport: { width: 390, height: 844 } },
    },
    {
      name: 'tablet-768',
      testIgnore: /auth\.setup\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: authFile, viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop-chromium',
      testIgnore: /auth\.setup\.ts/,
      dependencies: ['auth-setup'],
      use: { ...devices['Desktop Chrome'], storageState: authFile },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev --host 127.0.0.1',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
