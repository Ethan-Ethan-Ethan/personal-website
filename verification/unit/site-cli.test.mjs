import { describe, expect, test } from 'vitest';
import { fileURLToPath } from 'node:url';
import { parseSiteArgs, runSiteCommand } from '../../scripts/lib/site-cli.mjs';

const projectRoot = fileURLToPath(new URL('../..', import.meta.url));

describe('site command router', () => {
  test('parses domain/action/options and rejects unknown flags', () => {
    expect(parseSiteArgs(['content', 'sync', '--dry-run'])).toMatchObject({ domain: 'content', action: 'sync', dryRun: true });
    expect(() => parseSiteArgs(['system', 'validate', '--mystery'])).toThrow(/unknown option/);
  });

  test('rejects dry-run when the selected command does not declare it', async () => {
    await expect(runSiteCommand({ projectRoot, argv: ['system', 'validate', '--dry-run'] }))
      .rejects.toThrow(/does not accept --dry-run/);
  });

  test('rejects source-mode when the selected command does not declare it', async () => {
    await expect(runSiteCommand({ projectRoot, argv: ['system', 'validate', '--source-mode', 'artifact'] }))
      .rejects.toThrow(/does not accept --source-mode/);
  });

  test('accepts dry-run for rss.run because it is declared by the canonical contract', async () => {
    await expect(runSiteCommand({ projectRoot, argv: ['rss', 'run', '--dry-run'] }))
      .resolves.toMatchObject({ ok: true, command: 'rss.run', dryRun: true });
  });

  test('lists semantic commands from generated registry', async () => {
    const result = await runSiteCommand({ projectRoot, argv: ['command', 'list'] });
    expect(result.ok).toBe(true);
    expect(result.lines).toContain('scene.preview');
    expect(result.lines).toContain('window.open');
    expect(result.lines).toContain('command.list');
  });

  test('validates canonical YAML and generated TypeScript drift', async () => {
    const result = await runSiteCommand({ projectRoot, argv: ['system', 'validate'] });
    expect(result).toMatchObject({ ok: true, command: 'system.validate' });
  });

  test('fails closed for unknown semantic commands', async () => {
    await expect(runSiteCommand({ projectRoot, argv: ['scene', 'explode'] })).rejects.toThrow(/unknown command/);
  });
});
