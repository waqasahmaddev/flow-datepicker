import { el } from '../core/dom.js';

export class FooterView {
  element;

  #items = [];

  constructor(actions) {
    this.element = el('div', 'fdp-footer');
    for (const action of actions) {
      const button = el('button', 'fdp-action', { type: 'button', 'data-action': action.name });
      button.textContent = action.label;
      button.addEventListener('click', () => action.run());
      this.#items.push({ button, action });
      this.element.append(button);
    }
  }

  update() {
    for (const { button, action } of this.#items) {
      button.disabled = Boolean(action.disabled?.());
    }
  }
}
