import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { evaluateMeteorEvidence } from '../contracts/visual-compositing/evaluator.ts';

const calibrationEnabled = process.env.RUN_HOTSPOT_CALIBRATION === '1';
const idleReferencePath = '/Users/ethan/Downloads/ChatGPT Image 2026年9月7日 上午01_53_29.png';
const hoverReferencePath = '/Users/ethan/Downloads/ChatGPT Image 2026年9月7日 上午02_00_41.png';
const calibrationOutputDir = resolve(
  process.cwd(),
  'plan/2026-09-06-monitor-hotspot-popover-implementation-appendix/calibration',
);

type CalibrationRect = {
  id: string;
  bounds: [number, number, number, number];
  color: string;
};

async function renderCalibrationOverlay(
  page: Page,
  referencePath: string,
  outputName: string,
  rectangles: CalibrationRect[],
  options: {
    endpoint?: { x: number; y: number };
    palette?: Record<string, string>;
  } = {},
) {
  const reference = await readFile(referencePath);
  await page.route('**/assets/galaxy/cozy-galaxy-workspace-reference.png', async (route) => {
    await route.fulfill({ status: 200, contentType: 'image/png', body: reference });
  });
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto('/');
  await expect(page.locator('.workspace-page')).toHaveAttribute('data-hydrated', 'true');
  await page.addStyleTag({
    content: `
      html,body,.workspace-page{width:1672px!important;height:941px!important;min-width:1672px!important;min-height:941px!important;margin:0!important;overflow:hidden!important}
      .workspace-scene{width:1672px!important;height:941px!important;min-height:0!important;max-width:none!important;box-shadow:none!important}
      .workspace-scene>*{visibility:hidden!important}
      .workspace-scene>.calibration-overlay{visibility:visible!important}
    `,
  });
  await page.locator('.workspace-scene').evaluate((scene, payload) => {
    const overlay = document.createElement('div');
    overlay.className = 'calibration-overlay';
    Object.assign(overlay.style, {
      position: 'absolute',
      inset: '0',
      zIndex: '999',
      visibility: 'visible',
      pointerEvents: 'none',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    });

    for (const rectangle of payload.rectangles) {
      const [left, top, right, bottom] = rectangle.bounds;
      const width = right - left;
      const height = bottom - top;
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const tolerance = document.createElement('div');
      Object.assign(tolerance.style, {
        position: 'absolute',
        left: `${left - 2}px`,
        top: `${top - 2}px`,
        width: `${width + 4}px`,
        height: `${height + 4}px`,
        border: `1px dashed ${rectangle.color}`,
        opacity: '.55',
      });
      overlay.append(tolerance);

      const frame = document.createElement('div');
      Object.assign(frame.style, {
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: `2px solid ${rectangle.color}`,
        boxSizing: 'border-box',
      });
      overlay.append(frame);

      const centerTolerance = document.createElement('div');
      Object.assign(centerTolerance.style, {
        position: 'absolute',
        left: `${centerX - 4}px`,
        top: `${centerY - 4}px`,
        width: '8px',
        height: '8px',
        border: `1px dashed ${rectangle.color}`,
        boxSizing: 'border-box',
      });
      overlay.append(centerTolerance);

      const crossHorizontal = document.createElement('div');
      Object.assign(crossHorizontal.style, {
        position: 'absolute',
        left: `${centerX - 10}px`,
        top: `${centerY - 1}px`,
        width: '20px',
        height: '2px',
        background: rectangle.color,
      });
      overlay.append(crossHorizontal);

      const crossVertical = document.createElement('div');
      Object.assign(crossVertical.style, {
        position: 'absolute',
        left: `${centerX - 1}px`,
        top: `${centerY - 10}px`,
        width: '2px',
        height: '20px',
        background: rectangle.color,
      });
      overlay.append(crossVertical);

      const label = document.createElement('div');
      label.textContent = `${rectangle.id} [${left},${top},${right},${bottom}] center(${centerX},${centerY})`;
      Object.assign(label.style, {
        position: 'absolute',
        left: `${left}px`,
        top: `${Math.max(0, top - 25)}px`,
        padding: '4px 6px',
        border: `1px solid ${rectangle.color}`,
        background: 'rgba(18,13,29,.9)',
        color: '#fff7e8',
        fontSize: '12px',
        lineHeight: '1.2',
        whiteSpace: 'nowrap',
      });
      overlay.append(label);
    }

    if (payload.endpoint) {
      const endpoint = document.createElement('div');
      Object.assign(endpoint.style, {
        position: 'absolute',
        left: `${payload.endpoint.x - 7}px`,
        top: `${payload.endpoint.y - 7}px`,
        width: '14px',
        height: '14px',
        border: '2px solid #ff4d6d',
        borderRadius: '50%',
        boxSizing: 'border-box',
      });
      overlay.append(endpoint);
    }

    if (payload.palette) {
      const swatches = document.createElement('div');
      Object.assign(swatches.style, {
        position: 'absolute',
        left: '1040px',
        top: '550px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 92px)',
        gap: '8px',
        padding: '12px',
        border: '1px solid #f2c99b',
        background: 'rgba(74,45,62,.94)',
      });
      for (const [name, color] of Object.entries(payload.palette)) {
        const item = document.createElement('div');
        Object.assign(item.style, { color: '#fff3df', fontSize: '11px' });
        const chip = document.createElement('div');
        Object.assign(chip.style, { height: '28px', background: color, border: '1px solid rgba(255,255,255,.65)' });
        const text = document.createElement('span');
        text.textContent = `${name} ${color}`;
        item.append(chip, text);
        swatches.append(item);
      }
      overlay.append(swatches);
    }
    scene.append(overlay);
  }, { rectangles, ...options });
  await mkdir(calibrationOutputDir, { recursive: true });
  await page.locator('.workspace-scene').screenshot({
    path: resolve(calibrationOutputDir, outputName),
    animations: 'disabled',
  });
}

test('renders the monitor anchor calibration overlay', async ({ page }, testInfo) => {
  test.skip(!calibrationEnabled, 'Local-only calibration is opt-in');
  test.skip(testInfo.project.name !== 'desktop-chrome', 'Calibration uses desktop-chrome');
  await renderCalibrationOverlay(page, idleReferencePath, 'monitor-anchor-overlay.png', [
    { id: 'projects', bounds: [738, 644, 766, 672], color: '#ffb347' },
    { id: 'ai-lab', bounds: [792, 644, 820, 672], color: '#ffb347' },
    { id: 'trading-lab', bounds: [846, 644, 874, 672], color: '#ffb347' },
    { id: 'about', bounds: [900, 644, 928, 672], color: '#ffb347' },
  ]);
});

test('renders the hover composition calibration overlay', async ({ page }, testInfo) => {
  test.skip(!calibrationEnabled, 'Local-only calibration is opt-in');
  test.skip(testInfo.project.name !== 'desktop-chrome', 'Calibration uses desktop-chrome');
  await renderCalibrationOverlay(page, hoverReferencePath, 'hover-composition-overlay.png', [
    { id: 'projects-bottom', bounds: [309, 828, 337, 856], color: '#66d9ef' },
    { id: 'ai-lab-bottom', bounds: [667, 828, 695, 856], color: '#66d9ef' },
    { id: 'trading-lab-bottom', bounds: [946, 828, 974, 856], color: '#66d9ef' },
    { id: 'about-bottom', bounds: [1228, 828, 1256, 856], color: '#66d9ef' },
    { id: 'shared-popover', bounds: [430, 566, 599, 696], color: '#f2c99b' },
  ], {
    endpoint: { x: 323, y: 842 },
    palette: {
      background: '#4a2d3e',
      border: '#f2c99b',
      text: '#fff3df',
      accent: '#d89ab6',
      guide: '#f2bd78',
    },
  });
});

test('idle and active hotspot controls keep hit targets without painted button chrome', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'Button-chrome regression uses desktop-chrome');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.workspace-page')).toHaveAttribute('data-hydrated', 'true');

  const controls = page.locator('[data-trigger-source="hotspot"],[data-trigger-source="bottom-link"]');
  await expect(controls).toHaveCount(8);
  const readChrome = () => controls.evaluateAll((nodes) => nodes.map((node) => {
    const style = getComputedStyle(node);
    const child = node.firstElementChild;
    const childStyle = child ? getComputedStyle(child) : null;
    const rect = node.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      backgroundColor: style.backgroundColor,
      borderTopWidth: style.borderTopWidth,
      borderRightWidth: style.borderRightWidth,
      borderBottomWidth: style.borderBottomWidth,
      borderLeftWidth: style.borderLeftWidth,
      boxShadow: style.boxShadow,
      backdropFilter: style.backdropFilter,
      childDisplay: childStyle?.display ?? 'none',
    };
  }));

  const assertNoPaintedChrome = (states: Awaited<ReturnType<typeof readChrome>>) => {
    expect(states.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
    expect(states.every(({ backgroundColor }) => backgroundColor === 'rgba(0, 0, 0, 0)')).toBe(true);
    expect(states.every((state) => (
      state.borderTopWidth === '0px'
      && state.borderRightWidth === '0px'
      && state.borderBottomWidth === '0px'
      && state.borderLeftWidth === '0px'
    ))).toBe(true);
    expect(states.every(({ boxShadow }) => boxShadow === 'none')).toBe(true);
    expect(states.every(({ backdropFilter }) => backdropFilter === 'none')).toBe(true);
    expect(states.every(({ childDisplay }) => childDisplay === 'none')).toBe(true);
  };

  assertNoPaintedChrome(await readChrome());
  await page.locator('[data-trigger-source="hotspot"][data-window-id="projects"]').hover();
  await expect(page.locator('#workspace-hotspot-popover')).toBeVisible();
  assertNoPaintedChrome(await readChrome());
});

const profiles = [
  {
    name: 'desktop',
    project: 'desktop-chrome',
    viewport: { width: 1440, height: 900 },
    reference: { width: 1672, height: 941 },
    computerRoi: [494, 313, 1174, 686],
    probes: { wall: [100, 200], glass: [900, 200], monitor: [600, 450], plush: [1450, 550] },
  },
  {
    name: 'tablet',
    project: 'desktop-chrome',
    viewport: { width: 820, height: 1180 },
    reference: { width: 1672, height: 941 },
    computerRoi: [494, 313, 1174, 686],
    probes: { wall: [100, 200], glass: [900, 200], monitor: [600, 450], plush: [1450, 550] },
  },
  {
    name: 'mobile',
    project: 'mobile-chrome',
    viewport: { width: 390, height: 844 },
    reference: { width: 390, height: 844 },
    computerRoi: [0, 0, 0, 0],
    probes: { wall: [20, 200], glass: [195, 330], monitor: [195, 430] },
  },
] as const;

const previewLocalityProfiles = [
  { name: 'desktop', project: 'desktop-chrome', viewport: { width: 1440, height: 900 }, id: 'projects', activation: 'hover', source: 'hotspot' },
  { name: 'tablet', project: 'desktop-chrome', viewport: { width: 820, height: 1180 }, id: 'about', activation: 'hover', source: 'bottom-link' },
  { name: 'mobile', project: 'mobile-chrome', viewport: { width: 390, height: 844 }, id: 'ai-lab', activation: 'tap', source: 'bottom-link' },
] as const;

const freezeMotion = `
  * { animation: none !important; transition: none !important; caret-color: transparent !important; }
`;

const meteorFrameHarness = `
  .workspace-brand,
  .workspace-copy,
  .monitor-shell,
  .plush-motion,
  .plush-reactor,
  .visible-starfield { display: none !important; }
  * {
    animation-play-state: paused !important;
    transition: none !important;
  }
  html[data-hide-foreground="true"] .computer-foreground { visibility: hidden !important; }
  html[data-hide-meteor="true"] .shooting-star { visibility: hidden !important; }
`;

async function rawScreenshot(buffer: Buffer) {
  return sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
}

function diffMask(
  current: Awaited<ReturnType<typeof rawScreenshot>>,
  baseline: Awaited<ReturnType<typeof rawScreenshot>>,
  threshold = 28,
) {
  const pixels = new Uint8Array(current.info.width * current.info.height);
  let count = 0;
  for (let source = 0, pixel = 0; source < current.data.length; source += 3, pixel += 1) {
    const changed = Math.max(
      Math.abs(current.data[source] - baseline.data[source]),
      Math.abs(current.data[source + 1] - baseline.data[source + 1]),
      Math.abs(current.data[source + 2] - baseline.data[source + 2]),
    ) >= threshold;
    if (changed) {
      pixels[pixel] = 1;
      count += 1;
    }
  }
  return { pixels, count, info: current.info };
}

for (const profile of previewLocalityProfiles) {
  test(`hotspot preview changes only local UI in ${profile.name}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== profile.project, `${profile.name} locality uses ${profile.project}`);
    await page.setViewportSize(profile.viewport);
    await page.goto('/');
    await expect(page.locator('.workspace-page')).toHaveAttribute('data-hydrated', 'true');
    const initialUrl = page.url();
    const workspacePage = page.locator('.workspace-page');
    const previewRoot = page.locator('.workspace-preview-system');
    const hotspot = page.locator(`[data-trigger-source="hotspot"][data-window-id="${profile.id}"]`);
    const bottom = page.locator(`[data-trigger-source="bottom-link"][data-window-id="${profile.id}"]`);
    const activationTrigger = profile.source === 'hotspot' ? hotspot : bottom;
    const rootStyles = await previewRoot.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        backgroundColor: style.backgroundColor,
        opacity: style.opacity,
        filter: style.filter,
        backdropFilter: style.backdropFilter,
        maskImage: style.maskImage,
      };
    });
    expect(rootStyles).toEqual({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      opacity: '1',
      filter: 'none',
      backdropFilter: 'none',
      maskImage: 'none',
    });
    const hitSizes = await page.locator('[data-trigger-source="hotspot"],[data-trigger-source="bottom-link"]')
      .evaluateAll((nodes) => nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }));
    expect(hitSizes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);

    if (profile.activation === 'tap') await activationTrigger.tap();
    else await activationTrigger.hover();
    const popover = page.locator('#workspace-hotspot-popover');
    await expect(popover).toBeVisible();
    expect(page.url()).toBe(initialUrl);
    await expect(workspacePage).toHaveAttribute('data-scene-state', 'idle');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const activeRootStyles = await previewRoot.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        backgroundColor: style.backgroundColor,
        opacity: style.opacity,
        filter: style.filter,
        backdropFilter: style.backdropFilter,
        maskImage: style.maskImage,
      };
    });
    expect(activeRootStyles).toEqual(rootStyles);
    const motionStyles = await Promise.all([hotspot, bottom, popover].map((locator) => locator.evaluate((node) => {
      const style = getComputedStyle(node);
      return { animationName: style.animationName, transitionDuration: style.transitionDuration };
    })));
    expect(motionStyles.every(({ animationName, transitionDuration }) => (
      animationName === 'none' && transitionDuration.split(',').every((duration) => duration.trim() === '0s')
    ))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(popover).toHaveCount(0);
    if (profile.activation === 'hover') await page.mouse.move(0, 0);

    await page.addStyleTag({ content: freezeMotion });
    const scene = page.locator('.workspace-scene');
    const sceneBox = await scene.boundingBox();
    expect(sceneBox).not.toBeNull();
    const idle = await rawScreenshot(await scene.screenshot());
    if (profile.activation === 'tap') await activationTrigger.tap();
    else await activationTrigger.hover();
    const guide = page.locator('.hotspot-guide-visible');
    await expect(popover).toBeVisible();
    await expect(guide).toHaveCount(1);
    expect(page.url()).toBe(initialUrl);
    await expect(workspacePage).toHaveAttribute('data-scene-state', 'idle');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const active = await rawScreenshot(await scene.screenshot());
    const diff = diffMask(active, idle, 18);
    const boxes = await Promise.all([hotspot, popover, bottom].map((locator) => locator.boundingBox()));
    expect(boxes.every(Boolean)).toBe(true);
    const guidePoints = await guide.evaluate((path: SVGPathElement) => {
      const length = path.getTotalLength();
      const matrix = path.getScreenCTM() ?? new DOMMatrix();
      return Array.from({ length: 81 }, (_, index) => {
        const point = path.getPointAtLength(length * index / 80);
        const screenPoint = new DOMPoint(point.x, point.y).matrixTransform(matrix);
        return { x: screenPoint.x, y: screenPoint.y };
      });
    });

    const width = diff.info.width;
    const height = diff.info.height;
    const scaleX = width / (sceneBox?.width ?? width);
    const scaleY = height / (sceneBox?.height ?? height);
    const allowed = new Uint8Array(width * height);
    const mark = (x: number, y: number) => {
      if (x >= 0 && x < width && y >= 0 && y < height) allowed[y * width + x] = 1;
    };
    for (const box of boxes) {
      const left = Math.floor(((box?.x ?? 0) - (sceneBox?.x ?? 0) - 8) * scaleX);
      const top = Math.floor(((box?.y ?? 0) - (sceneBox?.y ?? 0) - 8) * scaleY);
      const right = Math.ceil(((box?.x ?? 0) - (sceneBox?.x ?? 0) + (box?.width ?? 0) + 8) * scaleX);
      const bottomEdge = Math.ceil(((box?.y ?? 0) - (sceneBox?.y ?? 0) + (box?.height ?? 0) + 8) * scaleY);
      for (let y = top; y < bottomEdge; y += 1) for (let x = left; x < right; x += 1) mark(x, y);
    }
    const radius = Math.ceil(10 * Math.max(scaleX, scaleY));
    for (const point of guidePoints) {
      const centerX = Math.round((point.x - (sceneBox?.x ?? 0)) * scaleX);
      const centerY = Math.round((point.y - (sceneBox?.y ?? 0)) * scaleY);
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          if (dx * dx + dy * dy <= radius * radius) mark(centerX + dx, centerY + dy);
        }
      }
    }

    let outsidePixels = 0;
    let highOutside = 0;
    let lowOutside = 0;
    let outsideDelta = 0;
    for (let source = 0, pixel = 0; source < active.data.length; source += 3, pixel += 1) {
      if (allowed[pixel]) continue;
      outsidePixels += 1;
      const delta = Math.max(
        Math.abs(active.data[source] - idle.data[source]),
        Math.abs(active.data[source + 1] - idle.data[source + 1]),
        Math.abs(active.data[source + 2] - idle.data[source + 2]),
      );
      outsideDelta += delta;
      if (delta >= 18) highOutside += 1;
      if (delta >= 2) lowOutside += 1;
    }
    expect(diff.count).toBeGreaterThan(20);
    expect(highOutside).toBeLessThanOrEqual(20);
    expect(lowOutside / outsidePixels).toBeLessThanOrEqual(0.001);
    expect(outsideDelta / outsidePixels).toBeLessThanOrEqual(0.08);
  });
}

async function captureMeteorFrame(
  page: Page,
  time: number,
  state: { hideForeground: boolean; hideMeteor: boolean },
) {
  await page.evaluate(({ frameTime, hideForeground, hideMeteor }) => {
    document.documentElement.dataset.hideForeground = String(hideForeground);
    document.documentElement.dataset.hideMeteor = String(hideMeteor);
    const animation = document.querySelector('.shooting-star')?.getAnimations()[0];
    if (animation) {
      animation.pause();
      animation.currentTime = frameTime;
    }
  }, { frameTime: time, ...state });
  return rawScreenshot(await page.locator('.workspace-scene').screenshot());
}

async function measureMeteorOcclusion(
  page: Page,
  time: number,
  reference: { width: number; height: number },
  computerRoi: readonly number[],
) {
  const noForegroundBaseline = await captureMeteorFrame(page, time, { hideForeground: true, hideMeteor: true });
  const noForegroundMeteor = await captureMeteorFrame(page, time, { hideForeground: true, hideMeteor: false });
  const foregroundBaseline = await captureMeteorFrame(page, time, { hideForeground: false, hideMeteor: true });
  const foregroundMeteor = await captureMeteorFrame(page, time, { hideForeground: false, hideMeteor: false });
  const completeMeteor = diffMask(noForegroundMeteor, noForegroundBaseline);
  const visibleMeteor = diffMask(foregroundMeteor, foregroundBaseline);
  let removedPixels = 0;
  let removedInsideComputer = 0;
  const roi = {
    left: Math.floor(computerRoi[0] * completeMeteor.info.width / reference.width),
    top: Math.floor(computerRoi[1] * completeMeteor.info.height / reference.height),
    right: Math.ceil(computerRoi[2] * completeMeteor.info.width / reference.width),
    bottom: Math.ceil(computerRoi[3] * completeMeteor.info.height / reference.height),
  };
  for (let index = 0; index < completeMeteor.pixels.length; index += 1) {
    if (completeMeteor.pixels[index] && !visibleMeteor.pixels[index]) {
      removedPixels += 1;
      const y = Math.floor(index / completeMeteor.info.width);
      const x = index % completeMeteor.info.width;
      if (x >= roi.left && x < roi.right && y >= roi.top && y < roi.bottom) removedInsideComputer += 1;
    }
  }
  return {
    totalPixels: completeMeteor.count,
    visiblePixels: visibleMeteor.count,
    occludedRatio: completeMeteor.count === 0 ? 0 : removedPixels / completeMeteor.count,
    computerShare: removedPixels === 0 ? 0 : removedInsideComputer / removedPixels,
  };
}

for (const profile of profiles) {
  test(`hero foreground fusion matches approved ${profile.name} baseline`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== profile.project, `${profile.name} profile uses ${profile.project}`);
    test.skip(process.env.VISUAL_BASELINE_APPROVED !== '1', 'Gate B approval is required before creating or updating visual baselines');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize(profile.viewport);
    await page.goto('/');
    await expect(page.locator('.workspace-page')).toHaveAttribute('data-hydrated', 'true');
    await page.addStyleTag({ content: freezeMotion });
    const scene = page.locator('.workspace-scene');
    await expect(scene).toBeVisible();
    await expect(scene).toHaveScreenshot(`hero-fusion-${profile.name}.png`, { maxDiffPixels: 150 });
  });

  test(`sky aperture remains transparent and contains only sparse motion in ${profile.name}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== profile.project, `${profile.name} profile uses ${profile.project}`);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize(profile.viewport);
    await page.goto('/');
    const aperture = page.locator('.sky-aperture');
    await expect(aperture.locator('.space-backdrop')).toHaveCount(0);
    await expect(aperture.locator('.visible-starfield i')).toHaveCount(12);
    await expect(aperture.locator('.shooting-star')).toHaveCount(1);
    await expect(aperture).toHaveCSS('background-image', 'none');
    await expect(page.locator('.computer-foreground')).toHaveCount(1);
    await expect(page.locator('.plush-body-layer')).toHaveCount(0);
  });

  test(`real meteor frames keep visual continuity while passing behind foreground in ${profile.name}`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    test.skip(testInfo.project.name !== profile.project, `${profile.name} profile uses ${profile.project}`);
    test.skip(profile.name === 'mobile', 'Mobile geometric aperture will be generated after desktop visual approval');
    await page.setViewportSize(profile.viewport);
    await page.goto('/');
    await page.addStyleTag({ content: meteorFrameHarness });
    const timing = await page.evaluate(() => {
      const animation = document.querySelector('.shooting-star')?.getAnimations()[0];
      const effectTiming = animation?.effect?.getTiming();
      return {
        delay: Number(effectTiming?.delay ?? 0),
        duration: Number(effectTiming?.duration ?? 0),
      };
    });
    expect(timing.duration).toBeGreaterThan(0);
    const progressPoints = Array.from({ length: 37 }, (_, index) => 0.14 + index * 0.02);
    const frames = [];
    for (const progress of progressPoints) {
      const time = timing.delay + timing.duration * progress;
      frames.push({
        progress,
        ...await measureMeteorOcclusion(page, time, profile.reference, profile.computerRoi),
      });
    }
    const evidence = evaluateMeteorEvidence(frames);
    expect(evidence.pass, JSON.stringify({ violations: evidence.violations, frames }, null, 2)).toBe(true);
  });
}
