import { expect, test } from '@playwright/test';

test('brand link shows Ethan homepage image with alt text', async ({ page }) => {
  await page.goto('/');
  const brand = page.getByRole('link', { name: 'Ethan 首頁' });
  await expect(brand).toBeVisible();
  const img = brand.locator('img');
  await expect(img).toHaveAttribute('alt', 'Ethan 首頁');
  await expect(img).toHaveAttribute('src', /ethan-brand\.png$/);
});
