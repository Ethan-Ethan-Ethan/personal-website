import { expect, test } from '@playwright/test';

test('opens, deep-links, minimizes, restores and closes workspace windows', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Your cozy corner/i })).toBeVisible();
  await expect(page.locator('.workspace-page')).toHaveAttribute('data-hydrated', 'true');
  await page.locator('.monitor-screen').getByRole('button', { name: 'Open Projects' }).click();
  await expect(page).toHaveURL(/#projects$/);
  const dialog = page.getByRole('dialog', { name: 'Projects' });
  await expect(dialog).toBeFocused();
  await expect(page.getByText('Personal Website').first()).toBeVisible();

  if (testInfo.project.name === 'desktop-chrome') {
    const before = await dialog.boundingBox();
    const titleBox = await dialog.locator('.window-titlebar').boundingBox();
    if (before && titleBox) {
      await page.mouse.move(titleBox.x + titleBox.width / 2, titleBox.y + 20);
      await page.mouse.down();
      await page.mouse.move(titleBox.x + titleBox.width / 2 + 80, titleBox.y + 70);
      await page.mouse.up();
      const after = await dialog.boundingBox();
      expect(after?.x).not.toBe(before.x);
    }
  }

  await dialog.getByRole('button', { name: 'Minimize Projects' }).click();
  await expect(dialog).toHaveCount(0);
  await page.locator('.workspace-dock').getByRole('button', { name: 'Open Projects' }).click();
  await expect(page.getByRole('dialog', { name: 'Projects' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Projects' })).toHaveCount(0);
  await expect(page).not.toHaveURL(/#projects$/);
});

test('history reconciles to the URL instead of leaving stale windows', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.workspace-page')).toHaveAttribute('data-hydrated', 'true');
  await page.locator('.monitor-screen').getByRole('button', { name: 'Open Projects' }).click();
  await page.evaluate(() => { window.location.hash = 'ai-lab'; });
  await expect(page.getByRole('dialog', { name: 'AI Lab' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog', { name: 'Projects' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'AI Lab' })).toHaveCount(0);
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('hidden dock cannot receive keyboard focus and closing after dock activation restores the scene launcher', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'Desktop focus restoration');
  await page.goto('/');
  const dock = page.locator('.workspace-dock');
  await expect(dock).toHaveAttribute('aria-hidden', 'true');
  await expect(dock).toHaveAttribute('inert', '');
  await expect(dock.locator('button').first()).toHaveAttribute('tabindex', '-1');

  const sceneLauncher = page.locator('.monitor-screen').getByRole('button', { name: 'Open Projects' });
  await sceneLauncher.click();
  const dialog = page.getByRole('dialog', { name: 'Projects' });
  await expect(dialog).toBeFocused();
  await dock.getByRole('button', { name: 'Open Projects' }).click();
  await dialog.getByRole('button', { name: 'Close Projects' }).click();

  await expect(sceneLauncher).toBeFocused();
  await expect(dock).toHaveAttribute('aria-hidden', 'true');
  expect(await dock.locator('button').evaluateAll((buttons) => buttons.every((button) => (button as HTMLButtonElement).tabIndex === -1))).toBe(true);
});

test('responsive workspace copy remains centered without an inherited translation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const copy = page.locator('.workspace-copy');
  await expect(copy).toHaveCSS('transform', 'none');
  const box = await copy.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.x).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(391);
});

test('mobile keeps keyboard focus inside the active dialog and makes the scene and dock inert', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome', 'Mobile stacking behavior');
  await page.goto('/');
  await page.locator('.monitor-screen').getByRole('button', { name: 'Open Projects' }).click();
  const dialog = page.getByRole('dialog', { name: 'Projects' });
  const sceneGuard = page.locator('.workspace-scene-guard');
  const dock = page.locator('.workspace-dock');
  await expect(dialog).toBeFocused();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(sceneGuard).toHaveAttribute('aria-hidden', 'true');
  await expect(sceneGuard).toHaveAttribute('inert', '');
  await expect(dock).toHaveAttribute('aria-hidden', 'true');
  await expect(dock).toHaveAttribute('inert', '');
  expect(await dock.locator('button').evaluateAll((buttons) => buttons.every((button) => (button as HTMLButtonElement).tabIndex === -1))).toBe(true);

  for (let step = 0; step < 16; step += 1) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  }
});

test('hash opens the correct window and content stays in viewport after resize', async ({ page }, testInfo) => {
  await page.goto('/#about');
  const dialog = page.getByRole('dialog', { name: 'About' });
  await expect(dialog).toBeVisible();
  if (testInfo.project.name === 'desktop-chrome') await page.setViewportSize({ width: 800, height: 700 });
  const box = await dialog.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  if (box && viewport) {
    expect(box.x).toBeLessThanOrEqual(viewport.width - 72 + 1);
    expect(box.x + box.width).toBeGreaterThanOrEqual(120);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeLessThanOrEqual(viewport.height - 48 + 1);
  }
  await dialog.getByRole('button', { name: 'Close About' }).click();
  await expect(dialog).toHaveCount(0);
});

test('content remains usable and fallback is marked when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'WebGLRenderingContext', { value: undefined, configurable: true });
  });
  await page.goto('/');
  await expect(page.locator('.workspace-page')).toHaveAttribute('data-hydrated', 'true');
  await expect(page.locator('.galaxy-canvas')).toHaveAttribute('data-webgl', 'fallback');
  await page.locator('.monitor-screen').getByRole('button', { name: 'Open AI Lab' }).click();
  await expect(page.getByRole('dialog', { name: 'AI Lab' })).toBeVisible();
  await expect(page.getByText('影片轉場分析器').first()).toBeVisible();
});

test('foreground occluders have a higher computed z-index than the animated sky', async ({ page }) => {
  await page.goto('/');
  const layers = await page.evaluate(() => ({
    stars: Number.parseInt(getComputedStyle(document.querySelector('.visible-starfield')!).zIndex, 10),
    computer: Number.parseInt(getComputedStyle(document.querySelector('.computer-foreground')!).zIndex, 10),
    plush: Number.parseInt(getComputedStyle(document.querySelector('.plush-reactor')!).zIndex, 10),
  }));
  expect(layers.computer).toBeGreaterThan(layers.stars);
  expect(layers.plush).toBeGreaterThan(layers.stars);
});

test('alpha foreground reveals the sky at transparent pixels and blocks it at real object silhouettes', async ({ page }, testInfo) => {
  await page.goto('/');
  const foreground = page.locator('.computer-foreground img');
  await expect(foreground).toBeVisible();
  const mobile = testInfo.project.name === 'mobile-chrome';
  const expectedFile = mobile ? 'workspace-mobile-foreground-alpha.webp' : 'workspace-foreground-alpha.webp';
  await expect.poll(() => foreground.evaluate((image: HTMLImageElement) => image.currentSrc)).toContain(expectedFile);
  await expect(foreground).toHaveCSS('object-fit', 'cover');
  await expect(foreground).toHaveCSS('object-position', mobile ? '50% 0%' : '50% 50%');

  const points = mobile
    ? { opaque: [[470, 900], [835, 930], [470, 1080]], transparent: [[470, 500], [700, 700], [300, 750]] }
    : { opaque: [[834, 500], [1480, 560], [800, 780]], transparent: [[800, 200], [1250, 400], [200, 300]] };
  const alpha = await foreground.evaluate(async (image: HTMLImageElement, samples) => {
    const response = await fetch(image.currentSrc, { cache: 'no-store' });
    const bitmap = await createImageBitmap(await response.blob());
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    context.drawImage(bitmap, 0, 0);
    const read = ([x, y]: number[]) => context.getImageData(x, y, 1, 1).data[3];
    return {
      size: [bitmap.width, bitmap.height],
      opaque: samples.opaque.map(read),
      transparent: samples.transparent.map(read),
    };
  }, points);
  expect(alpha.size).toEqual(mobile ? [940, 1672] : [1672, 941]);
  expect(alpha.opaque.every((value) => value >= 240)).toBe(true);
  expect(alpha.transparent.every((value) => value <= 8)).toBe(true);
});

test('reduced motion avoids downloading and initializing Three.js', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.workspace-page')).toHaveAttribute('data-hydrated', 'true');
  await expect(page.locator('.galaxy-canvas')).toHaveAttribute('data-webgl', 'reduced');
  await page.waitForTimeout(1200);
  expect(requests.some((url) => url.includes('three.module'))).toBe(false);
  const loopingSelectors = [
    '.plant-sway-left',
    '.plant-sway-right',
    '.plush-motion',
    '.plush-eye',
    '.scarf-tail',
    '.lamp-glow',
    '.warm-room-light',
    '.desk-reflection',
    '.room-dust i',
    '.visible-starfield i',
    '.shooting-star',
  ];
  const motion = await page.evaluate((selectors) => selectors.map((selector) => {
    const element = document.querySelector(selector);
    if (!element) return { selector, missing: true };
    const style = getComputedStyle(element);
    return {
      selector,
      missing: false,
      animationName: style.animationName,
      animationDuration: style.animationDuration,
      animationIterationCount: style.animationIterationCount,
    };
  }), loopingSelectors);
  for (const item of motion) {
    expect(item.missing, `${item.selector} should exist`).toBe(false);
    expect(item.animationName, `${item.selector} animation-name`).toBe('none');
    expect(item.animationDuration, `${item.selector} animation-duration`).toBe('0s');
    expect(item.animationIterationCount, `${item.selector} animation-iteration-count`).toBe('1');
  }
});

test('TradingView loads only after explicit consent and uses a restricted iframe', async ({ page }) => {
  await page.goto('/#trading-lab');
  const dialog = page.getByRole('dialog', { name: 'Trading Lab' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTitle('BTCUSDT market overview')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Load TradingView' }).click();
  const frame = dialog.getByTitle('BTCUSDT market overview');
  await expect(frame).toBeVisible();
  await expect(frame).toHaveAttribute('referrerpolicy', 'no-referrer');
  await expect(frame).toHaveAttribute('sandbox', /allow-scripts/);
});

test('hydration payload excludes private provenance fields', async ({ page }) => {
  await page.goto('/');
  expect(await page.content()).not.toContain('sourceHash');
  expect(await page.content()).not.toContain('site_visibility');
});

test('no-JavaScript fallback exposes direct content links', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.getByRole('heading', { name: 'Ethan Yang｜AI 系統創作者' })).toBeVisible();
  const fallback = page.getByRole('region', { name: '網站導覽' });
  await expect(fallback.getByRole('link', { name: 'Articles' })).toBeVisible();
  await expect(fallback.getByRole('link', { name: 'Trading Lab' })).toBeVisible();
  const appButtons = page.locator('.monitor-screen .app-button');
  await expect(appButtons).toHaveCount(4);
  expect(await appButtons.evaluateAll((buttons) => buttons.every((button) => (button as HTMLButtonElement).disabled))).toBe(true);
  await context.close();
});
