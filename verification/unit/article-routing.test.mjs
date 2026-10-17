import { describe, expect, test } from 'vitest';
import { execFile } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const projectRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

async function loadArticleRouting() {
  try {
    return await import('../../src/features/articles/routing.mjs');
  } catch (error) {
    expect.fail(`article routing module is unavailable: ${error.message}`);
  }
}

async function collectHtmlFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(current, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(root, path));
    else if (entry.name.endsWith('.html')) files.push(relative(root, path));
  }
  return files.sort();
}

const post = (id, { draft = false } = {}) => ({
  id,
  data: {
    draft,
    date: new Date('2026-09-05T00:00:00.000Z'),
    title: id,
  },
});

describe('article routing', () => {
  test('maps nested ids to flat routes', async () => {
    const { getArticleHref, getArticleSlug } = await loadArticleRouting();

    expect(getArticleSlug(post('manual-post'))).toBe('manual-post');
    expect(getArticleHref(post('manual-post'))).toBe('/articles/manual-post');
    expect(getArticleSlug(post('gmail/inbox/captured-post'))).toBe('captured-post');
    expect(getArticleHref(post('gmail/inbox/captured-post'))).toBe('/articles/captured-post');
  });

  test('uses one slug rule for listing hrefs and static paths', async () => {
    const { buildArticleListing, buildArticleStaticPaths } = await loadArticleRouting();
    const posts = [post('manual-post'), post('gmail/captured-post')];

    const hrefs = buildArticleListing(posts).map((entry) => entry.href);
    const routeHrefs = buildArticleStaticPaths(posts).map(({ params }) => `/articles/${params.slug}`);

    expect(hrefs).toEqual(routeHrefs);
  });

  test('preserves the original collection entry id in article listings', async () => {
    const { buildArticleListing } = await loadArticleRouting();
    const sourcePost = post('gmail/inbox/captured-post');

    const [entry] = buildArticleListing([sourcePost]);

    expect(entry.href).toBe('/articles/captured-post');
    expect(entry.post).toBe(sourcePost);
    expect(entry.post.id).toBe('gmail/inbox/captured-post');
  });

  test('fails closed when static routes contain duplicate flat slugs', async () => {
    const { buildArticleStaticPaths } = await loadArticleRouting();
    const posts = [post('gmail/shared-post'), post('gmail/inbox/shared-post')];

    expect(() => buildArticleStaticPaths(posts)).toThrow(/duplicate article slug "shared-post"/i);
  });

  test('fails closed when listing entries contain duplicate flat slugs', async () => {
    const { buildArticleListing } = await loadArticleRouting();
    const posts = [post('gmail/shared-post'), post('gmail/inbox/shared-post')];

    expect(() => buildArticleListing(posts)).toThrow(/duplicate article slug "shared-post"/i);
  });

  test('excludes drafts before checking routes and listings for collisions', async () => {
    const { buildArticleListing, buildArticleStaticPaths } = await loadArticleRouting();
    const posts = [post('gmail/shared-post'), post('gmail/inbox/shared-post', { draft: true })];

    expect(buildArticleListing(posts).map(({ post: entry }) => entry.id)).toEqual(['gmail/shared-post']);
    expect(buildArticleStaticPaths(posts).map(({ params }) => params.slug)).toEqual(['shared-post']);
  });

  test('article pages and PostCard use the shared routing helpers directly', async () => {
    const [indexPage, detailPage, homePage, postCard] = await Promise.all([
      readFile(new URL('../../src/pages/articles/index.astro', import.meta.url), 'utf8'),
      readFile(new URL('../../src/pages/articles/[slug].astro', import.meta.url), 'utf8'),
      readFile(new URL('../../src/pages/index.astro', import.meta.url), 'utf8'),
      readFile(new URL('../../src/components/PostCard.astro', import.meta.url), 'utf8'),
    ]);

    expect(indexPage).toContain('buildArticleListing');
    expect(indexPage).toContain('<PostCard post={post} />');
    expect(detailPage).toContain('buildArticleStaticPaths');
    expect(detailPage).toContain('getArticleHref(prevPost)');
    expect(detailPage).toContain('getArticleHref(nextPost)');
    expect(homePage).toContain('getArticleHref(post)');
    expect(postCard).toContain("import { getArticleHref } from '../features/articles/routing.mjs';");
    expect(postCard).toContain('href={getArticleHref(post)}');
    expect(postCard).not.toContain('`/articles/${post.id}`');
  });

  test('Astro build emits representative flat article routes without nested source paths', async () => {
    const temporaryRoot = await mkdtemp(join(tmpdir(), 'personal-site-article-build-'));
    const outputDirectory = join(temporaryRoot, 'dist');

    try {
      await execFileAsync(
        process.execPath,
        [join(projectRoot, 'node_modules/astro/bin/astro.mjs'), 'build', '--outDir', outputDirectory],
        { cwd: projectRoot, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, maxBuffer: 10 * 1024 * 1024 },
      );

      const htmlFiles = await collectHtmlFiles(outputDirectory);

      expect(htmlFiles.length).toBeGreaterThan(4);
      expect(htmlFiles).toContain('articles/ai-workflow/index.html');
      expect(htmlFiles).not.toContain(`articles/rss/`);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }, 120_000);
});
