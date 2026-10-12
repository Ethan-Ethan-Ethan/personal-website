import { expect, test } from '@playwright/test';

test('brand button shows home icon for Ethan homepage', async ({ page }) => {
  await page.goto('/');
  const brand = page.getByRole('button', { name: 'Ethan 首頁' });
  await expect(brand).toBeVisible();
  await expect(brand.locator('svg')).toHaveCount(1);
  const rail = page.getByRole('navigation', { name: '功能選單' });
  await expect(rail).toBeVisible();
  await expect(rail.getByRole('button', { name: '總覽' })).toHaveAttribute('aria-pressed', 'true');
});

test('forecast panels stay hidden until house button opens them', async ({ page }) => {
  await page.goto('/');
  const brand = page.getByRole('button', { name: 'Ethan 首頁' });
  await expect(page.getByLabel('Forecast', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Saved locations')).toHaveCount(0);
  await brand.click();
  await expect(page.getByLabel('Forecast', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Saved locations')).toBeVisible();
  await expect(brand).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('Forecast', { exact: true })).toHaveCount(0);
  await expect(brand).toHaveAttribute('aria-expanded', 'false');
});

test('forecast glass hero, strip and rail render with placeholder data', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ethan 首頁' }).click();
  const hero = page.getByLabel('Forecast', { exact: true });
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
  await expect(page.getByRole('button', { name: 'Ethan 首頁' })).toBeVisible();
  await page.getByRole('button', { name: 'Ethan 首頁' }).click();
  await expect(page.getByRole('heading')).toContainText(/Heavy Rain/);
  await expect(page.getByLabel('Saved locations')).toContainText('Central Jakarta');
});

test('rail does not overlap bottom controls on desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'desktop layout only');
  await page.goto('/');
  await page.getByRole('button', { name: 'Ethan 首頁' }).click();
  const rail = page.getByLabel('Saved locations');
  const play = page.getByRole('button', { name: /水聲/ });
  const rb = await rail.boundingBox();
  const pb = await play.boundingBox();
  expect(rb).toBeTruthy();
  expect(pb).toBeTruthy();
  const disjoint = rb!.y + rb!.height <= pb!.y || rb!.x >= pb!.x + pb!.width;
  expect(disjoint).toBe(true);
});
