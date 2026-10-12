# Date

Add `data-flow-datepicker` to an `<input type="date">`.

<Demo log>
  <div class="field">
    <label for="d-date">Publish date</label>
    <input id="d-date" type="date" name="publishDate" value="2026-10-12" data-flow-datepicker>
  </div>
</Demo>

```html
<input type="date" name="publishDate" value="2026-10-12" data-flow-datepicker>
```

- Click the field or press <kbd>Arrow Down</kbd> to open the calendar.
- Pick a day with the mouse, or with the arrow keys and <kbd>Enter</kbd>.
- **Today** picks today, **Clear** empties the field.
- You can also type a date into the field. See [Typing dates and times](/features/typing).

The form posts `publishDate=2026-10-12`.

## Keep the calendar open

By default the calendar closes after a pick. Add `data-fdp-close-on-select="false"` to keep it open:

<Demo>
  <div class="field">
    <label for="d-open">Review date</label>
    <input id="d-open" type="date" name="reviewDate" data-fdp-close-on-select="false" data-flow-datepicker>
  </div>
</Demo>

## Limits

Use the native `min` and `max`, or `data-fdp-min` / `data-fdp-max` with `today`. See [Limits and validation](/features/limits).
