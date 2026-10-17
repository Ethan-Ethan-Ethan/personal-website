import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { parseDocument } from 'yaml';

const ROOT_KEYS = new Set(['version', 'system', 'trunk', 'elements', 'features', 'content', 'commands', 'verification']);
const SYSTEM_KEYS = new Set(['id', 'generated_types']);
const NODE_KEYS = new Set(['owner', 'depends_on']);
const ELEMENT_KEYS = new Set(['owner', 'component', 'layer', 'responsive', 'motion', 'reduced_motion', 'depends_on']);
const CONTENT_KEYS = new Set(['sections']);
const VERIFICATION_KEYS = new Set(['commands']);
const VERIFICATION_COMMAND_KEYS = new Set(['verify-all']);
const COMMAND_FIELDS = new Set(['owner', 'input', 'result', 'failure']);
const REQUIRED_CONTENT_SECTIONS = ['projects', 'ai-lab', 'trading-lab', 'about', 'articles'];
const REQUIRED_COMMANDS = [
  'system.validate',
  'system.generate',
  'command.list',
  'scene.preview',
  'scene.reset',
  'window.open',
  'window.close',
  'window.minimize',
  'window.focus',
  'window.move',
  'window.reconcile',
  'content.check',
  'content.sync',
  'verify.unit',
  'verify.e2e',
  'verify.contracts',
  'verify.transition',
  'verify.build',
  'verify.all',
];
const INPUT_TYPES = new Set([
  'boolean',
  'source-mode',
  'scene-state',
  'window-id',
  'history-mode',
  'point',
  'nullable-window-id',
]);
const VERIFY_ALL_STEPS = ['unit', 'e2e', 'contracts', 'content', 'build'];
const KEBAB_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

function assertMapping(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be a mapping`);
}

function assertKnownKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`${label} has unknown field: ${key}`);
  }
}

function assertNonEmptyString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`);
}

function assertProjectRelativePath(value, label, extension) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty project-relative path`);
  const normalized = value.replaceAll('\\', '/');
  if (isAbsolute(value) || /^[a-zA-Z]:\//.test(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`${label} must stay inside the project root`);
  }
  if (extension && !normalized.endsWith(extension)) throw new Error(`${label} must point to a ${extension} file`);
  return normalized;
}

function resolveProjectPath(root, path, label) {
  const target = resolve(root, assertProjectRelativePath(path, label));
  const rel = relative(root, target);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error(`${label} must stay inside the project root`);
  return target;
}

async function resolveProjectArtifactPath(root, path, label) {
  const target = resolveProjectPath(root, path, label);
  const realRoot = await realpath(root);
  let existing = target;
  while (true) {
    try {
      existing = await realpath(existing);
      break;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = dirname(existing);
      if (parent === existing) throw error;
      existing = parent;
    }
  }
  const rel = relative(realRoot, existing);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error(`${label} must stay inside the project root`);
  return target;
}

export function parseSiteSystem(source) {
  const document = parseDocument(String(source), { uniqueKeys: true });
  if (document.errors.length) throw new Error(`site-system YAML error: ${document.errors[0].message}`);
  const value = document.toJS();
  assertMapping(value, 'site-system');
  return value;
}

function validateNodeCollection(collection, label, { element = false } = {}) {
  assertMapping(collection, label);
  for (const [id, node] of Object.entries(collection)) {
    if (!KEBAB_ID.test(id)) throw new Error(`${label} id must be kebab-case: ${id}`);
    assertMapping(node, `${label}.${id}`);
    assertKnownKeys(node, element ? ELEMENT_KEYS : NODE_KEYS, `${label}.${id}`);
    assertNonEmptyString(node.owner, `${label}.${id}.owner`);
    if (!Array.isArray(node.depends_on) || node.depends_on.some((dep) => typeof dep !== 'string' || !KEBAB_ID.test(dep))) {
      throw new Error(`${label}.${id}.depends_on must be an array of kebab-case IDs`);
    }
    if (new Set(node.depends_on).size !== node.depends_on.length) throw new Error(`${label}.${id}.depends_on contains duplicates`);
    if (element) {
      assertNonEmptyString(node.component, `${label}.${id}.component`);
      assertNonEmptyString(node.responsive, `${label}.${id}.responsive`);
      assertNonEmptyString(node.motion, `${label}.${id}.motion`);
      assertNonEmptyString(node.reduced_motion, `${label}.${id}.reduced_motion`);
      if (!Number.isInteger(node.layer) || node.layer < 0) throw new Error(`${label}.${id}.layer must be a non-negative integer`);
    }
  }
}

function flattenCommands(commands) {
  assertMapping(commands, 'commands');
  const entries = [];
  for (const [domain, actions] of Object.entries(commands)) {
    if (!KEBAB_ID.test(domain)) throw new Error(`command domain must be kebab-case: ${domain}`);
    assertMapping(actions, `commands.${domain}`);
    for (const [action, contract] of Object.entries(actions)) {
      if (!KEBAB_ID.test(action)) throw new Error(`command action must be kebab-case: ${domain}.${action}`);
      assertMapping(contract, `commands.${domain}.${action}`);
      assertKnownKeys(contract, COMMAND_FIELDS, `commands.${domain}.${action}`);
      for (const field of COMMAND_FIELDS) {
        if (!(field in contract)) throw new Error(`commands.${domain}.${action}.${field} is required`);
      }
      assertNonEmptyString(contract.owner, `commands.${domain}.${action}.owner`);
      assertNonEmptyString(contract.result, `commands.${domain}.${action}.result`);
      assertNonEmptyString(contract.failure, `commands.${domain}.${action}.failure`);
      assertMapping(contract.input, `commands.${domain}.${action}.input`);
      for (const [inputName, inputType] of Object.entries(contract.input)) {
        if (!KEBAB_ID.test(inputName) || typeof inputType !== 'string' || !inputType.trim()) {
          throw new Error(`commands.${domain}.${action}.input must map kebab-case names to non-empty types`);
        }
        if (!INPUT_TYPES.has(inputType)) throw new Error(`commands.${domain}.${action}.${inputName} has unsupported input type: ${inputType}`);
      }
      entries.push([`${domain}.${action}`, contract]);
    }
  }
  return entries;
}

function assertExactSet(actual, required, label) {
  const actualSet = new Set(actual);
  const requiredSet = new Set(required);
  const missing = required.filter((value) => !actualSet.has(value));
  const extra = actual.filter((value) => !requiredSet.has(value));
  if (missing.length || extra.length || actual.length !== required.length) {
    throw new Error(`${label} must equal the required set; missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}`);
  }
}

function assertAcyclic(nodes) {
  const visiting = new Set();
  const visited = new Set();
  const visit = (id, trail = []) => {
    if (visiting.has(id)) throw new Error(`dependency cycle: ${[...trail, id].join(' -> ')}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of nodes[id].depends_on) visit(dependency, [...trail, id]);
    visiting.delete(id);
    visited.add(id);
  };
  Object.keys(nodes).forEach((id) => visit(id));
}

export function validateSiteSystem(config) {
  assertMapping(config, 'site-system');
  for (const key of Object.keys(config)) if (!ROOT_KEYS.has(key)) throw new Error(`unknown root key: ${key}`);
  for (const key of ROOT_KEYS) if (!(key in config)) throw new Error(`missing root key: ${key}`);
  if (config.version !== 1) throw new Error('version must equal 1');

  assertMapping(config.system, 'system');
  assertKnownKeys(config.system, SYSTEM_KEYS, 'system');
  if (config.system.id !== 'personal-website') throw new Error('system.id must equal personal-website');
  assertProjectRelativePath(config.system.generated_types, 'system.generated_types', '.ts');

  validateNodeCollection(config.trunk, 'trunk');
  validateNodeCollection(config.elements, 'elements', { element: true });
  validateNodeCollection(config.features, 'features');
  const nodes = { ...config.trunk, ...config.elements, ...config.features };
  if (Object.keys(nodes).length !== Object.keys(config.trunk).length + Object.keys(config.elements).length + Object.keys(config.features).length) {
    throw new Error('duplicate ID across trunk/elements/features');
  }
  for (const [id, node] of Object.entries(nodes)) {
    for (const dependency of node.depends_on) {
      if (!(dependency in nodes)) throw new Error(`${id} has undeclared dependency: ${dependency}`);
    }
  }
  assertAcyclic(nodes);

  assertMapping(config.content, 'content');
  assertKnownKeys(config.content, CONTENT_KEYS, 'content');
  if (!Array.isArray(config.content.sections)) throw new Error('content.sections is required');
  if (config.content.sections.some((section) => typeof section !== 'string')) throw new Error('content.sections must contain strings');
  if (new Set(config.content.sections).size !== config.content.sections.length) throw new Error('content.sections contains duplicates');
  if (JSON.stringify(config.content.sections) !== JSON.stringify(REQUIRED_CONTENT_SECTIONS)) {
    throw new Error(`content.sections must equal ${REQUIRED_CONTENT_SECTIONS.join(', ')}`);
  }

  const commands = flattenCommands(config.commands);
  assertExactSet(commands.map(([name]) => name), REQUIRED_COMMANDS, 'command set');
  for (const [name, contract] of commands) {
    if (!(contract.owner in nodes)) throw new Error(`${name} has undeclared owner: ${contract.owner}`);
  }

  assertMapping(config.verification, 'verification');
  assertKnownKeys(config.verification, VERIFICATION_KEYS, 'verification');
  assertMapping(config.verification.commands, 'verification.commands');
  assertKnownKeys(config.verification.commands, VERIFICATION_COMMAND_KEYS, 'verification.commands');
  if (JSON.stringify(config.verification.commands['verify-all']) !== JSON.stringify(VERIFY_ALL_STEPS)) {
    throw new Error(`verification.commands.verify-all must equal ${VERIFY_ALL_STEPS.join(', ')}`);
  }
  return config;
}

export function generateSiteSystemTypes(source, sourceLabel = 'config/site-system.yaml') {
  const config = validateSiteSystem(parseSiteSystem(source));
  const hash = createHash('sha256').update(String(source)).digest('hex');
  const commandNames = flattenCommands(config.commands).map(([name]) => name);
  return `// @generated from ${sourceLabel}; do not edit\n// source-sha256: ${hash}\n\nexport const siteSystem = ${JSON.stringify(config, null, 2)} as const;\n\nexport const SITE_COMMANDS = ${JSON.stringify(commandNames, null, 2)} as const;\nexport type SiteCommandName = (typeof SITE_COMMANDS)[number];\nexport type SiteSystem = typeof siteSystem;\n`;
}

export async function verifyGeneratedSiteSystem(projectRoot, { write = false } = {}) {
  const root = resolve(projectRoot);
  const sourcePath = resolveProjectPath(root, 'config/site-system.yaml', 'site-system source');
  const source = await readFile(sourcePath, 'utf8');
  const config = validateSiteSystem(parseSiteSystem(source));
  const generatedPath = await resolveProjectArtifactPath(root, config.system.generated_types, 'system.generated_types');
  const expected = generateSiteSystemTypes(source);
  let actual = '';
  try { actual = await readFile(generatedPath, 'utf8'); } catch {}
  if (write) {
    await mkdir(dirname(generatedPath), { recursive: true });
    if (actual !== expected) await writeFile(generatedPath, expected);
    return { valid: true, changed: actual !== expected, generatedPath };
  }
  if (actual !== expected) throw new Error(`generated site-system drift: ${generatedPath}`);
  return { valid: true, changed: false, generatedPath };
}
