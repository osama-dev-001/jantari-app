import React from 'react';
import { requestWidgetUpdate, type WidgetTaskHandlerProps } from 'react-native-android-widget';
import { syncRemindersIfStale } from '../store/reminderSync';
import { settingsStore } from '../store/settings';
import { buildWidgetModel, EMPTY_WIDGET } from './model';
import { PrayerWidget } from './PrayerWidget';

// Must match the native provider (android/.../widget/Jantari.java) and its
// xml — renaming it would orphan widgets users have already placed.
export const WIDGET_NAME = 'Jantari';

async function render(props: WidgetTaskHandlerProps) {
  const { width, height } = props.widgetInfo;
  try {
    await settingsStore.load();
    props.renderWidget(<PrayerWidget width={width} height={height} {...buildWidgetModel(settingsStore.get(), Date.now())} />);
  } catch {
    props.renderWidget(<PrayerWidget width={width} height={height} {...EMPTY_WIDGET} />);
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
    case 'WIDGET_CLICK': // the ↻ button (clickAction "REFRESH")
      await render(props);
      // The widget's periodic wake-up also keeps the week of reminders topped up.
      await syncRemindersIfStale().catch(() => {});
      break;
    default:
      break;
  }
}

/** Pushes fresh content to every placed widget; called by the app while it's open. */
export function refreshWidgets() {
  const model = buildWidgetModel(settingsStore.get(), Date.now());
  return requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: info => <PrayerWidget width={info.width} height={info.height} {...model} />,
    widgetNotFound: () => {},
  }).catch(() => {});
}
