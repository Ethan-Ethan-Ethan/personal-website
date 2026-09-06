import { describe, expect, test } from 'vitest';
import { readFile } from 'node:fs/promises';

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
  test('desktop and mobile foregrounds are full-size WebP assets with alpha', async () => {
    const desktop = webpMetadata(await readFile(file('public/assets/galaxy/workspace-foreground-alpha.webp')));
    const mobile = webpMetadata(await readFile(file('public/assets/galaxy/workspace-mobile-foreground-alpha.webp')));
    expect(desktop).toEqual({ width: 1672, height: 941, hasAlpha: true });
    expect(mobile).toEqual({ width: 940, height: 1672, hasAlpha: true });
  });

  test('foreground component consumes alpha assets and CSS no longer clips a polygon', async () => {
    const [component, plush, elementsCss, responsiveCss] = await Promise.all([
      readFile(file('src/features/workspace/elements/ForegroundOcclusion.tsx'), 'utf8'),
      readFile(file('src/features/workspace/elements/PlushCharacter.tsx'), 'utf8'),
      readFile(file('src/styles/workspace/elements.css'), 'utf8'),
      readFile(file('src/styles/workspace/responsive.css'), 'utf8'),
    ]);
    const css = `${elementsCss}\n${responsiveCss}`;
    expect(component).toContain('workspace-foreground-alpha.webp');
    expect(component).toContain('workspace-mobile-foreground-alpha.webp');
    expect(css).not.toMatch(/\.computer-foreground(?:\s+img)?\s*\{[^}]*clip-path/s);
    expect(css).not.toContain('workspace-foreground.webp');
    expect(css).not.toContain('workspace-mobile-foreground.webp');
    expect(css).not.toMatch(/\.plush-foreground/);
    expect(plush).not.toContain('plush-foreground');
  });

  test('atmosphere particles stay strictly below the alpha foreground layer', async () => {
    const [sceneCss, elementsCss] = await Promise.all([
      readFile(file('src/styles/workspace/scene.css'), 'utf8'),
      readFile(file('src/styles/workspace/elements.css'), 'utf8'),
    ]);
    expect(sceneCss).toMatch(/\.room-dust\s*\{[^}]*z-index:3/s);
    expect(elementsCss).toMatch(/\.computer-foreground,\.plush-reactor\s*\{[^}]*z-index:4/s);
  });

  test('scene keeps atmosphere before the real foreground occluder', async () => {
    const source = await readFile(file('src/features/workspace/elements/WorkspaceScene.tsx'), 'utf8');
    expect(source.indexOf('<SceneAtmosphere')).toBeGreaterThan(-1);
    expect(source.indexOf('<ForegroundOcclusion')).toBeGreaterThan(source.indexOf('<SceneAtmosphere'));
    expect(source.indexOf('<ComputerHotspots')).toBeGreaterThan(source.indexOf('<ForegroundOcclusion'));
  });
});
