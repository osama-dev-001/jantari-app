import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildReminderPlan, todaySlot, type Progress, type WindowKind } from '../core/reminders';
import { ymdAt, ymdKey } from '../core/time';
import { FAVOURITES } from '../data/adhkar';
import { getCity } from '../data/cities';
import { nativeReminders } from '../native/reminders';
import { dhikrStore } from './progress';
import { calcOptionsOf, settingsStore } from './settings';

const SYNCED_AT = 'v2:reminders-synced-at';

/** "Done" means every Favourite for that time of day is complete (as on the Today screen). */
function progressFor(dayKey: string, kind: WindowKind): Progress {
  const items = FAVOURITES.filter(d => d.time === kind);
  const counts = dhikrStore.get()[dayKey] ?? {};
  return { done: items.filter(d => (counts[d.id] ?? 0) >= d.count).length, total: items.length };
}

/**
 * Rebuilds the next week of reminders from current settings and progress and
 * hands them to the native scheduler (which replaces whatever was pending).
 */
export async function syncReminders(now = Date.now()): Promise<number> {
  if (!nativeReminders.available) return 0;
  const s = settingsStore.get();
  const r = s.reminders;
  const city = getCity(s.cityId);
  const plan =
    r.morning || r.evening || r.prayerAlerts
      ? buildReminderPlan({ city, opts: calcOptionsOf(s), settings: r, timeFormat: s.timeFormat, now, progress: progressFor })
      : [];
  const count = await nativeReminders.schedule(plan);

  // A reminder already showing for a window that is now complete is just noise.
  const today = ymdKey(ymdAt(now, city.tzOffsetMin));
  const done = (['morning', 'evening'] as const).filter(k => {
    const p = progressFor(today, k);
    return p.total > 0 && p.done >= p.total;
  });
  if (done.length) nativeReminders.dismiss(done.map(todaySlot));

  AsyncStorage.setItem(SYNCED_AT, String(now)).catch(() => {});
  return count;
}

/** For background callers (widget task): resync at most every few hours so the week stays filled. */
export async function syncRemindersIfStale(maxAgeMs = 6 * 3600_000) {
  const last = Number((await AsyncStorage.getItem(SYNCED_AT)) ?? 0);
  if (Date.now() - last < maxAgeMs) return;
  await Promise.all([settingsStore.load(), dhikrStore.load()]);
  await syncReminders();
}
