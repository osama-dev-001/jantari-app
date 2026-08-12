import React from 'react';
import { JantariWidget } from './JantariWidget';
import { vnsData } from '../data/vns';
import { amdData } from '../data/amd';
import { resolveTimings } from '../utils/api';
import { buildWidgetModel } from './widgetData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const staticDataMap = { vns: vnsData, amd: amdData };

async function buildAndRender(renderWidget, widgetInfo) {
  const width = widgetInfo?.width;
  const height = widgetInfo?.height;
  const cityKey = (await AsyncStorage.getItem('selected_city')) || 'vns';

  try {
    const timings = await resolveTimings(cityKey, staticDataMap);
    if (!timings) throw new Error('No timings');

    renderWidget(
      <JantariWidget width={width} height={height} {...buildWidgetModel(timings)} />
    );
  } catch (e) {
    renderWidget(
      <JantariWidget
        width={width}
        height={height}
        label="-"
        hint=""
        countdown="--:--"
        schedule={[]}
      />
    );
  }
}

export async function widgetTaskHandler(props) {
  const { widgetAction, widgetInfo, renderWidget } = props;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
    case 'WIDGET_CLICK':
      await buildAndRender(renderWidget, widgetInfo);
      break;
    default:
      break;
  }
}
