# Labels and translation

The picker has a few fixed texts. Change them with the `labels` option:

```js
FlowDatepicker.init(document, {
  labels: {
    today: 'Heute',
    clear: 'Leeren',
    now: 'Jetzt',
    previousMonth: 'Vorheriger Monat',
    nextMonth: 'Nächster Monat'
  }
});
```

Labels can also be set per picker with `new FlowDatepicker(element, { labels })` or `picker.setOptions({ labels })`.

| Label | Default | Where |
|---|---|---|
| `chooseDate` | Choose date | popover and icon name, date mode |
| `chooseTime` | Choose time | time mode |
| `chooseDateTime` | Choose date and time | date and time mode |
| `chooseRange` | Choose date range | range mode |
| `previousMonth`, `nextMonth` | Previous month, Next month | month arrows |
| `selectRange` | Select dates | empty range trigger |
| `presets` | Presets | presets list name |
| `weekToDate`, `monthToDate`, `yearToDate` | Week to date, ... | default presets |
| `lastDays` | Last {n} days | default presets, `{n}` is the number |
| `customRange` | Custom range | with `calendar: 'custom'` |
| `today`, `now`, `clear` | Today, Now, Clear | footer buttons |
| `hour`, `minute`, `second`, `dayPeriod` | Hour, Minute, Second, AM/PM | time parts for screen readers |

Month and weekday names, dates and AM/PM come from the page language and need no labels. See [Languages and formats](/features/localization).

All labels are inserted as text, never as HTML.
