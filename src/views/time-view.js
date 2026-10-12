import { el, icon } from '../core/dom.js';

const TYPE_RESET_MS = 1000;
const DAY_SECONDS = 86400;

function toSeconds(time) {
  return time.hours * 3600 + time.minutes * 60 + (time.seconds ?? 0);
}

function fromSeconds(total) {
  return { hours: Math.floor(total / 3600), minutes: Math.floor(total / 60) % 60, seconds: total % 60 };
}

function wrap(value, size) {
  return ((value % size) + size) % size;
}

export function defaultTime(minuteStep = 1, now = new Date()) {
  const minutes = Math.round(now.getMinutes() / minuteStep) * minuteStep;
  const hours = now.getHours() + Math.floor(minutes / 60);
  return { hours: wrap(hours, 24), minutes: minutes % 60, seconds: 0 };
}

export class TimeView {
  element;

  #locale;
  #labels;
  #minuteStep;
  #withSeconds;
  #onChange;
  #time = null;
  #parts = {};
  #typed = '';
  #typedAt = 0;

  constructor({ locale, labels, minuteStep = 1, withSeconds = false, onChange }) {
    this.#locale = locale;
    this.#labels = labels;
    this.#minuteStep = Math.max(1, minuteStep);
    this.#withSeconds = withSeconds;
    this.#onChange = onChange;
    this.element = el('div', 'fdp-time');
    this.element.append(this.#segment('hours', labels.hour), this.#separator(), this.#segment('minutes', labels.minute));
    if (withSeconds) {
      this.element.append(this.#separator(), this.#segment('seconds', labels.second));
    }
    if (locale.hourCycle === 12) {
      const period = el('div', 'fdp-meridiem', { role: 'spinbutton', tabindex: '0', 'aria-label': labels.dayPeriod, 'data-part': 'period' });
      this.#parts.period = period;
      this.element.append(period);
    }
    this.element.addEventListener('click', (event) => this.#onClick(event));
    this.element.addEventListener('keydown', (event) => this.#onKeyDown(event));
    this.element.addEventListener('wheel', (event) => this.#onWheel(event), { passive: false });
    this.#render();
  }

  get time() {
    return this.#time;
  }

  setTime(time) {
    this.#time = time ? { hours: time.hours, minutes: time.minutes, seconds: time.seconds ?? 0 } : null;
    this.#render();
  }

  focus() {
    this.#parts.hours.focus({ preventScroll: true });
  }

  #separator() {
    const node = el('span', 'fdp-time-separator', { 'aria-hidden': 'true' });
    node.textContent = ':';
    return node;
  }

  #segment(part, label) {
    const node = el('div', `fdp-segment fdp-segment--${part}`, { role: 'spinbutton', tabindex: '0', 'aria-label': label, 'data-part': part });
    const value = el('span', 'fdp-segment-value');
    const handles = el('span', 'fdp-handles', { 'aria-hidden': 'true' });
    const up = el('span', 'fdp-handle', { 'data-step': '1' });
    const down = el('span', 'fdp-handle', { 'data-step': '-1' });
    up.append(icon('chevronUp'));
    down.append(icon('chevronDown'));
    handles.append(up, down);
    node.append(value, handles);
    this.#parts[part] = node;
    return node;
  }

  #range(part) {
    if (part === 'hours') {
      return this.#locale.hourCycle === 12 ? [1, 12] : [0, 23];
    }
    return [0, 59];
  }

  #shown(part) {
    const time = this.#time;
    if (!time) {
      return null;
    }
    if (part === 'hours' && this.#locale.hourCycle === 12) {
      return time.hours % 12 === 0 ? 12 : time.hours % 12;
    }
    return time[part];
  }

  #render() {
    for (const part of ['hours', 'minutes', 'seconds']) {
      const node = this.#parts[part];
      if (!node) {
        continue;
      }
      const shown = this.#shown(part);
      const [min, max] = this.#range(part);
      const text = shown === null ? '--' : part === 'hours' ? this.#locale.hourText(this.#time.hours) : String(shown).padStart(2, '0');
      node.firstChild.textContent = text;
      node.setAttribute('aria-valuemin', String(min));
      node.setAttribute('aria-valuemax', String(max));
      if (shown === null) {
        node.removeAttribute('aria-valuenow');
        node.setAttribute('aria-valuetext', '--');
      } else {
        node.setAttribute('aria-valuenow', String(shown));
        node.setAttribute('aria-valuetext', text);
      }
    }
    const period = this.#parts.period;
    if (period) {
      period.textContent = this.#time ? this.#locale.dayPeriodText(this.#time.hours) : '--';
    }
  }

  #change(next) {
    this.#time = next;
    this.#render();
    this.#onChange({ ...next });
  }

  #base() {
    return this.#time ?? defaultTime(this.#minuteStep);
  }

  #step(part, direction) {
    const time = { ...this.#base() };
    if (!this.#time) {
      this.#change(time);
      return;
    }
    if (part === 'hours') {
      time.hours = wrap(time.hours + direction, 24);
    } else if (part === 'minutes') {
      const step = this.#minuteStep;
      const aligned = direction > 0 ? Math.floor(time.minutes / step) * step + step : Math.ceil(time.minutes / step) * step - step;
      this.#change(fromSeconds(wrap(time.hours * 3600 + aligned * 60 + time.seconds, DAY_SECONDS)));
      return;
    } else if (part === 'seconds') {
      this.#change(fromSeconds(wrap(toSeconds(time) + direction, DAY_SECONDS)));
      return;
    } else {
      time.hours = wrap(time.hours + 12, 24);
    }
    this.#change(time);
  }

  #setPeriod(afternoon) {
    const time = { ...this.#base() };
    time.hours = (time.hours % 12) + (afternoon ? 12 : 0);
    this.#change(time);
  }

  #type(part, digit) {
    const now = Date.now();
    if (now - this.#typedAt > TYPE_RESET_MS || this.#typed.length >= 2) {
      this.#typed = '';
    }
    this.#typedAt = now;
    this.#typed += digit;
    const [min, max] = this.#range(part);
    let value = Number(this.#typed);
    if (value > max) {
      this.#typed = digit;
      value = Number(digit);
    }
    if (value < min && this.#typed.length >= 2) {
      return;
    }
    const time = { ...this.#base() };
    if (part === 'hours' && this.#locale.hourCycle === 12) {
      if (value < 1) {
        return;
      }
      time.hours = (value % 12) + (time.hours >= 12 ? 12 : 0);
    } else {
      time[part] = value;
    }
    this.#change(time);
    if (this.#typed.length >= 2 || value * 10 > max) {
      this.#typed = '';
      this.#focusNext(part);
    }
  }

  #focusNext(part) {
    const order = ['hours', 'minutes', 'seconds', 'period'].filter((name) => this.#parts[name]);
    const next = this.#parts[order[order.indexOf(part) + 1]];
    next?.focus({ preventScroll: true });
  }

  #onClick(event) {
    const handle = event.target.closest('.fdp-handle');
    const part = event.target.closest('[data-part]');
    if (!part) {
      return;
    }
    part.focus({ preventScroll: true });
    if (handle) {
      this.#step(part.dataset.part, Number(handle.dataset.step));
    } else if (part.dataset.part === 'period') {
      this.#step('period', 1);
    }
  }

  #onKeyDown(event) {
    const node = event.target.closest('[data-part]');
    if (!node) {
      return;
    }
    const part = node.dataset.part;
    const key = event.key;
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault();
      this.#step(part, key === 'ArrowUp' ? 1 : -1);
    } else if (part === 'period') {
      const letter = key.toLowerCase();
      if (letter === 'a' || letter === 'p') {
        event.preventDefault();
        this.#setPeriod(letter === 'p');
      } else if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.#step('period', 1);
      }
    } else if (/^\d$/.test(key)) {
      event.preventDefault();
      this.#type(part, key);
    }
  }

  #onWheel(event) {
    const node = event.target.closest('[data-part]');
    if (!node || event.deltaY === 0) {
      return;
    }
    event.preventDefault();
    this.#step(node.dataset.part, event.deltaY < 0 ? 1 : -1);
  }
}
