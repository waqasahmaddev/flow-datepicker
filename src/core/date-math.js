export function createDate(year, month, day) {
  const date = new Date(2000, 0, 1);
  date.setFullYear(year, month, day);
  return date;
}

export function today() {
  const now = new Date();
  return createDate(now.getFullYear(), now.getMonth(), now.getDate());
}

export function dayKey(date) {
  return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
}

export function isSameDay(a, b) {
  return Boolean(a && b) && dayKey(a) === dayKey(b);
}

export function compareDays(a, b) {
  return dayKey(a) - dayKey(b);
}

export function daysInMonth(year, month) {
  return createDate(year, month + 1, 0).getDate();
}

export function addDays(date, amount) {
  return createDate(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function addMonths(date, amount) {
  const target = createDate(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = daysInMonth(target.getFullYear(), target.getMonth());
  return createDate(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
}

export function startOfMonth(date) {
  return createDate(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date) {
  return createDate(date.getFullYear(), date.getMonth(), daysInMonth(date.getFullYear(), date.getMonth()));
}

export function startOfWeek(date, weekStart = 0) {
  const offset = (date.getDay() - weekStart + 7) % 7;
  return addDays(date, -offset);
}

export function endOfWeek(date, weekStart = 0) {
  return addDays(startOfWeek(date, weekStart), 6);
}

export function leadingDays(year, month, weekStart = 0) {
  return (createDate(year, month, 1).getDay() - weekStart + 7) % 7;
}

export function isWithin(date, min, max) {
  if (min && compareDays(date, min) < 0) {
    return false;
  }
  if (max && compareDays(date, max) > 0) {
    return false;
  }
  return true;
}

export function clampDate(date, min, max) {
  if (min && compareDays(date, min) < 0) {
    return min;
  }
  if (max && compareDays(date, max) > 0) {
    return max;
  }
  return date;
}

export function orderDays(a, b) {
  return compareDays(a, b) <= 0 ? [a, b] : [b, a];
}
