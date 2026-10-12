import { FlowDatepicker } from './flow-datepicker.js';
import { CalendarView } from './views/calendar-view.js';
import { FooterView } from './views/footer-view.js';
import { PresetsView } from './views/presets-view.js';
import { dateMode } from './modes/date.js';
import { rangeMode } from './modes/range.js';
import { timeMode } from './modes/time.js';
import { datetimeMode } from './modes/datetime.js';
import { TimeView } from './views/time-view.js';

FlowDatepicker.views.register('calendar', CalendarView);
FlowDatepicker.views.register('footer', FooterView);
FlowDatepicker.views.register('presets', PresetsView);
FlowDatepicker.modes.register(dateMode);
FlowDatepicker.views.register('time', TimeView);
FlowDatepicker.modes.register(rangeMode);
FlowDatepicker.modes.register(timeMode);
FlowDatepicker.modes.register(datetimeMode);

export { FlowDatepicker };
export default FlowDatepicker;
