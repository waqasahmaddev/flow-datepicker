import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'docs/public/screenshots');
const base = process.env.DEMO_URL || 'http://localhost:5280/demo/';

const shots = [
  { name: 'range', open: '[data-flow-datepicker="range"]' },
  { name: 'date', open: '#publishDate' },
  { name: 'time', open: '#startTime' },
  { name: 'datetime', open: '#meetingAt' }
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome' });
const context = await browser.newContext({ viewport: { width: 900, height: 700 }, deviceScaleFactor: 2 });

for (const theme of ['dark', 'light']) {
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date(2026, 9, 12, 12, 0));
  await page.goto(`${base}?theme=${theme}`);
  await page.addStyleTag({ content: 'main :is(h1, h2, p, label, .actions, #echo, #htmx), .theme-toggle, .fdp:not(.is-shot) { opacity: 0; }' });
  for (const shot of shots) {
    await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      document.querySelectorAll('.fdp.is-shot').forEach((node) => node.classList.remove('is-shot'));
      element.nextElementSibling.classList.add('is-shot');
      element.closest('section').scrollIntoView({ block: 'start' });
      window.scrollBy(0, -16);
      FlowDatepicker.get(element).open();
    }, shot.open);
    await page.waitForTimeout(250);
    const box = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      const root = element.nextElementSibling;
      const trigger = root.getBoundingClientRect();
      const popover = root.querySelector('.fdp-popover').getBoundingClientRect();
      const left = Math.min(trigger.left, popover.left) - 16;
      const top = trigger.top - 16;
      const right = Math.max(popover.right, Math.min(trigger.right, popover.right + 120)) + 16;
      const bottom = popover.bottom + 16;
      return { x: Math.max(0, left), y: Math.max(0, top), width: right - Math.max(0, left), height: bottom - Math.max(0, top) };
    }, shot.open);
    await page.screenshot({ path: resolve(out, `${shot.name}-${theme}.png`), clip: box });
    await page.evaluate((selector) => FlowDatepicker.get(document.querySelector(selector)).close(), shot.open);
  }
  await page.close();
}

await browser.close();
console.log(`Screenshots written to ${out}`);
