import { expect, test } from '@playwright/test';

test('brand button shows home icon for Ethan homepage', async ({ page }, testInfo) => {
  await page.goto('/');
  const brand = page.getByRole('button', { name: 'Ethan 首頁' });
  await expect(brand).toBeVisible();
  await expect(brand.locator('svg')).toHaveCount(1);
  await expect(brand.locator('svg')).toHaveAttribute('width', '20');
  await expect(brand).toHaveCSS('color', 'rgb(255, 255, 255)');
  const rail = page.getByRole('navigation', { name: '功能選單' });
  await expect(rail).toBeHidden();
  await brand.click();
  if (testInfo.project.name !== 'desktop-chrome') {
    // mobile：側軌按設計常駐隱藏（≤640px display:none），只驗 hero 開啟
    await expect(rail).toBeHidden();
    await expect(page.getByText('Weather Forecast')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Weather Forecast')).toBeHidden();
    return;
  }
  await expect(rail).toBeVisible();
  await expect(rail.getByRole('button', { name: '總覽' }).locator('svg')).toHaveAttribute('width', '20');
  await expect(rail.getByRole('button', { name: '總覽' })).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(rail.getByRole('button', { name: '總覽' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Weather Forecast')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(rail).toBeHidden();
  await expect(page.getByText('Weather Forecast')).toBeHidden();
});

test('forecast panels stay hidden until house button opens them', async ({ page }) => {
  await page.goto('/');
  const brand = page.getByRole('button', { name: 'Ethan 首頁' });
  await expect(page.getByText('Weather Forecast')).toBeHidden();
  await expect(page.getByLabel('Saved locations')).toBeHidden();
  await brand.click();
  await expect(page.getByText('Weather Forecast')).toBeVisible();
  await expect(page.getByLabel('Saved locations')).toBeVisible();
  await expect(brand).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByText('Weather Forecast')).toBeHidden();
  await expect(brand).toHaveAttribute('aria-expanded', 'false');
});

test('forecast glass hero, strip and rail render with live snapshot data', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ethan 首頁' }).click();
  const hero = page.getByLabel('Forecast', { exact: true });
  await expect(hero.getByText('Weather Forecast')).toBeVisible();
  await expect(hero.getByRole('heading')).toContainText(/\S/);
  const strip = page.getByLabel('Hourly forecast');
  await expect(strip).toBeVisible();
  await expect(strip.getByText(/^\d+°$/).first()).toBeVisible();
  await expect(page.getByText('中央氣象署')).toBeVisible();
  if (testInfo.project.name !== 'desktop-chrome') {
    await expect(strip.locator('.fc-day').first()).toBeHidden();
    await expect(strip.locator('.fc-wave')).toBeHidden();
  } else {
    const lastDay = strip.locator('.fc-day').last();
    const bb = await lastDay.boundingBox();
    const vw = page.viewportSize()?.width ?? 0;
    expect(bb).toBeTruthy();
    expect(bb!.x + bb!.width).toBeLessThanOrEqual(vw + 1);
  }
  const rail = page.getByLabel('Saved locations');
  await expect(rail).toBeVisible();
  await expect(rail.getByText('臺北市')).toBeVisible();
  await expect(rail.getByText('現在')).toBeVisible();
  await expect(rail.getByText(/^\d+°$/).first()).toBeVisible();
  await expect(rail.getByText('降雨機率')).toBeVisible();
});

test('forecast content stays readable with reduced motion', async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Ethan 首頁' })).toBeVisible();
  await page.getByRole('button', { name: 'Ethan 首頁' }).click();
  await expect(page.getByRole('heading')).toContainText(/\S/);
  await expect(page.getByLabel('Saved locations')).toContainText('°');
  await expect(page.getByText('中央氣象署')).toBeVisible();
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
