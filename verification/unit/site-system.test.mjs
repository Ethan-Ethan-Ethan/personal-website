import { describe, expect, test } from 'vitest';
import { readFile, writeFile, mkdtemp, mkdir, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  generateSiteSystemTypes,
  parseSiteSystem,
  validateSiteSystem,
  verifyGeneratedSiteSystem,
} from '../../scripts/lib/site-system.mjs';

const goodPath = new URL('../contracts/site-system/benchmark/artifacts/_golden/good.yaml', import.meta.url);
const adversarialPath = new URL('../contracts/site-system/benchmark/artifacts/_golden/unsafe-but-previously-passed.yaml', import.meta.url);

async function goodYaml() { return readFile(goodPath, 'utf8'); }

describe('site-system contract metadata', () => {
  test('keeps self-evolve version and weight totals aligned with the rubric', async () => {
    const { parse } = await import('yaml');
    const rubric = parse(await readFile(new URL('../contracts/site-system/docs/rubric.yaml', import.meta.url), 'utf8'));
    const config = parse(await readFile(new URL('../contracts/site-system/config/self-evolve.yaml', import.meta.url), 'utf8'));
    const weightTotal = rubric.items.reduce((total, item) => total + (item.weight ?? 1), 0);
    expect(config.meta.version).toBe(String(rubric.version));
    expect(config.metric.weights_sum).toBe(weightTotal);
  });
});

describe('visual-compositing DSH contract metadata', () => {
  test('keeps visual rubric version and weight totals aligned', async () => {
    const { parse } = await import('yaml');
    const rubric = parse(await readFile(new URL('../contracts/visual-compositing/docs/rubric.yaml', import.meta.url), 'utf8'));
    const config = parse(await readFile(new URL('../contracts/visual-compositing/config/self-evolve.yaml', import.meta.url), 'utf8'));
    const weightTotal = rubric.items.reduce((total, item) => total + (item.weight ?? 1), 0);
    expect(config.meta.version).toBe(String(rubric.version));
    expect(config.metric.weights_sum).toBe(weightTotal);
    expect(config.metric.pass_threshold).toBe(1);
    expect(config.metric.required_pass_ratio).toBe(1);
  });

  test('visual rubric rejects fake probes and requires real-frame timeline evidence', async () => {
    const rubric = await readFile(new URL('../contracts/visual-compositing/docs/rubric.yaml', import.meta.url), 'utf8');
    expect(rubric).toContain('not_contains_text');
    expect(rubric).toContain('#ff00ff');
    expect(rubric).toContain('evaluateMeteorEvidence');
    expect(rubric).toContain('shell_check');
    expect(rubric).not.toContain("p.endsWith('visual-fusion.spec.ts')");
    expect(rubric).not.toContain('export\\s+function\\s+evaluateMeteorEvidence');
    expect(rubric).toContain('neverReappears');
  });

  test('verify contracts executes the real browser harness plus the visual current artifact and every frozen fixture', async () => {
    const verifySource = await readFile(new URL('../../scripts/commands/verify.mjs', import.meta.url), 'utf8');
    const visualSource = await readFile(new URL('../e2e/visual-fusion.spec.ts', import.meta.url), 'utf8');
    const capability = await readFile(new URL('../contracts/visual-compositing/CAPABILITY.md', import.meta.url), 'utf8');
    expect(verifySource).toContain('runOwnedVisualContract');
    expect(verifySource).toContain("expected: 2");
    expect(verifySource).toContain("expected: 1");
    expect(verifySource).toContain("skipped: 1");
    expect(verifySource).toContain("skipped: 0");
    expect(verifySource).toContain('`${visualBase}/evaluator.ts`');
    expect(visualSource).toContain("from '../contracts/visual-compositing/evaluator.ts'");
    expect(visualSource).not.toContain('export function evaluateMeteorEvidence');
    expect(capability).toContain('evaluator.ts');
    expect(capability).toContain('frozen');
    for (const target of [
      'good.ts',
      'bad-magenta-probe.ts',
      'bad-hidden-header.ts',
      'bad-sparse-timeline.ts',
    ]) expect(verifySource).toContain(target);
  });
});

describe('site-system canonical YAML', () => {
  test('accepts the frozen good contract', async () => {
    const config = parseSiteSystem(await goodYaml());
    expect(validateSiteSystem(config)).toBe(config);
    expect(config.commands.scene.preview.owner).toBe('scene-state');
  });

  test('rejects unknown roots and invalid element layers', async () => {
    const config = parseSiteSystem(await goodYaml());
    expect(() => validateSiteSystem({ ...config, unknown: {} })).toThrow(/unknown root/);
    expect(() => validateSiteSystem({ ...config, elements: { ...config.elements, galaxy: { ...config.elements.galaxy, layer: -1 } } }))
      .toThrow(/layer/);
  });

  test('requires the complete canonical content section set', async () => {
    const config = parseSiteSystem(await goodYaml());
    config.content.sections = config.content.sections.filter((section) => section !== 'about');
    expect(() => validateSiteSystem(config)).toThrow(/content\.sections.*required|must equal/);
  });

  test('requires the complete canonical command set', async () => {
    const config = parseSiteSystem(await goodYaml());
    delete config.commands.window.close;
    expect(() => validateSiteSystem(config)).toThrow(/required command|command set/);
  });

  test('rejects unknown command input types', async () => {
    const config = parseSiteSystem(await goodYaml());
    config.commands.window.open.input.id = 'totally-unknown-type';
    expect(() => validateSiteSystem(config)).toThrow(/input type/);
  });

  test('requires integer layers and complete element behavior metadata', async () => {
    const config = parseSiteSystem(await goodYaml());
    config.elements.galaxy.layer = 2.5;
    expect(() => validateSiteSystem(config)).toThrow(/integer/);

    const incomplete = parseSiteSystem(await goodYaml());
    delete incomplete.elements.galaxy.reduced_motion;
    expect(() => validateSiteSystem(incomplete)).toThrow(/reduced_motion/);
  });

  test('rejects undeclared and cyclic dependencies', async () => {
    const config = parseSiteSystem(await goodYaml());
    expect(() => validateSiteSystem({ ...config, features: { ...config.features, 'scene-preview': { ...config.features['scene-preview'], depends_on: ['missing-id'] } } }))
      .toThrow(/undeclared dependency/);
    expect(() => validateSiteSystem({ ...config, trunk: {
      ...config.trunk,
      'scene-state': { ...config.trunk['scene-state'], depends_on: ['command-bus'] },
      'command-bus': { ...config.trunk['command-bus'], depends_on: ['scene-state'] },
    } })).toThrow(/cycle/);
  });

  test('requires complete semantic command contracts', async () => {
    const config = parseSiteSystem(await goodYaml());
    const broken = structuredClone(config);
    delete broken.commands.scene.preview.failure;
    expect(() => validateSiteSystem(broken)).toThrow(/failure/);
  });


  test('rejects unknown nested schema fields', async () => {
    for (const label of ['system', 'node', 'content', 'command', 'verification']) {
      const candidate = structuredClone(parseSiteSystem(await goodYaml()));
      if (label === 'system') candidate.system.secret = 'nope';
      if (label === 'node') candidate.trunk['site-shell'].secret = 'nope';
      if (label === 'content') candidate.content.secret = 'nope';
      if (label === 'command') candidate.commands.scene.preview.secret = 'nope';
      if (label === 'verification') candidate.verification.secret = 'nope';
      expect(() => validateSiteSystem(candidate), label).toThrow(/unknown/);
    }
  });

  test('contract rubric invokes the deterministic site-system validator', async () => {
    const rubric = await readFile(new URL('../contracts/site-system/docs/rubric.yaml', import.meta.url), 'utf8');
    expect(rubric).toContain('shell_check');
    expect(rubric).toContain('validateSiteSystem');
  });

  test('verify contracts explicitly executes every adversarial fixture', async () => {
    const verifySource = await readFile(new URL('../../scripts/commands/verify.mjs', import.meta.url), 'utf8');
    for (const fixture of [
      'unsafe-but-previously-passed.yaml',
      'unsafe-missing-command.yaml',
      'unsafe-input-type.yaml',
      'unsafe-fractional-layer.yaml',
      'unsafe-incomplete-element.yaml',
      'unsafe-but-previously-passed.json',
      'unsafe-hash.json',
      'unsafe-sensitive.json',
    ]) expect(verifySource).toContain(fixture);
  });

  test('rejects the adversarial DSH site-system fixture', async () => {
    const config = parseSiteSystem(await readFile(adversarialPath, 'utf8'));
    expect(() => validateSiteSystem(config)).toThrow(/unknown|generated_types/);
  });

  test('rejects generated TypeScript paths outside the project root', async () => {
    const config = parseSiteSystem(await goodYaml());
    config.system.generated_types = '../../escaped.ts';
    expect(() => validateSiteSystem(config)).toThrow(/generated_types/);
  });

  test('rejects generated output through a symlink outside the project root', async () => {
    const root = await mkdtemp(join(tmpdir(), 'site-system-symlink-'));
    const outside = await mkdtemp(join(tmpdir(), 'site-system-outside-'));
    await mkdir(join(root, 'config'), { recursive: true });
    const source = (await goodYaml()).replace('src/generated/site-system.ts', 'generated/site-system.ts');
    await writeFile(join(root, 'config', 'site-system.yaml'), source);
    await symlink(outside, join(root, 'generated'));
    await expect(verifyGeneratedSiteSystem(root, { write: true })).rejects.toThrow(/project root/);
  });

  test('generates deterministic TypeScript with source SHA and detects drift', async () => {
    const source = await goodYaml();
    const first = generateSiteSystemTypes(source);
    const second = generateSiteSystemTypes(source);
    expect(first).toBe(second);
    expect(first).toContain('@generated from config/site-system.yaml');
    expect(first).toMatch(/source-sha256: [a-f0-9]{64}/);
    expect(first).toContain('export const SITE_COMMANDS');

    const root = await mkdtemp(join(tmpdir(), 'site-system-'));
    await mkdir(join(root, 'config'), { recursive: true });
    await mkdir(join(root, 'src', 'generated'), { recursive: true });
    await writeFile(join(root, 'config', 'site-system.yaml'), source);
    await writeFile(join(root, 'src', 'generated', 'site-system.ts'), first);
    await expect(verifyGeneratedSiteSystem(root)).resolves.toMatchObject({ valid: true });
    await writeFile(join(root, 'src', 'generated', 'site-system.ts'), `${first}\n// manual drift\n`);
    await expect(verifyGeneratedSiteSystem(root)).rejects.toThrow(/drift/);
  });
});
