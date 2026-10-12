# Changelog

All notable changes are listed here. The project follows [semantic versioning](https://semver.org/).

## 1.0.0 - 2026-10-12

First release.

### Modes

- Date: `<input type="date" data-flow-datepicker>` with a one month calendar, Today and Clear.
- Date range: a wrapper with two date inputs, two months side by side, hover preview of the band, and presets.
- Time: `<input type="time" data-flow-datepicker>` with one time row (hour, minute, optional seconds, AM/PM), up and down handles, arrow keys, mouse wheel and typed digits. Steps carry into the next unit.
- Date and time: `<input type="datetime-local" data-flow-datepicker>` with a calendar, the time row, Now and Clear.

### Features

- The native input stays the source of truth: ISO values, `min`, `max`, `step`, `required`, `disabled`, `readonly`, form reset and the back/forward cache.
- Presets: week and month to date, last 7, 14 and 30 days, or your own list as JSON or JavaScript; `data-fdp-presets="none"`.
- `data-fdp-calendar="custom"`: presets only, with "Custom range" opening the calendar.
- `data-fdp-trigger="field"` for a range in a read-only form field.
- `data-fdp-close-on-select="false"` keeps the popover open after a pick.
- Typed dates and times in the order of the page language.
- Languages through `Intl`: names, week start, 12 or 24 hour clock, right to left.
- Responsive range: two months, one month, or only the calendar, depending on the space; refits on resize.
- Light and dark themes from `color-scheme`, `data-fdp-theme`, Bootstrap `data-bs-theme`, `data-theme` or a `.dark` class; every colour and size is a CSS custom property.
- htmx: swapped content starts by itself and is cleaned up; history restore does not double the picker.
- Keyboard and screen reader support: dialog, grid with one tab stop, spin buttons, listbox.
- No layout shift: the plain input is drawn at its final size and inputs are enhanced while the page is parsed.
- Extensible: mode recipes, shared views (calendar, time, presets, footer), triggers and plugins.

### Builds

- Published on npm as `flow-datepicker` and on jsDelivr and unpkg.
- `flow-datepicker.min.js` (auto start, global `FlowDatepicker`), `flow-datepicker.esm.min.js` (ES module), `flow-datepicker.min.css`, plus unminified files and source maps.
- Size: 14.7 KB gzip JavaScript, 2.8 KB gzip CSS.
