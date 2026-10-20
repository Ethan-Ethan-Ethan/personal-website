import { expect, test } from '@playwright/test';

test('serves the current featured article at a flat URL', async ({ page }) => {
  await page.goto('/articles/harness-not-claude');
  await expect(page.getByRole('heading', { level: 1, name: '不使用 Claude 的三大理由：你需要的不是更強的模型，而是更好的 Harness' })).toBeVisible();
  await expect(page.getByRole('link', { name: '你需要的不是更多 Skill，而是更好的 Loop' })).toBeVisible();
});

test('retired listing is not a catalog page', async ({ request }) => {
  const response = await request.get('/articles/', { maxRedirects: 0 });
  // Cloudflare Pages：_redirects 301；astro preview：無 index 則 404。
  expect([301, 302, 307, 308, 404]).toContain(response.status());
  if (response.status() === 200) {
    const body = await response.text();
    expect(body).not.toContain('Redirecting from');
    expect(body).not.toContain('AI 工具要接到工作流');
  }
});

test('retired June notes are not served', async ({ request }) => {
  for (const slug of ['ai-workflow', 'fae-value', 'public-notes']) {
    const response = await request.get(`/articles/${slug}`, { maxRedirects: 0 });
    expect(response.status(), slug).toBeGreaterThanOrEqual(400);
  }
});

test('secondary article remains published at flat URL', async ({ page }) => {
  await page.goto('/articles/rag-not-mandatory');
  await expect(page.getByRole('heading', { level: 1, name: 'RAG 是公司必備嗎？我看未必。' })).toBeVisible();
});

test('WIP slugs show under-construction page', async ({ page }) => {
  await page.goto('/wip/ontology-embedding-gemma-2');
  await expect(page.getByRole('heading', { level: 1, name: /Ontology.*EmbeddingGemma 2/ })).toBeVisible();
  await expect(page.getByText('建構中')).toBeVisible();
});

test('does not serve nested source paths for flat article routes', async ({ request }) => {
  const response = await request.get('/articles/rss/example');
  expect(response.ok()).toBe(false);
  expect(response.status()).toBe(404);
});
