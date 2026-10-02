import { EventEmitter } from 'node:events';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, test, vi } from 'vitest';

const verifyModule = await import('../../scripts/commands/verify.mjs');
const runtimeModule = await import('../../scripts/lib/command-runtime.mjs');

function fakeChild(pid = 4242) {
  const child = new EventEmitter();
  child.pid = pid;
  child.exitCode = null;
  child.signalCode = null;
  child.kill = vi.fn(() => {
    child.signalCode = 'SIGTERM';
    child.exitCode = 0;
    queueMicrotask(() => child.emit('exit', 0, 'SIGTERM'));
    return true;
  });
  return child;
}

describe('owned E2E server lifecycle', () => {
  test('builds a static preview, waits for readiness, passes the owned URL to Playwright, and always cleans up', async () => {
    expect(typeof verifyModule.runOwnedE2E).toBe('function');
    if (typeof verifyModule.runOwnedE2E !== 'function') return;

    const events = [];
    const child = fakeChild();
    const buildSite = vi.fn(() => events.push('build'));
    const spawnServer = vi.fn(() => {
      events.push('spawn');
      return child;
    });
    const waitForReady = vi.fn(async () => events.push('ready'));
    const runTests = vi.fn((_root, _command, _args, options) => {
      events.push('tests');
      expect(options.env.E2E_BASE_URL).toBe('http://127.0.0.1:4321');
      expect(options.env.E2E_SERVER_PID).toBe('4242');
      expect(options.env.E2E_SERVER_OWNED).toBe('1');
      throw new Error('synthetic Playwright failure');
    });
    const stopServer = vi.fn(async () => events.push('cleanup'));

    await expect(verifyModule.runOwnedE2E('/project', {
      buildSite,
      spawnServer,
      waitForReady,
      runTests,
      stopServer,
    })).rejects.toThrow('synthetic Playwright failure');

    expect(events).toEqual(['build', 'spawn', 'ready', 'tests', 'cleanup']);
    expect(stopServer).toHaveBeenCalledWith(child);
    expect(spawnServer).toHaveBeenCalledWith(
      '/project',
      process.execPath,
      expect.arrayContaining(['preview', '--host', '127.0.0.1', '--port', '4321']),
      expect.objectContaining({ env: expect.any(Object) }),
    );
  });

  test('readiness requires the Astro lock to belong to the spawned child', async () => {
    expect(typeof runtimeModule.waitForOwnedAstroServer).toBe('function');
    if (typeof runtimeModule.waitForOwnedAstroServer !== 'function') return;

    const root = await mkdtemp(join(tmpdir(), 'site-e2e-owner-'));
    await mkdir(join(root, '.astro'));
    await writeFile(join(root, '.astro', 'dev.json'), JSON.stringify({
      pid: 1111,
      port: 4321,
      url: 'http://127.0.0.1:4321',
    }));

    await expect(runtimeModule.waitForOwnedAstroServer(
      root,
      { pid: 2222, exitCode: null },
      'http://127.0.0.1:4321',
      { timeoutMs: 40, intervalMs: 5, fetchImpl: vi.fn() },
    )).rejects.toThrow(/owned Astro server.*ready/i);
  });

  test('readiness checks the expected URL only after ownership is proven', async () => {
    expect(typeof runtimeModule.waitForOwnedAstroServer).toBe('function');
    if (typeof runtimeModule.waitForOwnedAstroServer !== 'function') return;

    const root = await mkdtemp(join(tmpdir(), 'site-e2e-ready-'));
    await mkdir(join(root, '.astro'));
    await writeFile(join(root, '.astro', 'dev.json'), JSON.stringify({
      pid: 3333,
      port: 4321,
      url: 'http://127.0.0.1:4321',
    }));
    const fetchImpl = vi.fn(async () => ({ ok: true, status: 200 }));

    await runtimeModule.waitForOwnedAstroServer(
      root,
      { pid: 3333, exitCode: null },
      'http://127.0.0.1:4321',
      { timeoutMs: 40, intervalMs: 5, fetchImpl },
    );

    expect(fetchImpl).toHaveBeenCalledWith(
      'http://127.0.0.1:4321',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  test('cleanup removes only the lock owned by the spawned Astro process', async () => {
    expect(typeof runtimeModule.stopOwnedAstroServer).toBe('function');
    if (typeof runtimeModule.stopOwnedAstroServer !== 'function') return;

    const root = await mkdtemp(join(tmpdir(), 'site-e2e-cleanup-'));
    await mkdir(join(root, '.astro'));
    const lockPath = join(root, '.astro', 'dev.json');
    await writeFile(lockPath, JSON.stringify({ pid: 4444, port: 4321, url: 'http://127.0.0.1:4321' }));
    const child = fakeChild(4444);

    await runtimeModule.stopOwnedAstroServer(root, child, { timeoutMs: 40 });

    const { access } = await import('node:fs/promises');
    await expect(access(lockPath)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  test('raw Playwright entry point rejects callers without an owned server contract', () => {
    const env = { ...process.env };
    delete env.E2E_BASE_URL;
    delete env.E2E_SERVER_PID;
    delete env.E2E_SERVER_OWNED;
    const result = spawnSync('npm', ['run', 'test:e2e:raw', '--', '--list'], {
      cwd: process.cwd(),
      env,
      encoding: 'utf8',
    });

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(/owned server|internal-only/i);
  });

  test('runs local preview, no-painted button chrome, and pixel-locality browser oracles', async () => {
    const child = fakeChild();
    const calls = [];
    const runTests = vi.fn((_root, _command, args) => {
      calls.push(args);
      return JSON.stringify({
        stats: calls.length === 1
          ? { expected: 2, skipped: 1, unexpected: 0 }
          : { expected: 1, skipped: 0, unexpected: 0 },
      });
    });

    await verifyModule.runOwnedVisualContract('/project', {
      buildSite: vi.fn(),
      spawnServer: vi.fn(() => child),
      waitForReady: vi.fn(),
      runTests,
      stopServer: vi.fn(),
    });

    expect(calls).toHaveLength(6);
    expect(calls[1]).toEqual(expect.arrayContaining([
      'verification/e2e/hotspot-popover.spec.ts',
      'monitor and bottom controls share one local preview without changing the scene',
      'desktop-chrome',
    ]));
    expect(calls[2]).toEqual(expect.arrayContaining([
      'verification/e2e/visual-fusion.spec.ts',
      'idle and active hotspot controls keep hit targets without painted button chrome',
      'desktop-chrome',
    ]));
    expect(calls[3]).toEqual(expect.arrayContaining([
      'verification/e2e/visual-fusion.spec.ts',
      'hotspot preview changes only local UI in desktop',
      'desktop-chrome',
    ]));
    expect(calls[4]).toEqual(expect.arrayContaining([
      'verification/e2e/visual-fusion.spec.ts',
      'hotspot preview changes only local UI in tablet',
      'desktop-chrome',
    ]));
    expect(calls[5]).toEqual(expect.arrayContaining([
      'verification/e2e/visual-fusion.spec.ts',
      'hotspot preview changes only local UI in mobile',
      'mobile-chrome',
    ]));
  });
});
