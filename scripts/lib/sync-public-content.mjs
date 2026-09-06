import { readFile, writeFile, mkdir, stat, rename, realpath } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { parse } from 'yaml';
import { buildPublicContent, scanForSensitiveContent, sourceHash } from './public-content.mjs';

const ITEM_KEY_ORDER = [
  'id', 'slug', 'title', 'summary', 'section', 'status', 'updatedAt', 'lastReviewed',
  'featured', 'order', 'tags', 'highlights', 'cover', 'demoUrl', 'repoUrl', 'evidence', 'sourceHash',
];
const ITEM_KEYS = new Set(ITEM_KEY_ORDER);
const EVIDENCE_KEYS = new Set(['date', 'scope', 'disclaimer', 'liveSignal']);
const MANIFEST_KEYS = new Set(['vaultRoot', 'output', 'sources', 'lock']);
const SECTIONS = new Set(['projects', 'ai-lab', 'trading-lab', 'about']);
const STATUSES = new Set(['active', 'completed', 'research', 'paused']);

function assertMapping(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
}

function assertKnownKeys(value, allowed, label) {
  for (const key of Object.keys(value)) if (!allowed.has(key)) throw new Error(`${label} has unknown field: ${key}`);
}

function assertInside(root, target, label, { allowRoot = false } = {}) {
  const rel = relative(root, target);
  if ((!allowRoot && rel === '') || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`${label} must stay inside the ${label.startsWith('source') ? 'Vault' : 'project'} root`);
  }
}

function assertRelativePath(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty relative path`);
  const normalized = value.replaceAll('\\', '/');
  if (isAbsolute(value) || /^[a-zA-Z]:\//.test(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`${label} must stay inside the project root`);
  }
  return normalized;
}

async function resolveProjectArtifactPath(root, value, label) {
  const target = resolve(root, assertRelativePath(value, label));
  assertInside(root, target, label);
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
  assertInside(realRoot, existing, label, { allowRoot: true });
  return target;
}

export function parseFrontmatter(source) {
  const match = String(source).match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error('frontmatter block is required');
  const data = parse(match[1]);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('frontmatter must be a mapping');
  return data;
}

function validateUrl(value, field) {
  if (value === undefined) return;
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be a non-empty URL`);
  if (/^[/\\]{2}/.test(value)) throw new Error(`${field} must not be a protocol-relative URL`);
  if (value.startsWith('/')) return;
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error(`${field} must be an https URL or root-relative path`); }
  if (parsed.protocol !== 'https:') throw new Error(`${field} must use https`);
  if (parsed.username || parsed.password) throw new Error(`${field} must not contain credentials`);
}

function projectionItemPayload(item) {
  const payload = {};
  for (const key of ITEM_KEY_ORDER) {
    if (key !== 'sourceHash' && item[key] !== undefined) payload[key] = item[key];
  }
  return payload;
}

function projectionItemHash(item) {
  return sourceHash(JSON.stringify(projectionItemPayload(item)));
}

function validateProjectionItem(item) {
  assertMapping(item, 'generated item');
  assertKnownKeys(item, ITEM_KEYS, 'generated item');
  const required = ['id', 'slug', 'title', 'summary', 'section', 'status', 'updatedAt', 'lastReviewed'];
  for (const key of required) if (typeof item[key] !== 'string' || !item[key].trim()) throw new Error(`generated item missing ${key}`);
  if (!SECTIONS.has(item.section)) throw new Error(`generated item has invalid section: ${item.section}`);
  if (!STATUSES.has(item.status)) throw new Error(`generated item has invalid status: ${item.status}`);
  if (typeof item.featured !== 'boolean') throw new Error('generated item featured must be boolean');
  if (!Number.isFinite(item.order)) throw new Error('generated item order must be finite');
  if (!Array.isArray(item.tags) || item.tags.some((value) => typeof value !== 'string')) throw new Error('generated item tags are invalid');
  if (!Array.isArray(item.highlights) || item.highlights.some((value) => typeof value !== 'string')) throw new Error('generated item highlights are invalid');
  if (typeof item.sourceHash !== 'string' || !/^[a-f0-9]{64}$/.test(item.sourceHash)) throw new Error('generated item missing valid sourceHash');
  validateUrl(item.cover, 'cover');
  validateUrl(item.demoUrl, 'demoUrl');
  validateUrl(item.repoUrl, 'repoUrl');
  const findings = scanForSensitiveContent(JSON.stringify(projectionItemPayload(item)));
  if (findings.length) throw new Error(`generated item contains sensitive content: ${findings.join(', ')}`);

  if (item.section === 'trading-lab') {
    assertMapping(item.evidence, 'generated trading item evidence');
    assertKnownKeys(item.evidence, EVIDENCE_KEYS, 'generated evidence');
    if (!item.evidence.date || !item.evidence.scope || !item.evidence.disclaimer || item.evidence.liveSignal !== false) {
      throw new Error('generated trading item has invalid evidence metadata');
    }
  } else if (item.evidence !== undefined) {
    throw new Error('non-trading item must not include evidence');
  }
  if (item.sourceHash !== projectionItemHash(item)) throw new Error(`generated item sourceHash mismatch: ${item.id}`);
}

export function validateProjection(output) {
  assertMapping(output, 'generated projection');
  assertKnownKeys(output, new Set(['schemaVersion', 'items']), 'projection');
  if (output.schemaVersion !== 1 || !Array.isArray(output.items)) throw new Error('invalid generated projection');
  const ids = new Set();
  const slugs = new Set();
  for (const item of output.items) {
    validateProjectionItem(item);
    if (ids.has(item.id)) throw new Error(`duplicate id: ${item.id}`);
    if (slugs.has(item.slug)) throw new Error(`duplicate slug: ${item.slug}`);
    ids.add(item.id);
    slugs.add(item.slug);
  }
  return output;
}


async function readManifest(projectRoot, configPath) {
  const absoluteConfig = resolve(projectRoot, configPath);
  const manifest = JSON.parse(await readFile(absoluteConfig, 'utf8'));
  assertMapping(manifest, 'config/public-content.json');
  assertKnownKeys(manifest, MANIFEST_KEYS, 'config/public-content.json');
  if (typeof manifest.vaultRoot !== 'string' || !manifest.vaultRoot.trim()
      || typeof manifest.output !== 'string' || !manifest.output.trim()
      || !Array.isArray(manifest.sources) || manifest.sources.some((path) => typeof path !== 'string' || !path.trim())) {
    throw new Error('config/public-content.json requires vaultRoot, output and string sources');
  }
  manifest.lock ||= 'config/public-content.lock.json';
  assertRelativePath(manifest.output, 'manifest output');
  assertRelativePath(manifest.lock, 'manifest lock');
  if (new Set(manifest.sources).size !== manifest.sources.length) throw new Error('manifest contains duplicate source paths');
  return manifest;
}

async function buildProjection(root, manifest) {
  const vaultRoot = resolve(root, manifest.vaultRoot);
  const realVaultRoot = await realpath(vaultRoot);
  const items = [];
  for (const sourcePath of manifest.sources) {
    const normalizedSourcePath = assertRelativePath(sourcePath, 'source path');
    const absoluteSource = resolve(vaultRoot, normalizedSourcePath);
    assertInside(vaultRoot, absoluteSource, 'source path');
    const realSource = await realpath(absoluteSource);
    assertInside(realVaultRoot, realSource, 'source symlink');
    const source = await readFile(realSource, 'utf8');
    const frontmatter = parseFrontmatter(source);
    const record = buildPublicContent(frontmatter, sourcePath);
    const findings = scanForSensitiveContent(JSON.stringify(record));
    if (findings.length) throw new Error(`${sourcePath} contains sensitive public fields: ${findings.join(', ')}`);
    items.push({ ...record, sourceHash: projectionItemHash(record) });
  }
  items.sort((a, b) => a.order - b.order || compareCodePoints(a.title, b.title) || compareCodePoints(a.id, b.id) || compareCodePoints(a.slug, b.slug));
  return validateProjection({ schemaVersion: 1, items });
}

function compareCodePoints(left, right) {
  const a = Array.from(left, (char) => char.codePointAt(0));
  const b = Array.from(right, (char) => char.codePointAt(0));
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return a.length - b.length;
}

function buildProjectionLock(manifest, serializedProjection, output) {
  const manifestPayload = { version: 1, vaultRoot: manifest.vaultRoot, output: manifest.output, lock: manifest.lock, sources: manifest.sources };
  return {
    schemaVersion: 1,
    manifestHash: sourceHash(JSON.stringify(manifestPayload)),
    projectionHash: sourceHash(serializedProjection),
    output: manifest.output,
    sources: [...manifest.sources],
    items: output.items.map(({ id, slug, sourceHash: hash }) => ({ id, slug, sourceHash: hash })),
  };
}

function validateProjectionLock(manifest, serializedProjection, output, lock) {
  const expected = buildProjectionLock(manifest, serializedProjection, output);
  if (JSON.stringify(lock) !== JSON.stringify(expected)) throw new Error('public projection integrity lock mismatch');
  return true;
}

async function atomicWrite(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  await writeFile(temporary, content);
  await rename(temporary, path);
}

export async function runContentSync({ projectRoot, mode = 'check', dryRun = false, configPath = 'config/public-content.json', sourceMode = 'auto', allowMissingSources = process.env.CI === 'true' }) {
  const root = resolve(projectRoot);
  const manifest = await readManifest(root, configPath);
  const outputPath = await resolveProjectArtifactPath(root, manifest.output, 'manifest output');
  const lockPath = await resolveProjectArtifactPath(root, manifest.lock, 'manifest lock');

  if (mode === 'check') {
    if (!['auto', 'artifact'].includes(sourceMode)) throw new Error(`unsupported sourceMode: ${sourceMode}`);
    const serializedProjection = await readFile(outputPath, 'utf8');
    const output = validateProjection(JSON.parse(serializedProjection));
    const lock = JSON.parse(await readFile(lockPath, 'utf8'));
    validateProjectionLock(manifest, serializedProjection, output, lock);
    if (sourceMode === 'artifact') return { count: output.items.length, outputPath, lockPath, changed: false, sourceVerified: false };

    const vaultRoot = resolve(root, manifest.vaultRoot);
    const sourcePaths = manifest.sources.map((sourcePath) => resolve(vaultRoot, sourcePath));
    const sourceStates = await Promise.all(sourcePaths.map(async (path) => {
      try { await stat(path); return true; } catch { return false; }
    }));
    const existingCount = sourceStates.filter(Boolean).length;
    if (existingCount === sourcePaths.length) {
      const expected = await buildProjection(root, manifest);
      if (JSON.stringify(expected) !== JSON.stringify(output)) throw new Error('public projection is out of date with allowlisted Vault sources');
    } else if (existingCount > 0) {
      throw new Error('only part of the allowlisted Vault sources are available');
    } else if (!allowMissingSources) {
      throw new Error('allowlisted Vault sources are unavailable; source verification is required');
    }
    return { count: output.items.length, outputPath, lockPath, changed: false, sourceVerified: existingCount === sourcePaths.length };
  }

  if (mode !== 'sync') throw new Error(`unsupported mode: ${mode}`);
  const output = await buildProjection(root, manifest);
  const serialized = JSON.stringify(output, null, 2) + '\n';
  const lock = buildProjectionLock(manifest, serialized, output);
  const serializedLock = JSON.stringify(lock, null, 2) + '\n';
  let previous = '';
  let previousLock = '';
  try { previous = await readFile(outputPath, 'utf8'); } catch {}
  try { previousLock = await readFile(lockPath, 'utf8'); } catch {}
  const changed = previous !== serialized || previousLock !== serializedLock;
  if (!dryRun && changed) {
    await atomicWrite(outputPath, serialized);
    await atomicWrite(lockPath, serializedLock);
  }
  return { count: output.items.length, outputPath, lockPath, changed, dryRun, sourceVerified: true };
}
