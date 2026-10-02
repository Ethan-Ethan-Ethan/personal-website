import { expect, test } from '@playwright/test';
import sharp from 'sharp';

test('opens, deep-links, minimizes, restores and closes workspace windows', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Your cozy corner/i })).toBeVisible();
  await expect(page.locator('.workspace-page')).toHaveAttribute('data-hydrated', 'true');
  await page.evaluate(() => { window.location.hash = 'projects'; });
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
  await page.evaluate(() => { window.location.hash = 'projects'; });
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

  const sceneLauncher = page.locator('.monitor-screen').getByRole('button', { name: 'Preview Projects from monitor' });
  await page.evaluate(() => { window.location.hash = 'projects'; });
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

test('desktop and tablet preserve the full room composition without horizontal cover cropping', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'Desktop asset composition check');
  await page.setViewportSize({ width: 808, height: 771 });
  await page.goto('/');
  const scene = page.locator('.workspace-scene');
  const box = await scene.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.width ?? 0) / (box?.height ?? 1)).toBeCloseTo(1672 / 941, 2);
  await expect(scene).toHaveCSS('background-size', '100% 100%');
  expect(box?.height).toBeLessThan(500);
});

test('workspace brand is hidden without removing direct routes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'Desktop hidden-header regression check');
  await page.setViewportSize({ width: 808, height: 771 });
  await page.goto('/');
  const brand = page.locator('.workspace-brand');
  await expect(brand).toHaveCSS('display', 'none');
  await expect(brand.locator('a[href="/articles/"]')).toHaveCount(1);
  await expect(brand.locator('a[href="/resume"]')).toHaveCount(1);
  expect((await page.request.get('/articles/')).ok()).toBe(true);
  expect((await page.request.get('/resume')).ok()).toBe(true);
});

test('narrow desktop with a fine pointer keeps the full room instead of entering mobile composition', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'Narrow desktop regression uses a fine pointer');
  await page.setViewportSize({ width: 660, height: 771 });
  await page.goto('/');
  expect(await page.evaluate(() => matchMedia('(pointer: fine)').matches)).toBe(true);
  const scene = page.locator('.workspace-scene');
  const sceneBox = await scene.boundingBox();
  expect(sceneBox).not.toBeNull();
  expect((sceneBox?.width ?? 0) / (sceneBox?.height ?? 1)).toBeCloseTo(1672 / 941, 2);
  expect(sceneBox?.height).toBeLessThan(500);
  await expect(scene).toHaveCSS('background-size', '100% 100%');
  await expect(page.locator('.monitor-shell')).toHaveCSS('position', 'absolute');
  await expect(page.locator('.plush-motion')).toHaveCSS('position', 'absolute');
  await expect.poll(() => page.locator('.computer-foreground img').evaluate((image: HTMLImageElement) => image.currentSrc))
    .toMatch(/foreground-occluder-v3\.webp/);
  await page.evaluate(() => { window.location.hash = 'projects'; });
  const dialog = page.getByRole('dialog', { name: 'Projects' });
  await expect(dialog).not.toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('.workspace-scene-guard')).not.toHaveAttribute('aria-hidden', 'true');
  expect(await page.locator('.workspace-scene-guard').evaluate((guard) => guard.hasAttribute('inert'))).toBe(false);
  await expect(page.locator('.workspace-dock')).not.toHaveClass(/is-blocked/);
  const beforeDrag = await dialog.boundingBox();
  const titlebar = await dialog.locator('.window-titlebar').boundingBox();
  expect(beforeDrag).not.toBeNull();
  expect(titlebar).not.toBeNull();
  await page.mouse.move((titlebar?.x ?? 0) + 160, (titlebar?.y ?? 0) + 20);
  await page.mouse.down();
  await page.mouse.move((titlebar?.x ?? 0) + 195, (titlebar?.y ?? 0) + 45);
  await page.mouse.up();
  const afterDrag = await dialog.boundingBox();
  expect(afterDrag?.x).not.toBe(beforeDrag?.x);
  expect(afterDrag?.y).not.toBe(beforeDrag?.y);
});

test('touch viewport between 521 and 767 pixels keeps the mobile composition', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome', 'Touch breakpoint regression uses the mobile project');
  await page.setViewportSize({ width: 660, height: 771 });
  await page.goto('/');
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  const scene = page.locator('.workspace-scene');
  const sceneBox = await scene.boundingBox();
  expect(sceneBox).not.toBeNull();
  expect(sceneBox?.height).toBeCloseTo(771, 0);
  await expect(scene).toHaveCSS('background-size', 'cover');
  await expect.poll(() => page.locator('.computer-foreground img').evaluate((image: HTMLImageElement) => image.currentSrc))
    .toMatch(/foreground-occluder-mobile-v3\.webp/);
});

test('mobile keeps keyboard focus inside the active dialog and makes the scene and dock inert', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome', 'Mobile stacking behavior');
  await page.goto('/');
  await page.evaluate(() => { window.location.hash = 'projects'; });
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

test('content remains usable when WebGL is unavailable because the hero uses CSS sky effects', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'WebGLRenderingContext', { value: undefined, configurable: true });
  });
  await page.goto('/');
  await expect(page.locator('.workspace-page')).toHaveAttribute('data-hydrated', 'true');
  await expect(page.locator('.galaxy-canvas')).toHaveCount(0);
  await expect(page.locator('.visible-starfield')).toHaveCount(1);
  await page.evaluate(() => { window.location.hash = 'ai-lab'; });
  await expect(page.getByRole('dialog', { name: 'AI Lab' })).toBeVisible();
  await expect(page.getByText('影片轉場分析器').first()).toBeVisible();
});


test('CSS stars and the shooting star stay inside the approved image-masked window without a solid overlay', async ({ page }) => {
  await page.goto('/');
  const aperture = page.locator('.sky-aperture');
  await expect(aperture).toHaveCount(1);
  await expect(aperture.locator('.galaxy-window')).toHaveCount(0);
  await expect(aperture.locator('.galaxy-canvas')).toHaveCount(0);
  await expect(aperture.locator('.space-backdrop')).toHaveCount(0);
  await expect(aperture.locator('.visible-starfield')).toHaveCount(1);
  await expect(aperture.locator('.shooting-star')).toHaveCount(1);
  await expect(aperture).toHaveCSS('opacity', '1');
  await expect(aperture).toHaveCSS('mix-blend-mode', 'normal');
  await expect(aperture).toHaveCSS('background-image', 'none');
  const pseudo = await page.locator('.workspace-scene').evaluate((scene) => ({
    before: getComputedStyle(scene, '::before').display,
    after: getComputedStyle(scene, '::after').display,
  }));
  expect(pseudo).toEqual({ before: 'none', after: 'none' });
  await expect(page.locator('.scene-vignette,.warm-room-light,.desk-reflection,.room-dust,.lamp-glow,.plant-sway')).toHaveCount(0);
});

test('meteor runtime trajectory stays down-left and keeps its thin head in front', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'Meteor direction regression uses the desktop scene');
  await page.goto('/');
  const details = await page.locator('.shooting-star').evaluate((meteor) => {
    const animation = meteor.getAnimations()[0];
    const keyframes = animation?.effect?.getKeyframes() ?? [];
    const scene = meteor.closest('.workspace-scene')?.getBoundingClientRect();
    const incompletePositionFrames: number[] = [];
    const points = keyframes.flatMap((frame) => {
      const hasTop = frame.top !== undefined;
      const hasRight = frame.right !== undefined;
      const top = Number.parseFloat(String(frame.top));
      const right = Number.parseFloat(String(frame.right));
      const rotation = Number.parseFloat(String(frame.transform).match(/rotate\((-?\d+(?:\.\d+)?)deg\)/)?.[1] ?? '');
      const opacity = Number.parseFloat(String(frame.opacity));
      if (hasTop !== hasRight || (hasTop && ![top, right, rotation, opacity].every(Number.isFinite))) {
        incompletePositionFrames.push(frame.computedOffset);
        return [];
      }
      if (!hasTop && !hasRight) {
        const motionOnlyFrame = ['transform', 'translate', 'rotate', 'scale', 'left', 'bottom']
          .some((property) => frame[property as keyof typeof frame] !== undefined);
        if (motionOnlyFrame) incompletePositionFrames.push(frame.computedOffset);
        return [];
      }
      return [{ offset: frame.computedOffset, top, right, rotation, opacity }];
    });
    return {
      easing: animation?.effect?.getTiming().easing,
      scene: { width: scene?.width ?? 0, height: scene?.height ?? 0 },
      incompletePositionFrames,
      points,
      backgroundImage: getComputedStyle(meteor).backgroundImage,
      transformOriginX: Number.parseFloat(getComputedStyle(meteor).transformOrigin),
      clipPath: getComputedStyle(meteor).clipPath,
    };
  });
  expect(details.easing).toBe('linear');
  expect(details.incompletePositionFrames).toEqual([]);
  expect(details.points.every((point, index) => index === 0 || point.top >= details.points[index - 1].top)).toBe(true);
  expect(details.points.every((point, index) => index === 0 || point.right >= details.points[index - 1].right)).toBe(true);
  expect(details.points.every((point) => point.rotation === details.points[0].rotation)).toBe(true);
  const allSegments = details.points.slice(1).map((point, index) => {
    const previous = details.points[index];
    const dx = (point.right - previous.right) * details.scene.width / 100;
    const dy = (point.top - previous.top) * details.scene.height / 100;
    const distance = Math.hypot(dx, dy);
    return {
      distance,
      visible: Math.max(previous.opacity, point.opacity) > 0.01,
      angle: distance < 1 ? null : Math.atan2(dy, dx) * 180 / Math.PI,
      rotations: [previous.rotation, point.rotation],
    };
  });
  expect(allSegments.every((segment) => segment.distance >= 1 || !segment.visible)).toBe(true);
  const segments = allSegments.filter((segment) => segment.angle !== null) as Array<{ distance: number; angle: number; rotations: number[] }>;
  expect(segments.length).toBeGreaterThanOrEqual(7);
  expect(segments.reduce((total, segment) => total + segment.distance, 0)).toBeGreaterThan(details.scene.width * 0.8);
  expect(Math.max(...segments.map((segment) => segment.angle)) - Math.min(...segments.map((segment) => segment.angle))).toBeLessThan(0.25);
  expect(segments.every((segment) => segment.rotations.every(
    (rotation) => Math.abs(segment.angle - Math.abs(rotation)) < 0.25,
  ))).toBe(true);
  expect(details.transformOriginX).toBe(0);
  expect(details.clipPath).toContain('polygon(');
  const brightIndex = details.backgroundImage.indexOf('255, 250, 224');
  const transparentIndex = details.backgroundImage.lastIndexOf('rgba(0, 0, 0, 0)');
  expect(brightIndex).toBeGreaterThan(-1);
  expect(transparentIndex).toBeGreaterThan(brightIndex);
});

test('transparent foreground occluder is layered above the window animation', async ({ page }, testInfo) => {
  await page.goto('/');
  const foreground = page.locator('.computer-foreground');
  await expect(foreground).toHaveCount(1);
  await expect(page.locator('.plush-body-layer')).toHaveCount(0);
  const expectedForeground = testInfo.project.name === 'mobile-chrome'
    ? /foreground-occluder-mobile-v3\.webp/
    : /foreground-occluder-v3\.webp/;
  await expect.poll(() => foreground.locator('img').evaluate((image: HTMLImageElement) => image.currentSrc)).toMatch(expectedForeground);
  await expect(foreground).toHaveCSS('mask-image', 'none');
  const layers = await page.evaluate(() => ({
    sky: Number.parseInt(getComputedStyle(document.querySelector('.sky-aperture')!).zIndex, 10),
    foreground: Number.parseInt(getComputedStyle(document.querySelector('.computer-foreground')!).zIndex, 10),
  }));
  expect(layers.foreground).toBeGreaterThan(layers.sky);
  const expectedBase = testInfo.project.name === 'mobile-chrome'
    ? /workspace-mobile\.webp/
    : /cozy-galaxy-workspace-reference\.png/;
  await expect(page.locator('.workspace-scene')).toHaveCSS(
    'background-image',
    expectedBase,
  );
});

test('window animation uses the image alpha mask while preserving the untouched base image', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile-chrome') {
    await expect(page.locator('.sky-aperture')).toHaveCSS('mask-image', 'none');
  } else {
    expect(await page.locator('.sky-aperture').evaluate((node) => getComputedStyle(node).maskImage)).toContain('window-aperture-v3.png');
    await expect(page.locator('.sky-aperture')).toHaveCSS('mask-mode', 'alpha');
  }
});

test('photo cape rig animates three clipped layers without moving the room or plush body', async ({ page }, testInfo) => {
  const mobile = testInfo.project.name === 'mobile-chrome';
  if (mobile) await page.setViewportSize({ width: 660, height: 771 });
  await page.goto('/');
  const scene = page.locator('.workspace-scene');
  const before = await scene.boundingBox();
  const rig = page.locator('.plush-cape-rig');
  const segments = rig.locator('.cape-segment');
  await expect(rig).toHaveCount(1);
  await expect(segments).toHaveCount(3);
  await expect(rig).toHaveCSS('position', 'absolute');
  await expect(rig).toHaveCSS('z-index', '4');
  await expect(page.locator('.scarf-tail')).toHaveCount(0);
  await expect(page.locator('.plush-body-layer')).toHaveCount(0);

  const expectedAsset = mobile
    ? /plush-cape-mobile-v1\.webp/
    : /plush-cape-desktop-v1\.webp/;
  const details = await segments.evaluateAll((nodes) => nodes.map((node) => {
    const style = getComputedStyle(node);
    return {
      position: style.position,
      layoutWidth: Number.parseFloat(style.width),
      layoutHeight: Number.parseFloat(style.height),
      layoutLeft: Number.parseFloat(style.left),
      layoutTop: Number.parseFloat(style.top),
      backgroundImage: style.backgroundImage,
      backgroundSize: style.backgroundSize,
      clipPath: style.clipPath,
      transformOrigin: style.transformOrigin,
      animationName: style.animationName,
      animationDuration: Number.parseFloat(style.animationDuration),
      rotate: Number.parseFloat(style.getPropertyValue('--cape-rotate')),
      shift: Number.parseFloat(style.getPropertyValue('--cape-shift')),
    };
  }));
  expect(details.map((item) => item.animationDuration)).toEqual([4.4, 3.6, 3.2]);
  expect(details.map((item) => item.rotate)).toEqual(mobile ? [0.7, 1.4, 2.4] : [1, 2, 3.4]);
  expect(details.map((item) => item.shift)).toEqual(mobile ? [0.7, 1.4, 2.1] : [1, 2, 3]);
  expect(new Set(details.map((item) => item.clipPath)).size).toBe(3);
  expect(new Set(details.map((item) => item.transformOrigin)).size).toBe(3);
  const expectedWidth = mobile && before ? Math.max(before.width, before.height * 940 / 1672) : before?.width ?? 0;
  const expectedHeight = mobile && before ? Math.max(before.height, before.width * 1672 / 940) : before?.height ?? 0;
  for (const item of details) {
    expect(item.position).toBe('absolute');
    expect(item.layoutWidth).toBeCloseTo(expectedWidth, 1);
    expect(item.layoutHeight).toBeCloseTo(expectedHeight, 1);
    expect(item.layoutLeft).toBeCloseTo((before?.width ?? 0) / 2, 1);
    expect(item.layoutTop).toBe(0);
    expect(item.backgroundImage).toMatch(expectedAsset);
    expect(item.backgroundSize).toBe('100% 100%');
    expect(item.clipPath).toContain('polygon(');
    expect(item.animationName).toBe('cape-float');
  }

  await page.waitForTimeout(250);
  const after = await scene.boundingBox();
  expect(after).toEqual(before);

  await page.addStyleTag({ content: '*{animation-play-state:paused !important;transition:none !important}' });
  await segments.evaluateAll((nodes) => nodes.forEach((node) => {
    const animation = node.getAnimations()[0];
    if (animation) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getTiming().duration ?? 0) / 2;
    }
  }));
  const visible = await sharp(await scene.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  await rig.evaluate((node) => { (node as HTMLElement).style.visibility = 'hidden'; });
  const hidden = await sharp(await scene.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let changed = 0;
  let forbidden = 0;
  for (let source = 0, pixel = 0; source < visible.data.length; source += 3, pixel += 1) {
    const delta = Math.max(
      Math.abs(visible.data[source] - hidden.data[source]),
      Math.abs(visible.data[source + 1] - hidden.data[source + 1]),
      Math.abs(visible.data[source + 2] - hidden.data[source + 2]),
    );
    if (delta < 12) continue;
    changed += 1;
    const y = Math.floor(pixel / visible.info.width);
    const x = pixel % visible.info.width;
    const capeFloor = mobile ? visible.info.height * 0.79 : visible.info.height * 0.55;
    if (x < visible.info.width * 0.75 || y < capeFloor) forbidden += 1;
  }
  expect(changed).toBeGreaterThan(20);
  expect(forbidden).toBe(0);
});

test('reduced motion stops the remaining decorative loops', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.workspace-page')).toHaveAttribute('data-hydrated', 'true');
  await expect(page.locator('.galaxy-canvas')).toHaveCount(0);
  await page.waitForTimeout(1200);
  expect(requests.some((url) => url.includes('three.module'))).toBe(false);
  const loopingSelectors = [
    '.plush-motion',
    '.plush-eye',
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
  await expect(page.locator('.plush-cape-rig')).toHaveCSS('display', 'none');
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
  const hotspotButtons = page.locator('[data-trigger-source="hotspot"]');
  const bottomButtons = page.locator('[data-trigger-source="bottom-link"]');
  await expect(hotspotButtons).toHaveCount(4);
  await expect(bottomButtons).toHaveCount(4);
  const previewButtons = page.locator('[data-trigger-source="hotspot"],[data-trigger-source="bottom-link"]');
  expect(await previewButtons.evaluateAll((buttons) => buttons.every((button) => (button as HTMLButtonElement).disabled))).toBe(true);
  await context.close();
});
