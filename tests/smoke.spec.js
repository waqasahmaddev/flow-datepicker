import { test, expect } from '@playwright/test';

test('demo page loads the library without errors', { tag: '@basic' }, async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/demo/');
  await expect(page.locator('h1')).toHaveText('flow-datepicker');
  expect(await page.evaluate(() => typeof window.FlowDatepicker)).toBe('function');
  expect(errors).toEqual([]);
});

test('form posts the native input values', { tag: '@basic' }, async ({ page }) => {
  await page.goto('/demo/');
  await page.evaluate(() => FlowDatepicker.get('#deliveryDate').setValue('2026-10-15'));
  await page.getByRole('button', { name: 'Submit' }).click();
  const echo = page.getByTestId('echo');
  await expect(echo).toContainText('deliveryDate: 2026-10-15');
  await expect(echo).toContainText('startDate: 2026-03-02');
  await expect(echo).toContainText('from: 2026-10-05');
  await expect(echo).toContainText('to: 2026-10-12');
  await expect(echo).toContainText('publishDate: 2026-10-12');
  await expect(echo).toContainText('startTime: 12:00');
  await expect(echo).toContainText('meetingAt: 2026-10-12T12:00');
});
