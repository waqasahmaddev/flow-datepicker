# Extending

## Plugins

A plugin is a function that receives the class:

```js
function myPlugin(FlowDatepicker, options) {
  FlowDatepicker.modes.register(myMode);
}

FlowDatepicker.use(myPlugin, { some: 'option' });
```

Each plugin runs once.

## Modes are recipes

A mode tells the picker how to read and write its native inputs and what to show in the popover. The built-in modes (`date`, `time`, `datetime`, `range`) use the same shape:

```js
const weekMode = {
  name: 'week',
  trigger: 'field',          // 'field' or 'pill'
  icon: 'calendar',
  dialogLabel: 'chooseDate', // a key of labels
  editable: true,            // false makes the field read-only

  matches(element) { return element.dataset.fdpMode === 'week'; },
  inputs(element) { return [element]; },
  prepare(inputs, options) {},
  readBounds(inputs) { return { min: null, max: null }; },
  read(inputs) { /* native value -> value */ },
  write(value, inputs) { /* value -> native value */ },
  equals(a, b) {},
  serialize(value, picker) {},   // what getValue() returns
  deserialize(value, picker) {}, // what setValue() accepts
  format(value, picker) {},      // text in the trigger
  parse(text, picker) {},        // typed text -> value or null
  placeholder(picker) {},

  build(picker) {
    return {
      element,                    // node or array of nodes for the popover
      update(value, bounds) {},   // called on open and after each change
      preview(value) {},          // optional, while typing
      focus() {}                  // called on Arrow Down from the trigger
    };
  }
};

FlowDatepicker.modes.register(weekMode);
```

`picker` gives the recipe `id`, `locale`, `labels`, `options`, `bounds`, `inputs`, `value`, `commit(value, { close, silent })`, `close()` and `reposition()`.

## Views

The calendar, time row, presets list and footer are registered views you can reuse in your own mode:

```js
const CalendarView = FlowDatepicker.views.get('calendar');
const calendar = new CalendarView({ id: picker.id, locale: picker.locale, labels: picker.labels, months: 1, onPick: (date) => picker.commit(date, { close: true }) });
```

| Name | Use |
|---|---|
| `calendar` | month grid, single day or range, min and max, keyboard |
| `time` | the time row |
| `presets` | the preset list |
| `footer` | a row of text buttons |

## Triggers

`FlowDatepicker.triggers.register(name, Trigger)` adds a trigger next to `field` and `pill`, chosen with `data-fdp-trigger`.
