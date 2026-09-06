import { expect, test } from '@playwright/test';

// Pilot visual-regression gate for hero/foreground fusion (Task 2b).
//
// DORMANT BY DEFAULT: the hero scene is still awaiting user visual acceptance
// (see 01-Personal Website.md milestone "Foreground depth correction"), so a
// frozen baseline cannot be approved yet. The gate activates only when
// VISUAL_GATE=1 is set AND baselines exist. To activate after acceptance:
//   1. Get the hero scene user-approved.
//   2. Run: npm run test:e2e -- visual-fusion --update-snapshots  (with VISUAL_GATE=1)
//   3. Human-review the new baseline PNGs, then commit them.
//
// Pixel comparison only detects drift from the human-approved baseline; it
// does NOT judge aesthetics. Animated layers are frozen via addStyleTag
// because WebGL/CSS motion is nondeterministic across runs; occlusion LOGIC
// (z-index ordering, alpha silhouettes) is covered by workspace.spec.ts.
test('hero foreground fusion matches approved baseline', async ({ page }) => {
  test.skip(
    process.env.VISUAL_GATE !== '1',
    'Visual gate is dormant until the hero scene is user-accepted (set VISUAL_GATE=1 to enable)',
  );
  await page.goto('/');
  await expect(page.locator('.workspace-page')).toHaveAttribute('data-hydrated', 'true');
  const scene = page.locator('.monitor-screen');
  await expect(scene).toBeVisible();
  await page.addStyleTag({
    content: '* { animation: none !important; transition: none !important; caret-color: transparent !important; }',
  });
  await expect(scene).toHaveScreenshot('hero-fusion.png', {
    maxDiffPixels: 100,
    mask: [page.locator('.galaxy-canvas'), page.locator('.visible-starfield')],
  });
});
