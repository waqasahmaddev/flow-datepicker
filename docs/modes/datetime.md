# Date and time

Add `data-flow-datepicker` to an `<input type="datetime-local">`.

<Demo log>
  <div class="field">
    <label for="dt-meeting">Meeting</label>
    <input id="dt-meeting" type="datetime-local" name="meetingAt" value="2026-10-12T12:00" step="300" data-flow-datepicker>
  </div>
</Demo>

```html
<input type="datetime-local" name="meetingAt" step="300" data-flow-datepicker>
```

The popover shows one month and the same [time row](/modes/time) below it.

- Picking a day keeps the time and leaves the popover open, so you can set the time next.
- Changing the time without a day uses today.
- **Now** sets today and the current time, **Clear** empties the field.
- From the calendar, <kbd>Tab</kbd> moves to the time row.

The form posts `meetingAt=2026-10-12T12:00`.

## Typing

The field accepts a date and a time together, for example `Dec 24, 2026, 8:00 AM` or `11/3/2026 9:30 pm`. A date without a time gets 12:00. See [Typing dates and times](/features/typing).

## Time zones

Like `datetime-local`, the value has no time zone. Store the user's zone next to it if your app needs one.
