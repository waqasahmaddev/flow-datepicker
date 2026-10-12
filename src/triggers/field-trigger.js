import { el, icon } from '../core/dom.js';

export function isMousePress(event) {
  return event.pointerType === 'mouse' && event.button === 0;
}

export class FieldTrigger {
  element;
  input;
  button;

  #editable;
  #pressed = false;

  constructor({ id, iconName, label, placeholder, labelledBy, ariaLabel, describedBy, editable = true }) {
    this.#editable = editable;
    this.element = el('span', editable ? 'fdp-control' : 'fdp-control is-static');
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

  get editable() {
    return this.#editable;
  }

  get text() {
    return this.input.value;
  }

  bind({ open, toggle, keydown, typed }, signal) {
    this.input.addEventListener('pointerdown', (event) => {
      this.#avoidTouchKeyboard(event);
      if (isMousePress(event)) {
        open();
      }
    }, { signal });
    this.input.addEventListener('click', () => open(), { signal });
    this.input.addEventListener('keydown', (event) => keydown(event), { signal });
    this.input.addEventListener('input', () => typed(this.input.value), { signal });
    this.button.addEventListener('pointerdown', (event) => {
      this.#pressed = isMousePress(event);
      if (this.#pressed) {
        event.preventDefault();
        this.focus();
        toggle();
      }
    }, { signal });
    this.button.addEventListener('click', () => {
      if (this.#pressed) {
        this.#pressed = false;
        return;
      }
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
    this.input.readOnly = readOnly || !this.#editable;
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
    if (event.pointerType === 'touch' || !this.#editable) {
      this.input.inputMode = 'none';
    } else {
      this.input.removeAttribute('inputmode');
    }
  }
}
