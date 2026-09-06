import { once } from 'node:events';
import { open, readFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

export async function withCommandLock(root, name, fn) {
  const lockPath = resolve(root, `scripts/.${name}.lock`);
  const handle = await open(lockPath, 'wx');
  try {
    await handle.writeFile(`${process.pid}\n`);
    await handle.close();
    return await fn();
  } finally {
    await handle.close().catch(() => {});
    await unlink(lockPath).catch(() => {});
  }
}

export function runExternal(root, command, args, { capture = false, env = process.env } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: capture ? 'pipe' : 'inherit',
    encoding: capture ? 'utf8' : undefined,
    env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit ${result.status}`);
  return capture ? result.stdout : '';
}

export function spawnOwnedProcess(root, command, args, { env = process.env } = {}) {
  const child = spawn(command, args, {
    cwd: root,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.output = '';
  const capture = (chunk, destination) => {
    const text = chunk.toString();
    child.output = `${child.output}${text}`.slice(-32_000);
    destination.write(chunk);
  };
  child.stdout?.on('data', (chunk) => capture(chunk, process.stdout));
  child.stderr?.on('data', (chunk) => capture(chunk, process.stderr));
  return child;
}

function normalizeUrl(value) {
  return String(value || '').replace(/\/$/, '');
}

async function readAstroLock(root) {
  try {
    return JSON.parse(await readFile(resolve(root, '.astro/dev.json'), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) return null;
    throw error;
  }
}

export async function waitForOwnedAstroServer(
  root,
  child,
  expectedUrl,
  { timeoutMs = 30_000, intervalMs = 100, fetchImpl = fetch } = {},
) {
  const deadline = Date.now() + timeoutMs;
  const normalizedExpectedUrl = normalizeUrl(expectedUrl);

  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode) {
      throw new Error(`owned Astro server exited before readiness${child.output ? `:\n${child.output}` : ''}`);
    }

    const lock = await readAstroLock(root);
    if (lock?.pid === child.pid) {
      const lockUrl = normalizeUrl(lock.url);
      if (lockUrl !== normalizedExpectedUrl || Number(lock.port) !== Number(new URL(expectedUrl).port)) {
        throw new Error(`owned Astro server selected ${lock.url}; expected ${expectedUrl}. Port 4321 must be available because one existing E2E spec uses an absolute URL.`);
      }
      try {
        const response = await fetchImpl(expectedUrl, {
          cache: 'no-store',
          headers: { 'x-e2e-owner-pid': String(child.pid) },
        });
        if (response.ok) return;
      } catch {
        // The owned process has the lock but its HTTP listener may still be warming up.
      }
    }
    await delay(intervalMs);
  }

  throw new Error(`owned Astro server did not become ready at ${expectedUrl} within ${timeoutMs}ms`);
}

export async function stopOwnedProcess(child, { timeoutMs = 5_000 } = {}) {
  if (!child || child.exitCode !== null || child.signalCode) return;
  const exited = once(child, 'exit').catch(() => {});
  child.kill('SIGTERM');
  await Promise.race([exited, delay(timeoutMs)]);
  if (child.exitCode === null && !child.signalCode) {
    child.kill('SIGKILL');
    await Promise.race([once(child, 'exit').catch(() => {}), delay(1_000)]);
  }
}

export async function stopOwnedAstroServer(root, child, options) {
  await stopOwnedProcess(child, options);
  const lock = await readAstroLock(root);
  if (lock?.pid === child?.pid) {
    await unlink(resolve(root, '.astro/dev.json')).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}
