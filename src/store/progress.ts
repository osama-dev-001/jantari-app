import AsyncStorage from '@react-native-async-storage/async-storage';
import { FARD, type PrayerKey } from '../core/prayer/types';
import { addDays, ymdKey, type YMD } from '../core/time';
import { createPersistedStore, isRecord, useStore } from './persisted';

const KEEP_DAYS = 90;

/** Drops day entries older than KEEP_DAYS so the stores don't grow forever. */
function prune<V>(log: Record<string, V>, today: YMD): Record<string, V> {
  const cutoff = ymdKey(addDays(today, -KEEP_DAYS));
  const out: Record<string, V> = {};
  for (const [k, v] of Object.entries(log)) if (k >= cutoff) out[k] = v;
  return out;
}

const isDateKey = (k: string) => /^\d{4}-\d{2}-\d{2}$/.test(k);

// ─── Dhikr counts: { 'YYYY-MM-DD': { [dhikrId]: count } } ────────────────────

export type DhikrLog = Record<string, Record<string, number>>;

function sanitizeDhikr(raw: unknown): DhikrLog {
  const out: DhikrLog = {};
  if (!isRecord(raw)) return out;
  for (const [day, counts] of Object.entries(raw)) {
    if (!isDateKey(day) || !isRecord(counts)) continue;
    out[day] = {};
    for (const [id, n] of Object.entries(counts)) {
      if (typeof n === 'number' && n >= 0) out[day][id] = Math.floor(n);
    }
  }
  return out;
}

/** Imports v1's per-key counts (`dhikr_count_{id}_{YYYY-MM-DD}`); the old keys are left untouched. */
async function migrateDhikrFromV1(): Promise<DhikrLog | null> {
  const prefix = 'dhikr_count_';
  const keys = (await AsyncStorage.getAllKeys()).filter(k => k.startsWith(prefix));
  if (!keys.length) return null;
  const values = await AsyncStorage.getMany(keys);
  const log: DhikrLog = {};
  for (const key of keys) {
    const day = key.slice(-10);
    const id = key.slice(prefix.length, -11);
    const n = parseInt(values[key] ?? '', 10);
    if (!isDateKey(day) || !id || !(n > 0)) continue;
    (log[day] ??= {})[id] = n;
  }
  return log;
}

export const dhikrStore = createPersistedStore<DhikrLog>('v2:dhikr', {}, {
  sanitize: sanitizeDhikr,
  migrate: migrateDhikrFromV1,
});

export function useDhikrDay(dayKey: string): Record<string, number> {
  return useStore(dhikrStore)[dayKey] ?? EMPTY;
}
const EMPTY: Record<string, number> = {};

export function setDhikrCount(today: YMD, id: string, count: number) {
  const day = ymdKey(today);
  dhikrStore.set(prev => {
    const next = prune(prev, today);
    next[day] = { ...next[day], [id]: Math.max(0, count) };
    return next;
  });
}

/**
 * Adds one to today's count (capped at target) against the store's *current*
 * value — never a render-time snapshot — so rapid taps that land before a
 * re-render are all counted. Returns the new count.
 */
export function incrementDhikr(today: YMD, id: string, target: number): number {
  const day = ymdKey(today);
  let result = 0;
  dhikrStore.set(prev => {
    const current = prev[day]?.[id] ?? 0;
    result = Math.min(target, current + 1);
    if (result === current) return prev;
    const next = prune(prev, today);
    next[day] = { ...next[day], [id]: result };
    return next;
  });
  return result;
}

// ─── Prayer tracker: { 'YYYY-MM-DD': prayed fard keys } ──────────────────────

export type TrackerLog = Record<string, PrayerKey[]>;

export const trackerStore = createPersistedStore<TrackerLog>('v2:tracker', {}, {
  sanitize: raw => {
    const out: TrackerLog = {};
    if (isRecord(raw)) {
      for (const [k, v] of Object.entries(raw)) {
        if (isDateKey(k) && Array.isArray(v)) out[k] = FARD.filter(p => v.includes(p));
      }
    }
    return out;
  },
});

export const useTracker = () => useStore(trackerStore);

export const isPrayed = (day: PrayerKey[] | undefined, key: PrayerKey) => !!day?.includes(key);
export const countPrayed = (day: PrayerKey[] | undefined) => day?.length ?? 0;

export function togglePrayed(today: YMD, dayKey: string, key: PrayerKey) {
  trackerStore.set(prev => {
    const next = prune(prev, today);
    const day = next[dayKey] ?? [];
    next[dayKey] = day.includes(key) ? day.filter(k => k !== key) : FARD.filter(k => k === key || day.includes(k));
    return next;
  });
}

/** Consecutive days with all five prayers marked, counting back from today (today counts only if complete). */
export function trackerStreak(log: TrackerLog, today: YMD): number {
  let streak = 0;
  let day = today;
  if (countPrayed(log[ymdKey(day)]) < 5) day = addDays(day, -1);
  while (countPrayed(log[ymdKey(day)]) === 5) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export function lastNDays(today: YMD, n: number): YMD[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - n + 1));
}


// ─── Free tasbih counter ─────────────────────────────────────────────────────

export type Tasbih = { count: number; target: number; total: number };

export const tasbihStore = createPersistedStore<Tasbih>('v2:tasbih', { count: 0, target: 33, total: 0 }, {
  sanitize: raw => {
    const r = isRecord(raw) ? raw : {};
    const n = (v: unknown, d: number) => (typeof v === 'number' && v >= 0 ? Math.floor(v) : d);
    return { count: n(r.count, 0), target: n(r.target, 33), total: n(r.total, 0) };
  },
});

export const useTasbih = () => useStore(tasbihStore);
