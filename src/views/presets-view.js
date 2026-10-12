import { el, icon } from '../core/dom.js';

const MOVE_KEYS = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

export class PresetsView {
  element;

  #options = [];
  #onPick;

  constructor({ presets, label, onPick }) {
    this.#onPick = onPick;
    this.element = el('div', 'fdp-presets', { role: 'listbox', 'aria-label': label });
    for (const preset of presets) {
      const option = el('div', 'fdp-preset', { role: 'option', tabindex: '-1', 'aria-selected': 'false', 'data-id': preset.id });
      const text = el('span', 'fdp-preset-label');
      text.textContent = preset.label;
      option.append(text, icon('check'));
      this.#options.push({ option, preset });
      this.element.append(option);
    }
    this.element.addEventListener('click', (event) => this.#onClick(event));
    this.element.addEventListener('keydown', (event) => this.#onKeyDown(event));
  }

  update(activeId, isAllowed) {
    let focusable = null;
    for (const { option, preset } of this.#options) {
      const active = preset.id === activeId;
      option.setAttribute('aria-selected', String(active));
      option.classList.toggle('is-active', active);
      if (isAllowed(preset)) {
        option.removeAttribute('aria-disabled');
      } else {
        option.setAttribute('aria-disabled', 'true');
      }
      option.tabIndex = -1;
      if (active) {
        focusable = option;
      }
    }
    const target = focusable ?? this.#options[0]?.option;
    if (target) {
      target.tabIndex = 0;
    }
  }

  #pick(option) {
    if (option && option.getAttribute('aria-disabled') !== 'true') {
      this.#onPick(this.#options.find((item) => item.option === option).preset);
    }
  }

  #onClick(event) {
    this.#pick(event.target.closest('.fdp-preset'));
  }

  #onKeyDown(event) {
    const current = event.target.closest('.fdp-preset');
    if (!current) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.#pick(current);
      return;
    }
    const options = this.#options.map((item) => item.option);
    let index = options.indexOf(current);
    if (event.key in MOVE_KEYS) {
      index = (index + MOVE_KEYS[event.key] + options.length) % options.length;
    } else if (event.key === 'Home') {
      index = 0;
    } else if (event.key === 'End') {
      index = options.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    current.tabIndex = -1;
    options[index].tabIndex = 0;
    options[index].focus();
  }
}
