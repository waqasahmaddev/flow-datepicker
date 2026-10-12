import DefaultTheme from 'vitepress/theme';
import 'flow-datepicker/css';
import './custom.css';
import Demo from './Demo.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Demo', Demo);
  }
};
