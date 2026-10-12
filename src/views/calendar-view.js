import { el, icon } from '../core/dom.js';
import {
  addDays, addMonths, clampDate, compareDays, createDate, daysInMonth, endOfMonth, endOfWeek,
  isSameDay, isWithin, leadingDays, orderDays, startOfMonth, startOfWeek, today
} from '../core/date-math.js';
import { formatIsoDate, parseIsoDate } from '../core/iso.js';

function isRtl(element) {
  return getComputedStyle(element).direction === 'rtl';
}

export class CalendarView {
  element;

  #id;
  #locale;
  #labels;
  #months;
  #onPick;
  #onHover;
  #first;
  #active;
  #start = null;
  #end = null;
  #min = null;
  #max = null;
  #isDisabled = null;

  constructor({ id, locale, labels, months = 1, onPick, onHover = null, isDisabled = null }) {
    this.#id = id;
    this.#locale = locale;
    this.#labels = labels;
    this.#months = Math.max(1, months);
    this.#onPick = onPick;
    this.#onHover = onHover;
    this.#isDisabled = isDisabled;
    this.#active = today();
    this.#first = startOfMonth(this.#active);
    this.element = el('div', this.#months > 1 ? 'fdp-calendar is-multi' : 'fdp-calendar');
    this.element.addEventListener('click', (event) => this.#onClick(event));
    this.element.addEventListener('keydown', (event) => this.#onKeyDown(event));
    if (onHover) {
      this.element.addEventListener('pointerover', (event) => this.#onPointerOver(event));
    }
  }

  get activeDate() {
    return this.#active;
  }

  get firstMonth() {
    return this.#first;
  }

  get months() {
    return this.#months;
  }

  setMonths(months) {
    this.#months = Math.max(1, months);
    this.element.classList.toggle('is-multi', this.#months > 1);
  }

  setBounds(min, max) {
    this.#min = min ?? null;
    this.#max = max ?? null;
  }

  setSelection(start, end = start) {
    if (start && end) {
      [this.#start, this.#end] = orderDays(start, end);
    } else {
      this.#start = start ?? null;
      this.#end = start ?? null;
    }
    this.#paint();
  }

  isSelectable(date) {
    return isWithin(date, this.#min, this.#max) && !this.#isDisabled?.(date);
  }

  showDate(date, { align = 'start' } = {}) {
    this.#active = clampDate(date ?? today(), this.#min, this.#max);
    const month = startOfMonth(this.#active);
    this.#first = align === 'end' ? addMonths(month, 1 - this.#months) : month;
    this.render();
  }

  navigate(months) {
    this.#first = addMonths(this.#first, months);
    this.#active = clampDate(addMonths(this.#active, months), this.#min, this.#max);
    if (!this.#isVisible(this.#active)) {
      this.#active = clampDate(this.#first, this.#min, this.#max);
    }
    this.render();
  }

  focus() {
    this.element.querySelector('.fdp-cell[tabindex="0"]')?.focus({ preventScroll: true });
  }

  render() {
    const hadFocus = this.element.contains(document.activeElement);
    const current = today();
    const months = [];
    for (let index = 0; index < this.#months; index += 1) {
      months.push(this.#renderMonth(addMonths(this.#first, index), index, current));
    }
    this.element.replaceChildren(...months);
    this.#paint();
    if (hadFocus) {
      this.focus();
    }
  }

  #lastVisibleDay() {
    return endOfMonth(addMonths(this.#first, this.#months - 1));
  }

  #isVisible(date) {
    return compareDays(date, this.#first) >= 0 && compareDays(date, this.#lastVisibleDay()) <= 0;
  }

  #canGoBack() {
    return !this.#min || compareDays(addDays(this.#first, -1), this.#min) >= 0;
  }

  #canGoForward() {
    return !this.#max || compareDays(addMonths(this.#first, this.#months), this.#max) <= 0;
  }

  #navButton(step) {
    const back = step < 0;
    const button = el('button', 'fdp-nav', {
      type: 'button',
      'data-step': step,
      'aria-label': back ? this.#labels.previousMonth : this.#labels.nextMonth,
      disabled: back ? !this.#canGoBack() : !this.#canGoForward()
    });
    button.append(icon(back ? 'chevronLeft' : 'chevronRight'));
    return button;
  }

  #renderMonth(month, index, current) {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const titleId = `${this.#id}-month-${index}`;
    const wrap = el('div', 'fdp-month');
    const head = el('div', 'fdp-month-head');
    const title = el('div', 'fdp-month-title', { id: titleId, 'aria-live': index === 0 ? 'polite' : null });
    title.textContent = this.#locale.formatMonthYear(month);
    head.append(
      index === 0 ? this.#navButton(-1) : el('span', 'fdp-nav-space'),
      title,
      index === this.#months - 1 ? this.#navButton(1) : el('span', 'fdp-nav-space')
    );
    const table = el('table', 'fdp-grid', { role: 'grid', 'aria-labelledby': titleId });
    table.append(this.#renderWeekdays(), this.#renderDays(year, monthIndex, current));
    wrap.append(head, table);
    return wrap;
  }

  #renderWeekdays() {
    const head = el('thead');
    const row = el('tr');
    for (const weekday of this.#locale.weekdayOrder()) {
      const cell = el('th', 'fdp-weekday', { scope: 'col', abbr: this.#locale.weekdayLongNames[weekday] });
      const text = el('span');
      text.textContent = this.#locale.weekdayNames[weekday];
      cell.append(text);
      row.append(cell);
    }
    head.append(row);
    return head;
  }

  #renderDays(year, month, current) {
    const body = el('tbody');
    const count = daysInMonth(year, month);
    let row = el('tr');
    for (let index = leadingDays(year, month, this.#locale.weekStart); index > 0; index -= 1) {
      row.append(el('td', 'fdp-cell is-empty'));
    }
    for (let day = 1; day <= count; day += 1) {
      if (row.children.length === 7) {
        body.append(row);
        row = el('tr');
      }
      row.append(this.#renderDay(createDate(year, month, day), current));
    }
    while (row.children.length < 7) {
      row.append(el('td', 'fdp-cell is-empty'));
    }
    body.append(row);
    return body;
  }

  #rangeClasses(date) {
    const column = (date.getDay() - this.#locale.weekStart + 7) % 7;
    const rowStart = column === 0 || date.getDate() === 1;
    const rowEnd = column === 6 || date.getDate() === daysInMonth(date.getFullYear(), date.getMonth());
    if (!this.#start || !this.#end || compareDays(date, this.#start) < 0 || compareDays(date, this.#end) > 0) {
      return [];
    }
    const isStart = isSameDay(date, this.#start);
    const isEnd = isSameDay(date, this.#end);
    const classes = isStart || isEnd ? ['is-selected'] : [];
    if (isStart && isEnd) {
      return classes;
    }
    if (isStart) {
      classes.push(rowEnd ? 'is-range-alone' : 'is-range-start');
    } else if (isEnd) {
      classes.push(rowStart ? 'is-range-alone' : 'is-range-end');
    } else {
      classes.push('is-in-range');
    }
    if (rowStart && !isStart) {
      classes.push('is-row-start');
    }
    if (rowEnd && !isEnd) {
      classes.push('is-row-end');
    }
    return classes;
  }

  #paint() {
    for (const cell of this.element.querySelectorAll('.fdp-cell[data-date]')) {
      const classes = this.#rangeClasses(parseIsoDate(cell.dataset.date));
      cell.className = ['fdp-cell', ...classes].join(' ');
      cell.setAttribute('aria-selected', classes.length > 0 ? 'true' : 'false');
    }
  }

  #renderDay(date, current) {
    const selectable = this.isSelectable(date);
    const cell = el('td', 'fdp-cell', {
      'data-date': formatIsoDate(date),
      tabindex: isSameDay(date, this.#active) ? '0' : '-1',
      'aria-disabled': selectable ? null : 'true',
      'aria-current': isSameDay(date, current) ? 'date' : null,
      'aria-label': this.#locale.formatFullDate(date)
    });
    const mark = el('span', 'fdp-day');
    mark.textContent = this.#locale.formatDayNumber(date);
    cell.append(mark);
    return cell;
  }

  #cellDate(target) {
    const cell = target.closest?.('.fdp-cell[data-date]');
    return cell && this.element.contains(cell) ? { cell, date: parseIsoDate(cell.dataset.date) } : null;
  }

  #onClick(event) {
    const nav = event.target.closest('.fdp-nav');
    if (nav) {
      if (!nav.disabled) {
        this.navigate(Number(nav.dataset.step));
      }
      return;
    }
    const hit = this.#cellDate(event.target);
    if (!hit || hit.cell.getAttribute('aria-disabled') === 'true') {
      return;
    }
    this.#active = hit.date;
    this.#onPick(hit.date);
  }

  #onPointerOver(event) {
    if (event.pointerType && event.pointerType !== 'mouse') {
      return;
    }
    const hit = this.#cellDate(event.target);
    if (hit && hit.cell.getAttribute('aria-disabled') !== 'true') {
      this.#onHover(hit.date);
    }
  }

  #keyTarget(event) {
    const date = this.#active;
    const forward = isRtl(this.element) ? -1 : 1;
    switch (event.key) {
      case 'ArrowLeft':
        return addDays(date, -forward);
      case 'ArrowRight':
        return addDays(date, forward);
      case 'ArrowUp':
        return addDays(date, -7);
      case 'ArrowDown':
        return addDays(date, 7);
      case 'PageUp':
        return addMonths(date, event.shiftKey ? -12 : -1);
      case 'PageDown':
        return addMonths(date, event.shiftKey ? 12 : 1);
      case 'Home':
        return startOfWeek(date, this.#locale.weekStart);
      case 'End':
        return endOfWeek(date, this.#locale.weekStart);
      default:
        return null;
    }
  }

  #onKeyDown(event) {
    if (!event.target.closest?.('.fdp-cell[data-date]')) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (this.isSelectable(this.#active)) {
        this.#onPick(this.#active);
      }
      return;
    }
    const target = this.#keyTarget(event);
    if (target) {
      event.preventDefault();
      this.#moveTo(target);
    }
  }

  #moveTo(date) {
    const next = clampDate(date, this.#min, this.#max);
    const previous = this.#active;
    this.#active = next;
    if (this.#isVisible(next)) {
      this.element.querySelector(`.fdp-cell[data-date="${formatIsoDate(previous)}"]`)?.setAttribute('tabindex', '-1');
      this.element.querySelector(`.fdp-cell[data-date="${formatIsoDate(next)}"]`)?.setAttribute('tabindex', '0');
    } else {
      this.#first = compareDays(next, this.#first) < 0 ? startOfMonth(next) : addMonths(startOfMonth(next), 1 - this.#months);
      this.render();
    }
    this.focus();
    this.#onHover?.(next);
  }
}
