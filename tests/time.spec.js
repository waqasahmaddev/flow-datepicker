import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 12, 10, 7));
  await page.goto('/demo/');
});

const field = (page, id) => page.locator(`.fdp:has(#${id}) .fdp-input`);
const dialog = (page, id) => page.locator(`.fdp:has(#${id}) .fdp-popover`);
const segment = (page, id, part) => dialog(page, id).locator(`[data-part="${part}"]`);

test.describe('time mode', () => {
  test('shows the localised time and one time row', async ({ page }) => {
    await expect(field(page, 'startTime')).toHaveValue('12:00 PM');
    await field(page, 'startTime').click();
    await expect(dialog(page, 'startTime')).toBeVisible();
    await expect(segment(page, 'startTime', 'hours')).toHaveText('12');
    await expect(segment(page, 'startTime', 'minutes')).toHaveText('00');
    await expect(segment(page, 'startTime', 'period')).toHaveText('PM');
    await expect(dialog(page, 'startTime').locator('.fdp-calendar')).toHaveCount(0);
  });

  test('handles step hours and minutes by the native step', async ({ page }) => {
    await field(page, 'startTime').click();
    const minutes = segment(page, 'startTime', 'minutes');
    await minutes.hover();
    await minutes.locator('.fdp-handle[data-step="1"]').click();
    await expect(page.locator('#startTime')).toHaveValue('12:05');
    await minutes.locator('.fdp-handle[data-step="-1"]').click();
    await minutes.locator('.fdp-handle[data-step="-1"]').click();
    await expect(page.locator('#startTime')).toHaveValue('12:55');
    const hours = segment(page, 'startTime', 'hours');
    await hours.hover();
    await hours.locator('.fdp-handle[data-step="-1"]').click();
    await expect(page.locator('#startTime')).toHaveValue('11:55');
    await expect(segment(page, 'startTime', 'period')).toHaveText('AM');
    await expect(field(page, 'startTime')).toHaveValue('11:55 AM');
    await expect(dialog(page, 'startTime')).toBeVisible();
  });

  test('keyboard: ArrowDown opens on the hour, arrows step, digits type, Tab moves, Enter closes', async ({ page }) => {
    await field(page, 'startTime').focus();
    await page.keyboard.press('ArrowDown');
    await expect(segment(page, 'startTime', 'hours')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('#startTime')).toHaveValue('13:00');
    await page.keyboard.press('9');
    await expect(page.locator('#startTime')).toHaveValue('21:00');
    await expect(segment(page, 'startTime', 'minutes')).toBeFocused();
    await page.keyboard.press('4');
    await page.keyboard.press('5');
    await expect(page.locator('#startTime')).toHaveValue('21:45');
    await expect(segment(page, 'startTime', 'period')).toBeFocused();
    await page.keyboard.press('a');
    await expect(page.locator('#startTime')).toHaveValue('09:45');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Enter');
    await expect(dialog(page, 'startTime')).toBeHidden();
    await expect(field(page, 'startTime')).toBeFocused();
    await expect(field(page, 'startTime')).toHaveValue('9:45 AM');
  });

  test('clicking AM/PM toggles it', async ({ page }) => {
    await field(page, 'startTime').click();
    await segment(page, 'startTime', 'period').click();
    await expect(page.locator('#startTime')).toHaveValue('00:00');
    await expect(field(page, 'startTime')).toHaveValue('12:00 AM');
  });

  test('mouse wheel steps the part under the pointer', async ({ page }) => {
    await field(page, 'startTime').click();
    await segment(page, 'startTime', 'minutes').hover();
    await page.mouse.wheel(0, -100);
    await expect(page.locator('#startTime')).toHaveValue('12:05');
    await page.mouse.wheel(0, 100);
    await page.mouse.wheel(0, 100);
    await expect(page.locator('#startTime')).toHaveValue('12:55');
  });

  test('typing in the field commits a parsed time', async ({ page }) => {
    const input = field(page, 'startTime');
    await input.fill('9:30 pm');
    await input.press('Enter');
    await expect(page.locator('#startTime')).toHaveValue('21:30');
    await expect(input).toHaveValue('9:30 PM');
    await input.fill('7');
    await page.locator('h1').click();
    await expect(page.locator('#startTime')).toHaveValue('07:00');
  });

  test('an empty time starts from now rounded to the step', async ({ page }) => {
    await page.evaluate(() => FlowDatepicker.get('#startTime').clear());
    await expect(field(page, 'startTime')).toHaveAttribute('placeholder', '--:-- --');
    await field(page, 'startTime').click();
    await expect(segment(page, 'startTime', 'hours')).toHaveText('--');
    await segment(page, 'startTime', 'hours').hover();
    await segment(page, 'startTime', 'hours').locator('.fdp-handle[data-step="1"]').click();
    await expect(page.locator('#startTime')).toHaveValue('10:05');
  });

  test('form posts the native time value', async ({ page }) => {
    await field(page, 'startTime').fill('8:15 am');
    await field(page, 'startTime').press('Enter');
    await page.evaluate(() => FlowDatepicker.get('#deliveryDate').setValue('2026-10-15'));
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByTestId('echo')).toContainText('startTime: 08:15');
  });

  test('24 hour clock hides AM/PM', async ({ page }) => {
    const parts = await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'time';
      input.value = '18:30';
      input.dataset.flowDatepicker = '';
      input.dataset.fdpHourCycle = '24';
      input.id = 'clock24';
      document.querySelector('main').append(input);
      const picker = FlowDatepicker.init(input)[0];
      picker.open();
      return [document.querySelector('.fdp:has(#clock24) .fdp-input').value, [...document.querySelectorAll('.fdp:has(#clock24) [data-part]')].map((node) => node.dataset.part)];
    });
    expect(parts).toEqual(['18:30', ['hours', 'minutes']]);
  });
});

test.describe('datetime mode', () => {
  test('shows date and time, calendar plus time row', async ({ page }) => {
    await expect(field(page, 'meetingAt')).toHaveValue('Oct 12, 2026, 12:00 PM');
    await field(page, 'meetingAt').click();
    const box = dialog(page, 'meetingAt');
    await expect(box.locator('.fdp-month-title')).toHaveText('October 2026');
    await expect(box.locator('.fdp-cell[data-date="2026-10-12"]')).toHaveClass(/is-selected/);
    await expect(segment(page, 'meetingAt', 'hours')).toHaveText('12');
    await expect(box.getByRole('button', { name: 'Now' })).toBeVisible();
  });

  test('picking a day keeps the time and stays open, then the time changes', async ({ page }) => {
    await field(page, 'meetingAt').click();
    const box = dialog(page, 'meetingAt');
    await box.locator('.fdp-cell[data-date="2026-10-20"]').click();
    await expect(page.locator('#meetingAt')).toHaveValue('2026-10-20T12:00');
    await expect(box).toBeVisible();
    await segment(page, 'meetingAt', 'minutes').hover();
    await segment(page, 'meetingAt', 'minutes').locator('.fdp-handle[data-step="1"]').click();
    await expect(page.locator('#meetingAt')).toHaveValue('2026-10-20T12:05');
    await expect(field(page, 'meetingAt')).toHaveValue('Oct 20, 2026, 12:05 PM');
  });

  test('Now and Clear', async ({ page }) => {
    await field(page, 'meetingAt').click();
    await dialog(page, 'meetingAt').getByRole('button', { name: 'Now' }).click();
    await expect(page.locator('#meetingAt')).toHaveValue('2026-10-12T10:05');
    await field(page, 'meetingAt').click();
    await dialog(page, 'meetingAt').getByRole('button', { name: 'Clear' }).click();
    await expect(page.locator('#meetingAt')).toHaveValue('');
  });

  test('typing date and time in the field', async ({ page }) => {
    const input = field(page, 'meetingAt');
    await input.fill('11/3/2026 9:30 pm');
    await input.press('Enter');
    await expect(page.locator('#meetingAt')).toHaveValue('2026-11-03T21:30');
    await input.fill('Dec 24, 2026, 8:00 AM');
    await input.press('Enter');
    await expect(page.locator('#meetingAt')).toHaveValue('2026-12-24T08:00');
    await input.fill('Jan 5');
    await input.press('Enter');
    await expect(page.locator('#meetingAt')).toHaveValue('2026-01-05T12:00');
  });

  test('keyboard: from the grid Tab reaches the time row', async ({ page }) => {
    await field(page, 'meetingAt').focus();
    await page.keyboard.press('ArrowDown');
    await expect(dialog(page, 'meetingAt').locator('.fdp-cell[data-date="2026-10-12"]')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(segment(page, 'meetingAt', 'hours')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#meetingAt')).toHaveValue('2026-10-12T11:00');
  });
});

test.describe('close on select option', () => {
  test('data-fdp-close-on-select="false" keeps date and range pickers open', async ({ page }) => {
    await page.evaluate(() => {
      FlowDatepicker.get('#publishDate').setOptions({ closeOnSelect: false });
      FlowDatepicker.get(document.querySelector('[data-flow-datepicker="range"]')).setOptions({ closeOnSelect: false });
    });
    await field(page, 'publishDate').click();
    await dialog(page, 'publishDate').locator('.fdp-cell[data-date="2026-10-20"]').click();
    await expect(page.locator('#publishDate')).toHaveValue('2026-10-20');
    await expect(dialog(page, 'publishDate')).toBeVisible();
    await expect(dialog(page, 'publishDate').locator('.fdp-cell[data-date="2026-10-20"]')).toHaveClass(/is-selected/);
    const range = page.locator('.fdp--range').first();
    await range.locator('.fdp-pill').click();
    await range.getByRole('option', { name: 'Last 14 days' }).click();
    await expect(range.locator('.fdp-popover')).toBeVisible();
    await expect(range.locator('.fdp-preset.is-active')).toHaveText('Last 14 days');
    await range.locator('.fdp-cell[data-date="2026-10-01"]').click();
    await range.locator('.fdp-cell[data-date="2026-10-03"]').click();
    await expect(range.locator('.fdp-popover')).toBeVisible();
    await expect(page.locator('input[name="to"]')).toHaveValue('2026-10-03');
  });

  test('range closes on an outside click', async ({ page }) => {
    const range = page.locator('.fdp--range').first();
    await range.locator('.fdp-pill').click();
    await range.locator('.fdp-cell[data-date="2026-10-01"]').click();
    await page.locator('h1').click();
    await expect(range.locator('.fdp-popover')).toBeHidden();
    await expect(page.locator('input[name="from"]')).toHaveValue('2026-10-05');
  });
});
