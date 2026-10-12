import { defineConfig } from 'vitepress';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');

export default defineConfig({
  title: 'flow-datepicker',
  description: 'A light, keyboard-first date, time and date range picker for plain HTML forms. No dependencies.',
  base: process.env.DOCS_BASE || '/',
  cleanUrls: true,
  lastUpdated: false,
  head: [['link', { rel: 'icon', href: 'data:,' }]],
  vite: {
    resolve: {
      alias: {
        'flow-datepicker/css': resolve(root, 'src/flow-datepicker.css'),
        'flow-datepicker': resolve(root, 'src/index.js')
      }
    }
  },
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Modes', link: '/modes/date' },
      { text: 'Integrations', link: '/integrations/forms' },
      { text: 'Reference', link: '/reference/options' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'How it works', link: '/guide/how-it-works' }
        ]
      },
      {
        text: 'Modes',
        items: [
          { text: 'Date', link: '/modes/date' },
          { text: 'Date range', link: '/modes/range' },
          { text: 'Time', link: '/modes/time' },
          { text: 'Date and time', link: '/modes/datetime' }
        ]
      },
      {
        text: 'Features',
        items: [
          { text: 'Presets', link: '/features/presets' },
          { text: 'Limits and validation', link: '/features/limits' },
          { text: 'Typing dates and times', link: '/features/typing' },
          { text: 'Languages and formats', link: '/features/localization' }
        ]
      },
      {
        text: 'Integrations',
        items: [
          { text: 'Forms and servers', link: '/integrations/forms' },
          { text: 'htmx', link: '/integrations/htmx' },
          { text: 'JavaScript and modules', link: '/integrations/javascript' }
        ]
      },
      {
        text: 'Customization',
        items: [
          { text: 'Theming', link: '/customization/theming' },
          { text: 'Labels and translation', link: '/customization/labels' },
          { text: 'Extending', link: '/customization/extending' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Options', link: '/reference/options' },
          { text: 'Methods and properties', link: '/reference/api' },
          { text: 'Events', link: '/reference/events' },
          { text: 'Keyboard', link: '/reference/keyboard' },
          { text: 'Accessibility', link: '/reference/accessibility' },
          { text: 'Browser support', link: '/reference/browsers' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/waqasahmaddev/flow-datepicker' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/flow-datepicker' }
    ],
    editLink: {
      pattern: 'https://github.com/waqasahmaddev/flow-datepicker/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    search: { provider: 'local' },
    outline: { level: [2, 3] },
    footer: {
      message: 'Released under the MIT License.'
    }
  }
});
