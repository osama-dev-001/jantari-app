// Calendar + clock helpers that work in a *city's* timezone rather than the
// device's. Every instant in the app is an epoch-ms number; a city's wall
// clock is derived by shifting with its fixed UTC offset. All supported
// cities are in zones without daylight saving, so a fixed offset is exact.

export type YMD = { y: number; m: number; d: number }; // m is 1-12

export type TimeFormat = '12h' | '24h';

const MIN = 60_000;
const DAY = 86_400_000;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const MONTHS_SHORT = MONTHS.map(m => m.slice(0, 3));
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const pad2 = (n: number) => String(n).padStart(2, '0');

export function ymdKey({ y, m, d }: YMD): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

export function parseYmdKey(key: string): YMD {
  const [y, m, d] = key.split('-').map(Number);
  return { y, m, d };
}

export function sameYmd(a: YMD, b: YMD): boolean {
  return a.y === b.y && a.m === b.m && a.d === b.d;
}

/** The calendar date on a city's wall clock at a given instant. */
export function ymdAt(instant: number, tzOffsetMin: number): YMD {
  const t = new Date(instant + tzOffsetMin * MIN);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

/** Minutes past local midnight on a city's wall clock. */
export function minutesOfDayAt(instant: number, tzOffsetMin: number): number {
  const t = new Date(instant + tzOffsetMin * MIN);
  return t.getUTCHours() * 60 + t.getUTCMinutes();
}

export function addDays(ymd: YMD, n: number): YMD {
  const t = new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d) + n * DAY);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function weekday(ymd: YMD): number {
  return new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d)).getUTCDay();
}

/** Days from a to b (b - a), ignoring time of day. */
export function diffDays(a: YMD, b: YMD): number {
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / DAY);
}

/** Converts a wall-clock time on a city's calendar date into an instant. */
export function wallClockToInstant(ymd: YMD, minutes: number, tzOffsetMin: number): number {
  return Date.UTC(ymd.y, ymd.m - 1, ymd.d) + minutes * MIN - tzOffsetMin * MIN;
}

/** "05:23 AM" | "5:23 PM" | "17:05" → minutes past midnight, or null if unparseable. */
export function parseClock(text: string | undefined): number | null {
  if (!text) return null;
  const match = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec(text);
  if (!match) return null;
  let h = Number(match[1]);
  const min = Number(match[2]);
  const period = match[3]?.toUpperCase();
  if (min > 59 || h > 23 || (period && (h < 1 || h > 12))) return null;
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

export type FormatOptions = { format?: TimeFormat; withPeriod?: boolean };

/** Formats an instant on a city's wall clock: "5:32 PM" (12h) or "17:32" (24h). */
export function formatClock(
  instant: number,
  tzOffsetMin: number,
  { format = '12h', withPeriod = true }: FormatOptions = {},
): string {
  const total = minutesOfDayAt(instant, tzOffsetMin);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (format === '24h') return `${pad2(h)}:${pad2(m)}`;
  const h12 = h % 12 || 12;
  return withPeriod ? `${h12}:${pad2(m)} ${h < 12 ? 'AM' : 'PM'}` : `${h12}:${pad2(m)}`;
}

export function periodOf(instant: number, tzOffsetMin: number): 'AM' | 'PM' {
  return minutesOfDayAt(instant, tzOffsetMin) < 720 ? 'AM' : 'PM';
}

export type Duration = { h: number; m: number; s: number; totalMs: number };

export function splitDuration(ms: number): Duration {
  const clamped = Math.max(0, ms);
  const totalSec = Math.floor(clamped / 1000);
  return {
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
    totalMs: clamped,
  };
}

/** "2h 05m 09s", or "5m 09s" under an hour. */
export function formatCountdown(ms: number): string {
  const { h, m, s } = splitDuration(ms);
  return h > 0 ? `${h}h ${pad2(m)}m ${pad2(s)}s` : `${m}m ${pad2(s)}s`;
}

/**
 * Compact countdown for the home-screen widget, which refreshes rarely:
 * ≥ 1 hour → "1h 38m" (no seconds), < 1 hour → "59m 12s".
 */
export function formatCountdownCompact(ms: number): string {
  const { h, m, s } = splitDuration(ms);
  return h >= 1 ? `${h}h ${pad2(m)}m` : `${m}m ${pad2(s)}s`;
}

/** Spoken-style duration for secondary text: "1 hr 5 min", "12 min", "under a minute". */
export function formatDurationWords(ms: number): string {
  const { h, m } = splitDuration(ms);
  if (h === 0 && m === 0) return 'under a minute';
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function formatLongDate(ymd: YMD): string {
  return `${WEEKDAYS[weekday(ymd)]}, ${ymd.d} ${MONTHS[ymd.m - 1]}`;
}

export function formatShortDate(ymd: YMD): string {
  return `${WEEKDAYS[weekday(ymd)].slice(0, 3)}, ${ymd.d} ${MONTHS_SHORT[ymd.m - 1]}`;
}
