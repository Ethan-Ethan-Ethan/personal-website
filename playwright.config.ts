import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL;
const ownerPid = process.env.E2E_SERVER_PID;
const ownedServer = process.env.E2E_SERVER_OWNED === '1';

if (!ownedServer || !baseURL || !ownerPid) {
  throw new Error('test:e2e:raw is internal-only: run npm run test:e2e so an owned server is started, verified ready, and cleaned up.');
}

export default defineConfig({
  testDir: './verification/e2e',
  timeout: 30_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ]
});
