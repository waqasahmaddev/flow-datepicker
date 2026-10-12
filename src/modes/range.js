import { el } from '../core/dom.js';
import { isSameDay, orderDays, today } from '../core/date-math.js';
import { formatIsoDate, parseIsoDate } from '../core/iso.js';
import { CalendarView } from '../views/calendar-view.js';
import { PresetsView } from '../views/presets-view.js';
import { matchPreset, presetFits, resolvePresets } from './presets.js';
import { applyDateBounds, readDateBounds, toDate } from './shared.js';

const CUSTOM_ID = 'custom';

function sameRange(a, b) {
  if (!a || !b) {
    return !a && !b;
  }
  return sameDay(a.from, b.from) && sameDay(a.to, b.to);
}

function sameDay(a, b) {
  return (!a && !b) || isSameDay(a, b);
}

function normalise(from, to) {
  if (!from && !to) {
    return null;
  }
  if (from && to) {
    const [start, end] = orderDays(from, to);
    return { from: start, to: end };
  }
  return { from: from ?? to, to: to ?? from };
}

function fixedMonths(options) {
  return Number.isInteger(options.months) && options.months > 0 ? options.months : null;
}

export const rangeMode = {
  name: 'range',
  trigger: 'pill',
  icon: 'calendar',
  editable: false,
  dialogLabel: 'chooseRange',

  matches(element) {
    return element.dataset.flowDatepicker === 'range';
  },

  inputs(element) {
    return [...element.querySelectorAll('input')].slice(0, 2);
  },

  prepare(inputs, options) {
    for (const input of inputs) {
      applyDateBounds(input, options);
    }
  },

  readBounds([from]) {
    return readDateBounds(from);
  },

  read([from, to]) {
    return normalise(parseIsoDate(from?.value), parseIsoDate(to?.value));
  },

  write(value, [from, to]) {
    from.value = formatIsoDate(value?.from);
    to.value = formatIsoDate(value?.to);
  },

  equals(a, b) {
    return sameRange(a, b);
  },

  serialize(value, picker) {
    const preset = matchPreset(value, resolvePresets(picker.options.presets, picker.labels), today(), picker.locale);
    return { from: formatIsoDate(value?.from), to: formatIsoDate(value?.to), preset: preset?.id ?? null };
  },

  deserialize(value, picker) {
    if (!value) {
      return null;
    }
    if (typeof value === 'string') {
      const preset = resolvePresets(picker.options.presets, picker.labels).find((item) => item.id === value);
      if (!preset) {
        return null;
      }
      const [from, to] = preset.range(today(), picker.locale);
      return normalise(from, to);
    }
    return normalise(toDate(value.from), toDate(value.to));
  },

  format(value, picker) {
    if (!value) {
      return '';
    }
    const preset = matchPreset(value, resolvePresets(picker.options.presets, picker.labels), today(), picker.locale);
    return preset ? preset.label : picker.locale.formatRange(value.from, value.to);
  },

  parse() {
    return null;
  },

  placeholder(picker) {
    return picker.labels.selectRange;
  },

  build(picker) {
    const presets = resolvePresets(picker.options.presets, picker.labels);
    const onDemand = picker.options.calendar === 'custom' && presets.length > 0;
    const custom = { id: CUSTOM_ID, label: picker.labels.customRange, custom: true };
    let anchor = null;
    let calendarShown = !onDemand;
    let shownDate = null;
    let isAllowed = () => true;
    const calendar = new CalendarView({
      id: picker.id,
      locale: picker.locale,
      labels: picker.labels,
      months: fixedMonths(picker.options) ?? 2,
      onPick(date) {
        if (anchor) {
          const [from, to] = orderDays(anchor, date);
          anchor = null;
          picker.commit({ from, to }, { close: picker.options.closeOnSelect });
        } else {
          anchor = date;
          calendar.setSelection(date);
        }
      },
      onHover(date) {
        if (anchor) {
          calendar.setSelection(anchor, date);
        }
      }
    });
    const element = el('div', 'fdp-range');
    const showCalendar = (shown) => {
      calendarShown = shown;
      element.classList.toggle('is-compact', !shown);
    };
    const list = presets.length > 0
      ? new PresetsView({
        presets: onDemand ? [...presets, custom] : presets,
        label: picker.labels.presets,
        onPick(preset) {
          if (preset.custom) {
            showCalendar(true);
            list.update(CUSTOM_ID, isAllowed);
            picker.reposition();
            calendar.focus();
            return;
          }
          const [from, to] = preset.range(today(), picker.locale);
          picker.commit(normalise(from, to), { close: picker.options.closeOnSelect });
        }
      })
      : null;
    if (list) {
      element.append(list.element);
    }
    element.append(calendar.element);
    return {
      element,
      update(value, bounds) {
        anchor = null;
        const matched = matchPreset(value, presets, today(), picker.locale);
        if (onDemand) {
          showCalendar(Boolean(value && !matched));
        }
        calendar.setBounds(bounds.min, bounds.max);
        calendar.setSelection(value?.from ?? null, value?.to ?? null);
        shownDate = value?.to ?? today();
        calendar.showDate(shownDate, { align: 'end' });
        const active = matched?.id ?? (onDemand && calendarShown ? CUSTOM_ID : null);
        isAllowed = (preset) => preset.custom || presetFits(preset, today(), picker.locale, bounds);
        list?.update(active, isAllowed);
      },
      fit(maxWidth) {
        if (fixedMonths(picker.options)) {
          return;
        }
        const narrow = onDemand ? 'is-stacked' : 'is-calendar-only';
        const layouts = [[2, null], [1, null], [1, narrow]];
        for (const [months, layout] of layouts) {
          element.classList.remove('is-stacked', 'is-calendar-only');
          if (layout) {
            element.classList.add(layout);
          }
          if (calendar.months !== months) {
            calendar.setMonths(months);
            calendar.showDate(shownDate ?? today(), { align: 'end' });
          }
          if (element.scrollWidth <= maxWidth) {
            return;
          }
        }
      },
      focus() {
        if (calendarShown) {
          calendar.focus();
        } else {
          list.focus();
        }
      }
    };
  }
};
