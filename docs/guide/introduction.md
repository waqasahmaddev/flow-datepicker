# Introduction

flow-datepicker turns a normal `<input type="date">`, `<input type="time">` or `<input type="datetime-local">` into a picker that looks the same in every browser, and adds a date range picker with presets.

<Demo>
  <div class="field">
    <label for="i-date">Publish date</label>
    <input id="i-date" type="date" name="publishDate" data-flow-datepicker>
  </div>
</Demo>

## Why another date picker

- **The input stays real.** The native input keeps its name, value, `min`, `max`, `step`, `required` and `disabled`. Forms post exactly what they posted before, form reset and the Back button work, and if the script never loads the browser's own picker still works.
- **One look everywhere.** Native date inputs look different in each browser and cannot be styled. flow-datepicker draws the same field, calendar and time row everywhere.
- **Light.** No dependencies, no locale files, about 14 KB gzipped for all four modes.
- **Keyboard and screen reader friendly.** The calendar is a grid with one tab stop, the time parts are spin buttons and the popover is a labelled dialog.

## What you get

| Mode | Markup | Posts |
|---|---|---|
| [Date](/modes/date) | `<input type="date" data-flow-datepicker>` | `2026-10-12` |
| [Date range](/modes/range) | `<div data-flow-datepicker="range">` with two date inputs | two fields |
| [Time](/modes/time) | `<input type="time" data-flow-datepicker>` | `09:30` |
| [Date and time](/modes/datetime) | `<input type="datetime-local" data-flow-datepicker>` | `2026-10-12T09:30` |

Next: [Getting started](/guide/getting-started).
