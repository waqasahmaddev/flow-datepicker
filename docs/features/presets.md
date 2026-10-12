# Presets

Range pickers show a list of presets. The defaults are:

| Preset | Range |
|---|---|
| Week to date | first day of this week (from the locale) to today |
| Month to date | first day of this month to today |
| Last 7 days | today minus 7 days to today |
| Last 14 days | today minus 14 days to today |
| Last 30 days | today minus 30 days to today |

"Last N days" means today minus N days through today, the same as the MUI X and Ant Design presets. If you want N days including today, use `days: N - 1` in your own list.

When the picked dates match a preset, the trigger shows the preset name and the preset has a check. A preset that falls outside `min` or `max` is greyed out.

## Your own list

Pass a JSON list in `data-fdp-presets`. Each preset is one of:

| Kind | Example | Range |
|---|---|---|
| days back | `{ "label": "Last 90 days", "days": 90 }` | today minus 90 days to today |
| period to date | `{ "label": "Year to date", "period": "year" }` | start of the week, month or year to today |
| fixed dates | `{ "label": "Q3", "from": "2026-07-01", "to": "2026-09-30" }` | those two days |

<Demo>
  <div data-flow-datepicker="range" aria-label="Custom presets" data-fdp-presets='[{ "label": "Today", "days": 0 }, { "label": "Last 90 days", "days": 90 }, { "label": "Year to date", "period": "year" }, { "id": "q3", "label": "Q3 2026", "from": "2026-07-01", "to": "2026-09-30" }]'>
    <input type="date" name="from" aria-label="From">
    <input type="date" name="to" aria-label="To">
  </div>
</Demo>

```html
<div data-flow-datepicker="range" data-fdp-presets='[
  { "label": "Today", "days": 0 },
  { "label": "Last 90 days", "days": 90 },
  { "label": "Year to date", "period": "year" },
  { "id": "q3", "label": "Q3 2026", "from": "2026-07-01", "to": "2026-09-30" }
]'>...</div>
```

The optional `id` is what `getValue().preset` returns and what `setValue('q3')` accepts. Without it the id is `preset-1`, `preset-2` and so on.

## Any rule in JavaScript

A preset can compute its own range. `range` receives today and the locale and returns `[from, to]`:

```js
FlowDatepicker.init(wrapper, {
  presets: [
    {
      id: 'last-month',
      label: 'Last month',
      range: (today) => [
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        new Date(today.getFullYear(), today.getMonth(), 0)
      ]
    },
    {
      id: 'previous-7',
      label: 'Previous 7 days',
      range: (today) => [new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7), new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)]
    }
  ]
});
```

## No presets

`data-fdp-presets="none"` shows the calendar only.

## Presets only

`data-fdp-calendar="custom"` shows only the presets plus a **Custom range** item that opens the calendar. See [Date range](/modes/range#presets-only-calendar-on-demand).

## Translating the default labels

Keep the default list and change only the text with the `labels` option. `{n}` is replaced by the number of days:

```js
FlowDatepicker.init(wrapper, {
  labels: { weekToDate: 'Woche bis heute', monthToDate: 'Monat bis heute', lastDays: 'Letzte {n} Tage' }
});
```
