# Methods and properties

## Static

| Member | Description |
|---|---|
| `FlowDatepicker.init(root?, options?)` | starts every `data-flow-datepicker` inside `root` (default `document`) and returns the pickers |
| `FlowDatepicker.get(target)` | the picker of an element or selector, or `null` |
| `FlowDatepicker.destroy(root?)` | destroys every picker inside `root` |
| `FlowDatepicker.autoInit(options?)` | the automatic start used by the script build; `{ root, htmx }` |
| `FlowDatepicker.use(plugin, options?)` | runs a plugin once |
| `FlowDatepicker.modes`, `.views`, `.triggers` | registries, each with `register` and `get` |
| `FlowDatepicker.defaults` | default options |
| `FlowDatepicker.selector` | the selector `init` uses |
| `new FlowDatepicker(target, options?)` | starts one element (or returns its picker) |

## Instance

| Member | Description |
|---|---|
| `getValue()` | the value, see below |
| `setValue(value, { silent })` | sets the value and fires `change` unless `silent` |
| `value` | get or set, same as the two above |
| `clear({ silent })` | empties the value |
| `open()`, `close({ restoreFocus })`, `toggle()` | the popover |
| `isOpen` | `true` while open |
| `focus()` | focuses the trigger |
| `refresh()` | reads the native inputs again after you changed them in code |
| `setOptions(patch)` | changes options, labels and language |
| `destroy({ restore })` | removes the picker; `restore: false` leaves the native input hidden |
| `disabled` | `true` when the native input is disabled |
| `element`, `mode`, `options`, `labels`, `locale` | read only |

## Values

| Mode | `getValue()` returns | `setValue()` accepts |
|---|---|---|
| Date | `'2026-10-12'` or `''` | ISO string, `Date`, `null` |
| Time | `'09:30'` (or `'09:30:15'`) or `''` | ISO string, `{ hours, minutes, seconds }`, `null` |
| Date and time | `'2026-10-12T09:30'` or `''` | ISO string, `Date`, `{ date, time }`, `null` |
| Range | `{ from, to, preset }` | a preset id, `{ from, to }` with ISO strings or `Date`, `null` |

Setting a native input's `value` in code does not fire events. Call `picker.refresh()` afterwards, or use `setValue`.
