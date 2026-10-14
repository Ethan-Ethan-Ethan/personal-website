import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL;
const ownerPid = process.env.E2E_SERVER_PID;
const ownedServer = process.env.E2E_SERVER_OWNED === '1';

// D4 凍結隔離：WorkspaceDesktop 停用分支 specs 預設不跑，避免假紅污染 gate；
// 另案重啟時以 E2E_INCLUDE_LEGACY=1 跑全量（見 plan/homepage-hero-ethan-image.md D4）。
const LEGACY_SPECS = [
  '**/workspace.spec.ts',
  '**/visual-fusion.spec.ts',
  '**/hotspot-popover.spec.ts',
  '**/theme-switch.spec.ts',
];

if (!ownedServer || !baseURL || !ownerPid) {
  throw new Error('test:e2e:raw is internal-only: run npm run test:e2e so an owned server is started, verified ready, and cleaned up.');
}

export default defineConfig({
  testDir: './verification/e2e',
  testIgnore: process.env.E2E_INCLUDE_LEGACY === '1' ? [] : LEGACY_SPECS,
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
