import { isSameDay, isWithin, today } from '../core/date-math.js';
import { formatIsoDateTime, parseIsoDate, parseIsoDateTime } from '../core/iso.js';
import { CalendarView } from '../views/calendar-view.js';
import { FooterView } from '../views/footer-view.js';
import { TimeView, defaultTime } from '../views/time-view.js';
import { toDate } from './shared.js';
import { minuteStep, sameTime, timeHint, toTime, withSeconds } from './time.js';

const NOON = { hours: 12, minutes: 0, seconds: 0 };
const SPLIT_POINT = /[\s,T]/;

function readBound(input, name) {
  const text = input.getAttribute(name) ?? '';
  return parseIsoDateTime(text)?.date ?? parseIsoDate(text);
}

function parseText(text, locale) {
  const value = String(text ?? '').trim();
  const iso = parseIsoDateTime(value);
  if (iso) {
    return iso;
  }
  for (let index = value.length - 1; index > 0; index -= 1) {
    if (!SPLIT_POINT.test(value[index])) {
      continue;
    }
    const time = locale.parseTime(value.slice(index + 1));
    const date = time && locale.parseDate(value.slice(0, index).replace(/[\s,T]+$/, ''));
    if (date) {
      return { date, time };
    }
  }
  const date = locale.parseDate(value);
  return date ? { date, time: { ...NOON } } : null;
}

export const datetimeMode = {
  name: 'datetime',
  trigger: 'field',
  icon: 'calendar',
  dialogLabel: 'chooseDateTime',

  matches(element) {
    return element instanceof HTMLInputElement && element.getAttribute('type')?.toLowerCase() === 'datetime-local';
  },

  inputs(element) {
    return [element];
  },

  readBounds([input]) {
    return { min: readBound(input, 'min'), max: readBound(input, 'max') };
  },

  read([input]) {
    return parseIsoDateTime(input.value);
  },

  write(value, [input]) {
    input.value = value ? formatIsoDateTime(value.date, value.time, withSeconds(input)) : '';
  },

  equals(a, b) {
    if (!a || !b) {
      return !a && !b;
    }
    return isSameDay(a.date, b.date) && sameTime(a.time, b.time);
  },

  serialize(value, picker) {
    return value ? formatIsoDateTime(value.date, value.time, withSeconds(picker.inputs[0])) : '';
  },

  deserialize(value) {
    if (!value) {
      return null;
    }
    if (typeof value === 'string') {
      return parseIsoDateTime(value);
    }
    if (value instanceof Date) {
      return { date: toDate(value), time: { hours: value.getHours(), minutes: value.getMinutes(), seconds: value.getSeconds() } };
    }
    const date = toDate(value.date);
    return date ? { date, time: toTime(value.time) ?? { ...NOON } } : null;
  },

  format(value, picker) {
    return value ? picker.locale.formatDateTime(value.date, value.time, withSeconds(picker.inputs[0])) : '';
  },

  parse(text, picker) {
    return parseText(text, picker.locale);
  },

  placeholder(picker) {
    return `${picker.locale.dateHint()}, ${timeHint(picker.locale, withSeconds(picker.inputs[0]))}`;
  },

  build(picker) {
    const input = picker.inputs[0];
    const step = minuteStep(input);
    const calendar = new CalendarView({
      id: picker.id,
      locale: picker.locale,
      labels: picker.labels,
      months: 1,
      onPick(date) {
        picker.commit({ date, time: picker.value?.time ?? { ...NOON } });
      }
    });
    const time = new TimeView({
      locale: picker.locale,
      labels: picker.labels,
      minuteStep: step,
      withSeconds: withSeconds(input),
      onChange(next) {
        picker.commit({ date: picker.value?.date ?? today(), time: next });
      }
    });
    time.element.classList.add('has-divider');
    const footer = new FooterView([
      {
        name: 'now',
        label: picker.labels.now,
        run: () => picker.commit({ date: today(), time: defaultTime(step) }, { close: true }),
        disabled: () => !isWithin(today(), picker.bounds.min, picker.bounds.max)
      },
      {
        name: 'clear',
        label: picker.labels.clear,
        run: () => picker.commit(null, { close: true })
      }
    ]);
    return {
      element: [calendar.element, time.element, footer.element],
      update(value, { min, max }) {
        calendar.setBounds(min, max);
        calendar.setSelection(value?.date ?? null);
        calendar.showDate(value?.date ?? today());
        time.setTime(value?.time ?? null);
        footer.update();
      },
      preview(value) {
        calendar.showDate(value.date);
        time.setTime(value.time);
      },
      focus() {
        calendar.focus();
      }
    };
  }
};
