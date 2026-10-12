import { FlowDatepicker } from './flow-datepicker.js';

let started = false;

export function autoInit({ root = document, htmx = true } = {}) {
  if (started) {
    return;
  }
  started = true;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      FlowDatepicker.init(root);
    }, { once: true });
  } else {
    FlowDatepicker.init(root);
  }
  if (htmx) {
    document.addEventListener('htmx:load', (event) => {
      FlowDatepicker.init(event.detail?.elt ?? event.target);
    });
  }
}

FlowDatepicker.autoInit = autoInit;
globalThis.FlowDatepicker = FlowDatepicker;
autoInit();
