# JavaScript and modules

## Script tag

`flow-datepicker.min.js` defines a global `FlowDatepicker` and starts every input with `data-flow-datepicker` automatically.

## ES module

`flow-datepicker.esm.min.js` exports the class and does not start anything by itself:

```js
import { FlowDatepicker } from './flow-datepicker.esm.min.js';

FlowDatepicker.init(document);
```

Or start one element with options:

```js
const picker = new FlowDatepicker('#meetingAt', {
  min: 'today',
  hourCycle: 24,
  closeOnSelect: false
});
```

`new FlowDatepicker(element)` returns the existing picker if the element already has one.

## Starting new content

Inputs added after load need a call:

```js
FlowDatepicker.init(container);
```

htmx content is handled for you, see [htmx](/integrations/htmx).

## Changing options later

```js
picker.setOptions({ closeOnSelect: false, labels: { today: 'Heute' } });
```

## Removing

```js
picker.destroy();          // removes the picker, the native input is shown again
FlowDatepicker.destroy(container); // all pickers inside
```

See [Methods and properties](/reference/api) for everything else.
