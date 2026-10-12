# Languages and formats

All names and formats come from the browser's built-in `Intl`, so every language works without extra files.

The language is taken from, in this order:

1. the `locale` option or `data-fdp-locale`
2. the nearest `lang` attribute (`<html lang="de">` or any parent)
3. the browser language

<Demo>
  <div lang="de-DE" class="field">
    <label for="lo-de">Startdatum</label>
    <input id="lo-de" type="date" name="startDate" value="2026-03-02" data-flow-datepicker>
  </div>
  <div lang="ar-EG" dir="rtl" class="field">
    <label for="lo-ar">تاريخ البدء</label>
    <input id="lo-ar" type="date" name="startDateAr" value="2026-03-02" data-flow-datepicker>
  </div>
</Demo>

## What follows the language

- month and weekday names, and the month title
- the displayed date (`Oct 12, 2026`, `12.10.2026`)
- the order of typed numbers and the placeholder hint
- the first day of the week
- 12 or 24 hour clock and the AM/PM words
- the screen reader label of each day (`Monday, October 12, 2026`)

## Overrides

| Attribute | Effect |
|---|---|
| `data-fdp-week-start="1"` | first day of the week, `0` Sunday to `6` Saturday |
| `data-fdp-hour-cycle="24"` | `12` or `24` hour clock |
| `data-fdp-locale="en-GB"` | use this language |

The `weekdayLength` option sets the weekday headers: `min` (default, `Su Mo Tu`), `short` (`Sun Mon`), `narrow` (`S M T`) or `long`.

## Right to left

In a `dir="rtl"` page the arrows, the range band and the popover position are mirrored, and <kbd>Arrow Left</kbd> moves to the next day.

## Button texts

The few fixed texts (Today, Clear, Now, the presets, screen reader labels) are English by default. See [Labels and translation](/customization/labels).
