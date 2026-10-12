# flow-datepicker

A light, keyboard-first date, time and date range picker for plain HTML forms. No dependencies.

> Work in progress. Not released yet.

## Goals

- One library for four modes: date, time, date and time, and date range with presets.
- The native `<input>` stays the source of truth. Forms post exactly what the native input would (`2026-10-12`, `09:30`, `2026-10-12T09:30`).
- The mode comes from the input `type`. `min`, `max`, `step` and `required` are read from the native attributes.
- If the script does not load, the browser's own picker still works.
- Full keyboard and screen reader support.
- Light and dark themes through `color-scheme`, every colour and size is a CSS custom property.
- Works with htmx out of the box.

## Planned usage

```html
<link rel="stylesheet" href="flow-datepicker.min.css">
<script src="flow-datepicker.min.js"></script>

<input type="date" name="publishDate" data-flow-datepicker>
<input type="time" name="startTime" step="300" data-flow-datepicker>
<input type="datetime-local" name="meetingAt" data-flow-datepicker>

<div data-flow-datepicker="range">
  <input type="date" name="from">
  <input type="date" name="to">
</div>
```

## Development

```bash
npm install
npm run build
npm run serve
```

The demo runs at http://localhost:5280/demo/. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
