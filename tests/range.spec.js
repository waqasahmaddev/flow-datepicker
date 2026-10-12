import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 12, 10, 0));
  await page.goto('/demo/');
});

const root = (page) => page.locator('.fdp--range').first();
const pill = (page) => root(page).locator('.fdp-pill');
const dialog = (page) => root(page).locator('.fdp-popover');
const day = (page, iso) => dialog(page).locator(`.fdp-cell[data-date="${iso}"]`);
const from = (page) => page.locator('input[name="from"]');
const to = (page) => page.locator('input[name="to"]');

test.describe('range mode', () => {
  test('pill shows the matching preset name and has an accessible name', async ({ page }) => {
    await expect(pill(page).locator('.fdp-pill-text')).toHaveText('Last 7 days');
    await expect(page.getByRole('button', { name: 'Choose date range, Last 7 days' })).toBeVisible();
    await expect(from(page)).toHaveAttribute('max', '2026-10-12');
  });

  test('opens two months with the end date in the second month and the band drawn', async ({ page }) => {
    await pill(page).click();
    await expect(dialog(page).locator('.fdp-month-title')).toHaveText(['September 2026', 'October 2026']);
    await expect(day(page, '2026-10-05')).toHaveClass(/is-selected/);
    await expect(day(page, '2026-10-05')).toHaveClass(/is-range-start/);
    await expect(day(page, '2026-10-08')).toHaveClass(/is-in-range/);
    await expect(day(page, '2026-10-10')).toHaveClass(/is-row-end/);
    await expect(day(page, '2026-10-11')).toHaveClass(/is-row-start/);
    await expect(day(page, '2026-10-12')).toHaveClass(/is-range-end/);
    await expect(day(page, '2026-10-04')).not.toHaveClass(/is-in-range/);
    await expect(dialog(page).locator('.fdp-preset.is-active')).toHaveText('Last 7 days');
  });

  test('max today: future days and the next month are disabled', async ({ page }) => {
    await pill(page).click();
    await expect(day(page, '2026-10-13')).toHaveAttribute('aria-disabled', 'true');
    await expect(dialog(page).getByRole('button', { name: 'Next month' })).toBeDisabled();
    await expect(dialog(page).getByRole('button', { name: 'Previous month' })).toBeEnabled();
  });

  test('two clicks pick a range, fire change on both inputs and close', { tag: '@basic' }, async ({ page }) => {
    await page.evaluate(() => {
      window.changes = [];
      for (const input of document.querySelectorAll('input[name="from"], input[name="to"]')) {
        input.addEventListener('change', () => window.changes.push(input.name));
      }
    });
    await pill(page).click();
    await day(page, '2026-09-20').click();
    await expect(dialog(page)).toBeVisible();
    await expect(day(page, '2026-09-20')).toHaveClass(/is-selected/);
    await day(page, '2026-10-03').click();
    await expect(dialog(page)).toBeHidden();
    await expect(from(page)).toHaveValue('2026-09-20');
    await expect(to(page)).toHaveValue('2026-10-03');
    await expect(pill(page).locator('.fdp-pill-text')).toHaveText('Sep 20 - Oct 3');
    await expect(pill(page)).toBeFocused();
    expect(await page.evaluate(() => window.changes)).toEqual(['from', 'to']);
  });

  test('clicking the end first still orders the range', async ({ page }) => {
    await pill(page).click();
    await day(page, '2026-10-09').click();
    await day(page, '2026-09-25').click();
    await expect(from(page)).toHaveValue('2026-09-25');
    await expect(to(page)).toHaveValue('2026-10-09');
  });

  test('hover previews the band after the first click', async ({ page }) => {
    await pill(page).click();
    await day(page, '2026-09-10').click();
    await day(page, '2026-09-16').hover();
    await expect(day(page, '2026-09-13')).toHaveClass(/is-in-range/);
    await expect(day(page, '2026-09-16')).toHaveClass(/is-range-end/);
    await expect(day(page, '2026-09-17')).not.toHaveClass(/is-in-range/);
    await expect(from(page)).toHaveValue('2026-10-05');
  });

  test('presets pick a range and close', { tag: '@basic' }, async ({ page }) => {
    await pill(page).click();
    await dialog(page).getByRole('option', { name: 'Last 14 days' }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(from(page)).toHaveValue('2026-09-28');
    await expect(to(page)).toHaveValue('2026-10-12');
    await expect(pill(page).locator('.fdp-pill-text')).toHaveText('Last 14 days');
    await pill(page).click();
    await dialog(page).getByRole('option', { name: 'Week to date' }).click();
    await expect(from(page)).toHaveValue('2026-10-11');
    await expect(to(page)).toHaveValue('2026-10-12');
    await pill(page).click();
    await dialog(page).getByRole('option', { name: 'Month to date' }).click();
    await expect(from(page)).toHaveValue('2026-10-01');
  });

  test('presets keyboard: arrows move, Enter picks', async ({ page }) => {
    await pill(page).click();
    await dialog(page).getByRole('option', { name: 'Last 7 days' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(dialog(page).getByRole('option', { name: 'Last 14 days' })).toBeFocused();
    await page.keyboard.press('End');
    await expect(dialog(page).getByRole('option', { name: 'Last 30 days' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(from(page)).toHaveValue('2026-09-12');
    await expect(pill(page)).toBeFocused();
  });

  test('keyboard range: ArrowDown opens on the end date, Enter twice picks', async ({ page }) => {
    await pill(page).focus();
    await page.keyboard.press('ArrowDown');
    await expect(day(page, '2026-10-12')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(day(page, '2026-10-03')).toHaveClass(/is-selected/);
    await expect(day(page, '2026-10-04')).toHaveClass(/is-in-range/);
    await page.keyboard.press('Enter');
    await expect(dialog(page)).toBeHidden();
    await expect(from(page)).toHaveValue('2026-10-03');
    await expect(to(page)).toHaveValue('2026-10-05');
  });

  test('Enter and Space on the pill open it, Escape closes', async ({ page }) => {
    await pill(page).focus();
    await page.keyboard.press('Enter');
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await page.keyboard.press(' ');
    await expect(dialog(page)).toBeVisible();
  });

  test('form posts from and to', async ({ page }) => {
    await pill(page).click();
    await dialog(page).getByRole('option', { name: 'Last 14 days' }).click();
    await page.evaluate(() => FlowDatepicker.get('#deliveryDate').setValue('2026-10-15'));
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByTestId('echo')).toContainText('from: 2026-09-28');
    await expect(page.getByTestId('echo')).toContainText('to: 2026-10-12');
  });

  test('public API: value object, preset id and dates', async ({ page }) => {
    const result = await page.evaluate(() => {
      const picker = FlowDatepicker.get(document.querySelector('[data-flow-datepicker="range"]'));
      const out = [picker.getValue()];
      picker.setValue('last-30-days');
      out.push(picker.getValue());
      picker.setValue({ from: '2026-08-31', to: '2026-08-01' });
      out.push(picker.getValue(), document.querySelector('.fdp--range .fdp-pill-text').textContent);
      picker.clear();
      out.push(picker.getValue(), document.querySelector('.fdp--range .fdp-pill-text').textContent);
      return out;
    });
    expect(result).toEqual([
      { from: '2026-10-05', to: '2026-10-12', preset: 'last-7-days' },
      { from: '2026-09-12', to: '2026-10-12', preset: 'last-30-days' },
      { from: '2026-08-01', to: '2026-08-31', preset: null },
      'Aug 1 - Aug 31',
      { from: '', to: '', preset: null },
      'Select dates'
    ]);
  });

  test('custom presets from JSON and no presets', async ({ page }) => {
    await page.evaluate(() => {
      const make = (presets, names) => {
        const box = document.createElement('div');
        box.dataset.flowDatepicker = 'range';
        if (presets) {
          box.dataset.fdpPresets = presets;
        }
        box.innerHTML = `<input type="date" name="${names[0]}"><input type="date" name="${names[1]}">`;
        document.querySelector('main').append(box);
        return FlowDatepicker.init(box)[0];
      };
      window.custom = make('[{"label":"Last 90 days","days":90},{"id":"q3","label":"Q3","from":"2026-07-01","to":"2026-09-30"}]', ['a', 'b']);
      window.bare = make('none', ['c', 'd']);
    });
    const result = await page.evaluate(() => {
      window.custom.open();
      const labels = [...document.querySelectorAll('[data-flow-datepicker]:has([name=\"a\"]) + .fdp .fdp-preset')].map((node) => node.textContent);
      window.custom.close();
      window.bare.open();
      const none = document.querySelectorAll('[data-flow-datepicker]:has([name=\"c\"]) + .fdp .fdp-preset').length;
      window.bare.close();
      window.custom.setValue('q3');
      return [labels, none, window.custom.getValue()];
    });
    expect(result).toEqual([['Last 90 days', 'Q3'], 0, { from: '2026-07-01', to: '2026-09-30', preset: 'q3' }]);
  });

  test('destroy restores both inputs to the tab order', async ({ page }) => {
    const result = await page.evaluate(() => {
      const box = document.querySelector('[data-flow-datepicker="range"]');
      FlowDatepicker.get(box).destroy();
      return [...box.querySelectorAll('input')].map((input) => input.hasAttribute('tabindex')).concat(box.parentElement.classList.contains('fdp'));
    });
    expect(result).toEqual([false, false, false]);
  });
});

test.describe('range with custom calendar', () => {
  const custom = (page) => page.locator('[data-flow-datepicker]:has([name=\"statsFrom\"]) + .fdp');

  test('opens as a list only, Custom range opens the calendar', async ({ page }) => {
    await expect(custom(page).locator('.fdp-pill-text')).toHaveText('Last 14 days');
    await custom(page).locator('.fdp-pill').click();
    const box = custom(page).locator('.fdp-popover');
    await expect(box.locator('.fdp-calendar')).toBeHidden();
    await expect(box.getByRole('option')).toHaveText(['Week to date', 'Month to date', 'Last 7 days', 'Last 14 days', 'Last 30 days', 'Custom range']);
    await expect(box.locator('.fdp-preset.is-active')).toHaveText('Last 14 days');
    await box.getByRole('option', { name: 'Custom range' }).click();
    await expect(box.locator('.fdp-calendar')).toBeVisible();
    await expect(box.locator('.fdp-preset.is-active')).toHaveText('Custom range');
    await box.locator('.fdp-cell[data-date="2026-09-03"]').click();
    await box.locator('.fdp-cell[data-date="2026-09-09"]').click();
    await expect(box).toBeHidden();
    await expect(page.locator('input[name="statsFrom"]')).toHaveValue('2026-09-03');
    await expect(page.locator('input[name="statsTo"]')).toHaveValue('2026-09-09');
    await expect(custom(page).locator('.fdp-pill-text')).toHaveText('Sep 3 - Sep 9');
  });

  test('custom dates reopen with the calendar shown, a preset reopens without it', async ({ page }) => {
    await page.evaluate(() => FlowDatepicker.get(document.querySelector('[data-fdp-calendar="custom"]')).setValue({ from: '2026-09-01', to: '2026-09-05' }));
    await custom(page).locator('.fdp-pill').click();
    const box = custom(page).locator('.fdp-popover');
    await expect(box.locator('.fdp-calendar')).toBeVisible();
    await expect(box.locator('.fdp-preset.is-active')).toHaveText('Custom range');
    await box.getByRole('option', { name: 'Last 7 days' }).click();
    await expect(page.locator('input[name="statsFrom"]')).toHaveValue('2026-10-05');
    await custom(page).locator('.fdp-pill').click();
    await expect(box.locator('.fdp-calendar')).toBeHidden();
  });

  test('keyboard: ArrowDown focuses the list, Enter on Custom range moves into the calendar', async ({ page }) => {
    await custom(page).locator('.fdp-pill').focus();
    await page.keyboard.press('ArrowDown');
    const box = custom(page).locator('.fdp-popover');
    await expect(box.getByRole('option', { name: 'Last 14 days' })).toBeFocused();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(box.locator('.fdp-cell[data-date="2026-10-12"]')).toBeFocused();
  });
});
