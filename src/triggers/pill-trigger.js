import { el, icon } from '../core/dom.js';

export class PillTrigger {
  element;

  #text = '';
  #value;
  #placeholder;

  constructor({ id, iconName, label, placeholder, describedBy }) {
    this.#placeholder = placeholder || '';
    this.element = el('button', 'fdp-pill', {
      type: 'button',
      id: `${id}-trigger`,
      'aria-haspopup': 'dialog',
      'aria-expanded': 'false',
      'aria-describedby': describedBy || null
    });
    const name = el('span', 'fdp-visually-hidden');
    name.textContent = `${label}, `;
    this.#value = el('span', 'fdp-pill-text');
    this.element.append(icon(iconName), name, this.#value, icon('chevrons'));
    this.#render();
  }

  get anchor() {
    return this.element;
  }

  get text() {
    return this.#text;
  }

  bind({ toggle, keydown }, signal) {
    this.element.addEventListener('click', () => toggle(), { signal });
    this.element.addEventListener('keydown', (event) => keydown(event), { signal });
  }

  setText(text) {
    this.#text = text;
    this.#render();
  }

  setPlaceholder(text) {
    this.#placeholder = text || '';
    this.#render();
  }

  setControls(id) {
    this.element.setAttribute('aria-controls', id);
  }

  setExpanded(expanded) {
    this.element.setAttribute('aria-expanded', String(expanded));
  }

  setState({ disabled, readOnly }) {
    this.element.disabled = disabled;
    this.element.classList.toggle('is-readonly', readOnly);
  }

  setInvalid(invalid) {
    if (invalid) {
      this.element.setAttribute('aria-invalid', 'true');
    } else {
      this.element.removeAttribute('aria-invalid');
    }
  }

  focus() {
    this.element.focus({ preventScroll: true });
  }

  #render() {
    this.#value.textContent = this.#text || this.#placeholder;
    this.#value.classList.toggle('is-placeholder', !this.#text);
  }
}
