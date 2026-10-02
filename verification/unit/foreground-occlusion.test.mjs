import { describe, expect, test } from 'vitest';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../../', import.meta.url);
const file = (path) => new URL(path, root);

function webpMetadata(buffer) {
  expect(buffer.subarray(0, 4).toString()).toBe('RIFF');
  expect(buffer.subarray(8, 12).toString()).toBe('WEBP');
  expect(buffer.subarray(12, 16).toString()).toBe('VP8X');
  return {
    width: buffer.readUIntLE(24, 3) + 1,
    height: buffer.readUIntLE(27, 3) + 1,
    hasAlpha: (buffer[20] & 0x10) !== 0 && buffer.includes(Buffer.from('ALPH')),
  };
}

describe('foreground depth assets', () => {
  test('geometric aperture and unmasked foreground occluders are full-size alpha assets', async () => {
    const [windowMask, desktop, mobile] = await Promise.all([
      sharp(fileURLToPath(file('public/assets/galaxy/window-aperture-v3.png'))).metadata(),
      sharp(fileURLToPath(file('public/assets/galaxy/foreground-occluder-v3.webp'))).metadata(),
      sharp(fileURLToPath(file('public/assets/galaxy/foreground-occluder-mobile-v3.webp'))).metadata(),
    ]);
    expect({ width: windowMask.width, height: windowMask.height, format: windowMask.format, hasAlpha: windowMask.hasAlpha }).toEqual({
      width: 1672,
      height: 941,
      format: 'png',
      hasAlpha: true,
    });
    expect({ width: desktop.width, height: desktop.height, hasAlpha: desktop.hasAlpha }).toEqual({
      width: 1672,
      height: 941,
      hasAlpha: true,
    });
    expect({ width: mobile.width, height: mobile.height, hasAlpha: mobile.hasAlpha }).toEqual({
      width: 940,
      height: 1672,
      hasAlpha: true,
    });
  });

  test('foreground occluder is above the meteor and is never window-masked', async () => {
    const [workspace, component, elementsCss, responsiveCss] = await Promise.all([
      readFile(file('src/features/workspace/elements/WorkspaceScene.tsx'), 'utf8'),
      readFile(file('src/features/workspace/elements/ForegroundOcclusion.tsx'), 'utf8'),
      readFile(file('src/styles/workspace/elements.css'), 'utf8'),
      readFile(file('src/styles/workspace/responsive.css'), 'utf8'),
    ]);
    const css = `${elementsCss}\n${responsiveCss}`;
    expect(workspace).toContain('ForegroundOcclusion');
    expect(component).toContain('foreground-occluder-v3.webp');
    expect(component).toContain('foreground-occluder-mobile-v3.webp');
    expect(elementsCss).toMatch(/\.computer-foreground\s*\{[^}]*z-index:3/s);
    expect(elementsCss).not.toMatch(/\.computer-foreground\s*\{[^}]*mask-image/s);
    expect(css).not.toMatch(/\.computer-foreground\s*\{[^}]*clip-path/s);
  });

  test('window mask paints only sparse stars and a meteor, never a solid backdrop', async () => {
    const sceneCss = await readFile(file('src/styles/workspace/scene.css'), 'utf8');
    expect(sceneCss).toMatch(/\.sky-aperture\s*\{[^}]*z-index:2/s);
    expect(sceneCss).not.toMatch(/\.space-backdrop\s*\{/);
    expect(sceneCss).not.toMatch(/\.sky-aperture\s*\{[^}]*background(?:-image)?:/s);
  });

  test('meteor moves monotonically down-left with a thin leading head', async () => {
    const sceneCss = await readFile(file('src/styles/workspace/scene.css'), 'utf8');
    const keyframes = sceneCss.match(/@keyframes shooting-star-pass\s*\{([\s\S]*?)\}\s*\.visible-starfield/)?.[1] ?? '';
    const incompletePositionFrames = [];
    const points = [...keyframes.matchAll(/([^{}]+)\{([^{}]+)\}/g)].flatMap((match) => {
        const hasRight = /right:/.test(match[2]);
        const hasTop = /top:/.test(match[2]);
        const right = Number(match[2].match(/right:(\d+(?:\.\d+)?)%/)?.[1]);
        const top = Number(match[2].match(/top:(\d+(?:\.\d+)?)%/)?.[1]);
        const rotation = Number(match[2].match(/rotate\((-?\d+(?:\.\d+)?)deg\)/)?.[1]);
        const opacity = Number(match[2].match(/opacity:(\d+(?:\.\d+)?|\.\d+)/)?.[1]);
        if (hasRight !== hasTop || (hasRight && ![right, top, rotation, opacity].every(Number.isFinite))) {
          incompletePositionFrames.push(match[1]);
          return [];
        }
        if (!hasRight && !hasTop) {
          const nonOpacityDeclarations = match[2]
            .replace(/opacity:(?:\d+(?:\.\d+)?|\.\d+);?/g, '')
            .trim();
          if (nonOpacityDeclarations) incompletePositionFrames.push(match[1]);
          return [];
        }
        return match[1].split(',').map((offset) => ({
          offset: Number.parseFloat(offset) / 100,
          right,
          top,
          rotation,
          opacity,
        }));
      })
      .sort((a, b) => a.offset - b.offset);
    expect(incompletePositionFrames).toEqual([]);
    expect(points.length).toBeGreaterThanOrEqual(8);
    expect(points.every((point, index) => index === 0 || point.top >= points[index - 1].top)).toBe(true);
    expect(points.every((point, index) => index === 0 || point.right >= points[index - 1].right)).toBe(true);
    expect(points.every((point) => point.rotation === points[0].rotation)).toBe(true);
    expect(points.at(-1).right - points[0].right).toBeGreaterThan(80);
    expect(points.at(-1).top - points[0].top).toBeGreaterThan(45);
    const aspectRatio = 1672 / 941;
    const segments = points.slice(1).map((point, index) => {
      const previous = points[index];
      const dx = point.right - previous.right;
      const dy = (point.top - previous.top) / aspectRatio;
      const distance = Math.hypot(dx, dy);
      return {
        distance,
        visible: Math.max(previous.opacity, point.opacity) > 0.01,
        angle: distance < 0.01 ? null : Math.atan2(dy, dx) * 180 / Math.PI,
        rotations: [previous.rotation, point.rotation],
      };
    });
    expect(segments.every((segment) => segment.distance >= 0.01 || !segment.visible)).toBe(true);
    const angles = segments.flatMap((segment) => segment.angle === null ? [] : [segment.angle]);
    expect(Math.max(...angles) - Math.min(...angles)).toBeLessThan(0.25);
    expect(segments.every((segment) => segment.angle === null
      || segment.rotations.every((rotation) => Math.abs(segment.angle - Math.abs(rotation)) < 0.25))).toBe(true);
    expect(sceneCss).toMatch(/\.shooting-star\s*\{[^}]*transform-origin:left center/s);
    const clipPath = sceneCss.match(/\.shooting-star\s*\{[^}]*clip-path:polygon\(([^)]*)\)/s)?.[1] ?? '';
    const clipPoints = [...clipPath.matchAll(/(0|\d+(?:\.\d+)?%)\s+(0|\d+(?:\.\d+)?%)/g)]
      .map((match) => ({ x: Number.parseFloat(match[1]), y: Number.parseFloat(match[2]) }));
    const thicknessAt = (x) => {
      const ys = clipPoints.filter((point) => point.x === x).map((point) => point.y);
      return ys.length < 2 ? 0 : Math.max(...ys) - Math.min(...ys);
    };
    expect(thicknessAt(0)).toBe(0);
    expect(thicknessAt(100)).toBeGreaterThan(thicknessAt(8));
    expect(thicknessAt(8)).toBeGreaterThan(thicknessAt(0));
    const gradient = sceneCss.match(/\.shooting-star\s*\{[^}]*background:linear-gradient\(90deg,([^;]*)\)/s)?.[1] ?? '';
    const alphas = [...gradient.matchAll(/rgba\([^)]*,(\d?(?:\.\d+)?)\)|transparent/g)]
      .map((match) => match[0] === 'transparent' ? 0 : Number(match[1]));
    expect(alphas.length).toBeGreaterThanOrEqual(4);
    expect(alphas.every((alpha, index) => index === 0 || alpha <= alphas[index - 1])).toBe(true);
    expect(gradient).toMatch(/^rgba\(255,250,224,.98\) 0/);
    expect(gradient).toMatch(/transparent 100%$/);
    expect(sceneCss).toMatch(/animation:shooting-star-pass 6s linear infinite 1s/);
  });

  test('approved image mask defines the full-scene sky instead of guessed desktop percentages', async () => {
    const [atmosphere, sceneCss, responsiveCss] = await Promise.all([
      readFile(file('src/features/workspace/elements/SceneAtmosphere.tsx'), 'utf8'),
      readFile(file('src/styles/workspace/scene.css'), 'utf8'),
      readFile(file('src/styles/workspace/responsive.css'), 'utf8'),
    ]);
    const start = atmosphere.indexOf('className="sky-aperture"');
    const end = atmosphere.indexOf('    </div>', start);
    expect(start).toBeGreaterThan(-1);
    expect(atmosphere).not.toContain('GalaxyCanvas');
    expect(atmosphere).not.toContain('space-backdrop');
    expect(atmosphere.indexOf('className="visible-starfield"', start)).toBeGreaterThan(start);
    expect(atmosphere.indexOf('className="shooting-star"', start)).toBeGreaterThan(start);
    expect(atmosphere).not.toMatch(/scene-vignette|warm-room-light|desk-reflection|room-dust|lamp-glow|plant-sway/);
    expect(sceneCss).toMatch(/\.sky-aperture\s*\{[^}]*inset:0/s);
    expect(sceneCss).toMatch(/\.sky-aperture\s*\{[^}]*opacity:1/s);
    expect(sceneCss).toMatch(/\.sky-aperture\s*\{[^}]*mask-image:url\('\/assets\/galaxy\/window-aperture-v3\.png'\)/s);
    expect(sceneCss).toContain("mask-image:url('/assets/galaxy/window-aperture-v3.png')");
    expect(sceneCss).toMatch(/\.sky-aperture\s*\{[^}]*mask-mode:alpha/s);
    expect(sceneCss).not.toMatch(/\.sky-aperture\s*\{[^}]*mask-image:linear-gradient/s);
    expect(sceneCss).not.toMatch(/\.sky-aperture\s*\{[^}]*(?:left:15%|top:22%|width:80%|height:31%)/s);
    expect(sceneCss).toMatch(/\.visible-starfield\s*\{[^}]*inset:0/s);
    expect(sceneCss).not.toMatch(/\.galaxy-window|\.galaxy-canvas/);
    expect(sceneCss).toMatch(/\.workspace-scene:before,\.workspace-scene:after\s*\{[^}]*display:none/s);
    expect(sceneCss).not.toMatch(/\.(?:scene-vignette|warm-room-light|desk-reflection|room-dust|lamp-glow)\s*\{/);
    expect(responsiveCss).not.toMatch(/\.(?:visible-starfield|shooting-star)\s*\{[^}]*(?:left|top|width|height):/s);
  });

  test('scene keeps atmosphere before the real foreground occluder', async () => {
    const source = await readFile(file('src/features/workspace/elements/WorkspaceScene.tsx'), 'utf8');
    expect(source.indexOf('<SceneAtmosphere')).toBeGreaterThan(-1);
    expect(source.indexOf('<ForegroundOcclusion')).toBeGreaterThan(source.indexOf('<SceneAtmosphere'));
    expect(source.indexOf('<ComputerHotspots')).toBeGreaterThan(source.indexOf('<ForegroundOcclusion'));
  });

  test('geometric aperture includes hidden window area behind foreground objects but excludes wall and frame', async () => {
    const [apertureRaw, apertureInfo, foregroundRaw, foregroundInfo] = await Promise.all([
      sharp(fileURLToPath(file('public/assets/galaxy/window-aperture-v3.png'))).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
      sharp(fileURLToPath(file('public/assets/galaxy/window-aperture-v3.png'))).metadata(),
      sharp(fileURLToPath(file('public/assets/galaxy/foreground-occluder-v3.webp'))).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
      sharp(fileURLToPath(file('public/assets/galaxy/foreground-occluder-v3.webp'))).metadata(),
    ]);
    const alphaAt = ({ data, info }, x, y) => data[(y * info.width + x) * info.channels + 3];
    expect(apertureInfo.width).toBe(foregroundInfo.width);
    expect(apertureInfo.height).toBe(foregroundInfo.height);
    expect(alphaAt(apertureRaw, 900, 200)).toBeGreaterThanOrEqual(240);
    expect(alphaAt(apertureRaw, 100, 200)).toBeLessThanOrEqual(8);
    expect(alphaAt(apertureRaw, 300, 200)).toBeLessThanOrEqual(8);
    expect(alphaAt(foregroundRaw, 600, 450)).toBeGreaterThanOrEqual(240);
    expect(alphaAt(apertureRaw, 600, 450)).toBeGreaterThanOrEqual(240);
  });

  test('desktop scene preserves the complete 1672:941 composition instead of cover-cropping it', async () => {
    const [shellCss, responsiveCss, workspaceSource, foregroundSource] = await Promise.all([
      readFile(file('src/styles/workspace/shell.css'), 'utf8'),
      readFile(file('src/styles/workspace/responsive.css'), 'utf8'),
      readFile(file('src/features/workspace/WorkspaceDesktop.tsx'), 'utf8'),
      readFile(file('src/features/workspace/elements/ForegroundOcclusion.tsx'), 'utf8'),
    ]);
    const mobileQuery = '(max-width: 520px), (min-width: 521px) and (max-width: 767px) and (pointer: coarse)';
    expect(shellCss).toMatch(/\.workspace-page\s*\{[^}]*display:grid[^}]*place-items:center/s);
    expect(shellCss).toMatch(/\.workspace-scene\s*\{[^}]*aspect-ratio:1672\/941/s);
    expect(shellCss).toMatch(/\.workspace-scene\s*\{[^}]*min-height:0/s);
    expect(shellCss).toMatch(/\.workspace-scene\s*\{[^}]*background-size:100% 100%/s);
    expect(shellCss).toContain("background-image:url('/assets/galaxy/cozy-galaxy-workspace-reference.png')");
    expect(shellCss).not.toContain("background-image:url('/assets/galaxy/workspace-base.webp')");
    expect(shellCss).not.toMatch(/\.workspace-scene\s*\{[^}]*min-height:100dvh/s);
    expect(responsiveCss).toContain('@media (max-width:520px),(min-width:521px) and (max-width:767px) and (pointer:coarse)');
    expect(responsiveCss).not.toContain('@media (max-width:767px){');
    expect(responsiveCss).toMatch(/pointer:coarse\)[\s\S]*?\.workspace-page\s*\{[^}]*display:block/s);
    expect(responsiveCss).toMatch(/pointer:coarse\)[\s\S]*?\.workspace-scene\s*\{[^}]*height:100svh[^}]*background-size:cover/s);
    expect(workspaceSource).toContain(`const MOBILE_MEDIA_QUERY = '${mobileQuery}'`);
    expect(workspaceSource).toContain('window.matchMedia(MOBILE_MEDIA_QUERY)');
    expect(workspaceSource).not.toContain('window.innerWidth < 768');
    expect(workspaceSource).not.toContain("window.matchMedia('(max-width: 767px)')");
    expect(foregroundSource).toContain(`const MOBILE_MEDIA_QUERY = '${mobileQuery}'`);
    expect(foregroundSource).toContain('media={MOBILE_MEDIA_QUERY}');
    expect(foregroundSource).not.toContain('media="(max-width: 767px)"');
  });

  test('photo cape rig uses sparse desktop and mobile alpha assets without moving the plush body', async () => {
    const [desktop, mobile, component, elementsCss, responsiveCss] = await Promise.all([
      sharp(fileURLToPath(file('public/assets/galaxy/plush-cape-desktop-v1.webp'))).metadata(),
      sharp(fileURLToPath(file('public/assets/galaxy/plush-cape-mobile-v1.webp'))).metadata(),
      readFile(file('src/features/workspace/elements/PlushCharacter.tsx'), 'utf8'),
      readFile(file('src/styles/workspace/elements.css'), 'utf8'),
      readFile(file('src/styles/workspace/responsive.css'), 'utf8'),
    ]);
    expect({ width: desktop.width, height: desktop.height, hasAlpha: desktop.hasAlpha }).toEqual({
      width: 1672,
      height: 941,
      hasAlpha: true,
    });
    expect({ width: mobile.width, height: mobile.height, hasAlpha: mobile.hasAlpha }).toEqual({
      width: 940,
      height: 1672,
      hasAlpha: true,
    });

    const alphaStats = async (path) => {
      const { data, info } = await sharp(fileURLToPath(file(path))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let visible = 0;
      let minX = info.width;
      let minY = info.height;
      let maxX = -1;
      let maxY = -1;
      for (let index = 3; index < data.length; index += info.channels) {
        if (data[index] <= 16) continue;
        visible += 1;
        const pixel = (index - 3) / info.channels;
        const x = pixel % info.width;
        const y = Math.floor(pixel / info.width);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      return {
        data,
        info,
        visible,
        coverage: visible / (info.width * info.height),
        bbox: [minX, minY, maxX, maxY],
      };
    };
    const [desktopCape, mobileCape, desktopForeground, mobileForeground] = await Promise.all([
      alphaStats('public/assets/galaxy/plush-cape-desktop-v1.webp'),
      alphaStats('public/assets/galaxy/plush-cape-mobile-v1.webp'),
      alphaStats('public/assets/galaxy/foreground-occluder-v3.webp'),
      alphaStats('public/assets/galaxy/foreground-occluder-mobile-v3.webp'),
    ]);
    expect(desktopCape.coverage).toBeGreaterThan(0.001);
    expect(desktopCape.coverage).toBeLessThan(0.08);
    expect(mobileCape.coverage).toBeGreaterThan(0.0005);
    expect(mobileCape.coverage).toBeLessThan(0.08);
    expect(mobileCape.bbox[1]).toBeGreaterThanOrEqual(925);

    const visibleInRoi = ({ data, info }, [x0, y0, x1, y1]) => {
      let visible = 0;
      for (let y = y0; y <= y1; y += 1) {
        for (let x = x0; x <= x1; x += 1) {
          if (data[(y * info.width + x) * info.channels + 3] > 16) visible += 1;
        }
      }
      return visible;
    };
    expect(visibleInRoi(desktopCape, [1300, 430, 1650, 549])).toBe(0);
    expect(visibleInRoi(mobileCape, [750, 850, 920, 924])).toBe(0);
    const desktopPlushPixels = visibleInRoi(desktopForeground, [1300, 430, 1650, 700]);
    const mobilePlushPixels = visibleInRoi(mobileForeground, [750, 850, 920, 1020]);
    const desktopCapeRatio = desktopCape.visible / desktopPlushPixels;
    const mobileCapeRatio = mobileCape.visible / mobilePlushPixels;
    expect(desktopCapeRatio).toBeGreaterThan(0.12);
    expect(desktopCapeRatio).toBeLessThan(0.35);
    expect(mobileCapeRatio).toBeGreaterThan(0.12);
    expect(mobileCapeRatio).toBeLessThan(0.35);
    expect(Math.abs(desktopCapeRatio - mobileCapeRatio)).toBeLessThan(0.08);

    const homography = [
      [0.562762, -0.000180, -0.064983],
      [0.0000049, 0.562846, 619.924743],
      [0.000000017, -0.000000361, 1],
    ];
    const mappedDesktop = new Uint8Array(mobileCape.info.width * mobileCape.info.height);
    for (let y = 0; y < desktopCape.info.height; y += 1) {
      for (let x = 0; x < desktopCape.info.width; x += 1) {
        if (desktopCape.data[(y * desktopCape.info.width + x) * desktopCape.info.channels + 3] <= 16) continue;
        const denominator = homography[2][0] * x + homography[2][1] * y + homography[2][2];
        const mappedX = Math.round((homography[0][0] * x + homography[0][1] * y + homography[0][2]) / denominator);
        const mappedY = Math.round((homography[1][0] * x + homography[1][1] * y + homography[1][2]) / denominator);
        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            const targetX = mappedX + offsetX;
            const targetY = mappedY + offsetY;
            if (targetX < 0 || targetX >= mobileCape.info.width || targetY < 0 || targetY >= mobileCape.info.height) continue;
            mappedDesktop[targetY * mobileCape.info.width + targetX] = 1;
          }
        }
      }
    }
    let intersection = 0;
    let union = 0;
    let actualOutsideMapping = 0;
    for (let y = 0; y < mobileCape.info.height; y += 1) {
      for (let x = 0; x < mobileCape.info.width; x += 1) {
        const index = y * mobileCape.info.width + x;
        const actual = mobileCape.data[index * mobileCape.info.channels + 3] > 16;
        const expected = mappedDesktop[index] === 1;
        if (actual && expected) intersection += 1;
        if (actual || expected) union += 1;
        if (actual && !expected) actualOutsideMapping += 1;
      }
    }
    expect(actualOutsideMapping).toBe(0);
    expect(intersection / union).toBeGreaterThan(0.7);

    expect(component).toContain('className="plush-cape-rig"');
    expect(component).toContain('className="cape-segment cape-upper"');
    expect(component).toContain('className="cape-segment cape-middle"');
    expect(component).toContain('className="cape-segment cape-tail"');
    expect(component).not.toContain('scarf-tail');
    expect(elementsCss).not.toMatch(/\.scarf-tail/);
    expect(elementsCss).toMatch(/\.plush-cape-rig\s*\{[^}]*position:absolute[^}]*inset:0[^}]*z-index:4[^}]*container-type:size/s);
    expect(elementsCss).toMatch(/\.cape-segment\s*\{[^}]*position:absolute[^}]*left:50%[^}]*top:0[^}]*width:100%[^}]*height:100%[^}]*background-size:100% 100%/s);
    expect(elementsCss).toMatch(/@keyframes cape-float\s*\{[^}]*translateX\(-50%\)[\s\S]*?translateX\(-50%\)/s);
    expect(elementsCss).toContain("background-image:url('/assets/galaxy/plush-cape-desktop-v1.webp')");
    expect(elementsCss).toMatch(/\.cape-upper\s*\{[^}]*--cape-rotate:1deg[^}]*--cape-shift:1px[^}]*animation:cape-float 4\.4s/s);
    expect(elementsCss).toMatch(/\.cape-middle\s*\{[^}]*--cape-rotate:2deg[^}]*--cape-shift:2px[^}]*animation:cape-float 3\.6s/s);
    expect(elementsCss).toMatch(/\.cape-tail\s*\{[^}]*--cape-rotate:3\.4deg[^}]*--cape-shift:3px[^}]*animation:cape-float 3\.2s/s);
    expect(responsiveCss).toContain("background-image:url('/assets/galaxy/plush-cape-mobile-v1.webp')");
    expect(responsiveCss).toMatch(/\.cape-segment\s*\{[^}]*width:max\(100cqw,56\.2201cqh\)[^}]*height:max\(100cqh,177\.8723cqw\)[^}]*background-size:100% 100%[^}]*background-position:center top/s);
    expect(responsiveCss).toMatch(/\.cape-upper\s*\{[^}]*--cape-rotate:0\.7deg[^}]*--cape-shift:0\.7px/s);
    expect(responsiveCss).toMatch(/\.cape-middle\s*\{[^}]*--cape-rotate:1\.4deg[^}]*--cape-shift:1\.4px/s);
    expect(responsiveCss).toMatch(/\.cape-tail\s*\{[^}]*--cape-rotate:2\.4deg[^}]*--cape-shift:2\.1px/s);
    expect(responsiveCss).toMatch(/prefers-reduced-motion:reduce\)[\s\S]*?\.plush-cape-rig\s*\{[^}]*display:none/s);
  });
});
