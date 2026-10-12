# Date range

Wrap two date inputs in an element with `data-flow-datepicker="range"`. The first input is the start, the second the end.

<Demo log>
  <div data-flow-datepicker="range" data-fdp-max="today" aria-label="Report period">
    <input type="date" name="from" aria-label="From">
    <input type="date" name="to" aria-label="To">
  </div>
</Demo>

```html
<div data-flow-datepicker="range" data-fdp-max="today" aria-label="Report period">
  <input type="date" name="from" aria-label="From">
  <input type="date" name="to" aria-label="To">
</div>
```

- Click a start day, move the pointer to preview the band, click an end day. Clicking the end first works too.
- With the keyboard: <kbd>Enter</kbd> sets the start, the arrow keys preview, <kbd>Enter</kbd> sets the end.
- The list on the left holds [presets](/features/presets). When the dates match a preset, the trigger shows its name.

The form posts `from=2026-10-05&to=2026-10-12`.

## Presets only, calendar on demand

With `data-fdp-calendar="custom"` the popover shows only the presets and a **Custom range** item. Choosing it opens the calendar in the same popover.

<Demo>
  <div data-flow-datepicker="range" data-fdp-calendar="custom" data-fdp-max="today" aria-label="Stats period">
    <input type="date" name="statsFrom" aria-label="Stats from">
    <input type="date" name="statsTo" aria-label="Stats to">
  </div>
</Demo>

```html
<div data-flow-datepicker="range" data-fdp-calendar="custom">...</div>
```

When the saved dates match no preset, the picker opens with the calendar already shown.

## In a normal field

The default trigger is a pill for filter bars. Use `data-fdp-trigger="field"` for a read-only field that looks like the other form inputs:

<Demo>
  <div class="field">
    <label id="r-campaign">Campaign dates</label>
    <div data-flow-datepicker="range" data-fdp-trigger="field" aria-labelledby="r-campaign">
      <input type="date" name="campaignFrom" aria-label="Campaign from">
      <input type="date" name="campaignTo" aria-label="Campaign to">
    </div>
  </div>
</Demo>

## Months shown

Two months are shown side by side, one on narrow screens. Set `data-fdp-months="1"` to always show one.

## Keep it open

`data-fdp-close-on-select="false"` keeps the popover open after a range or a preset is picked.

## Value

```js
FlowDatepicker.get(wrapper).getValue();
// { from: '2026-10-05', to: '2026-10-12', preset: 'last-7-days' }

picker.setValue('last-30-days');
picker.setValue({ from: '2026-07-01', to: '2026-09-30' });
```
