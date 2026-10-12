# Limits and validation

## min and max

Use the native attributes. Days outside the range are dimmed, cannot be picked, and the month arrows and keyboard stop at the limits.

<Demo>
  <div class="field">
    <label for="l-delivery">Delivery date</label>
    <input id="l-delivery" type="date" name="deliveryDate" min="2026-10-05" max="2026-10-20" value="2026-10-12" data-flow-datepicker>
  </div>
</Demo>

```html
<input type="date" name="deliveryDate" min="2026-10-05" max="2026-10-20" data-flow-datepicker>
```

## Relative to today

`data-fdp-min` and `data-fdp-max` accept `today` or an ISO date. The picker writes them to the native `min` and `max`, so browser validation sees them too.

<Demo>
  <div data-flow-datepicker="range" data-fdp-max="today" aria-label="Past period">
    <input type="date" name="from" aria-label="From">
    <input type="date" name="to" aria-label="To">
  </div>
</Demo>

```html
<div data-flow-datepicker="range" data-fdp-max="today">...</div>
<input type="date" name="followUp" data-fdp-min="today" data-flow-datepicker>
```

On a range, the limits apply to both inputs.

## required

`required` stays on the native input, so the browser blocks the submit. The picker marks the field red and sets `aria-invalid` until a value is picked.

<Demo>
  <form onsubmit="event.preventDefault()" style="display:grid;gap:12px;max-width:320px">
    <div>
      <label for="l-required">Start date</label>
      <input id="l-required" type="date" name="startDate" required data-flow-datepicker>
    </div>
    <button type="submit" style="justify-self:start;padding:6px 14px;border:1px solid var(--vp-c-divider);border-radius:8px">Submit</button>
  </form>
</Demo>

## disabled and readonly

Both follow the native input, also when they change later. A disabled or read-only picker does not open.

## Time limits

On time inputs, `min` and `max` are kept on the native input and checked by the browser on submit. The time row does not block values outside them yet.
