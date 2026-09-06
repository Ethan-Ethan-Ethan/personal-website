import { runContentSync } from '../lib/sync-public-content.mjs';
import { withCommandLock } from '../lib/command-runtime.mjs';

export async function handleContentCommand(root, action, options) {
  if (action === 'check') {
    const result = await runContentSync({ projectRoot: root, mode: 'check', sourceMode: options.sourceMode, allowMissingSources: options.sourceMode === 'artifact' });
    return { ok: true, command: 'content.check', ...result };
  }
  if (action === 'sync') {
    const execute = () => runContentSync({ projectRoot: root, mode: 'sync', dryRun: options.dryRun });
    const result = options.dryRun ? await execute() : await withCommandLock(root, 'site-content', execute);
    return { ok: true, command: 'content.sync', ...result };
  }
  throw new Error(`unknown command: content.${action}`);
}
