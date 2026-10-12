import { expect, test } from '@playwright/test';

test('brand link shows Ethan homepage image with alt text', async ({ page }) => {
  await page.goto('/');
  const brand = page.getByRole('link', { name: 'Ethan 首頁' });
  await expect(brand).toBeVisible();
  const img = brand.locator('img');
  await expect(img).toHaveAttribute('alt', 'Ethan 首頁');
  await expect(img).toHaveAttribute('src', /ethan-brand\.png$/);
});

test('forecast glass hero, strip and rail render with placeholder data', async ({ page }) => {
  await page.goto('/');
  const hero = page.getByLabel('Forecast');
  await expect(hero.getByText('Weather Forecast')).toBeVisible();
  await expect(hero.getByRole('heading')).toContainText(/Strom/);
  const strip = page.getByLabel('Hourly forecast');
  await expect(strip).toBeVisible();
  await expect(strip).toContainText('Wednesday');
  const rail = page.getByLabel('Saved locations');
  await expect(rail).toBeVisible();
  await expect(rail).toContainText('Central Jakarta');
  await expect(rail).toContainText('Bandung');
});

test('forecast content stays readable with reduced motion', async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Ethan 首頁' })).toBeVisible();
  await expect(page.getByRole('heading')).toContainText(/Heavy Rain/);
  await expect(page.getByLabel('Saved locations')).toContainText('Central Jakarta');
});
