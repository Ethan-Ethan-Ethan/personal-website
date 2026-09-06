#!/usr/bin/env node
import { runSiteCommand, SITE_HELP } from './lib/site-cli.mjs';

try {
  const result = await runSiteCommand({ argv: process.argv.slice(2) });
  if (result.command === 'help') process.stdout.write(SITE_HELP);
  else if (result.lines) process.stdout.write(`${result.lines.join('\n')}\n`);
  else process.stdout.write(`${result.command}: ok${result.changed === true ? ' (changes detected)' : ''}${result.dryRun ? ' (dry-run)' : ''}\n`);
} catch (error) {
  process.stderr.write(`site error: ${error.message}\nHint: run "npm run site -- --help".\n`);
  process.exitCode = 1;
}
