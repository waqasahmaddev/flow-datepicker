---
layout: home

hero:
  name: flow-datepicker
  text: Dates and times that feel native
  tagline: One light picker for date, time, date and time, and date ranges. It enhances a normal &lt;input&gt;, so your forms keep working. No dependencies.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: See the modes
      link: /modes/date

features:
  - title: Plain HTML first
    details: Add one attribute to an input. The form still posts the same ISO values a native date, time or datetime-local input would.
  - title: Four modes, one library
    details: Date, time, date and time, and a date range with presets. The mode comes from the input type.
  - title: Keyboard first
    details: Arrow keys in the calendar, Page Up and Page Down for months, a time row you can type into, and Escape always closes.
  - title: Every language
    details: Month names, weekdays, week start, 12 or 24 hour clock and typed dates follow the page language through Intl. No locale files.
  - title: No layout shift
    details: The stylesheet draws the plain input at its final size, and the script enhances inputs while the page is parsed.
  - title: Small and themeable
    details: About 14 KB gzipped for all four modes. Neutral grey, light and dark from the page's color-scheme, every value a CSS custom property.
---

<div class="vp-doc" style="max-width: 720px; margin: 48px auto 0; padding: 0 24px">

## Try it

<Demo inline>
  <div data-flow-datepicker="range" data-fdp-max="today" aria-label="Report period">
    <input type="date" name="from" aria-label="From">
    <input type="date" name="to" aria-label="To">
  </div>
  <div class="field" style="flex: 1 1 220px">
    <input type="date" name="publish" aria-label="Publish date" data-flow-datepicker>
  </div>
  <div class="field" style="flex: 1 1 160px">
    <input type="time" name="start" step="300" value="09:30" aria-label="Start time" data-flow-datepicker>
  </div>
</Demo>

</div>
