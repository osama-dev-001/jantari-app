import React from 'react';
import { vnsData } from '../data/vns';
import { amdData } from '../data/amd';
import { resolveTimings } from '../utils/api';
import { getCurrentAndNext, getCountdown } from '../utils/prayerUtils';
import { JantariWidget } from './JantariWidget';
import AsyncStorage from '@react-native-async-storage/async-storage';

const staticDataMap = { vns: vnsData, amd: amdData };

async function buildWidgetProps() {
  // Read last selected city from storage (set by the app)
  const cityKey = (await AsyncStorage.getItem('selected_city')) || 'vns';
  const cityLabel = cityKey === 'vns' ? 'Varanasi' : cityKey === 'amd' ? 'Ahmedabad' : cityKey;

  try {
    const timings = await resolveTimings(cityKey, staticDataMap);
    if (!timings) throw new Error('No timings');

    const { current, next } = getCurrentAndNext(timings);
    const countdown = getCountdown(next.time);

    return {
      city: cityLabel,
      currentSalah: current?.name || null,
      nextSalah: next.label || next.name,
      nextTime: next.timeStr,
      countdown,
    };
  } catch (e) {
    return {
      city: cityLabel,
      currentSalah: null,
      nextSalah: '---',
      nextTime: '--:-- --',
      countdown: '--h --m --s',
    };
  }
}

export async function widgetTaskHandler(props) {
  const { widgetAction, widgetInfo, renderWidget } = props;

  console.log('Widget task called:', widgetAction, JSON.stringify(widgetInfo));

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      renderWidget(
        <JantariWidget
          city="---"
          currentSalah={null}
          nextSalah="Open app"
          nextTime="--:-- --"
          countdown="--h --m --s"
        />
      );
      break;
    }
    default:
      break;
  }
}