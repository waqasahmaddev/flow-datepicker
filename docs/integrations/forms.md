# Forms and servers

The picker writes to the native inputs, so the server receives exactly what a native input would send.

| Mode | Example post |
|---|---|
| Date | `publishDate=2026-10-12` |
| Time | `startTime=09:30` (`09:30:15` when `step` has seconds) |
| Date and time | `meetingAt=2026-10-12T09:30` |
| Range | `from=2026-10-05&to=2026-10-12` |
| Empty | the field is sent empty |

These are the standard HTML formats, so model binding works as it does for native inputs in ASP.NET Core (`DateOnly`, `TimeOnly`, `DateTime`), Laravel, Django, Rails and PHP.

## Initial values

Set `value` on the native inputs, in ISO:

```html
<input type="date" name="publishDate" value="2026-10-12" data-flow-datepicker>
<div data-flow-datepicker="range">
  <input type="date" name="from" value="2026-10-05">
  <input type="date" name="to" value="2026-10-12">
</div>
```

## Reset and Back button

`form.reset()` puts the native values back and the picker follows. When the browser restores a page from its back/forward cache, the picker reads the native values again.

## Labels

A `<label for>` that points at the native input names the picker field, and clicking it focuses the picker. For a range, put `aria-label` or `aria-labelledby` on the wrapper.

## Reading values in JavaScript

Read the native input as usual (`input.value`), or ask the picker:

```js
FlowDatepicker.get('#publishDate').getValue(); // '2026-10-12'
```
