import { addDays, compareDays, createDate, isSameDay, isWithin, startOfWeek } from '../core/date-math.js';
import { parseIsoDate } from '../core/iso.js';

const DEFAULT_PRESETS = [
  { id: 'week-to-date', period: 'week' },
  { id: 'month-to-date', period: 'month' },
  { id: 'last-7-days', days: 7 },
  { id: 'last-14-days', days: 14 },
  { id: 'last-30-days', days: 30 }
];

function periodStart(period, day, locale) {
  if (period === 'week') {
    return startOfWeek(day, locale.weekStart);
  }
  if (period === 'month') {
    return createDate(day.getFullYear(), day.getMonth(), 1);
  }
  return createDate(day.getFullYear(), 0, 1);
}

function presetLabel(definition, labels) {
  if (definition.label) {
    return definition.label;
  }
  if (definition.period) {
    return labels[`${definition.period}ToDate`] ?? definition.id;
  }
  return labels.lastDays.replace('{n}', String(definition.days));
}

function presetRange(definition) {
  if (typeof definition.range === 'function') {
    return definition.range;
  }
  if (definition.period) {
    return (day, locale) => [periodStart(definition.period, day, locale), day];
  }
  if (Number.isInteger(definition.days)) {
    return (day) => [addDays(day, -definition.days), day];
  }
  const from = parseIsoDate(definition.from);
  const to = parseIsoDate(definition.to);
  return from && to ? () => [from, to] : null;
}

function readDefinitions(source) {
  if (source === 'none' || source === false) {
    return [];
  }
  if (typeof source === 'string') {
    try {
      return JSON.parse(source);
    } catch {
      return DEFAULT_PRESETS;
    }
  }
  return Array.isArray(source) ? source : DEFAULT_PRESETS;
}

export function resolvePresets(source, labels) {
  const presets = [];
  readDefinitions(source).forEach((definition, index) => {
    const range = presetRange(definition);
    if (range) {
      presets.push({ id: definition.id ?? `preset-${index + 1}`, label: presetLabel(definition, labels), range });
    }
  });
  return presets;
}

export function matchPreset(value, presets, day, locale) {
  if (!value?.from || !value?.to) {
    return null;
  }
  for (const preset of presets) {
    const [from, to] = preset.range(day, locale);
    if (isSameDay(from, value.from) && isSameDay(to, value.to)) {
      return preset;
    }
  }
  return null;
}

export function presetFits(preset, day, locale, { min, max }) {
  const [from, to] = preset.range(day, locale);
  return compareDays(from, to) <= 0 && isWithin(from, min, max) && isWithin(to, min, max);
}
