import { createDate, today } from '../core/date-math.js';
import { formatIsoDate, parseIsoDate } from '../core/iso.js';

export function resolveDateOption(value) {
  if (value === 'today') {
    return today();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return createDate(value.getFullYear(), value.getMonth(), value.getDate());
  }
  return typeof value === 'string' ? parseIsoDate(value) : null;
}

export function applyDateBounds(input, options) {
  for (const name of ['min', 'max']) {
    const date = resolveDateOption(options[name]);
    if (date) {
      input.setAttribute(name, formatIsoDate(date));
    }
  }
}

export function readDateBounds(input) {
  return { min: parseIsoDate(input.getAttribute('min')), max: parseIsoDate(input.getAttribute('max')) };
}

export function toDate(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return resolveDateOption(value);
}
