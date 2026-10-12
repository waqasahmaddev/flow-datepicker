import { test, expect } from '@playwright/test';

async function run(page, body) {
  await page.goto('/demo/');
  return page.evaluate(async (source) => {
    const math = await import('/src/core/date-math.js');
    const iso = await import('/src/core/iso.js');
    const locale = await import('/src/core/locale.js');
    return new Function('math', 'iso', 'locale', `return (async () => { ${source} })();`)(math, iso, locale);
  }, body);
}

test.describe('date-math', () => {
  test('adds months and clamps to the last day', async ({ page }) => {
    const result = await run(page, `
      const { createDate, addMonths, addDays } = math;
      const f = iso.formatIsoDate;
      return [
        f(addMonths(createDate(2026, 0, 31), 1)),
        f(addMonths(createDate(2024, 0, 31), 1)),
        f(addMonths(createDate(2026, 11, 15), 1)),
        f(addMonths(createDate(2026, 2, 31), -1)),
        f(addDays(createDate(2026, 11, 31), 1)),
        f(addDays(createDate(2026, 2, 1), -1))
      ];`);
    expect(result).toEqual(['2026-02-28', '2024-02-29', '2027-01-15', '2026-02-28', '2027-01-01', '2026-02-28']);
  });

  test('week start and leading days', async ({ page }) => {
    const result = await run(page, `
      const { createDate, startOfWeek, endOfWeek, leadingDays } = math;
      const f = iso.formatIsoDate;
      const day = createDate(2026, 9, 12);
      return [f(startOfWeek(day, 0)), f(startOfWeek(day, 1)), f(endOfWeek(day, 1)), leadingDays(2026, 9, 0), leadingDays(2026, 9, 1), leadingDays(2026, 8, 0)];`);
    expect(result).toEqual(['2026-10-11', '2026-10-12', '2026-10-18', 4, 3, 2]);
  });

  test('compare, within and clamp', async ({ page }) => {
    const result = await run(page, `
      const { createDate, isWithin, clampDate, isSameDay, orderDays } = math;
      const f = iso.formatIsoDate;
      const min = createDate(2026, 9, 1), max = createDate(2026, 9, 12);
      const [a, b] = orderDays(max, min);
      return [
        isWithin(createDate(2026, 9, 12), min, max), isWithin(createDate(2026, 9, 13), min, max), isWithin(createDate(2026, 8, 30), min, null),
        f(clampDate(createDate(2026, 11, 1), min, max)), isSameDay(createDate(2026, 9, 12), max), f(a), f(b)
      ];`);
    expect(result).toEqual([true, false, false, '2026-10-12', true, '2026-10-01', '2026-10-12']);
  });

  test('years below 100 stay as typed', async ({ page }) => {
    const result = await run(page, `return [math.createDate(50, 0, 1).getFullYear(), iso.formatIsoDate(math.createDate(9, 11, 31))];`);
    expect(result).toEqual([50, '0009-12-31']);
  });
});

test.describe('iso', () => {
  test('dates round trip and reject impossible days', async ({ page }) => {
    const result = await run(page, `
      const p = iso.parseIsoDate, f = iso.formatIsoDate;
      return [f(p('2026-10-12')), f(p('2024-02-29')), p('2026-02-29'), p('2026-13-01'), p('2026-1-1'), p(''), p(null), p(' 2026-10-12 ') !== null];`);
    expect(result).toEqual(['2026-10-12', '2024-02-29', null, null, null, null, null, true]);
  });

  test('times parse native values with and without seconds', async ({ page }) => {
    const result = await run(page, `
      const p = iso.parseIsoTime, f = iso.formatIsoTime;
      return [p('09:30'), p('23:59:59'), p('09:30:15.250'), p('24:00'), p('9:30'), f({ hours: 9, minutes: 5 }), f({ hours: 9, minutes: 5, seconds: 7 }, true)];`);
    expect(result).toEqual([
      { hours: 9, minutes: 30, seconds: 0 },
      { hours: 23, minutes: 59, seconds: 59 },
      { hours: 9, minutes: 30, seconds: 15 },
      null,
      null,
      '09:05',
      '09:05:07'
    ]);
  });

  test('date and time values', async ({ page }) => {
    const result = await run(page, `
      const value = iso.parseIsoDateTime('2026-10-12T09:30');
      return [iso.formatIsoDateTime(value.date, value.time), iso.parseIsoDateTime('2026-10-12'), iso.parseIsoDateTime('2026-10-12T25:00'), iso.stepHasSeconds('300'), iso.stepHasSeconds('1'), iso.stepHasSeconds('')];`);
    expect(result).toEqual(['2026-10-12T09:30', null, null, false, true, false]);
  });
});

test.describe('locale', () => {
  test('english names, week start and hour cycle', async ({ page }) => {
    const result = await run(page, `
      const en = locale.getLocale('en-US');
      return [en.weekStart, en.hourCycle, en.weekdayNames, en.monthNames[9], en.dayPeriods, en.order];`);
    expect(result).toEqual([0, 12, ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], 'October', ['AM', 'PM'], ['month', 'day', 'year']]);
  });

  test('other locales', async ({ page }) => {
    const result = await run(page, `
      const gb = locale.getLocale('en-GB'), de = locale.getLocale('de-DE'), ar = locale.getLocale('ar-EG');
      return [gb.weekStart, gb.hourCycle, gb.order, de.weekStart, de.hourCycle, de.monthNames[2], ar.weekStart];`);
    expect(result).toEqual([1, 24, ['day', 'month', 'year'], 1, 24, 'März', 6]);
  });

  test('options override the locale', async ({ page }) => {
    const result = await run(page, `
      const custom = locale.getLocale('en-US', { weekStart: 1, hourCycle: 24 });
      return [custom.weekStart, custom.hourCycle, custom.weekdayOrder()];`);
    expect(result).toEqual([1, 24, [1, 2, 3, 4, 5, 6, 0]]);
  });

  test('formats dates, ranges and times for display', async ({ page }) => {
    const result = await run(page, `
      const en = locale.getLocale('en-US'), gb = locale.getLocale('en-GB');
      const { createDate } = math;
      const ref = createDate(2026, 9, 12);
      return [
        en.formatDate(createDate(2026, 9, 12)),
        en.formatMonthYear(createDate(2026, 8, 1)),
        en.formatRange(createDate(2026, 9, 5), ref, ref),
        en.formatRange(createDate(2025, 11, 30), ref, ref),
        en.formatTime({ hours: 0, minutes: 5 }),
        en.formatTime({ hours: 12, minutes: 0 }),
        en.formatTime({ hours: 21, minutes: 30, seconds: 9 }, true),
        gb.formatTime({ hours: 9, minutes: 30 }),
        en.formatDateTime(ref, { hours: 12, minutes: 0 })
      ];`);
    expect(result).toEqual([
      'Oct 12, 2026',
      'September 2026',
      'Oct 5 - Oct 12',
      'Dec 30, 2025 - Oct 12, 2026',
      '12:05 AM',
      '12:00 PM',
      '9:30:09 PM',
      '09:30',
      'Oct 12, 2026, 12:00 PM'
    ]);
  });

  test('parses typed dates in the locale order', async ({ page }) => {
    const result = await run(page, `
      const en = locale.getLocale('en-US'), gb = locale.getLocale('en-GB'), de = locale.getLocale('de-DE');
      const ref = math.createDate(2026, 9, 12);
      const f = (d) => d ? iso.formatIsoDate(d) : null;
      return [
        f(en.parseDate('10/12/2026', ref)), f(gb.parseDate('12/10/2026', ref)), f(de.parseDate('12.10.2026', ref)),
        f(en.parseDate('10/12', ref)), f(en.parseDate('10/12/26', ref)), f(en.parseDate('2026-10-12', ref)),
        f(en.parseDate('Oct 12, 2026', ref)), f(en.parseDate('october 12', ref)), f(de.parseDate('12. März 2026', ref)),
        f(en.parseDate('2/30/2026', ref)), f(en.parseDate('hello', ref)), f(en.parseDate('', ref))
      ];`);
    expect(result).toEqual(['2026-10-12', '2026-10-12', '2026-10-12', '2026-10-12', '2026-10-12', '2026-10-12', '2026-10-12', '2026-10-12', '2026-03-12', null, null, null]);
  });

  test('parses typed times', async ({ page }) => {
    const result = await run(page, `
      const en = locale.getLocale('en-US');
      const t = (text) => { const v = en.parseTime(text); return v ? iso.formatIsoTime(v, true) : null; };
      return [t('9:30'), t('9:30 pm'), t('9:30PM'), t('12 am'), t('12:15 p.m.'), t('21:30'), t('930'), t('9'), t('13 pm'), t('25:00'), t('nine'), t('')];`);
    expect(result).toEqual(['09:30:00', '21:30:00', '21:30:00', '00:00:00', '12:15:00', '21:30:00', '09:30:00', '09:00:00', null, null, null, null]);
  });

  test('locale tag comes from the option, then lang, then the browser', async ({ page }) => {
    const result = await run(page, `
      const box = document.createElement('div');
      box.lang = 'fr-FR';
      const input = document.createElement('input');
      box.append(input);
      document.body.append(box);
      return [locale.resolveLocaleTag(input, 'de-DE'), locale.resolveLocaleTag(input), locale.resolveLocaleTag(input, 'not a tag!'), locale.resolveLocaleTag(null) !== ''];`);
    expect(result).toEqual(['de-DE', 'fr-FR', 'fr-FR', true]);
  });
});
