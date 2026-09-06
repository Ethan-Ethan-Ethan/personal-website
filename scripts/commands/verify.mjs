import { resolve } from 'node:path';
import {
  runExternal,
  spawnOwnedProcess,
  stopOwnedAstroServer,
  waitForOwnedAstroServer,
} from '../lib/command-runtime.mjs';
import { verifyGeneratedSiteSystem } from '../lib/site-system.mjs';
import { runContentSync } from '../lib/sync-public-content.mjs';

const E2E_HOST = '127.0.0.1';
const E2E_PORT = 4321;
const E2E_BASE_URL = `http://${E2E_HOST}:${E2E_PORT}`;

function runBenchmark(root, artifact, rubric, expectedVerdict) {
  const engine = resolve(process.env.HOME, 'Documents/scripts/benchmark_gate.py');
  runExternal(root, 'python3', [engine, 'validate-rubric', '--rubric', rubric]);
  const output = runExternal(root, 'python3', [engine, 'run', '--artifact', artifact, '--rubric', rubric, '--json'], { capture: true });
  const protocol = JSON.parse(output);
  if (protocol.score?.verdict !== expectedVerdict) throw new Error(`${artifact} expected ${expectedVerdict}, got ${protocol.score?.verdict}`);
}

export async function runOwnedE2E(root, dependencies = {}) {
  const spawnServer = dependencies.spawnServer || spawnOwnedProcess;
  const waitForReady = dependencies.waitForReady || waitForOwnedAstroServer;
  const runTests = dependencies.runTests || runExternal;
  const stopServer = dependencies.stopServer || ((child) => stopOwnedAstroServer(root, child));
  const serverEnv = { ...process.env, ASTRO_DEV_BACKGROUND: '0' };
  const serverArgs = [
    resolve(root, 'node_modules/astro/bin/astro.mjs'),
    'dev',
    '--host', E2E_HOST,
    '--port', String(E2E_PORT),
    '--force',
  ];
  const child = spawnServer(root, process.execPath, serverArgs, { env: serverEnv });

  try {
    await waitForReady(root, child, E2E_BASE_URL);
    runTests(root, 'npm', ['run', 'test:e2e:raw'], {
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
  } else if (action === 'build') runExternal(root, 'npx', ['astro', 'build']);
  else if (action === 'all') {
    for (const step of ['unit', 'e2e', 'contracts']) await handleVerifyCommand(root, step);
    await runContentSync({ projectRoot: root, mode: 'check', sourceMode: 'auto' });
    await handleVerifyCommand(root, 'build');
  } else throw new Error(`unknown command: verify.${action}`);
  return { ok: true, command: `verify.${action}` };
}
