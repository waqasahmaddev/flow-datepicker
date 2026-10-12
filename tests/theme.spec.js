import { test, expect } from '@playwright/test';

async function colours(page) {
  return page.evaluate(() => {
    const picker = FlowDatepicker.get('#meetingAt');
    picker.open();
    const read = (selector) => getComputedStyle(document.querySelector(selector));
    const hour = document.querySelector('#meetingAt + .fdp [data-part="hours"]');
    hour.focus();
    return {
      popover: read('#meetingAt + .fdp .fdp-popover').backgroundColor,
      text: read('#meetingAt + .fdp .fdp-popover').color,
      cap: read('#meetingAt + .fdp .fdp-cell.is-selected .fdp-day').backgroundColor,
      focused: getComputedStyle(hour).backgroundColor,
      ring: getComputedStyle(hour).boxShadow,
      outline: getComputedStyle(hour).outlineStyle
    };
  });
}

const DARK = { popover: 'rgb(48, 48, 48)', text: 'rgb(240, 240, 240)', cap: 'rgb(255, 255, 255)', focused: 'rgb(70, 70, 70)', ring: 'none', outline: 'none' };
const LIGHT = { popover: 'rgb(255, 255, 255)', text: 'rgb(27, 27, 27)', cap: 'rgb(27, 27, 27)', focused: 'rgb(236, 236, 236)', ring: 'none', outline: 'none' };

test.describe('themes', () => {
  test('data-fdp-theme="dark"', { tag: '@basic' }, async ({ page }) => {
    await page.goto('/demo/?theme=dark');
    expect(await colours(page)).toEqual(DARK);
  });

  test('data-fdp-theme="light" even when the OS prefers dark', { tag: '@basic' }, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/demo/?theme=light');
    expect(await colours(page)).toEqual(LIGHT);
  });

  test('explicit theme wins over a page :root color-scheme rule', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/demo/?theme=light');
    await page.addStyleTag({ content: ':root { color-scheme: light dark; }' });
    expect(await colours(page)).toEqual(LIGHT);
  });

  test('auto follows the OS setting', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/demo/?theme=auto');
    expect((await colours(page)).popover).toBe(LIGHT.popover);
    await page.emulateMedia({ colorScheme: 'dark' });
    expect((await colours(page)).popover).toBe(DARK.popover);
  });

  test('Bootstrap data-bs-theme works without data-fdp-theme', async ({ page }) => {
    await page.goto('/demo/');
    await page.evaluate(() => {
      document.documentElement.removeAttribute('data-fdp-theme');
      document.documentElement.setAttribute('data-bs-theme', 'light');
    });
    expect((await colours(page)).popover).toBe(LIGHT.popover);
  });
});
