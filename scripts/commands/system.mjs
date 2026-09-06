import { verifyGeneratedSiteSystem } from '../lib/site-system.mjs';
import { withCommandLock } from '../lib/command-runtime.mjs';

export async function handleSystemCommand(root, action, options) {
  if (action === 'validate') {
    await verifyGeneratedSiteSystem(root);
    return { ok: true, command: 'system.validate' };
  }
  if (action === 'generate') {
    if (options.dryRun) {
      try { await verifyGeneratedSiteSystem(root); return { ok: true, command: 'system.generate', changed: false, dryRun: true }; }
      catch (error) { if (/drift/.test(error.message)) return { ok: true, command: 'system.generate', changed: true, dryRun: true }; throw error; }
    }
    const result = await withCommandLock(root, 'site-system', () => verifyGeneratedSiteSystem(root, { write: true }));
    return { ok: true, command: 'system.generate', ...result };
  }
  throw new Error(`unknown command: system.${action}`);
}
