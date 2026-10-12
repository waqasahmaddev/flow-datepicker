# Time

Add `data-flow-datepicker` to an `<input type="time">`.

<Demo log>
  <div class="field">
    <label for="t-time">Start time</label>
    <input id="t-time" type="time" name="startTime" value="12:00" step="300" data-flow-datepicker>
  </div>
</Demo>

```html
<input type="time" name="startTime" value="12:00" step="300" data-flow-datepicker>
```

The popover is one row: hour, minute and AM/PM.

- Hover a part to see its up and down handles.
- <kbd>Arrow Up</kbd> and <kbd>Arrow Down</kbd> step the focused part. The mouse wheel does the same.
- Type digits to set a part. After two digits focus moves to the next part.
- Click AM/PM to switch it, or press <kbd>A</kbd> or <kbd>P</kbd>.
- <kbd>Enter</kbd> or <kbd>Escape</kbd> closes the row.

Going from 11 to 12 switches AM and PM, like a clock.

## Minute step

The native `step` attribute is in seconds. `step="300"` makes the handles move minutes by 5, `step="900"` by 15. Typed minutes accept any value.

## Seconds

A `step` that is not a whole number of minutes (for example `step="1"`) adds a seconds part.

## 24 hour clock

The clock follows the page language. Force it with `data-fdp-hour-cycle="24"` or `"12"`. A 24 hour clock has no AM/PM part.

<Demo>
  <div class="field">
    <label for="t-24">Departure</label>
    <input id="t-24" type="time" name="departure" value="18:30" data-fdp-hour-cycle="24" data-flow-datepicker>
  </div>
</Demo>

## Empty value

An empty time shows `--`. The first step or typed digit starts from the current time, rounded to the step.
