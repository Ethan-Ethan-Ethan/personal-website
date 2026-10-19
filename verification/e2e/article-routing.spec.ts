import { expect, test } from '@playwright/test';

test('serves the current featured article at a flat URL', async ({ page }) => {
  await page.goto('/articles/harness-not-claude');
  await expect(page.getByRole('heading', { level: 1, name: '你需要的不是更強的模型，而是更好的 Harness' })).toBeVisible();
  await expect(page.getByRole('link', { name: '你需要的不是更多 Skill，而是更好的 Loop' })).toBeVisible();
});

test('retired listing redirects to the lake homepage', async ({ page }) => {
  await page.goto('/articles/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name: '文章' })).toBeVisible();
});

test('retired June notes are not served', async ({ request }) => {
  for (const slug of ['ai-workflow', 'fae-value', 'public-notes']) {
    const response = await request.get(`/articles/${slug}`, { maxRedirects: 0 });
    expect(response.status(), slug).toBeGreaterThanOrEqual(400);
  }
});

test('does not serve nested source paths for flat article routes', async ({ request }) => {
  const response = await request.get('/articles/rss/example');
  expect(response.ok()).toBe(false);
  expect(response.status()).toBe(404);
});
