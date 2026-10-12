# Contributing

Thanks for helping. Bug reports, ideas and pull requests are all welcome.

## Setup

```bash
git clone https://github.com/waqasahmaddev/flow-datepicker.git
cd flow-datepicker
npm install
npm run build
```

## Useful commands

| Command | What it does |
|---|---|
| `npm run build` | Builds `dist/` and prints the bundle sizes |
| `npm run watch` | Rebuilds `dist/` on every change |
| `npm run serve` | Demo page with a form echo endpoint at http://localhost:5280/demo/ |
| `npm test` | Runs the Playwright tests |
| `npm run docs:dev` | Documentation site with live demos at http://localhost:5290/ |

Install the test browsers once with `npx playwright install`.

## Guidelines

- Keep it dependency free and small. Check the size with `npm run build` before and after.
- The native `<input>` stays the source of truth. Forms must keep posting what a native input would.
- Keyboard and screen reader behaviour follow the WAI-ARIA date picker dialog pattern. Add a test for any key behaviour you change.
- A new mode is a recipe over the existing views. Prefer adding a recipe or a view over changing an existing one.
- Colours and sizes are CSS custom properties, so users can theme without editing the stylesheet.
- Use only generic sample data in demos and tests.

## Reporting a bug

Open an issue with the browser and version, a minimal HTML example, what you expected and what happened.
