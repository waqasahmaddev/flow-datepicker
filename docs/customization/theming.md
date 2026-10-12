# Theming

## Light and dark

The picker follows the `color-scheme` of the page. It picks it up from:

| Page uses | Result |
|---|---|
| `data-fdp-theme="dark"`, `"light"` or `"auto"` on any ancestor | that theme |
| Bootstrap `data-bs-theme="dark"` / `"light"` | that theme |
| `data-theme="dark"` / `"light"` | that theme |
| `.dark` class on `<html>` (Tailwind, VitePress) | dark |
| CSS `color-scheme` | that theme |
| nothing | light |

The nearest ancestor wins, so a light card inside a dark page works.

## Custom properties

Every colour and size is a CSS custom property declared with zero specificity, so you can override it anywhere: on `:root`, on a wrapper, or inline on the input.

```css
:root {
  --fdp-cap-bg: #673de6;
  --fdp-cap-text: #fff;
  --fdp-band-bg: light-dark(#ede7fd, #2d2347);
}
```

```html
<input type="date" style="--fdp-radius: 0.5em" data-flow-datepicker>
```

### Colours

| Property | Used for |
|---|---|
| `--fdp-popover-bg` | popover background |
| `--fdp-field-bg` | field background |
| `--fdp-field-border`, `--fdp-field-border-focus` | field border |
| `--fdp-focus-ring` | soft ring around a focused field |
| `--fdp-outline` | keyboard focus outline |
| `--fdp-line` | borders and dividers |
| `--fdp-text`, `--fdp-muted`, `--fdp-disabled` | text |
| `--fdp-hover-bg` | hovered rows and days |
| `--fdp-selected-bg` | selected preset, focused time part |
| `--fdp-band-bg` | range band |
| `--fdp-cap-bg`, `--fdp-cap-text` | selected day circle |
| `--fdp-danger` | invalid field border |
| `--fdp-shadow` | popover shadow |

Use `light-dark(light, dark)` to set both themes at once.

### Sizes

Sizes are in `em` of `--fdp-font-size` (default `0.875rem`), so changing that one value scales the whole popover.

| Property | Default |
|---|---|
| `--fdp-font-size` | `0.875rem` |
| `--fdp-field-width`, `--fdp-field-height`, `--fdp-field-pad` | `100%`, `2.5em`, `0.75em` |
| `--fdp-radius` | popover corner radius |
| `--fdp-control-radius`, `--fdp-row-radius`, `--fdp-band-radius` | field, rows, band |
| `--fdp-day-size`, `--fdp-day-column`, `--fdp-row-gap` | calendar grid |
| `--fdp-month-gap`, `--fdp-month-padding` | two-month layout |
| `--fdp-pill-height` | pill trigger |
| `--fdp-presets-width`, `--fdp-preset-height` | presets list |
| `--fdp-time-height`, `--fdp-meridiem-width` | time row |

## Layout classes

Width and margin classes on the input (`w-50`, `mb-3`, `col-6`) and inline `width` / `margin` are copied to the picker.
