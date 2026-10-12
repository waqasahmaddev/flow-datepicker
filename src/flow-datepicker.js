import { defaults, mergeOptions, readDataset } from './config.js';
import { el, copyLayout, ensureId, listenWeak, nextId } from './core/dom.js';
import { getLocale, resolveLocaleTag } from './core/locale.js';
import { hidePopover, positionPopover, preparePopover, showPopover } from './core/popover.js';
import { FieldTrigger } from './triggers/field-trigger.js';
import { PillTrigger } from './triggers/pill-trigger.js';

const SELECTOR = 'input[data-flow-datepicker]:not([data-flow-datepicker="manual"]), [data-flow-datepicker="range"]';
const WATCHED_ATTRIBUTES = ['disabled', 'readonly', 'required', 'min', 'max', 'step'];

const instances = new WeakMap();
const modes = new Map();
const views = new Map();
const triggers = new Map([['field', FieldTrigger], ['pill', PillTrigger]]);
const plugins = new Set();

let openInstance = null;

function toElement(target) {
  return typeof target === 'string' ? document.querySelector(target) : target;
}

function resolveMode(element, name) {
  if (name) {
    return modes.get(name) ?? null;
  }
  for (const recipe of modes.values()) {
    if (recipe.matches(element)) {
      return recipe;
    }
  }
  return null;
}

function refreshAfterReset(picker) {
  if (picker) {
    setTimeout(() => picker.refresh(), 0);
  }
}

function refreshPicker(picker) {
  picker?.refresh();
}

export class FlowDatepicker {
  static defaults = defaults;
  static selector = SELECTOR;
  static version = '0.0.0';

  static modes = {
    register(recipe) {
      modes.set(recipe.name, recipe);
    },
    get(name) {
      return modes.get(name) ?? null;
    },
    resolve(element, name) {
      return resolveMode(element, name);
    }
  };

  static views = {
    register(name, View) {
      views.set(name, View);
    },
    get(name) {
      return views.get(name) ?? null;
    }
  };

  static triggers = {
    register(name, Trigger) {
      triggers.set(name, Trigger);
    },
    get(name) {
      return triggers.get(name) ?? null;
    }
  };

  static use(plugin, options) {
    if (typeof plugin !== 'function') {
      throw new TypeError('FlowDatepicker.use expects a function.');
    }
    if (!plugins.has(plugin)) {
      plugins.add(plugin);
      plugin(FlowDatepicker, options);
    }
    return FlowDatepicker;
  }

  static get(target) {
    const element = toElement(target);
    return element ? instances.get(element) ?? null : null;
  }

  static init(root = document, options) {
    const elements = [];
    if (root instanceof Element && root.matches(SELECTOR)) {
      elements.push(root);
    }
    if (root && typeof root.querySelectorAll === 'function') {
      elements.push(...root.querySelectorAll(SELECTOR));
    }
    const pickers = [];
    for (const element of elements) {
      const existing = instances.get(element);
      if (existing) {
        pickers.push(existing);
      } else if (resolveMode(element, options?.mode ?? element.dataset.fdpMode)) {
        pickers.push(new FlowDatepicker(element, options));
      }
    }
    return pickers;
  }

  static destroy(root = document) {
    const elements = root instanceof Element && instances.has(root) ? [root] : root.querySelectorAll?.('.fdp-native') ?? [];
    for (const element of elements) {
      instances.get(element)?.destroy();
    }
  }

  static #unwrapStale(element) {
    const parent = element.parentElement;
    if (parent?.classList.contains('fdp') && parent.firstElementChild === element) {
      parent.replaceWith(element);
    }
    element.classList.remove('fdp-native');
  }

  element;
  mode;
  options;
  labels;
  locale;

  #id;
  #inputs;
  #value = null;
  #root;
  #trigger;
  #popover = null;
  #content = null;
  #isOpen = false;
  #destroyed = false;
  #frame = 0;
  #saved = new Map();
  #ctx;
  #listeners = new AbortController();
  #openListeners = null;
  #observer = null;

  constructor(target, options = {}) {
    const element = toElement(target);
    if (!(element instanceof HTMLElement)) {
      throw new TypeError('FlowDatepicker needs an element.');
    }
    const existing = instances.get(element);
    if (existing) {
      return existing;
    }
    FlowDatepicker.#unwrapStale(element);
    this.element = element;
    this.options = mergeOptions(defaults, readDataset(element), options);
    this.mode = resolveMode(element, this.options.mode);
    if (!this.mode) {
      throw new TypeError('No flow-datepicker mode matches this element.');
    }
    this.#inputs = this.mode.inputs(element);
    this.#ctx = this.#context();
    this.#configure();
    this.#value = this.mode.read(this.#inputs);
    this.#build();
    this.#bind();
    this.#syncState();
    this.#syncTrigger();
    instances.set(element, this);
    if (document.activeElement === element) {
      this.focus();
    }
    this.#emit('init');
  }

  get value() {
    return this.getValue();
  }

  set value(value) {
    this.setValue(value);
  }

  get isOpen() {
    return this.#isOpen;
  }

  get disabled() {
    return this.#inputs.some((input) => input.disabled);
  }

  getValue() {
    return this.mode.serialize(this.#value, this.#ctx);
  }

  setValue(value, { silent = false } = {}) {
    this.#commit(this.mode.deserialize(value, this.#ctx), { silent });
  }

  clear({ silent = false } = {}) {
    this.#commit(null, { silent });
  }

  open() {
    if (this.#isOpen || this.#destroyed || this.disabled || this.#isReadOnly()) {
      return;
    }
    if (openInstance && openInstance !== this) {
      openInstance.close({ restoreFocus: false });
    }
    this.#ensurePopover();
    this.#isOpen = true;
    openInstance = this;
    this.#content.update(this.#value, this.#bounds());
    this.#root.classList.add('is-open');
    this.#trigger.setExpanded(true);
    showPopover(this.#popover);
    this.#listenWhileOpen();
    this.#position();
    this.#emit('open');
  }

  close({ restoreFocus = true } = {}) {
    if (!this.#isOpen) {
      return;
    }
    const active = document.activeElement;
    const focusInside = this.#popover.contains(active) || !active || active === document.body;
    this.#isOpen = false;
    if (openInstance === this) {
      openInstance = null;
    }
    this.#openListeners?.abort();
    this.#openListeners = null;
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
    hidePopover(this.#popover);
    this.#root.classList.remove('is-open');
    this.#trigger.setExpanded(false);
    if (restoreFocus && focusInside) {
      this.#trigger.focus();
    }
    this.#emit('close');
  }

  toggle() {
    if (this.#isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  focus() {
    this.#trigger.focus();
  }

  refresh() {
    if (this.#destroyed) {
      return;
    }
    this.#value = this.mode.read(this.#inputs);
    this.#syncState();
    this.#syncTrigger();
    if (this.#isOpen) {
      this.#content.update(this.#value, this.#bounds());
    }
  }

  setOptions(patch) {
    this.options = mergeOptions(this.options, patch);
    this.#configure();
    this.#dropPopover();
    this.#trigger.setPlaceholder(this.#placeholder());
    this.refresh();
  }

  destroy({ restore = true } = {}) {
    if (this.#destroyed) {
      return;
    }
    this.close({ restoreFocus: false });
    this.#destroyed = true;
    this.#listeners.abort();
    this.#observer?.disconnect();
    const element = this.element;
    if (restore) {
      if (this.#root.isConnected) {
        this.#root.replaceWith(element);
      }
      element.classList.remove('fdp-native');
      if (!element.getAttribute('class')) {
        element.removeAttribute('class');
      }
      for (const [node, attributes] of this.#saved) {
        for (const [name, value] of Object.entries(attributes)) {
          if (value === null) {
            node.removeAttribute(name);
          } else {
            node.setAttribute(name, value);
          }
        }
      }
    }
    instances.delete(element);
    this.#emit('destroy');
  }

  #configure() {
    this.labels = { ...defaults.labels, ...this.options.labels };
    this.locale = getLocale(resolveLocaleTag(this.element, this.options.locale), {
      weekStart: this.options.weekStart,
      hourCycle: this.options.hourCycle,
      weekdayLength: this.options.weekdayLength
    });
    this.mode.prepare?.(this.#inputs, this.options);
  }

  #placeholder() {
    return this.options.placeholder ?? this.mode.placeholder?.(this.#ctx) ?? '';
  }

  #isReadOnly() {
    return this.#inputs.some((input) => input.readOnly);
  }

  #bounds() {
    return this.mode.readBounds(this.#inputs);
  }

  #labelIds() {
    const ids = [];
    for (const input of this.#inputs) {
      for (const label of input.labels ?? []) {
        ids.push(ensureId(label, 'fdp-label'));
      }
      const extra = input.getAttribute('aria-labelledby');
      if (extra) {
        ids.push(extra);
      }
    }
    return [...new Set(ids)].join(' ');
  }

  #build() {
    const element = this.element;
    const triggerName = this.options.trigger ?? this.mode.trigger;
    const Trigger = triggers.get(triggerName) ?? FieldTrigger;
    this.#id = nextId('fdp');
    this.#saved = new Map();
    for (const node of new Set([element, ...this.#inputs])) {
      this.#saved.set(node, { tabindex: node.getAttribute('tabindex'), 'aria-hidden': node.getAttribute('aria-hidden') });
      node.tabIndex = -1;
    }
    this.#root = el('span', `fdp fdp--${triggerName} fdp--${this.mode.name}`);
    copyLayout(element, this.#root);
    element.before(this.#root);
    element.classList.add('fdp-native');
    element.setAttribute('aria-hidden', 'true');
    this.#trigger = new Trigger({
      id: this.#id,
      iconName: this.mode.icon,
      label: element.getAttribute('aria-label') || this.labels[this.mode.dialogLabel],
      placeholder: this.#placeholder(),
      labelledBy: this.#labelIds(),
      ariaLabel: this.#inputs[0]?.getAttribute('aria-label'),
      describedBy: element.getAttribute('aria-describedby')
    });
    this.#root.append(element, this.#trigger.element);
  }

  #context() {
    const picker = this;
    return {
      get id() {
        return picker.#id;
      },
      get locale() {
        return picker.locale;
      },
      get labels() {
        return picker.labels;
      },
      get options() {
        return picker.options;
      },
      get bounds() {
        return picker.#bounds();
      },
      get value() {
        return picker.#value;
      },
      commit(value, options) {
        picker.#commit(value, options);
      },
      close() {
        picker.close();
      }
    };
  }

  #ensurePopover() {
    if (this.#popover) {
      return;
    }
    const popover = el('div', `fdp-popover fdp-popover--${this.mode.name}`, {
      id: `${this.#id}-dialog`,
      role: 'dialog',
      'aria-label': this.labels[this.mode.dialogLabel]
    });
    preparePopover(popover);
    this.#content = this.mode.build(this.#ctx);
    popover.append(...[].concat(this.#content.element));
    this.#root.append(popover);
    this.#popover = popover;
    this.#trigger.setControls(popover.id);
    this.#bindPopover();
  }

  #dropPopover() {
    if (!this.#popover) {
      return;
    }
    this.close({ restoreFocus: false });
    this.#popover.remove();
    this.#popover = null;
    this.#content = null;
  }

  #bind() {
    const signal = this.#listeners.signal;
    this.#trigger.bind({
      open: () => this.open(),
      toggle: () => this.toggle(),
      keydown: (event) => this.#onTriggerKeyDown(event),
      typed: (text) => this.#onTyped(text)
    }, signal);
    this.#root.addEventListener('focusout', (event) => {
      const next = event.relatedTarget;
      if (next && this.#root.contains(next)) {
        return;
      }
      this.#commitTyped();
      if (this.#isOpen && next) {
        this.close({ restoreFocus: false });
      }
    }, { signal });
    for (const input of this.#inputs) {
      input.addEventListener('focus', () => this.focus(), { signal });
      input.addEventListener('invalid', () => this.#setInvalid(true), { signal });
    }
    const form = this.#inputs[0]?.form;
    if (form) {
      listenWeak(form, 'reset', this, signal, refreshAfterReset);
    }
    listenWeak(window, 'pageshow', this, signal, refreshPicker);
    this.#observer = new MutationObserver(() => this.refresh());
    for (const input of this.#inputs) {
      this.#observer.observe(input, { attributes: true, attributeFilter: WATCHED_ATTRIBUTES });
    }
  }

  #bindPopover() {
    const signal = this.#listeners.signal;
    this.#popover.addEventListener('mousedown', (event) => {
      if (!event.target.closest('input, textarea, select')) {
        event.preventDefault();
      }
    }, { signal });
    this.#popover.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.close();
      }
    }, { signal });
  }

  #listenWhileOpen() {
    this.#openListeners = new AbortController();
    const signal = this.#openListeners.signal;
    const reposition = (event) => {
      const inside = event.type === 'scroll' && event.target instanceof Node && this.#popover.contains(event.target);
      if (!inside) {
        this.#schedulePosition();
      }
    };
    const watcher = new MutationObserver(() => {
      if (!this.#root.isConnected) {
        this.close({ restoreFocus: false });
      }
    });
    watcher.observe(document, { childList: true, subtree: true });
    signal.addEventListener('abort', () => watcher.disconnect());
    document.addEventListener('pointerdown', (event) => {
      if (!this.#root.contains(event.target)) {
        this.close({ restoreFocus: false });
      }
    }, { signal, capture: true });
    window.addEventListener('scroll', reposition, { signal, capture: true, passive: true });
    window.addEventListener('resize', reposition, { signal });
    window.visualViewport?.addEventListener('resize', reposition, { signal });
    window.visualViewport?.addEventListener('scroll', reposition, { signal });
  }

  #position() {
    if (!this.#isOpen) {
      return;
    }
    positionPopover(this.#popover, this.#trigger.anchor, { rtl: getComputedStyle(this.#root).direction === 'rtl' });
  }

  #schedulePosition() {
    if (!this.#isOpen || this.#frame) {
      return;
    }
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#position();
    });
  }

  #onTriggerKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.#commitTyped();
      this.open();
      this.#content?.focus();
      return;
    }
    if (event.key === 'Escape') {
      if (this.#isOpen) {
        event.preventDefault();
        event.stopPropagation();
        this.close();
      } else if (this.#trigger.text !== this.#formatted()) {
        event.preventDefault();
        this.#syncTrigger();
      }
      return;
    }
    if (event.key === 'Enter') {
      const typed = this.#trigger.text !== this.#formatted();
      this.#commitTyped();
      if (this.#isOpen) {
        event.preventDefault();
        this.close();
      } else if (typed) {
        event.preventDefault();
      }
    }
  }

  #onTyped(text) {
    if (!this.#isOpen) {
      return;
    }
    const parsed = this.mode.parse(text, this.#ctx);
    if (parsed) {
      this.#content.preview?.(parsed);
    }
  }

  #formatted() {
    return this.mode.format(this.#value, this.#ctx);
  }

  #commitTyped() {
    const text = this.#trigger.text;
    if (text === this.#formatted()) {
      return;
    }
    if (!text.trim()) {
      this.#commit(null);
      return;
    }
    const parsed = this.mode.parse(text, this.#ctx);
    if (parsed) {
      this.#commit(parsed);
    } else {
      this.#syncTrigger();
    }
  }

  #commit(value, { close = false, silent = false } = {}) {
    const changed = !this.mode.equals(value, this.#value);
    this.#value = value ?? null;
    this.mode.write(this.#value, this.#inputs);
    this.#setInvalid(false);
    this.#syncTrigger();
    if (this.#isOpen && !close) {
      this.#content.update(this.#value, this.#bounds());
    }
    if (changed && !silent) {
      for (const input of this.#inputs) {
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    if (close) {
      this.close();
    }
  }

  #setInvalid(invalid) {
    this.#root.classList.toggle('is-invalid', invalid);
    this.#trigger.setInvalid(invalid);
  }

  #syncTrigger() {
    this.#trigger.setText(this.#formatted());
  }

  #syncState() {
    const disabled = this.disabled;
    const readOnly = this.#isReadOnly();
    this.#root.classList.toggle('is-disabled', disabled);
    this.#trigger.setState({ disabled, readOnly, required: this.#inputs.some((input) => input.required) });
    if ((disabled || readOnly) && this.#isOpen) {
      this.close({ restoreFocus: false });
    }
  }

  #emit(name) {
    this.element.dispatchEvent(new CustomEvent(`fdp:${name}`, { bubbles: true, detail: { picker: this } }));
  }
}
