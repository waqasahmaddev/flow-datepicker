const SVG_NS = 'http://www.w3.org/2000/svg';

const ICON_PATHS = {
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  calendarTime: '<path d="M11.5 21H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4.5M16 3v4M8 3v4M4 11h10"/><circle cx="18" cy="18" r="4"/><path d="M18 16.5V18l1 1"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronUp: '<path d="m6 15 6-6 6 6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevrons: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>'
};

const LAYOUT_CLASS = /^(?:[\w-]+:)*-?(?:w|min-w|max-w|m[trblxyse]?|col|flex|grow|shrink|basis|order|self|d)(?:-|$)/;
const LAYOUT_STYLES = ['width', 'min-width', 'max-width', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'margin-inline', 'margin-block'];
const iconTemplates = new Map();

let sequence = 0;

export function nextId(prefix = 'fdp') {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

export function el(tag, className, attributes) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (attributes) {
    for (const name in attributes) {
      const value = attributes[name];
      if (value === false || value === null || value === undefined) {
        continue;
      }
      node.setAttribute(name, value === true ? '' : String(value));
    }
  }
  return node;
}

export function icon(name) {
  let template = iconTemplates.get(name);
  if (!template) {
    template = document.createElementNS(SVG_NS, 'svg');
    template.setAttribute('viewBox', '0 0 24 24');
    template.setAttribute('aria-hidden', 'true');
    template.setAttribute('focusable', 'false');
    template.setAttribute('class', 'fdp-icon');
    template.innerHTML = ICON_PATHS[name] ?? '';
    iconTemplates.set(name, template);
  }
  return template.cloneNode(true);
}

export function copyLayout(source, root) {
  for (const name of source.classList) {
    if (LAYOUT_CLASS.test(name)) {
      root.classList.add(name);
    }
  }
  for (const property of LAYOUT_STYLES) {
    const value = source.style.getPropertyValue(property);
    if (value) {
      root.style.setProperty(property, value);
    }
  }
  for (const property of source.style) {
    if (property.startsWith('--fdp-')) {
      root.style.setProperty(property, source.style.getPropertyValue(property));
    }
  }
  if (source.dataset.fdpTheme) {
    root.dataset.fdpTheme = source.dataset.fdpTheme;
  }
}

export function ensureId(element, prefix) {
  if (!element.id) {
    element.id = nextId(prefix);
  }
  return element.id;
}

export function listenWeak(target, name, instance, signal, action) {
  const ref = new WeakRef(instance);
  target.addEventListener(name, () => action(ref.deref()), { signal });
}
