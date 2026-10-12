import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 12, 10, 0));
  await page.goto('/demo/');
});

function field(page, id) {
  return page.locator(`.fdp:has(#${id}) .fdp-input`);
}

function popover(page, id) {
  return page.locator(`.fdp:has(#${id}) .fdp-popover`);
}

function day(page, id, iso) {
  return popover(page, id).locator(`.fdp-cell[data-date="${iso}"]`);
}

test.describe('date mode', () => {
  test('enhances the native input and shows the localised value', async ({ page }) => {
    const input = field(page, 'publishDate');
    await expect(input).toHaveValue('Oct 12, 2026');
    await expect(input).toHaveAttribute('placeholder', 'mm/dd/yyyy');
    await expect(page.locator('#publishDate')).toHaveClass(/fdp-native/);
    await expect(page.getByRole('textbox', { name: 'Publish date' })).toHaveValue('Oct 12, 2026');
  });

  test('clicking the field opens one month on the selected date', async ({ page }) => {
    await field(page, 'publishDate').click();
    const dialog = popover(page, 'publishDate');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.fdp-month-title')).toHaveText('October 2026');
    await expect(day(page, 'publishDate', '2026-10-12')).toHaveAttribute('aria-selected', 'true');
    await expect(day(page, 'publishDate', '2026-10-12')).toHaveAttribute('aria-current', 'date');
    await expect(field(page, 'publishDate')).toHaveAttribute('aria-expanded', 'true');
  });

  test('picking a day writes ISO to the native input, fires change and closes', async ({ page }) => {
    await page.evaluate(() => {
      window.changes = [];
      document.querySelector('#publishDate').addEventListener('change', (event) => window.changes.push(event.target.value));
    });
    await field(page, 'publishDate').click();
    await day(page, 'publishDate', '2026-10-21').click();
    await expect(popover(page, 'publishDate')).toBeHidden();
    await expect(page.locator('#publishDate')).toHaveValue('2026-10-21');
    await expect(field(page, 'publishDate')).toHaveValue('Oct 21, 2026');
    await expect(field(page, 'publishDate')).toBeFocused();
    expect(await page.evaluate(() => window.changes)).toEqual(['2026-10-21']);
  });

  test('month navigation buttons', async ({ page }) => {
    await field(page, 'publishDate').click();
    const dialog = popover(page, 'publishDate');
    await dialog.getByRole('button', { name: 'Next month' }).click();
    await expect(dialog.locator('.fdp-month-title')).toHaveText('November 2026');
    await dialog.getByRole('button', { name: 'Previous month' }).click();
    await dialog.getByRole('button', { name: 'Previous month' }).click();
    await expect(dialog.locator('.fdp-month-title')).toHaveText('September 2026');
    await expect(field(page, 'publishDate')).toBeFocused();
  });

  test('keyboard: ArrowDown opens and focuses the grid, arrows move, Enter picks', async ({ page }) => {
    await field(page, 'publishDate').focus();
    await page.keyboard.press('ArrowDown');
    await expect(day(page, 'publishDate', '2026-10-12')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(day(page, 'publishDate', '2026-10-13')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(day(page, 'publishDate', '2026-10-20')).toBeFocused();
    await page.keyboard.press('PageDown');
    await expect(day(page, 'publishDate', '2026-11-20')).toBeFocused();
    await page.keyboard.press('Home');
    await expect(day(page, 'publishDate', '2026-11-15')).toBeFocused();
    await page.keyboard.press('End');
    await expect(day(page, 'publishDate', '2026-11-21')).toBeFocused();
    await page.keyboard.press('Shift+PageUp');
    await expect(day(page, 'publishDate', '2025-11-21')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(popover(page, 'publishDate')).toBeHidden();
    await expect(page.locator('#publishDate')).toHaveValue('2025-11-21');
    await expect(field(page, 'publishDate')).toBeFocused();
  });

  test('keyboard: Escape closes and returns focus without changing the value', async ({ page }) => {
    await field(page, 'publishDate').focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Escape');
    await expect(popover(page, 'publishDate')).toBeHidden();
    await expect(field(page, 'publishDate')).toBeFocused();
    await expect(page.locator('#publishDate')).toHaveValue('2026-10-12');
  });

  test('typing a date commits on Enter and on blur', async ({ page }) => {
    const input = field(page, 'publishDate');
    await input.fill('11/3/2026');
    await input.press('Enter');
    await expect(page.locator('#publishDate')).toHaveValue('2026-11-03');
    await expect(input).toHaveValue('Nov 3, 2026');
    await input.fill('Dec 24');
    await page.locator('h1').click();
    await expect(page.locator('#publishDate')).toHaveValue('2026-12-24');
    await expect(input).toHaveValue('Dec 24, 2026');
  });

  test('typing moves the open calendar to the typed month', async ({ page }) => {
    const input = field(page, 'publishDate');
    await input.click();
    await input.fill('2/14/2027');
    await expect(popover(page, 'publishDate').locator('.fdp-month-title')).toHaveText('February 2027');
    await expect(page.locator('#publishDate')).toHaveValue('2026-10-12');
  });

  test('typing nonsense reverts, clearing the text clears the value', async ({ page }) => {
    const input = field(page, 'publishDate');
    await input.fill('not a date');
    await input.press('Enter');
    await expect(input).toHaveValue('Oct 12, 2026');
    await expect(page.locator('#publishDate')).toHaveValue('2026-10-12');
    await input.fill('');
    await input.press('Enter');
    await expect(page.locator('#publishDate')).toHaveValue('');
  });

  test('Today and Clear buttons', async ({ page }) => {
    await field(page, 'publishDate').click();
    await popover(page, 'publishDate').getByRole('button', { name: 'Clear' }).click();
    await expect(page.locator('#publishDate')).toHaveValue('');
    await expect(field(page, 'publishDate')).toHaveValue('');
    await field(page, 'publishDate').click();
    await popover(page, 'publishDate').getByRole('button', { name: 'Today' }).click();
    await expect(page.locator('#publishDate')).toHaveValue('2026-10-12');
  });

  test('min and max dim days, block picking and limit navigation', async ({ page }) => {
    await field(page, 'deliveryDate').click();
    const dialog = popover(page, 'deliveryDate');
    await expect(day(page, 'deliveryDate', '2026-10-04')).toHaveAttribute('aria-disabled', 'true');
    await expect(day(page, 'deliveryDate', '2026-10-21')).toHaveAttribute('aria-disabled', 'true');
    await expect(day(page, 'deliveryDate', '2026-10-05')).not.toHaveAttribute('aria-disabled', 'true');
    await expect(dialog.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Next month' })).toBeDisabled();
    await day(page, 'deliveryDate', '2026-10-21').click({ force: true });
    await expect(page.locator('#deliveryDate')).toHaveValue('');
    await expect(dialog).toBeVisible();
  });

  test('keyboard stays inside min and max', async ({ page }) => {
    await field(page, 'deliveryDate').focus();
    await page.keyboard.press('ArrowDown');
    await expect(day(page, 'deliveryDate', '2026-10-12')).toBeFocused();
    await page.keyboard.press('PageDown');
    await expect(day(page, 'deliveryDate', '2026-10-20')).toBeFocused();
    await page.keyboard.press('PageUp');
    await page.keyboard.press('PageUp');
    await expect(day(page, 'deliveryDate', '2026-10-05')).toBeFocused();
  });

  test('locale from lang: German names and Monday first', async ({ page }) => {
    await expect(field(page, 'startDate')).toHaveValue('02.03.2026');
    await expect(field(page, 'startDate')).toHaveAttribute('placeholder', 'dd.mm.yyyy');
    await field(page, 'startDate').click();
    const dialog = popover(page, 'startDate');
    await expect(dialog.locator('.fdp-month-title')).toHaveText('März 2026');
    await expect(dialog.locator('.fdp-weekday').first()).toHaveText('Mo');
  });

  test('required: submitting empty marks the field invalid', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('.fdp:has(#deliveryDate)')).toHaveClass(/is-invalid/);
    await expect(field(page, 'deliveryDate')).toHaveAttribute('aria-invalid', 'true');
    await field(page, 'deliveryDate').click();
    await day(page, 'deliveryDate', '2026-10-15').click();
    await expect(page.locator('.fdp:has(#deliveryDate)')).not.toHaveClass(/is-invalid/);
  });

  test('form post and reset', async ({ page }) => {
    await field(page, 'deliveryDate').click();
    await day(page, 'deliveryDate', '2026-10-15').click();
    await field(page, 'publishDate').click();
    await day(page, 'publishDate', '2026-10-01').click();
    await page.getByRole('button', { name: 'Submit' }).click();
    const echo = page.getByTestId('echo');
    await expect(echo).toContainText('publishDate: 2026-10-01');
    await expect(echo).toContainText('deliveryDate: 2026-10-15');
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(field(page, 'publishDate')).toHaveValue('Oct 12, 2026');
    await expect(field(page, 'deliveryDate')).toHaveValue('');
  });

  test('clicking outside closes; Tab out of the popover closes', async ({ page }) => {
    await field(page, 'publishDate').click();
    await page.locator('h1').click();
    await expect(popover(page, 'publishDate')).toBeHidden();
    await field(page, 'publishDate').focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(popover(page, 'publishDate').getByRole('button', { name: 'Clear' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(popover(page, 'publishDate')).toBeHidden();
  });

  test('only one picker is open at a time', async ({ page }) => {
    await field(page, 'publishDate').click();
    await field(page, 'deliveryDate').click();
    await expect(popover(page, 'publishDate')).toBeHidden();
    await expect(popover(page, 'deliveryDate')).toBeVisible();
  });

  test('disabled native input disables the picker', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector('#publishDate').disabled = true;
    });
    await expect(field(page, 'publishDate')).toBeDisabled();
    await page.evaluate(() => {
      document.querySelector('#publishDate').disabled = false;
    });
    await expect(field(page, 'publishDate')).toBeEnabled();
  });

  test('public API: getValue, setValue, clear, destroy', async ({ page }) => {
    const result = await page.evaluate(() => {
      const picker = FlowDatepicker.get('#publishDate');
      const out = [picker.getValue()];
      picker.setValue('2026-01-31');
      out.push(document.querySelector('#publishDate').value, document.querySelector('.fdp:has(#publishDate) .fdp-input').value);
      picker.setValue(new Date(2027, 4, 9));
      out.push(picker.value);
      picker.clear();
      out.push(picker.value);
      picker.destroy();
      const input = document.querySelector('#publishDate');
      out.push(FlowDatepicker.get(input) === null, input.classList.contains('fdp-native'), input.parentElement.classList.contains('fdp'), input.hasAttribute('aria-hidden'));
      return out;
    });
    expect(result).toEqual(['2026-10-12', '2026-01-31', 'Jan 31, 2026', '2027-05-09', '', true, false, false, false]);
  });

  test('htmx swap starts the picker in new content', async ({ page }) => {
    await page.getByRole('button', { name: 'Load fragment' }).click();
    await expect(page.locator('#swapTarget .fdp .fdp-input')).toBeVisible();
  });

  test('no layout shift: enhanced field has the same height as the plain input', async ({ page }) => {
    const heights = await page.evaluate(() => {
      const plain = document.querySelector('#startTime').getBoundingClientRect().height;
      const enhanced = document.querySelector('.fdp:has(#publishDate)').getBoundingClientRect().height;
      return [plain, enhanced];
    });
    expect(heights[1]).toBe(heights[0]);
  });
});
