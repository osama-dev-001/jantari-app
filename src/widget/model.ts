import { getPrayerState, statusOf } from '../core/prayer/engine';
import { PRAYER_META, PRAYER_ORDER, type PrayerStatus } from '../core/prayer/types';
import { formatClock, formatCountdownCompact } from '../core/time';
import { getCity } from '../data/cities';
import { calcOptionsOf, type Settings } from '../store/settings';

export type WidgetRow = { name: string; time: string; status: PrayerStatus };

export type WidgetModel = {
  /** Current period, uppercase ("ASR"). Before the first entry of the day it is the next one. */
  label: string;
  /** "→ Maghrib" — always the plain name, never a long label (it would overflow). */
  hint: string;
  countdown: string;
  rows: WidgetRow[];
  /** Row index the list window centres on. */
  pivot: number;
};

export const EMPTY_WIDGET: WidgetModel = { label: '—', hint: '', countdown: '--:--', rows: [], pivot: 0 };

export function buildWidgetModel(settings: Settings, now: number): WidgetModel {
  const city = getCity(settings.cityId);
  const state = getPrayerState(city, now, calcOptionsOf(settings));
  const { current, next } = state;
  if (!next) return EMPTY_WIDGET;

  const nextName = PRAYER_META[next.key].en;
  const rows: WidgetRow[] = PRAYER_ORDER.filter(k => state.todayTimes.times[k] !== undefined).map(k => ({
    name: PRAYER_META[k].en,
    time: formatClock(state.todayTimes.times[k]!, city.tzOffsetMin, { format: settings.timeFormat }),
    status: statusOf(state, k, now),
  }));
  let pivot = rows.findIndex(r => r.status === 'current');
  if (pivot < 0) pivot = Math.max(0, rows.findIndex(r => r.status === 'next'));

  return {
    label: (current ? PRAYER_META[current.key].en : nextName).toUpperCase(),
    hint: current ? `→ ${nextName}` : '',
    countdown: formatCountdownCompact(next.at - now),
    rows,
    pivot,
  };
}
