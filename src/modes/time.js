import { formatIsoTime, parseIsoTime, stepHasSeconds } from '../core/iso.js';
import { TimeView } from '../views/time-view.js';

export function minuteStep(input) {
  const seconds = Number(input.getAttribute('step'));
  if (!Number.isFinite(seconds) || seconds < 60) {
    return 1;
  }
  return Math.max(1, Math.round(seconds / 60));
}

export function withSeconds(input) {
  return stepHasSeconds(input.getAttribute('step'));
}

export function sameTime(a, b) {
  if (!a || !b) {
    return !a && !b;
  }
  return a.hours === b.hours && a.minutes === b.minutes && (a.seconds ?? 0) === (b.seconds ?? 0);
}

export function toTime(value) {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return parseIsoTime(value);
  }
  return { hours: value.hours, minutes: value.minutes, seconds: value.seconds ?? 0 };
}

export function timeHint(locale, seconds) {
  const clock = seconds ? '--:--:--' : '--:--';
  return locale.hourCycle === 12 ? `${clock} --` : clock;
}

export const timeMode = {
  name: 'time',
  trigger: 'field',
  icon: 'clock',
  dialogLabel: 'chooseTime',

  matches(element) {
    return element instanceof HTMLInputElement && element.getAttribute('type')?.toLowerCase() === 'time';
  },

  inputs(element) {
    return [element];
  },

  readBounds([input]) {
    return { min: parseIsoTime(input.getAttribute('min')), max: parseIsoTime(input.getAttribute('max')) };
  },

  read([input]) {
    return parseIsoTime(input.value);
  },

  write(value, [input]) {
    input.value = formatIsoTime(value, withSeconds(input));
  },

  equals(a, b) {
    return sameTime(a, b);
  },

  serialize(value, picker) {
    return formatIsoTime(value, withSeconds(picker.inputs[0]));
  },

  deserialize(value) {
    return toTime(value);
  },

  format(value, picker) {
    return value ? picker.locale.formatTime(value, withSeconds(picker.inputs[0])) : '';
  },

  parse(text, picker) {
    return picker.locale.parseTime(text);
  },

  placeholder(picker) {
    return timeHint(picker.locale, withSeconds(picker.inputs[0]));
  },

  build(picker) {
    const input = picker.inputs[0];
    const view = new TimeView({
      locale: picker.locale,
      labels: picker.labels,
      minuteStep: minuteStep(input),
      withSeconds: withSeconds(input),
      onChange: (time) => picker.commit(time)
    });
    return {
      element: view.element,
      update(value) {
        view.setTime(value);
      },
      preview(value) {
        view.setTime(value);
      },
      focus() {
        view.focus();
      }
    };
  }
};
