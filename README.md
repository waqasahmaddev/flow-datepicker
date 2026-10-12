# flow-datepicker

A light, keyboard-first date, time and date range picker for plain HTML forms. No dependencies.

> Work in progress. Not released yet. Date, time, date and time, and date range work today.

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

## Options

All options work as `data-fdp-*` attributes or as JS options in `FlowDatepicker.init(element, options)`.

| Attribute | Meaning | Default |
|---|---|---|
| `data-fdp-min`, `data-fdp-max` | `today` or an ISO date, written to the native `min` / `max` | none |
| `data-fdp-close-on-select` | `false` keeps the calendar open after a pick | `true` |
| `data-fdp-presets` | JSON list of presets, or `none` | week and month to date, last 7, 14 and 30 days |
| `data-fdp-months` | months shown in range mode | `2` (1 on narrow screens) |
| `data-fdp-week-start` | first day of the week, `0` (Sunday) to `6` | from the locale |
| `data-fdp-hour-cycle` | `12` or `24` | from the locale |
| `data-fdp-locale` | language tag such as `de-DE` | nearest `lang`, then the browser |
| `data-fdp-placeholder` | placeholder text | a hint such as `mm/dd/yyyy` |
| `data-fdp-trigger` | `field` or `pill` | `pill` for range, `field` otherwise |

The native `step` attribute sets the minute step of the time handles (`step="300"` is 5 minutes).

A preset is `{ "label": "Last 90 days", "days": 90 }`, `{ "label": "Year to date", "period": "year" }` or `{ "label": "Q3", "from": "2026-07-01", "to": "2026-09-30" }`.

## API

```js
const picker = FlowDatepicker.get('#publishDate');
picker.getValue();               // '2026-10-12'
picker.setValue('2026-11-03');
picker.open();
picker.close();
picker.clear();
picker.setOptions({ closeOnSelect: false });
picker.destroy();

FlowDatepicker.get(rangeWrapper).getValue(); // { from: '2026-10-05', to: '2026-10-12', preset: 'last-7-days' }
```

Every change fires the native `input` and `change` events on the inputs. The picker also fires `fdp:open` and `fdp:close`.

## Development

```bash
npm install
npm run build
npm run serve
```

The demo runs at http://localhost:5280/demo/. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
