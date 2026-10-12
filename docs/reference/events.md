# Events

## Native events

Every change fires `input` and then `change` on the native input, bubbling, exactly like a user change on a native input. A range fires both on the start and the end input.

```js
document.querySelector('#publishDate').addEventListener('change', (event) => {
  console.log(event.target.value); // '2026-10-12'
});
```

`setValue(value, { silent: true })` changes the value without events.

## Picker events

Fired on the element with `data-flow-datepicker` (the input, or the range wrapper). They bubble and carry the picker in `event.detail.picker`.

| Event | When |
|---|---|
| `fdp:init` | the picker started |
| `fdp:open` | the popover opened |
| `fdp:close` | the popover closed |
| `fdp:destroy` | the picker was destroyed |

```js
document.addEventListener('fdp:open', (event) => {
  console.log(event.detail.picker.getValue());
});
```

<Demo log>
  <div class="field">
    <label for="e-date">Try it</label>
    <input id="e-date" type="date" name="eventDate" data-flow-datepicker>
  </div>
</Demo>
