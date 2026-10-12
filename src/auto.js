import { FlowDatepicker } from './index.js';

let started = false;

function isParsed(node) {
  for (let current = node; current; current = current.parentNode) {
    if (current.nextSibling) {
      return true;
    }
  }
  return false;
}

function enhanceWhileParsing() {
  const pending = new Set();
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType !== 1) {
          continue;
        }
        if (node.matches(FlowDatepicker.selector)) {
          pending.add(node);
        } else if (node.firstElementChild) {
          node.querySelectorAll(FlowDatepicker.selector).forEach((element) => pending.add(element));
        }
      }
    }
    for (const element of pending) {
      if (isParsed(element)) {
        pending.delete(element);
        FlowDatepicker.init(element);
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  return () => observer.disconnect();
}

export function autoInit({ root = document, htmx = true } = {}) {
  if (started) {
    return;
  }
  started = true;
  if (document.readyState === 'loading') {
    const stop = enhanceWhileParsing();
    document.addEventListener('DOMContentLoaded', () => {
      stop();
      FlowDatepicker.init(root);
    }, { once: true });
  } else {
    FlowDatepicker.init(root);
  }
  if (htmx) {
    document.addEventListener('htmx:load', (event) => {
      FlowDatepicker.init(event.detail?.elt ?? event.target);
    });
    document.addEventListener('htmx:beforeCleanupElement', (event) => {
      const element = event.detail?.elt ?? event.target;
      FlowDatepicker.get(element)?.destroy({ restore: false });
    });
  }
}

FlowDatepicker.autoInit = autoInit;
globalThis.FlowDatepicker = FlowDatepicker;
autoInit();
