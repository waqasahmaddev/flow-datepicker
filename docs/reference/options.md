# Options

Every option can be set as a `data-fdp-*` attribute or as a JS option in `new FlowDatepicker(element, options)` / `FlowDatepicker.init(root, options)`. Attribute names are the option names in kebab case.

| Option | Attribute | Values | Default |
|---|---|---|---|
| `mode` | `data-fdp-mode` | `date`, `time`, `datetime`, `range` or a registered mode | from the input type |
| `trigger` | `data-fdp-trigger` | `field`, `pill` | `pill` for range, `field` otherwise |
| `min`, `max` | `data-fdp-min`, `data-fdp-max` | `today`, an ISO date or a `Date` | none |
| `closeOnSelect` | `data-fdp-close-on-select` | `true`, `false` | `true` |
| `calendar` | `data-fdp-calendar` | `always`, `custom` (range only) | `always` |
| `presets` | `data-fdp-presets` | JSON list, `none`, or a JS array | five defaults |
| `months` | `data-fdp-months` | number of months in range mode | `2`, `1` on narrow screens |
| `locale` | `data-fdp-locale` | a language tag such as `de-DE` | nearest `lang`, then the browser |
| `weekStart` | `data-fdp-week-start` | `0` (Sunday) to `6` | from the locale |
| `hourCycle` | `data-fdp-hour-cycle` | `12`, `24` | from the locale |
| `weekdayLength` | `data-fdp-weekday-length` | `min`, `short`, `narrow`, `long` | `min` |
| `placeholder` | `data-fdp-placeholder` | any text | a format hint |
| `labels` | (JS only) | object, see [Labels](/customization/labels) | English |

## Native attributes

| Attribute | Effect |
|---|---|
| `type` | picks the mode |
| `value` | the starting value, in ISO |
| `min`, `max` | limits for days (and for the browser's own validation) |
| `step` | minute step of the time handles, in seconds; seconds part when not whole minutes |
| `required` | browser validation, the field turns red when empty on submit |
| `disabled`, `readonly` | the picker does not open |
| `name` | posted as usual |

## Starting

| Attribute | Effect |
|---|---|
| `data-flow-datepicker` | start automatically |
| `data-flow-datepicker="range"` | on a wrapper with two date inputs |
| `data-flow-datepicker="manual"` | do not start automatically |

## Defaults for all pickers

```js
FlowDatepicker.defaults.closeOnSelect = false;
FlowDatepicker.defaults.labels.today = 'Heute';
```

Change them before the pickers start (with the ES module build, before `init`).
