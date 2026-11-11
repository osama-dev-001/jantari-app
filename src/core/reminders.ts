// Plans adhkar and prayer reminder notifications. Pure — the native module
// (src/native/reminders.ts) just registers whatever this returns.
import type { ReminderSettings } from '../store/settings';
import { getDayTimes } from './prayer/engine';
import { FARD, PRAYER_META, type CalcOptions, type City, type DayTimes } from './prayer/types';
import { addDays, formatClock, ymdAt, ymdKey, type TimeFormat } from './time';

const MIN = 60_000;

export type WindowKind = 'morning' | 'evening';
export type Channel = 'adhkar' | 'adhkar_ending' | 'prayer';

export type PlannedReminder = {
  /** Unique per plan; the alarm's identity. */
  id: number;
  /** Notification slot: later reminders in the same window replace earlier ones. */
  notifyId: number;
  at: number;
  title: string;
  body: string;
  channel: Channel;
  link: string;
};

export type Progress = { done: number; total: number };

export type PlanInput = {
  city: City;
  opts: CalcOptions;
  settings: ReminderSettings;
  timeFormat: TimeFormat;
  now: number;
  days?: number;
  /** Adhkar completion for a window on a given day ('YYYY-MM-DD'). */
  progress: (dayKey: string, kind: WindowKind) => Progress;
};

export type AdhkarWindow = { kind: WindowKind; start: number; end: number; endsAt: string };

/** Morning: Fajr → Zawal (Dhuhr where the city has no Zawal). Evening: Asr → Isha. */
export function adhkarWindow(day: DayTimes, kind: WindowKind): AdhkarWindow | null {
  const t = day.times;
  if (kind === 'morning') {
    const end = t.zawal ?? t.dhuhr;
    if (t.fajr === undefined || end === undefined) return null;
    return { kind, start: t.fajr, end, endsAt: t.zawal !== undefined ? 'Zawal' : 'Dhuhr' };
  }
  if (t.asr === undefined || t.isha === undefined) return null;
  return { kind, start: t.asr, end: t.isha, endsAt: 'Isha' };
}

/** Reminder instants inside one window: regular spacing, then frequent near the end. */
export function windowTimes(start: number, end: number, s: ReminderSettings): { at: number; ending: boolean }[] {
  const first = start + s.startAfterMin * MIN;
  const endingStart = s.endingWindowMin > 0 ? Math.max(first, end - s.endingWindowMin * MIN) : end;
  const out: { at: number; ending: boolean }[] = [];
  for (let t = first; t < endingStart; t += s.everyMin * MIN) out.push({ at: t, ending: false });
  if (s.endingWindowMin > 0) {
    for (let t = endingStart; t < end; t += s.endingEveryMin * MIN) {
      // Don't fire a regular reminder moments before the first "ending soon" one.
      const last = out[out.length - 1];
      if (last && !last.ending && t - last.at < 5 * MIN) out.pop();
      out.push({ at: t, ending: true });
    }
  }
  return out;
}

const TITLES: Record<WindowKind, { regular: string; ending: string }> = {
  morning: { regular: 'Morning adhkar · صبح کے اذکار', ending: 'Morning adhkar time is ending' },
  evening: { regular: 'Evening adhkar · شام کے اذکار', ending: 'Evening adhkar time is ending' },
};

export function buildReminderPlan(input: PlanInput): PlannedReminder[] {
  const { city, opts, settings: s, timeFormat, now, days = 7, progress } = input;
  const fmt = (t: number) => formatClock(t, city.tzOffsetMin, { format: timeFormat });
  const today = ymdAt(now, city.tzOffsetMin);
  const out: PlannedReminder[] = [];
  let id = 1000;

  for (let d = 0; d < days; d++) {
    const ymd = addDays(today, d);
    const key = ymdKey(ymd);
    const day = getDayTimes(city, ymd, opts);

    for (const kind of ['morning', 'evening'] as const) {
      if (!s[kind]) continue;
      const win = adhkarWindow(day, kind);
      if (!win) continue;
      const p = progress(key, kind);
      if (s.stopWhenDone && p.total > 0 && p.done >= p.total) continue;
      const tally = d === 0 && p.done > 0 ? ` · ${p.done} of ${p.total} done` : '';
      for (const { at, ending } of windowTimes(win.start, win.end, s)) {
        if (at <= now) continue;
        const left = Math.round((win.end - at) / MIN);
        out.push({
          id: id++,
          notifyId: 100 + d * 10 + (kind === 'morning' ? 1 : 2),
          at,
          title: ending ? TITLES[kind].ending : TITLES[kind].regular,
          body: ending
            ? `${left} min left — ends at ${win.endsAt}, ${fmt(win.end)}${tally}`
            : `Time for your ${kind} adhkar · until ${win.endsAt}, ${fmt(win.end)}${tally}`,
          channel: ending ? 'adhkar_ending' : 'adhkar',
          link: 'islamicdaily://dhikr',
        });
      }
    }

    if (s.prayerAlerts) {
      FARD.forEach((k, i) => {
        const at = day.times[k];
        if (at === undefined || at <= now) return;
        const meta = PRAYER_META[k];
        out.push({
          id: id++,
          notifyId: 200 + d * 10 + i,
          at,
          title: `${meta.en} · ${meta.ur}`,
          body: `It's time for ${meta.en} (${fmt(at)}) in ${city.name}`,
          channel: 'prayer',
          link: 'islamicdaily://today',
        });
      });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}

/** Notification slots for today's windows — used to clear a shown reminder once its adhkar are done. */
export const todaySlot = (kind: WindowKind) => 100 + (kind === 'morning' ? 1 : 2);
