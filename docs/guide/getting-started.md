# Getting started

## Add the files

flow-datepicker is published on GitHub. Download `flow-datepicker.min.js` and `flow-datepicker.min.css` from the [latest release](https://github.com/waqasahmaddev/flow-datepicker/releases/latest) (the zip has every build and the source maps), or build them yourself:

```bash
git clone https://github.com/waqasahmaddev/flow-datepicker.git
cd flow-datepicker
npm install
npm run build
```

The files land in `dist/`. Put both in the `<head>`:

```html
<link rel="stylesheet" href="/css/flow-datepicker.min.css">
<script src="/js/flow-datepicker.min.js"></script>
```

Loading the script in the `<head>` (without `defer`) lets it enhance each input while the page is parsed, so nothing moves on screen.

## Mark the inputs

```html
<input type="date" name="publishDate" data-flow-datepicker>
<input type="time" name="startTime" step="300" data-flow-datepicker>
<input type="datetime-local" name="meetingAt" data-flow-datepicker>

<div data-flow-datepicker="range">
  <input type="date" name="from">
  <input type="date" name="to">
</div>
```

That is all. Every input with `data-flow-datepicker` starts by itself, also inputs added later by htmx.

<Demo>
  <div class="field">
    <label for="g-date">Publish date</label>
    <input id="g-date" type="date" name="publishDate" data-flow-datepicker>
  </div>
  <div class="field">
    <label for="g-time">Start time</label>
    <input id="g-time" type="time" name="startTime" step="300" data-flow-datepicker>
  </div>
</Demo>

## Start inputs yourself

Use `data-flow-datepicker="manual"` to skip the automatic start and create the picker in your own code:

```js
const picker = new FlowDatepicker('#publishDate', { min: 'today' });
```

See [JavaScript and modules](/integrations/javascript) for the ES module build.
