import { getCurrentAndNext, getCountdown, parseTime } from '../utils/prayerUtils';

// Same order as PRAYERS in prayerUtils — used to build the schedule list.
const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Zawal', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Midnight'];

/**
 * Formats "2h 14m 33s" -> compact widget string.
 * >= 1 hour: "Xh XXm" (no seconds — changes slowly)
 * <  1 hour: "XXm XXs" (no zero-hour prefix)
 */
export function widgetCountdown(full) {
  const m = full.match(/(\d+)h (\d+)m (\d+)s/);
  if (!m) return full;
  const h = parseInt(m[1]);
  if (h >= 1) return `${h}h ${m[2]}m`;
  return `${parseInt(m[2])}m ${m[3]}s`;
}

/**
 * Single source of truth for what the widget displays, shared by the task
 * handler and the in-app requestWidgetUpdate call.
 *
 * Returns { label, hint, countdown, schedule, pivotIndex } where:
 *  - label      : current salah name (or next, pre-Fajr) UPPERCASE
 *  - hint       : "→ NextSalah" (empty pre-Fajr) — always uses next.name (rule #8)
 *  - countdown  : compact countdown to the next salah
 *  - schedule   : ordered [{ name, timeStr, status }] for the day's prayers,
 *                 status ∈ 'past' | 'current' | 'next' | 'future'
 *  - pivotIndex : index the widget windows around (current, or next pre-Fajr)
 */
export function buildWidgetModel(timings) {
  const { current, next } = getCurrentAndNext(timings);

  const label = current ? current.name.toUpperCase() : next.name.toUpperCase();
  const hint = current ? `→ ${next.name}` : '';
  const countdown = widgetCountdown(getCountdown(next.time));

  const now = Date.now();
  const schedule = PRAYER_ORDER
    .filter(name => timings[name])
    .map(name => {
      let status = 'future';
      if (current && name === current.name) status = 'current';
      else if (name === next.name) status = 'next';
      else if (parseTime(timings[name]).getTime() < now) status = 'past';
      return { name, timeStr: timings[name], status };
    });

  let pivotIndex = schedule.findIndex(p => p.status === 'current');
  if (pivotIndex === -1) pivotIndex = schedule.findIndex(p => p.status === 'next');
  if (pivotIndex === -1) pivotIndex = 0;

  return { label, hint, countdown, schedule, pivotIndex };
}
