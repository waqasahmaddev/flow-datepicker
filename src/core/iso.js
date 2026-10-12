import { createDate, daysInMonth } from './date-math.js';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_TIME = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?$/;

function pad(value, length = 2) {
  return String(value).padStart(length, '0');
}

export function isValidDay(year, month, day) {
  return year >= 1 && year <= 9999 && month >= 0 && month <= 11 && day >= 1 && day <= daysInMonth(year, month);
}

export function isValidTime({ hours, minutes, seconds = 0 }) {
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59;
}

export function parseIsoDate(text) {
  const match = ISO_DATE.exec(String(text ?? '').trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (!isValidDay(year, month, day)) {
    return null;
  }
  return createDate(year, month, day);
}

export function formatIsoDate(date) {
  if (!date) {
    return '';
  }
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseIsoTime(text) {
  const match = ISO_TIME.exec(String(text ?? '').trim());
  if (!match) {
    return null;
  }
  const time = { hours: Number(match[1]), minutes: Number(match[2]), seconds: Number(match[3] ?? 0) };
  return isValidTime(time) ? time : null;
}

export function formatIsoTime(time, withSeconds = false) {
  if (!time) {
    return '';
  }
  const base = `${pad(time.hours)}:${pad(time.minutes)}`;
  return withSeconds ? `${base}:${pad(time.seconds ?? 0)}` : base;
}

export function parseIsoDateTime(text) {
  const [datePart, timePart, extra] = String(text ?? '').trim().split('T');
  if (extra !== undefined || !timePart) {
    return null;
  }
  const date = parseIsoDate(datePart);
  const time = parseIsoTime(timePart);
  return date && time ? { date, time } : null;
}

export function formatIsoDateTime(date, time, withSeconds = false) {
  if (!date || !time) {
    return '';
  }
  return `${formatIsoDate(date)}T${formatIsoTime(time, withSeconds)}`;
}

export function stepHasSeconds(step) {
  const seconds = Number(step);
  return Number.isFinite(seconds) && seconds > 0 && seconds % 60 !== 0;
}
