import { isSameDay, isWithin, today } from '../core/date-math.js';
import { formatIsoDate, parseIsoDate } from '../core/iso.js';
import { CalendarView } from '../views/calendar-view.js';
import { FooterView } from '../views/footer-view.js';
import { applyDateBounds, readDateBounds, toDate } from './shared.js';

export const dateMode = {
  name: 'date',
  trigger: 'field',
  icon: 'calendar',
  dialogLabel: 'chooseDate',

  matches(element) {
    return element instanceof HTMLInputElement && element.getAttribute('type')?.toLowerCase() === 'date';
  },

  inputs(element) {
    return [element];
  },

  prepare([input], options) {
    applyDateBounds(input, options);
  },

  readBounds([input]) {
    return readDateBounds(input);
  },

  read([input]) {
    return parseIsoDate(input.value);
  },

  write(value, [input]) {
    input.value = formatIsoDate(value);
  },

  equals(a, b) {
    return (!a && !b) || isSameDay(a, b);
  },

  serialize(value) {
    return formatIsoDate(value);
  },

  deserialize(value) {
    return toDate(value);
  },

  format(value, locale) {
    return value ? locale.formatDate(value) : '';
  },

  parse(text, locale) {
    return locale.parseDate(text);
  },

  placeholder(locale) {
    return locale.dateHint();
  },

  build(picker) {
    const calendar = new CalendarView({
      id: picker.id,
      locale: picker.locale,
      labels: picker.labels,
      months: 1,
      onPick: (date) => picker.commit(date, { close: true })
    });
    const footer = new FooterView([
      {
        name: 'today',
        label: picker.labels.today,
        run: () => picker.commit(today(), { close: true }),
        disabled: () => !isWithin(today(), picker.bounds.min, picker.bounds.max)
      },
      {
        name: 'clear',
        label: picker.labels.clear,
        run: () => picker.commit(null, { close: true })
      }
    ]);
    return {
      element: [calendar.element, footer.element],
      update(value, { min, max }) {
        calendar.setBounds(min, max);
        calendar.setSelection(value);
        calendar.showDate(value ?? today());
        footer.update();
      },
      preview(value) {
        calendar.showDate(value);
      },
      focus() {
        calendar.focus();
      }
    };
  }
};
