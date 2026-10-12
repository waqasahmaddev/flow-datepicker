import { FlowDatepicker } from './flow-datepicker.js';
import { CalendarView } from './views/calendar-view.js';
import { FooterView } from './views/footer-view.js';
import { dateMode } from './modes/date.js';

FlowDatepicker.views.register('calendar', CalendarView);
FlowDatepicker.views.register('footer', FooterView);
FlowDatepicker.modes.register(dateMode);

export { FlowDatepicker };
export default FlowDatepicker;
