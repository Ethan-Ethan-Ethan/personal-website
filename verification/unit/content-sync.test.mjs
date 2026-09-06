import { describe, expect, test } from 'vitest';
import { mkdtemp, readFile, writeFile, mkdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  buildPublicContent,
  scanForSensitiveContent,
  sourceHash,
  validatePublicRecord,
} from '../../scripts/lib/public-content.mjs';
import { parseFrontmatter, runContentSync, validateProjection } from '../../scripts/lib/sync-public-content.mjs';

const base = {
  type: 'project',
  status: 'active',
  project: 'video-transition-analyzer',
  updated: '2026-09-05',
  site_publish: true,
  site_visibility: 'public',
  site_section: 'ai-lab',
  site_slug: 'video-transition-analyzer',
  site_title: '影片轉場分析器',
  site_summary: '使用 Apple 原生框架分析影片鏡頭、轉場、運鏡與聲音。',
  site_last_reviewed: '2026-09-05',
  site_featured: true,
  site_order: 10,
  site_highlights: ['純 Swift 與 Apple frameworks', '輸出結構化分析'],
};

describe('public content projection', () => {
  test('builds a deterministic public record without source paths', () => {
    const record = buildPublicContent(base, '04_Projects/影片轉場分析器/影片轉場分析器.md');
    expect(record).toMatchObject({
      id: 'video-transition-analyzer',
      slug: 'video-transition-analyzer',
      section: 'ai-lab',
      status: 'active',
      featured: true,
      order: 10,
      tags: [],
    });
    expect(record).not.toHaveProperty('sourcePath');
    expect(record).not.toHaveProperty('visibility');
  });

  test('rejects records that are not explicitly public', () => {
    expect(() => validatePublicRecord({ ...base, site_visibility: 'review' }, 'x.md'))
      .toThrow(/site_visibility/);
  });

  test('requires evidence metadata for trading content', () => {
    expect(() => validatePublicRecord({ ...base, site_section: 'trading-lab' }, 'trade.md'))
      .toThrow(/site_evidence_date/);
  });

  test('blocks denied source paths and sensitive content', () => {
    expect(() => validatePublicRecord(base, '04_Projects/個人網站/履歷/護照.pdf'))
      .toThrow(/denied source path/);
    expect(scanForSensitiveContent('service: Keychain\nhttp://localhost:4321')).toEqual(
      expect.arrayContaining(['keychain-reference', 'localhost-reference']),
    );
  });

  test('hard denies dot-prefixed archive directories', () => {
    expect(() => validatePublicRecord(base, '04_Projects/.archive/private.md'))
      .toThrow(/denied source path/);
  });

  test('detects international and North American phone numbers in public fields', () => {
    expect(scanForSensitiveContent('Call +1 415 555 0123 for details')).toContain('phone-number');
    expect(scanForSensitiveContent('Call 415-555-0123 for details')).toContain('phone-number');
    expect(scanForSensitiveContent('Call (415) 555-0123 for details')).toContain('phone-number');
    expect(scanForSensitiveContent('聯絡 +886 912 345 678')).toContain('phone-number');
  });

  test('detects common bare token formats without labels', () => {
    expect(scanForSensitiveContent('ghp_abcdefghijklmnopqrstuvwxyz1234567890')).toContain('credential-reference');
    expect(scanForSensitiveContent('github_pat_11AA0abcdefghijklmnopqrstuvwxyz1234567890')).toContain('credential-reference');
    expect(scanForSensitiveContent('sk-proj-abcdefghijklmnopqrstuvwxyz1234567890')).toContain('credential-reference');
    expect(scanForSensitiveContent('AKIAIOSFODNN7EXAMPLE')).toContain('credential-reference');
  });

  test('hashes identical source data identically and detects changes', () => {
    expect(sourceHash('same')).toBe(sourceHash('same'));
    expect(sourceHash('same')).not.toBe(sourceHash('changed'));
  });

  test('buildPublicContent fails closed for malformed source status, order, tags and highlights', () => {
    expect(() => buildPublicContent({ ...base, status: 'typo' }, 'demo.md')).toThrow(/status/);
    expect(() => buildPublicContent({ ...base, site_order: '10' }, 'demo.md')).toThrow(/site_order/);
    expect(() => buildPublicContent({ ...base, tags: ['safe', 42] }, 'demo.md')).toThrow(/tags/);
    expect(() => buildPublicContent({ ...base, site_highlights: ['safe', ''] }, 'demo.md')).toThrow(/site_highlights/);
  });
});


describe('content sync workflow', () => {
  test('parses YAML frontmatter without publishing the body', () => {
    const parsed = parseFrontmatter(`---\nsite_publish: true\nsite_highlights:\n  - Alpha\n---\n# Secret body`);
    expect(parsed.site_publish).toBe(true);
    expect(parsed.site_highlights).toEqual(['Alpha']);
    expect(parsed).not.toHaveProperty('body');
  });

  test('sync writes deterministic public projection and check validates it', async () => {
    const root = await mkdtemp(join(tmpdir(), 'site-content-'));
    const vault = join(root, 'vault');
    const project = join(vault, '04_Projects', 'site');
    await mkdir(join(vault, '04_Projects', 'demo'), { recursive: true });
    await mkdir(join(project, 'config'), { recursive: true });
    await mkdir(join(project, 'src', 'data'), { recursive: true });
    const note = `---\ntype: project\nstatus: active\nproject: demo\nupdated: 2026-09-05\nsite_publish: true\nsite_visibility: public\nsite_section: projects\nsite_slug: demo\nsite_title: Demo\nsite_summary: Safe public summary.\nsite_last_reviewed: 2026-09-05\nsite_featured: true\nsite_order: 1\n---\n# private body`;
    await writeFile(join(vault, '04_Projects', 'demo', 'demo.md'), note);
    await writeFile(join(project, 'config', 'public-content.json'), JSON.stringify({
      vaultRoot: '../..',
      output: 'src/data/public-content.json',
      lock: 'config/public-content.lock.json',
      sources: ['04_Projects/demo/demo.md'],
    }));

    const synced = await runContentSync({ projectRoot: project, mode: 'sync' });
    expect(synced.count).toBe(1);
    const output = JSON.parse(await readFile(join(project, 'src', 'data', 'public-content.json'), 'utf8'));
    expect(output.items[0]).toMatchObject({ id: 'demo', title: 'Demo' });
    expect(output.items[0].sourceHash).toMatch(/^[a-f0-9]{64}$/);

    const checked = await runContentSync({ projectRoot: project, mode: 'check' });
    expect(checked.count).toBe(1);

    output.items[0].summary = 'Tampered summary';
    await writeFile(join(project, 'src', 'data', 'public-content.json'), JSON.stringify(output));
    await expect(runContentSync({ projectRoot: project, mode: 'check', sourceMode: 'artifact' })).rejects.toThrow(/sourceHash|integrity/);

    output.items[0].summary = 'Safe public summary.';
    await writeFile(join(project, 'src', 'data', 'public-content.json'), JSON.stringify(output, null, 2) + '\n');
    const changedNote = note.replace('Safe public summary.', 'New reviewed summary.');
    await writeFile(join(vault, '04_Projects', 'demo', 'demo.md'), changedNote);
    await expect(runContentSync({ projectRoot: project, mode: 'check', sourceMode: 'artifact' })).resolves.toMatchObject({ sourceVerified: false });
    await expect(runContentSync({ projectRoot: project, mode: 'check', sourceMode: 'auto' })).rejects.toThrow(/out of date/);

    delete output.items[0].sourceHash;
    await writeFile(join(project, 'src', 'data', 'public-content.json'), JSON.stringify(output));
    await expect(runContentSync({ projectRoot: project, mode: 'check', sourceMode: 'artifact' })).rejects.toThrow(/sourceHash|integrity/);
  });

  test('rejects malformed source status, order, tags and highlights instead of normalizing them', async () => {
    const overrides = [
      'status: typo',
      'site_order: nope',
      'tags: [safe, 42]',
      'site_highlights: [safe, 42]',
    ];
    for (const override of overrides) {
      const root = await mkdtemp(join(tmpdir(), 'site-content-invalid-'));
      const vault = join(root, 'vault');
      const project = join(vault, '04_Projects', 'site');
      await mkdir(join(vault, '04_Projects', 'demo'), { recursive: true });
      await mkdir(join(project, 'config'), { recursive: true });
      let note = `---\ntype: project\nstatus: active\nproject: demo\nupdated: 2026-09-05\nsite_publish: true\nsite_visibility: public\nsite_section: projects\nsite_slug: demo\nsite_title: Demo\nsite_summary: Safe public summary.\nsite_last_reviewed: 2026-09-05\nsite_featured: true\nsite_order: 1\ntags: [safe]\nsite_highlights: [safe]\n---\n# private body`;
      const key = override.slice(0, override.indexOf(':'));
      note = note.replace(new RegExp(`^${key}:.*$`, 'm'), override);
      await writeFile(join(vault, '04_Projects', 'demo', 'demo.md'), note);
      await writeFile(join(project, 'config', 'public-content.json'), JSON.stringify({
        vaultRoot: '../..', output: 'src/data/public-content.json', lock: 'config/public-content.lock.json',
        sources: ['04_Projects/demo/demo.md'],
      }));
      await expect(runContentSync({ projectRoot: project, mode: 'sync' })).rejects.toThrow(/status|site_order|tags|site_highlights/);
    }
  });

  test('rejects output and lock paths outside the project root', async () => {
    for (const field of ['output', 'lock']) {
      const root = await mkdtemp(join(tmpdir(), 'site-content-path-'));
      const vault = join(root, 'vault');
      const project = join(vault, '04_Projects', 'site');
      await mkdir(join(vault, '04_Projects', 'demo'), { recursive: true });
      await mkdir(join(project, 'config'), { recursive: true });
      const note = `---\nstatus: active\nproject: demo\nupdated: 2026-09-05\nsite_publish: true\nsite_visibility: public\nsite_section: projects\nsite_slug: demo\nsite_title: Demo\nsite_summary: Safe.\nsite_last_reviewed: 2026-09-05\nsite_order: 1\ntags: []\nsite_highlights: []\n---\n`;
      await writeFile(join(vault, '04_Projects', 'demo', 'demo.md'), note);
      const manifest = { vaultRoot: '../..', output: 'src/data/public-content.json', lock: 'config/public-content.lock.json', sources: ['04_Projects/demo/demo.md'] };
      manifest[field] = '../../escaped.json';
      await writeFile(join(project, 'config', 'public-content.json'), JSON.stringify(manifest));
      await expect(runContentSync({ projectRoot: project, mode: 'sync' })).rejects.toThrow(/project root/);
    }
  });

  test('rejects allowlisted source symlinks that resolve outside the Vault root', async () => {
    const root = await mkdtemp(join(tmpdir(), 'site-content-symlink-'));
    const vault = join(root, 'vault');
    const project = join(vault, '04_Projects', 'site');
    const outside = join(root, 'outside.md');
    await mkdir(join(vault, '04_Projects', 'demo'), { recursive: true });
    await mkdir(join(project, 'config'), { recursive: true });
    await writeFile(outside, `---\nstatus: active\nproject: demo\nupdated: 2026-09-05\nsite_publish: true\nsite_visibility: public\nsite_section: projects\nsite_slug: demo\nsite_title: Demo\nsite_summary: Outside.\nsite_last_reviewed: 2026-09-05\nsite_order: 1\ntags: []\nsite_highlights: []\n---\n`);
    await symlink(outside, join(vault, '04_Projects', 'demo', 'demo.md'));
    await writeFile(join(project, 'config', 'public-content.json'), JSON.stringify({
      vaultRoot: '../..', output: 'src/data/public-content.json', lock: 'config/public-content.lock.json',
      sources: ['04_Projects/demo/demo.md'],
    }));
    await expect(runContentSync({ projectRoot: project, mode: 'sync' })).rejects.toThrow(/symlink|Vault root/);
  });

  test('sorts equal-order titles by Unicode code point order', async () => {
    const root = await mkdtemp(join(tmpdir(), 'site-content-sort-'));
    const vault = join(root, 'vault');
    const project = join(vault, '04_Projects', 'site');
    await mkdir(join(project, 'config'), { recursive: true });
    for (const [id, title] of [['b', 'é'], ['a', 'z']]) {
      await mkdir(join(vault, '04_Projects', id), { recursive: true });
      await writeFile(join(vault, '04_Projects', id, `${id}.md`), `---\nstatus: active\nproject: ${id}\nupdated: 2026-09-05\nsite_publish: true\nsite_visibility: public\nsite_section: projects\nsite_slug: ${id}\nsite_title: ${title}\nsite_summary: Safe.\nsite_last_reviewed: 2026-09-05\nsite_order: 1\ntags: []\nsite_highlights: []\n---\n`);
    }
    await writeFile(join(project, 'config', 'public-content.json'), JSON.stringify({
      vaultRoot: '../..', output: 'src/data/public-content.json', lock: 'config/public-content.lock.json',
      sources: ['04_Projects/b/b.md', '04_Projects/a/a.md'],
    }));
    await runContentSync({ projectRoot: project, mode: 'sync' });
    const output = JSON.parse(await readFile(join(project, 'src/data/public-content.json'), 'utf8'));
    expect(output.items.map(({ title }) => title)).toEqual(['z', 'é']);
  });

});


describe('public-content contract metadata', () => {
  test('keeps self-evolve version and weight totals aligned with the rubric', async () => {
    const { parse } = await import('yaml');
    const rubric = parse(await readFile(new URL('../contracts/public-content/docs/rubric.yaml', import.meta.url), 'utf8'));
    const config = parse(await readFile(new URL('../contracts/public-content/config/self-evolve.yaml', import.meta.url), 'utf8'));
    const weightTotal = rubric.items.reduce((total, item) => total + (item.weight ?? 1), 0);
    expect(config.meta.version).toBe(String(rubric.version));
    expect(config.metric.weights_sum).toBe(weightTotal);
  });
});

describe('closed projection schema', () => {
  test('rejects unknown fields, invalid enum values and unsafe URLs', () => {
    const item = {
      id: 'demo', slug: 'demo', title: 'Demo', summary: 'Safe summary', section: 'projects', status: 'active',
      updatedAt: '2026-09-05', lastReviewed: '2026-09-05', featured: true, order: 1,
      tags: [], highlights: [],
    };
    item.sourceHash = sourceHash(JSON.stringify(item));
    expect(() => validateProjection({ schemaVersion: 1, items: [{ ...item, privateNotes: 'secret' }] }))
      .toThrow(/unknown field/);
    expect(() => validateProjection({ schemaVersion: 1, items: [{ ...item, section: 'invalid' }] }))
      .toThrow(/section/);
    expect(() => validateProjection({ schemaVersion: 1, items: [{ ...item, demoUrl: 'data:text/html,bad' }] }))
      .toThrow(/demoUrl/);
  });


  test('rejects protocol-relative URLs and HTTPS URLs with credentials', () => {
    const item = {
      id: 'demo', slug: 'demo', title: 'Demo', summary: 'Safe summary', section: 'projects', status: 'active',
      updatedAt: '2026-09-05', lastReviewed: '2026-09-05', featured: true, order: 1,
      tags: [], highlights: [],
    };
    item.sourceHash = sourceHash(JSON.stringify(item));
    const protocolRelative = { ...item, demoUrl: '//evil.example/x' };
    protocolRelative.sourceHash = sourceHash(JSON.stringify({ ...protocolRelative, sourceHash: undefined }, (key, value) => value));
    const credentialed = { ...item, demoUrl: 'https://user:password@example.com/x' };
    credentialed.sourceHash = sourceHash(JSON.stringify({ ...credentialed, sourceHash: undefined }, (key, value) => value));
    expect(() => validateProjection({ schemaVersion: 1, items: [protocolRelative] })).toThrow(/demoUrl/);
    expect(() => validateProjection({ schemaVersion: 1, items: [credentialed] })).toThrow(/credentials/);
  });

  test('contract rubric invokes the deterministic projection validator', async () => {
    const rubric = await readFile(new URL('../contracts/public-content/docs/rubric.yaml', import.meta.url), 'utf8');
    expect(rubric).toContain('shell_check');
    expect(rubric).toContain('validateProjection');
  });

  test('accepts the frozen-good DSH public-content fixture with bound hashes', async () => {
    const path = new URL('../contracts/public-content/benchmark/artifacts/_golden/good.json', import.meta.url);
    const fixture = JSON.parse(await readFile(path, 'utf8'));
    expect(() => validateProjection(fixture)).not.toThrow();
  });

  test('rejects the adversarial DSH public-content fixture', async () => {
    const path = new URL('../contracts/public-content/benchmark/artifacts/_golden/unsafe-but-previously-passed.json', import.meta.url);
    const fixture = JSON.parse(await readFile(path, 'utf8'));
    expect(() => validateProjection(fixture)).toThrow(/demoUrl|credentials|sourceHash/);
  });

  test('binds sourceHash to the projection item content', () => {
    const item = {
      id: 'demo', slug: 'demo', title: 'Demo', summary: 'Safe summary', section: 'projects', status: 'active',
      updatedAt: '2026-09-05', lastReviewed: '2026-09-05', featured: true, order: 1,
      tags: [], highlights: [],
    };
    item.sourceHash = sourceHash(JSON.stringify(item));
    expect(() => validateProjection({ schemaVersion: 1, items: [{ ...item, summary: 'Tampered' }] }))
      .toThrow(/sourceHash/);
  });

  test('rejects duplicate ids and slugs', () => {
    const item = {
      id: 'demo', slug: 'demo', title: 'Demo', summary: 'Safe summary', section: 'projects', status: 'active',
      updatedAt: '2026-09-05', lastReviewed: '2026-09-05', featured: true, order: 1,
      tags: [], highlights: [],
    };
    item.sourceHash = sourceHash(JSON.stringify(item));
    expect(() => validateProjection({ schemaVersion: 1, items: [item, { ...item }] }))
      .toThrow(/duplicate id/);
  });
});
