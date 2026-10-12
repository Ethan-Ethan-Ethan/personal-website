import { resolve } from 'node:path';
import {
  runExternal,
  spawnOwnedProcess,
  stopOwnedProcess,
} from '../lib/command-runtime.mjs';
import { verifyGeneratedSiteSystem } from '../lib/site-system.mjs';
import { runContentSync } from '../lib/sync-public-content.mjs';

const E2E_HOST = '127.0.0.1';
const E2E_PORT = 4321;
const E2E_BASE_URL = `http://${E2E_HOST}:${E2E_PORT}`;
const PLAYWRIGHT_OUTPUT_DIR = resolve(process.env.TMPDIR || '/tmp', `personal-website-playwright-${process.pid}`);
const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

async function waitForOwnedPreview(
  _root,
  child,
  expectedUrl,
  { timeoutMs = 30_000, intervalMs = 100, fetchImpl = fetch } = {},
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode) {
      throw new Error(`owned Astro preview exited before readiness${child.output ? `:\n${child.output}` : ''}`);
    }
    if (child.output?.includes(expectedUrl)) {
      try {
        const response = await fetchImpl(expectedUrl, {
          cache: 'no-store',
          headers: { 'x-e2e-owner-pid': String(child.pid) },
        });
        if (response.ok) return;
      } catch {
        // The owned preview announced its URL but the listener may still be warming up.
      }
    }
    await delay(intervalMs);
  }
  throw new Error(`owned Astro preview did not become ready at ${expectedUrl} within ${timeoutMs}ms`);
}

function runBenchmark(root, artifact, rubric, expectedVerdict) {
  const engine = resolve(process.env.HOME, 'Documents/scripts/benchmark_gate.py');
  runExternal(root, 'python3', [engine, 'validate-rubric', '--rubric', rubric]);
  const output = runExternal(root, 'python3', [engine, 'run', '--artifact', artifact, '--rubric', rubric, '--json'], { capture: true });
  const protocol = JSON.parse(output);
  if (protocol.score?.verdict !== expectedVerdict) throw new Error(`${artifact} expected ${expectedVerdict}, got ${protocol.score?.verdict}`);
}

export async function runOwnedE2E(root, dependencies = {}, testArgs = []) {
  const buildSite = dependencies.buildSite || runExternal;
  const spawnServer = dependencies.spawnServer || spawnOwnedProcess;
  const waitForReady = dependencies.waitForReady || waitForOwnedPreview;
  const runTests = dependencies.runTests || runExternal;
  const stopServer = dependencies.stopServer || stopOwnedProcess;
  const serverEnv = { ...process.env, ASTRO_DEV_BACKGROUND: '0', ASTRO_PREVIEW_BACKGROUND: '0' };
  buildSite(root, 'npx', ['astro', 'build']);
  const serverArgs = [
    resolve(root, 'node_modules/astro/bin/astro.mjs'),
    'preview',
    '--host', E2E_HOST,
    '--port', String(E2E_PORT),
  ];
  const child = spawnServer(root, process.execPath, serverArgs, { env: serverEnv });

  try {
    await waitForReady(root, child, E2E_BASE_URL);
    const commandArgs = ['run', 'test:e2e:raw', '--', ...testArgs, '--output', PLAYWRIGHT_OUTPUT_DIR];
    runTests(root, 'npm', commandArgs, {
      env: {
        ...process.env,
        E2E_BASE_URL,
        E2E_SERVER_PID: String(child.pid),
        E2E_SERVER_OWNED: '1',
      },
    });
  } finally {
    await stopServer(child);
  }
}

function assertPlaywrightStats(output, expectedStats, label) {
  const report = JSON.parse(output);
  const stats = report.stats || {};
  for (const [key, expected] of Object.entries(expectedStats)) {
    if (stats[key] !== expected) {
      throw new Error(`${label} expected Playwright stats.${key}=${expected}, got ${stats[key]}`);
    }
  }
}

export async function runOwnedVisualContract(root, dependencies = {}) {
  const buildSite = dependencies.buildSite || runExternal;
  const spawnServer = dependencies.spawnServer || spawnOwnedProcess;
  const waitForReady = dependencies.waitForReady || waitForOwnedPreview;
  const runTests = dependencies.runTests || runExternal;
  const stopServer = dependencies.stopServer || stopOwnedProcess;
  const serverEnv = { ...process.env, ASTRO_DEV_BACKGROUND: '0', ASTRO_PREVIEW_BACKGROUND: '0' };
  buildSite(root, 'npx', ['astro', 'build']);
  const child = spawnServer(root, process.execPath, [
    resolve(root, 'node_modules/astro/bin/astro.mjs'),
    'preview',
    '--host', E2E_HOST,
    '--port', String(E2E_PORT),
  ], { env: serverEnv });

  const checks = [
    {
      label: 'real meteor browser evidence',
      file: 'verification/e2e/visual-fusion.spec.ts',
      grep: 'real meteor frames keep visual continuity while passing behind foreground',
      project: 'desktop-chrome',
      stats: { expected: 2, skipped: 1, unexpected: 0 },
    },
    {
      label: 'local hotspot preview',
      file: 'verification/e2e/hotspot-popover.spec.ts',
      grep: 'monitor and bottom controls share one local preview without changing the scene',
      project: 'desktop-chrome',
      stats: { expected: 1, skipped: 0, unexpected: 0 },
    },
    {
      label: 'hotspot controls without painted button chrome',
      file: 'verification/e2e/visual-fusion.spec.ts',
      grep: 'idle and active hotspot controls keep hit targets without painted button chrome',
      project: 'desktop-chrome',
      stats: { expected: 1, skipped: 0, unexpected: 0 },
    },
    {
      label: 'desktop hotspot pixel locality',
      file: 'verification/e2e/visual-fusion.spec.ts',
      grep: 'hotspot preview changes only local UI in desktop',
      project: 'desktop-chrome',
      stats: { expected: 1, skipped: 0, unexpected: 0 },
    },
    {
      label: 'tablet hotspot pixel locality',
      file: 'verification/e2e/visual-fusion.spec.ts',
      grep: 'hotspot preview changes only local UI in tablet',
      project: 'desktop-chrome',
      stats: { expected: 1, skipped: 0, unexpected: 0 },
    },
    {
      label: 'mobile hotspot pixel locality',
      file: 'verification/e2e/visual-fusion.spec.ts',
      grep: 'hotspot preview changes only local UI in mobile',
      project: 'mobile-chrome',
      stats: { expected: 1, skipped: 0, unexpected: 0 },
    },
  ];

  try {
    await waitForReady(root, child, E2E_BASE_URL);
    const env = {
      ...process.env,
      FORCE_COLOR: '0',
      NO_COLOR: '1',
      E2E_BASE_URL,
      E2E_SERVER_PID: String(child.pid),
      E2E_SERVER_OWNED: '1',
    };
    for (const check of checks) {
      const output = runTests(root, 'npx', [
        'playwright',
        'test',
        check.file,
        '--grep',
        check.grep,
        '--project',
        check.project,
        '--reporter=json',
        '--output',
        PLAYWRIGHT_OUTPUT_DIR,
      ], { capture: true, env });
      assertPlaywrightStats(output, check.stats, check.label);
    }
  } finally {
    await stopServer(child);
  }
}

export async function handleVerifyCommand(root, action) {
  if (action === 'unit') runExternal(root, 'npm', ['test']);
  else if (action === 'e2e') await runOwnedE2E(root);
  else if (action === 'contracts') {
    await verifyGeneratedSiteSystem(root);
    runExternal(root, 'npm', ['run', 'content:dsh']);
    const base = 'verification/contracts/site-system';
    runBenchmark(root, 'config/site-system.yaml', `${base}/docs/rubric.yaml`, 'PASS');
    runBenchmark(root, `${base}/benchmark/artifacts/_golden/good.yaml`, `${base}/docs/rubric.yaml`, 'PASS');
    for (const fixture of [
      'bad.yaml',
      'unsafe-but-previously-passed.yaml',
      'unsafe-missing-command.yaml',
      'unsafe-input-type.yaml',
      'unsafe-fractional-layer.yaml',
      'unsafe-incomplete-element.yaml',
    ]) runBenchmark(root, `${base}/benchmark/artifacts/_golden/${fixture}`, `${base}/docs/rubric.yaml`, 'FAIL');

    const publicBase = 'verification/contracts/public-content';
    runBenchmark(root, `${publicBase}/benchmark/artifacts/_golden/good.json`, `${publicBase}/docs/rubric.yaml`, 'PASS');
    for (const fixture of [
      'bad.json',
      'unsafe-but-previously-passed.json',
      'unsafe-hash.json',
      'unsafe-sensitive.json',
    ]) runBenchmark(root, `${publicBase}/benchmark/artifacts/_golden/${fixture}`, `${publicBase}/docs/rubric.yaml`, 'FAIL');

    const visualBase = 'verification/contracts/visual-compositing';
    await runOwnedVisualContract(root);
    runBenchmark(root, `${visualBase}/evaluator.ts`, `${visualBase}/docs/rubric.yaml`, 'PASS');
    runBenchmark(root, `${visualBase}/benchmark/artifacts/_golden/good.ts`, `${visualBase}/docs/rubric.yaml`, 'PASS');
    for (const fixture of [
      'bad-magenta-probe.ts',
      'bad-hidden-header.ts',
      'bad-sparse-timeline.ts',
    ]) runBenchmark(root, `${visualBase}/benchmark/artifacts/_golden/${fixture}`, `${visualBase}/docs/rubric.yaml`, 'FAIL');
  } else if (action === 'transition') runExternal(root, 'node', ['scripts/check-transition-single-source.mjs']);
  else if (action === 'build') runExternal(root, 'npx', ['astro', 'build']);
  else if (action === 'all') {
    for (const step of ['unit', 'transition', 'e2e', 'contracts']) await handleVerifyCommand(root, step);
    await runContentSync({ projectRoot: root, mode: 'check', sourceMode: 'auto' });
    await handleVerifyCommand(root, 'build');
  } else throw new Error(`unknown command: verify.${action}`);
  return { ok: true, command: `verify.${action}` };
}
