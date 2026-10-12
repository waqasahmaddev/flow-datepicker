import { createDate, today } from './date-math.js';
import { isValidDay, isValidTime, parseIsoDate } from './iso.js';

const SUNDAY_REGIONS = new Set('AG AS BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW'.split(' '));
const SATURDAY_REGIONS = new Set('AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'.split(' '));
const SAMPLE_DAYS = [4, 5, 6, 7, 8, 9, 10];
const cache = new Map();

export function resolveLocaleTag(element, explicit) {
  const candidates = [explicit, element?.closest?.('[lang]')?.getAttribute('lang'), globalThis.navigator?.language, 'en-US'];
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    try {
      return Intl.getCanonicalLocales(candidate)[0];
    } catch {
      continue;
    }
  }
  return 'en-US';
}

function localeWeekStart(tag) {
  const locale = new Intl.Locale(tag);
  const info = typeof locale.getWeekInfo === 'function' ? locale.getWeekInfo() : locale.weekInfo;
  if (info?.firstDay) {
    return info.firstDay % 7;
  }
  const region = locale.maximize().region;
  if (SUNDAY_REGIONS.has(region)) {
    return 0;
  }
  if (SATURDAY_REGIONS.has(region)) {
    return 6;
  }
  return 1;
}

function localeHourCycle(tag) {
  const cycle = new Intl.DateTimeFormat(tag, { hour: 'numeric' }).resolvedOptions().hourCycle;
  return cycle === 'h11' || cycle === 'h12' ? 12 : 24;
}

function shortenWeekday(name) {
  return /^\p{Script=Latin}{3,}\.?$/u.test(name) ? name.slice(0, 2) : name;
}

function dayPeriods(tag) {
  const format = new Intl.DateTimeFormat(tag, { hour: 'numeric', hour12: true });
  return [createDate(2026, 0, 1), createDate(2026, 0, 1)].map((date, index) => {
    date.setHours(index === 0 ? 9 : 21);
    return format.formatToParts(date).find((part) => part.type === 'dayPeriod')?.value ?? (index === 0 ? 'AM' : 'PM');
  });
}

function numericOrder(tag) {
  const parts = new Intl.DateTimeFormat(tag, { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(createDate(2026, 10, 23));
  return parts.filter((part) => part.type === 'year' || part.type === 'month' || part.type === 'day').map((part) => part.type);
}

function normalise(text) {
  return text.toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ.]/g, '');
}

class Locale {
  constructor(tag, { weekStart, hourCycle, weekdayLength = 'min' } = {}) {
    this.tag = tag;
    this.weekStart = Number.isInteger(weekStart) ? weekStart : localeWeekStart(tag);
    this.hourCycle = hourCycle === 12 || hourCycle === 24 ? hourCycle : localeHourCycle(tag);
    this.monthNames = this.#months('long');
    this.monthShortNames = this.#months('short');
    this.weekdayNames = this.#weekdays(weekdayLength);
    this.weekdayLongNames = this.#weekdays('long');
    this.dayPeriods = dayPeriods(tag);
    this.order = numericOrder(tag);
    this.#formats = {
      monthYear: new Intl.DateTimeFormat(tag, { month: 'long', year: 'numeric' }),
      date: new Intl.DateTimeFormat(tag, { dateStyle: 'medium' }),
      fullDate: new Intl.DateTimeFormat(tag, { dateStyle: 'full' }),
      dayMonth: new Intl.DateTimeFormat(tag, { month: 'short', day: 'numeric' }),
      dayMonthYear: new Intl.DateTimeFormat(tag, { month: 'short', day: 'numeric', year: 'numeric' }),
      number: new Intl.NumberFormat(tag, { useGrouping: false })
    };
  }

  #formats;

  #months(length) {
    const format = new Intl.DateTimeFormat(this.tag, { month: length });
    return Array.from({ length: 12 }, (unused, month) => format.format(createDate(2026, month, 1)));
  }

  #weekdays(length) {
    const format = new Intl.DateTimeFormat(this.tag, { weekday: length === 'min' ? 'short' : length });
    const names = SAMPLE_DAYS.map((day) => format.format(createDate(2026, 0, day)));
    return length === 'min' ? names.map(shortenWeekday) : names;
  }

  dateHint() {
    const hints = { year: 'yyyy', month: 'mm', day: 'dd' };
    const parts = new Intl.DateTimeFormat(this.tag, { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(createDate(2026, 10, 23));
    return parts.map((part) => hints[part.type] ?? (part.type === 'literal' ? part.value : '')).join('');
  }

  weekdayOrder() {
    return Array.from({ length: 7 }, (unused, index) => (this.weekStart + index) % 7);
  }

  formatMonthYear(date) {
    return this.#formats.monthYear.format(date);
  }

  formatDate(date) {
    return date ? this.#formats.date.format(date) : '';
  }

  formatFullDate(date) {
    return this.#formats.fullDate.format(date);
  }

  formatDayNumber(date) {
    return this.#formats.number.format(date.getDate());
  }

  formatShortDate(date, reference = today()) {
    const format = date.getFullYear() === reference.getFullYear() ? this.#formats.dayMonth : this.#formats.dayMonthYear;
    return format.format(date);
  }

  formatRange(from, to, reference = today()) {
    if (!from || !to) {
      return '';
    }
    const inReferenceYear = from.getFullYear() === reference.getFullYear() && to.getFullYear() === reference.getFullYear();
    const format = inReferenceYear ? this.#formats.dayMonth : this.#formats.dayMonthYear;
    return `${format.format(from)} - ${format.format(to)}`;
  }

  hourText(hours) {
    if (this.hourCycle === 24) {
      return String(hours).padStart(2, '0');
    }
    return String(hours % 12 === 0 ? 12 : hours % 12);
  }

  dayPeriodText(hours) {
    return this.dayPeriods[hours < 12 ? 0 : 1];
  }

  formatTime(time, withSeconds = false) {
    if (!time) {
      return '';
    }
    const minutes = String(time.minutes).padStart(2, '0');
    const seconds = withSeconds ? `:${String(time.seconds ?? 0).padStart(2, '0')}` : '';
    const clock = `${this.hourText(time.hours)}:${minutes}${seconds}`;
    return this.hourCycle === 24 ? clock : `${clock} ${this.dayPeriodText(time.hours)}`;
  }

  formatDateTime(date, time, withSeconds = false) {
    if (!date || !time) {
      return '';
    }
    return `${this.formatDate(date)}, ${this.formatTime(time, withSeconds)}`;
  }

  #monthFromWord(word) {
    const target = normalise(word);
    if (target.length < 3) {
      return -1;
    }
    for (const names of [this.monthNames, this.monthShortNames]) {
      const index = names.findIndex((name) => normalise(name).startsWith(target));
      if (index >= 0) {
        return index;
      }
    }
    return -1;
  }

  parseDate(text, reference = today()) {
    const value = String(text ?? '').trim();
    if (!value) {
      return null;
    }
    const iso = parseIsoDate(value);
    if (iso) {
      return iso;
    }
    const tokens = value.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const words = tokens.filter((token) => /\p{L}/u.test(token));
    const numbers = tokens.filter((token) => /^\d+$/.test(token));
    const parts = {};
    const order = [...this.order];
    if (words.length > 0) {
      const month = this.#monthFromWord(words[0]);
      if (month < 0 || words.length > 1) {
        return null;
      }
      parts.month = month;
      order.splice(order.indexOf('month'), 1);
    }
    if (numbers.length > order.length || numbers.length < order.length - 1) {
      return null;
    }
    const fields = numbers.length === order.length ? order : order.filter((field) => field !== 'year');
    fields.forEach((field, index) => {
      parts[field] = Number(numbers[index]) - (field === 'month' ? 1 : 0);
    });
    let year = parts.year ?? reference.getFullYear();
    if (parts.year !== undefined && numbers[fields.indexOf('year')].length <= 2) {
      year += 2000;
    }
    if (!isValidDay(year, parts.month, parts.day)) {
      return null;
    }
    return createDate(year, parts.month, parts.day);
  }

  parseTime(text) {
    const value = normalise(String(text ?? '').trim()).replace(/\s+/g, '');
    if (!value) {
      return null;
    }
    const match = /^(\d{1,2})(?::?(\d{2}))?(?::?(\d{2}))?(\D*)$/.exec(value);
    if (!match) {
      return null;
    }
    let hours = Number(match[1]);
    const minutes = Number(match[2] ?? 0);
    const seconds = Number(match[3] ?? 0);
    const period = this.#dayPeriodFromWord(match[4]);
    if (period === null) {
      return null;
    }
    if (period !== undefined) {
      if (hours < 1 || hours > 12) {
        return null;
      }
      hours = (hours % 12) + (period === 1 ? 12 : 0);
    }
    const time = { hours, minutes, seconds };
    return isValidTime(time) ? time : null;
  }

  #dayPeriodFromWord(word) {
    if (!word) {
      return undefined;
    }
    const target = normalise(word).replace(/\s+/g, '');
    const names = this.dayPeriods.map((name) => normalise(name).replace(/\s+/g, ''));
    const fallbacks = ['am', 'pm'];
    for (let index = 0; index < 2; index += 1) {
      if (names[index].startsWith(target) || fallbacks[index].startsWith(target)) {
        return index;
      }
    }
    return null;
  }
}

export function getLocale(tag, options = {}) {
  const key = `${tag}|${options.weekStart ?? ''}|${options.hourCycle ?? ''}|${options.weekdayLength ?? ''}`;
  if (!cache.has(key)) {
    cache.set(key, new Locale(tag, options));
  }
  return cache.get(key);
}
