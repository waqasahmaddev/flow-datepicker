# Browser support

| Browser | Version | Status |
|---|---|---|
| Chrome, Edge | 123 and newer | supported, fully tested |
| Firefox | 125 and newer | supported, fully tested |
| Safari (macOS, iOS) | 17.5 and newer | works, basic tests only |
| Chrome on Android | current | supported, tested on a phone emulator |

"Fully tested" means the whole automated suite (keyboard, ranges, presets, time row, forms, htmx, themes, right to left, modal dialogs, memory and layout shift) runs in that browser. In Safari only the main flows are tested: opening, picking, keyboard basics, form posts and themes.

The library uses the popover API (with a fallback), `light-dark()` and `Intl`. It needs no polyfills in the versions above.

## Size

| File | Minified | Gzip |
|---|---|---|
| `flow-datepicker.min.js` | 43 KB | 14.4 KB |
| `flow-datepicker.min.css` | 11 KB | 2.8 KB |
