# Typing dates and times

Date, time and date and time fields are text fields: you can type into them. The text is read when you press <kbd>Enter</kbd> or leave the field. Text that cannot be read goes back to the last value; an empty field clears the value.

While the calendar is open, it follows what you type.

<Demo log>
  <div class="field">
    <label for="ty-date">Date</label>
    <input id="ty-date" type="date" name="date" data-flow-datepicker>
  </div>
  <div class="field">
    <label for="ty-time">Time</label>
    <input id="ty-time" type="time" name="time" data-flow-datepicker>
  </div>
</Demo>

## Dates

Numbers are read in the order of the page language: month, day, year in `en-US`, day, month, year in `en-GB` and `de-DE`. Any separator works.

| Typed (en-US) | Result |
|---|---|
| `10/12/2026` | 2026-10-12 |
| `10/12` | 2026-10-12 (this year) |
| `10/12/26` | 2026-10-12 |
| `Oct 12, 2026` | 2026-10-12 |
| `october 12` | 2026-10-12 |
| `2026-10-12` | 2026-10-12 (ISO always works) |
| `2/30/2026` | not a date, goes back |

Month names are matched in the page language, so `12. März 2026` works on a German page.

The placeholder shows the expected order, for example `mm/dd/yyyy`. Change it with `data-fdp-placeholder`.

## Times

| Typed | Result |
|---|---|
| `9:30` | 09:30 |
| `9:30 pm`, `9:30PM`, `9:30 p.m.` | 21:30 |
| `930` | 09:30 |
| `9` | 09:00 |
| `12 am` | 00:00 |
| `21:30` | 21:30 |

## Date and time

Type the date, then the time: `Dec 24, 2026, 8:00 AM` or `11/3/2026 9:30 pm`. A date alone gets 12:00.

## Range

The range trigger is not a text field. Pick the dates in the calendar or the presets.
