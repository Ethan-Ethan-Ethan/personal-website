#!/usr/bin/env node
import { runSiteCommand } from './lib/site-cli.mjs';

const [legacyAction, ...rest] = process.argv.slice(2);
if (!legacyAction || legacyAction === '--help' || legacyAction === '-h') {
  process.stdout.write('Compatibility facade. Use: npm run site -- content <check|sync> [--dry-run] [--source-mode auto|artifact]\n');
  process.exit(0);
}
try {
  const result = await runSiteCommand({ argv: ['content', legacyAction, ...rest] });
  process.stdout.write(`${result.command}: ${result.count} public item(s)${result.changed ? '; changes detected' : ''}${result.dryRun ? ' (dry-run)' : ''}\n`);
} catch (error) {
  process.stderr.write(`site-content error: ${error.message}\nHint: run "npm run site -- content check".\n`);
  process.exitCode = 1;
}
