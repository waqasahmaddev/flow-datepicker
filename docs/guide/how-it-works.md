# How it works

## The native input stays the source of truth

flow-datepicker never replaces your input. It hides it in place (it stays in the form and keeps its name and value) and inserts the picker right after it. Every change writes the ISO value back to the native input and fires the native `input` and `change` events.

That is why these keep working without extra code:

- form posts and `FormData`
- `form.reset()` and the browser Back button
- `required`, `min`, `max` and `step` validation
- frameworks and libraries that listen for `change`

If the script does not load, the browser shows its own date input.

## The mode comes from the input type

| `type` | Mode |
|---|---|
| `date` | [Date](/modes/date) |
| `time` | [Time](/modes/time) |
| `datetime-local` | [Date and time](/modes/datetime) |
| a wrapper with `data-flow-datepicker="range"` | [Date range](/modes/range) |

The type is read from the attribute you wrote, so the picker also works in browsers that do not support a native date input.

## Values are ISO, text is local

What the form posts is always ISO (`2026-10-12`, `09:30`, `2026-10-12T09:30`). What people see and type follows the page language: `Oct 12, 2026` in English, `12.10.2026` in German. Your server never has to parse local formats.

## Built from small parts

Each mode is a small recipe that combines shared views: the calendar, the time row and the presets list. The calendar is built when the pointer first moves over the field or the field gets focus, so opening is instant. See [Extending](/customization/extending) to add your own mode.
