import { el, icon } from '../core/dom.js';

export class FieldTrigger {
  element;
  input;
  button;

  constructor({ id, iconName, label, placeholder, labelledBy, ariaLabel, describedBy }) {
    this.element = el('span', 'fdp-control');
    this.input = el('input', 'fdp-input', {
      type: 'text',
      id: `${id}-input`,
      autocomplete: 'off',
      spellcheck: 'false',
      'aria-haspopup': 'dialog',
      'aria-expanded': 'false',
      'aria-labelledby': labelledBy || null,
      'aria-label': labelledBy ? null : ariaLabel || label,
      'aria-describedby': describedBy || null,
      placeholder: placeholder || null
    });
    this.button = el('button', 'fdp-toggle', { type: 'button', tabindex: '-1', 'aria-label': label });
    this.button.append(icon(iconName));
    this.element.append(this.input, this.button);
  }

  get anchor() {
    return this.element;
  }

  get text() {
    return this.input.value;
  }

  bind({ open, toggle, keydown, typed }, signal) {
    this.input.addEventListener('pointerdown', (event) => this.#avoidTouchKeyboard(event), { signal });
    this.input.addEventListener('click', () => open(), { signal });
    this.input.addEventListener('keydown', (event) => keydown(event), { signal });
    this.input.addEventListener('input', () => typed(this.input.value), { signal });
    this.button.addEventListener('click', () => {
      toggle();
      this.focus();
    }, { signal });
  }

  setText(text) {
    this.input.value = text;
  }

  setPlaceholder(text) {
    if (text) {
      this.input.placeholder = text;
    } else {
      this.input.removeAttribute('placeholder');
    }
  }

  setControls(id) {
    this.input.setAttribute('aria-controls', id);
  }

  setExpanded(expanded) {
    this.input.setAttribute('aria-expanded', String(expanded));
  }

  setState({ disabled, readOnly, required }) {
    this.input.disabled = disabled;
    this.input.readOnly = readOnly;
    if (required) {
      this.input.setAttribute('aria-required', 'true');
    } else {
      this.input.removeAttribute('aria-required');
    }
    this.button.disabled = disabled || readOnly;
  }

  setInvalid(invalid) {
    if (invalid) {
      this.input.setAttribute('aria-invalid', 'true');
    } else {
      this.input.removeAttribute('aria-invalid');
    }
  }

  focus() {
    this.input.focus({ preventScroll: true });
  }

  #avoidTouchKeyboard(event) {
    if (event.pointerType === 'touch') {
      this.input.inputMode = 'none';
    } else {
      this.input.removeAttribute('inputmode');
    }
  }
}
