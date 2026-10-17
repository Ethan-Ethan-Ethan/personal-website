import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseSiteSystem, validateSiteSystem } from './site-system.mjs';
import { handleSystemCommand } from '../commands/system.mjs';
import { handleContentCommand } from '../commands/content.mjs';
import { handleVerifyCommand } from '../commands/verify.mjs';

export const SITE_HELP = `Usage: npm run site -- <domain> <action> [options]\n\nDomains:\n  system   validate | generate\n  command  list\n  content  check | sync\n  verify   unit | e2e | contracts | transition | build | all\n\nOptions:\n  --dry-run\n  --source-mode <auto|artifact>\n  --project-root <path>\n  --help\n`;

const CONTRACT_OPTION_NAMES = new Map([
  ['--dry-run', 'dry-run'],
  ['--source-mode', 'source-mode'],
]);

export function parseSiteArgs(argv) {
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) return { help: true };
  const [domain, action] = argv;
  if (!domain || !action || domain.startsWith('-') || action.startsWith('-')) throw new Error('domain and action are required');
  let dryRun = false;
  let sourceMode = 'auto';
  let projectRoot;
  const providedOptions = [];
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (providedOptions.includes(arg)) throw new Error(`duplicate option: ${arg}`);
    if (arg === '--dry-run') {
      dryRun = true;
      providedOptions.push(arg);
    } else if (arg === '--source-mode') {
      providedOptions.push(arg);
      sourceMode = argv[++index];
      if (!['auto', 'artifact'].includes(sourceMode)) throw new Error('--source-mode must be auto or artifact');
    } else if (arg === '--project-root') {
      providedOptions.push(arg);
      projectRoot = argv[++index];
      if (!projectRoot || projectRoot.startsWith('--')) throw new Error('--project-root requires a path');
    } else throw new Error(`unknown option: ${arg}`);
  }
  return { domain, action, dryRun, sourceMode, projectRoot, providedOptions };
}

function flattenCommandNames(commands) {
  return Object.entries(commands).flatMap(([domain, actions]) => Object.keys(actions).map((action) => `${domain}.${action}`));
}

function validateCommandOptions(parsed, contract) {
  for (const option of parsed.providedOptions) {
    if (option === '--project-root') continue;
    const inputName = CONTRACT_OPTION_NAMES.get(option);
    if (!inputName || !Object.hasOwn(contract.input, inputName)) {
      throw new Error(`${parsed.domain}.${parsed.action} does not accept ${option}`);
    }
  }
}

async function loadCanonical(root) {
  const source = await readFile(resolve(root, 'config/site-system.yaml'), 'utf8');
  return validateSiteSystem(parseSiteSystem(source));
}

export async function runSiteCommand({ projectRoot = process.cwd(), argv = [] }) {
  const parsed = parseSiteArgs(argv);
  if (parsed.help) return { ok: true, command: 'help', text: SITE_HELP };
  const root = resolve(parsed.projectRoot || projectRoot);
  const config = await loadCanonical(root);
  const command = `${parsed.domain}.${parsed.action}`;
  const declared = flattenCommandNames(config.commands);
  if (!declared.includes(command)) throw new Error(`unknown command: ${command}`);
  const contract = config.commands[parsed.domain][parsed.action];
  validateCommandOptions(parsed, contract);
  if (command === 'command.list') return { ok: true, command, lines: declared };
  if (parsed.domain === 'system') return handleSystemCommand(root, parsed.action, parsed);
  if (parsed.domain === 'content') return handleContentCommand(root, parsed.action, parsed);
  if (parsed.domain === 'verify') return handleVerifyCommand(root, parsed.action);
  throw new Error(`command ${command} is runtime-only; use the website interaction surface`);
}
