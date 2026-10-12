import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 12, 10, 0));
  await page.goto('/demo/');
});

async function addPicker(page, html, setup = '') {
  await page.evaluate(({ html, setup }) => {
    const host = document.createElement('section');
    host.id = 'extra';
    host.innerHTML = html;
    document.querySelector('main').append(host);
    new Function(setup)();
    FlowDatepicker.init(host);
  }, { html, setup });
}

test.describe('integration', () => {
  test('RTL: arrows follow reading direction and the popover aligns to the right', async ({ page }) => {
    await addPicker(page, '<div dir="rtl" style="width:300px;margin-left:200px"><input id="rtlDate" type="date" value="2026-10-12" data-flow-datepicker></div>');
    const field = page.locator('#rtlDate + .fdp .fdp-input');
    await field.focus();
    await page.keyboard.press('ArrowDown');
    const dialog = page.locator('#rtlDate + .fdp .fdp-popover');
    await expect(dialog.locator('.fdp-cell[data-date="2026-10-12"]')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('.fdp-cell[data-date="2026-10-11"]')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.locator('.fdp-cell[data-date="2026-10-13"]')).toBeFocused();
    const control = await page.locator('#rtlDate + .fdp .fdp-control').boundingBox();
    const box = await dialog.boundingBox();
    expect(Math.round(box.x + box.width)).toBe(Math.round(control.x + control.width));
  });

  test('inside a modal <dialog> the picker opens on top and picks', async ({ page }) => {
    await addPicker(page, '<dialog id="modal"><form method="dialog"><input id="modalDate" type="date" data-flow-datepicker></form></dialog>', "document.getElementById('modal').showModal()");
    await page.locator('#modalDate + .fdp .fdp-input').click();
    const dialog = page.locator('#modalDate + .fdp .fdp-popover');
    await expect(dialog).toBeVisible();
    await dialog.locator('.fdp-cell[data-date="2026-10-20"]').click();
    await expect(page.locator('#modalDate')).toHaveValue('2026-10-20');
    await expect(page.locator('#modal')).toHaveAttribute('open', '');
  });

  test('Escape in a modal <dialog> closes only the picker first', async ({ page }) => {
    await addPicker(page, '<dialog id="modal"><input id="modalDate" type="date" data-flow-datepicker></dialog>', "document.getElementById('modal').showModal()");
    await page.locator('#modalDate + .fdp .fdp-input').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#modalDate + .fdp .fdp-popover')).toBeHidden();
    await expect(page.locator('#modal')).toHaveAttribute('open', '');
  });

  test('not clipped by overflow hidden or a transformed parent', async ({ page }) => {
    await addPicker(page, '<div id="clip" style="overflow:hidden;height:60px;transform:translateZ(0);width:320px"><input id="clipDate" type="date" value="2026-10-12" data-flow-datepicker></div>');
    await page.locator('#clipDate + .fdp .fdp-input').click();
    const dialog = page.locator('#clipDate + .fdp .fdp-popover');
    await expect(dialog).toBeVisible();
    const clip = await page.locator('#clip').boundingBox();
    const box = await dialog.boundingBox();
    expect(box.height).toBeGreaterThan(clip.height);
    await dialog.locator('.fdp-cell[data-date="2026-10-28"]').click();
    await expect(page.locator('#clipDate')).toHaveValue('2026-10-28');
  });

  test('htmx history restore: a stale enhanced copy is cleaned up, not doubled', async ({ page }) => {
    const counts = await page.evaluate(() => {
      const native = document.querySelector('#publishDate');
      const holder = document.createElement('div');
      holder.id = 'restored';
      holder.append(native.cloneNode(true), native.nextElementSibling.cloneNode(true));
      FlowDatepicker.get(native).destroy();
      native.remove();
      document.querySelector('main').append(holder);
      FlowDatepicker.init(holder);
      return [holder.querySelectorAll('.fdp').length, holder.querySelectorAll('.fdp-control').length, holder.querySelector('.fdp-input').value, Boolean(FlowDatepicker.get('#publishDate'))];
    });
    expect(counts).toEqual([1, 1, 'Oct 12, 2026', true]);
  });

  test('labels, presets and placeholders are text, never HTML', async ({ page }) => {
    await page.evaluate(() => {
      window.injected = 0;
      const payload = '<img src=x onerror="window.injected=1">';
      const host = document.createElement('section');
      host.innerHTML = '<input id="xssDate" type="date" data-flow-datepicker="manual"><div id="xssRange" data-flow-datepicker="manual"><input type="date" name="xa"><input type="date" name="xb"></div>';
      document.querySelector('main').append(host);
      const date = new FlowDatepicker('#xssDate', { placeholder: payload, labels: { today: payload, clear: payload, nextMonth: payload } });
      const range = new FlowDatepicker('#xssRange', { mode: 'range', labels: { customRange: payload }, calendar: 'custom', presets: [{ label: payload, days: 3 }] });
      date.open();
      date.close();
      range.open();
    });
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => [window.injected, document.querySelectorAll('#extra img, .fdp img').length])).toEqual([0, 0]);
    await expect(page.locator('[data-flow-datepicker]:has([name=\"xa\"]) + .fdp .fdp-preset').first()).toHaveText('<img src=x onerror="window.injected=1">');
  });

  test('no layout shift while the page loads and enhances', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'layout-shift entries are Chromium only');
    await page.addInitScript(() => {
      window.shift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.shift += entry.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/demo/');
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.shift)).toBeLessThan(0.01);
  });

  test('destroyed pickers are released from memory', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'needs the Chrome DevTools protocol');
    await page.evaluate(() => {
      window.refs = [];
      for (let index = 0; index < 50; index += 1) {
        const input = document.createElement('input');
        input.type = index % 2 ? 'date' : 'time';
        input.dataset.flowDatepicker = '';
        document.body.append(input);
        const picker = FlowDatepicker.init(input)[0];
        picker.open();
        picker.close();
        picker.destroy();
        input.remove();
        window.refs.push(new WeakRef(picker));
      }
    });
    const session = await page.context().newCDPSession(page);
    for (let round = 0; round < 3; round += 1) {
      await session.send('HeapProfiler.collectGarbage');
      await page.waitForTimeout(50);
    }
    expect(await page.evaluate(() => window.refs.filter((ref) => ref.deref()).length)).toBe(0);
  });

  test('many pickers on one page start fast', async ({ page }) => {
    const ms = await page.evaluate(() => {
      const host = document.createElement('section');
      host.innerHTML = Array.from({ length: 200 }, (unused, index) => `<input type="date" value="2026-10-${String((index % 28) + 1).padStart(2, '0')}" data-flow-datepicker="manual">`).join('');
      document.querySelector('main').append(host);
      const start = performance.now();
      for (const input of host.querySelectorAll('input')) {
        new FlowDatepicker(input);
      }
      return performance.now() - start;
    });
    expect(ms).toBeLessThan(300);
  });

  test('opening is quick after hover warm-up', async ({ page }) => {
    const field = page.locator('#publishDate + .fdp .fdp-input');
    await field.hover();
    const ms = await page.evaluate(() => {
      const start = performance.now();
      FlowDatepicker.get('#publishDate').open();
      return performance.now() - start;
    });
    expect(ms).toBeLessThan(16);
  });
});
