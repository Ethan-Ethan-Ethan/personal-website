import { runExternal } from '../lib/command-runtime.mjs';

export async function handleRssCommand(root, action, options) {
  if (action !== 'run') throw new Error(`unknown command: rss.${action}`);
  if (options.dryRun) return { ok: true, command: 'rss.run', dryRun: true };
  runExternal(root, 'node', ['scripts/rss-aggregate.mjs']);
  return { ok: true, command: 'rss.run' };
}
