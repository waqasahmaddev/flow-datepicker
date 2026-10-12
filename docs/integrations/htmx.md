# htmx

flow-datepicker works with htmx without extra code.

- **Swapped content starts by itself.** Inputs with `data-flow-datepicker` inside content swapped in by htmx are enhanced on `htmx:load`.
- **Swapped-out content is cleaned up.** Pickers inside removed content are destroyed on `htmx:beforeCleanupElement`.
- **History restore.** When htmx restores a page snapshot, the stale copy of the picker is removed and a fresh one starts, so nothing is doubled.
- **Native events.** Every change fires `input` and `change` on the native input, so `hx-trigger="change"` works:

```html
<form hx-get="/reports" hx-target="#report" hx-trigger="change">
  <div data-flow-datepicker="range" data-fdp-max="today">
    <input type="date" name="from">
    <input type="date" name="to">
  </div>
</form>
```

A range fires `change` on both inputs. With `hx-trigger="change"` on the form, add `delay:10ms` or use `hx-sync` if you want a single request.

## Turning it off

The automatic start uses `FlowDatepicker.autoInit()`. Load the ES module build and call `autoInit({ htmx: false })` yourself to skip the htmx hooks.
