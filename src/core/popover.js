const GAP_PX = 6;
const MARGIN_PX = 8;

export const supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

function viewport() {
  const visual = window.visualViewport;
  if (visual) {
    return { top: visual.offsetTop, left: visual.offsetLeft, width: visual.width, height: visual.height };
  }
  return { top: 0, left: 0, width: document.documentElement.clientWidth, height: window.innerHeight };
}

export function preparePopover(popover) {
  if (supportsPopover) {
    popover.setAttribute('popover', 'manual');
  } else {
    popover.hidden = true;
  }
}

export function showPopover(popover) {
  try {
    popover.showPopover();
  } catch {
    popover.hidden = false;
  }
}

export function hidePopover(popover) {
  if (supportsPopover && popover.matches(':popover-open')) {
    popover.hidePopover();
  }
  if (!supportsPopover) {
    popover.hidden = true;
  }
}

export function positionPopover(popover, anchor, { rtl = false } = {}) {
  const rect = anchor.getBoundingClientRect();
  const view = viewport();
  const style = popover.style;
  const below = view.top + view.height - rect.bottom - GAP_PX - MARGIN_PX;
  const above = rect.top - view.top - GAP_PX - MARGIN_PX;
  const height = popover.offsetHeight;
  const width = popover.offsetWidth;
  const placeBelow = height <= below || below >= above;
  const wanted = placeBelow ? rect.bottom + GAP_PX : rect.top - GAP_PX - height;
  const top = Math.max(view.top + MARGIN_PX, Math.min(wanted, view.top + view.height - MARGIN_PX - height));
  const preferred = rtl ? rect.right - width : rect.left;
  const left = Math.max(view.left + MARGIN_PX, Math.min(preferred, view.left + view.width - MARGIN_PX - width));
  style.top = `${Math.round(top)}px`;
  style.left = `${Math.round(left)}px`;
  popover.dataset.placement = placeBelow ? 'bottom' : 'top';
}
