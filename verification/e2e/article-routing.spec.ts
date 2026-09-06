import { expect, test } from '@playwright/test';

const rssSlug = '2026-07-11-ghost-font-a-font-that-humans-can-read-but-ai-cannot';

test('serves representative manual and RSS articles at flat URLs', async ({ page }) => {
  await page.goto('/articles/ai-workflow');
  await expect(page.getByRole('heading', { level: 1, name: 'AI 工具要接到工作流' })).toBeVisible();

  await page.goto(`/articles/${rssSlug}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Ghost Font: A font that humans can read but AI cannot' })).toBeVisible();
});

test('does not serve nested source paths for flat article routes', async ({ request }) => {
  const response = await request.get(`/articles/rss/${rssSlug}`);

  expect(response.ok()).toBe(false);
  expect(response.status()).toBe(404);
});

test('article listing renders the canonical flat RSS href', async ({ page }) => {
  await page.goto('/articles/');

  const link = page.getByRole('link', { name: 'Ghost Font: A font that humans can read but AI cannot' });
  await expect(link).toHaveAttribute('href', `/articles/${rssSlug}`);
});
