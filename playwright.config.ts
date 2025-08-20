import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    extraHTTPHeaders: (process.env.E2E_AUTH_BYPASS_USER_ID
      ? { 'x-user-id': process.env.E2E_AUTH_BYPASS_USER_ID }
      : {}),
  },
  webServer: process.env.E2E_WEB_SERVER === 'false' ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      E2E_AUTH_BYPASS_USER_ID: process.env.E2E_AUTH_BYPASS_USER_ID || '00000000-0000-0000-0000-000000000000',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});


