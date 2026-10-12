# Accessibility

- The trigger has `aria-haspopup="dialog"` and `aria-expanded`, and is named by the input's `<label>` (or `aria-label` / `aria-labelledby`).
- The popover is a `dialog` with a label (`Choose date`, `Choose time`, ...).
- The calendar is a `grid` with one tab stop. Each day has a full label (`Monday, October 12, 2026`), `aria-selected`, `aria-current="date"` for today and `aria-disabled` outside `min` and `max`. The month title is a polite live region, so the new month is announced.
- Time parts are `spinbutton` elements with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`.
- Presets are a `listbox` of `option` elements.
- The range pill is named `Choose date range, Last 7 days`: purpose and value together.
- Focus returns to the trigger when the popover closes. Escape closes the picker before it closes a surrounding modal dialog.
- `required` and invalid state are announced through `aria-required` and `aria-invalid`.
- On touch screens, days are at least 42 px, and tapping the field does not open the on-screen keyboard.
- Animations are off for `prefers-reduced-motion`.
- All texts are inserted as text, never as HTML.
