import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 12, 10, 0));
  await page.goto('/demo/');
});

test('tap opens the calendar without the on-screen keyboard and a tap picks a day', { tag: '@basic' }, async ({ page }) => {
  const input = page.locator('#publishDate + .fdp .fdp-input');
  await input.tap();
  const dialog = page.locator('#publishDate + .fdp .fdp-popover');
  await expect(dialog).toBeVisible();
  await expect(input).toHaveAttribute('inputmode', 'none');
  await dialog.locator('.fdp-cell[data-date="2026-10-20"]').tap();
  await expect(dialog).toBeHidden();
  await expect(page.locator('#publishDate')).toHaveValue('2026-10-20');
});

test('popover fits the phone screen', async ({ page }) => {
  await page.locator('#publishDate + .fdp .fdp-input').tap();
  const box = await page.locator('#publishDate + .fdp .fdp-popover').boundingBox();
  const width = page.viewportSize().width;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(width);
});

test('touch targets are at least 42px', async ({ page }) => {
  await page.locator('#publishDate + .fdp .fdp-input').tap();
  const size = await page.locator('#publishDate + .fdp .fdp-cell[data-date="2026-10-20"] .fdp-day').boundingBox();
  expect(size.width).toBeGreaterThanOrEqual(42);
});

test('range on a phone: only one month, no presets', { tag: '@basic' }, async ({ page }) => {
  await page.locator('.fdp--range').first().locator('.fdp-pill').tap();
  const dialog = page.locator('.fdp--range').first().locator('.fdp-popover');
  await expect(dialog.locator('.fdp-month')).toHaveCount(1);
  await expect(dialog.locator('.fdp-month-title')).toHaveText('October 2026');
  await expect(dialog.locator('.fdp-presets')).toBeHidden();
  await expect(dialog.getByRole('button', { name: 'Previous month' })).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
  await dialog.locator('.fdp-cell[data-date="2026-10-01"]').tap();
  await dialog.locator('.fdp-cell[data-date="2026-10-09"]').tap();
  await expect(page.locator('input[name="from"]')).toHaveValue('2026-10-01');
  await expect(page.locator('input[name="to"]')).toHaveValue('2026-10-09');
});
