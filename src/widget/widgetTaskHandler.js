import React from 'react';
import { JantariWidget } from './JantariWidget';
import { vnsData } from '../data/vns';
import { amdData } from '../data/amd';
import { resolveTimings } from '../utils/api';
import { getCurrentAndNext, getCountdown } from '../utils/prayerUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const staticDataMap = { vns: vnsData, amd: amdData };

async function buildAndRender(renderWidget) {
  const cityKey = (await AsyncStorage.getItem('selected_city')) || 'vns';
  const cityLabel = cityKey === 'vns' ? 'Varanasi' : cityKey === 'amd' ? 'Ahmedabad' : cityKey;

  try {
    const timings = await resolveTimings(cityKey, staticDataMap);
    if (!timings) throw new Error('No timings');
    const { current, next } = getCurrentAndNext(timings);

    renderWidget(
      <JantariWidget
        city={cityLabel}
        currentSalah={current?.name || null}
        nextSalah={next.label || next.name}
        nextTime={next.timeStr}
        countdown={getCountdown(next.time)}
      />
    );
  } catch (e) {
    renderWidget(
      <JantariWidget
        city={cityLabel}
        currentSalah={null}
        nextSalah="Open app"
        nextTime="--:-- --"
        countdown="--h --m --s"
      />
    );
  }
}

export async function widgetTaskHandler(props) {
  const { widgetAction, renderWidget } = props;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
    case 'WIDGET_CLICK':
      await buildAndRender(renderWidget);
      break;
    default:
      break;
  }
}