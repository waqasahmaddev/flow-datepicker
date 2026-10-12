export const defaults = {
  mode: null,
  trigger: null,
  locale: null,
  weekStart: null,
  hourCycle: null,
  weekdayLength: 'min',
  min: null,
  max: null,
  months: null,
  placeholder: null,
  presets: null,
  closeOnSelect: true,
  labels: {
    chooseDate: 'Choose date',
    chooseTime: 'Choose time',
    chooseDateTime: 'Choose date and time',
    chooseRange: 'Choose date range',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    selectRange: 'Select dates',
    presets: 'Presets',
    weekToDate: 'Week to date',
    monthToDate: 'Month to date',
    yearToDate: 'Year to date',
    lastDays: 'Last {n} days',
    today: 'Today',
    now: 'Now',
    clear: 'Clear',
    hour: 'Hour',
    minute: 'Minute',
    second: 'Second',
    dayPeriod: 'AM/PM'
  }
};

const INTEGER_OPTIONS = new Set(['weekStart', 'hourCycle', 'months']);
const BOOLEAN_OPTIONS = new Set(['closeOnSelect']);
const DATASET_OPTIONS = Object.keys(defaults).filter((key) => key !== 'labels');

function datasetKey(option) {
  return `fdp${option[0].toUpperCase()}${option.slice(1)}`;
}

export function readDataset(element) {
  const options = {};
  for (const option of DATASET_OPTIONS) {
    const raw = element.dataset[datasetKey(option)];
    if (raw === undefined || raw === '') {
      continue;
    }
    if (BOOLEAN_OPTIONS.has(option)) {
      options[option] = raw !== 'false';
    } else if (INTEGER_OPTIONS.has(option)) {
      const number = Number.parseInt(raw, 10);
      if (Number.isInteger(number)) {
        options[option] = number;
      }
    } else {
      options[option] = raw;
    }
  }
  return options;
}

export function mergeOptions(...sources) {
  const merged = { labels: {} };
  for (const source of sources) {
    if (!source) {
      continue;
    }
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) {
        continue;
      }
      if (key === 'labels') {
        Object.assign(merged.labels, value);
      } else {
        merged[key] = value;
      }
    }
  }
  return merged;
}
