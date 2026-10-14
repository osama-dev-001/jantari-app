import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  Madhab as AdhanMadhab,
  PrayerTimes,
  SunnahTimes,
} from 'adhan';
import type { MosqueRow } from '../../data/mosque/types';
import {
  MONTHS,
  addDays,
  daysInMonth,
  parseClock,
  sameYmd,
  wallClockToInstant,
  ymdAt,
  ymdKey,
  type YMD,
} from '../time';
import {
  PRAYER_ORDER,
  type CalcOptions,
  type City,
  type DayTimes,
  type MethodKey,
  type PrayerKey,
  type PrayerStatus,
  type Region,
  type TimelineEntry,
} from './types';

// ─── Calculation methods ──────────────────────────────────────────────────────

const METHOD_FACTORIES: Record<MethodKey, () => CalculationParameters> = {
  karachi: CalculationMethod.Karachi,
  mwl: CalculationMethod.MuslimWorldLeague,
  ummalqura: CalculationMethod.UmmAlQura,
  egyptian: CalculationMethod.Egyptian,
  dubai: CalculationMethod.Dubai,
  qatar: CalculationMethod.Qatar,
  kuwait: CalculationMethod.Kuwait,
  singapore: CalculationMethod.Singapore,
  isna: CalculationMethod.NorthAmerica,
};

export const METHOD_NAMES: Record<MethodKey, string> = {
  karachi: 'University of Islamic Sciences, Karachi',
  mwl: 'Muslim World League',
  ummalqura: 'Umm al-Qura, Makkah',
  egyptian: 'Egyptian General Authority',
  dubai: 'Dubai (UAE)',
  qatar: 'Qatar',
  kuwait: 'Kuwait',
  singapore: 'Singapore / Malaysia',
  isna: 'ISNA (North America)',
};

export const METHOD_KEYS = Object.keys(METHOD_FACTORIES) as MethodKey[];

/** Angle summary read from the library itself, so the label can never drift from the maths. */
export function methodDetail(key: MethodKey): string {
  const p = METHOD_FACTORIES[key]();
  const isha = p.ishaInterval > 0 ? `Isha ${p.ishaInterval} min after Maghrib` : `Isha ${p.ishaAngle}°`;
  return `Fajr ${p.fajrAngle}° · ${isha}`;
}

const REGION_METHOD: Record<Region, MethodKey> = {
  IN: 'karachi', PK: 'karachi', BD: 'karachi', NP: 'karachi', LK: 'karachi',
  SA: 'ummalqura', AE: 'dubai', QA: 'qatar', KW: 'kuwait', OM: 'mwl', BH: 'mwl',
  MY: 'singapore', SG: 'singapore',
};

export function resolveMethod(city: City, opts: CalcOptions): MethodKey {
  return opts.method === 'auto' ? REGION_METHOD[city.region] : opts.method;
}

// ─── Sources ──────────────────────────────────────────────────────────────────

const TIMETABLE_FIELDS: Record<PrayerKey, keyof MosqueRow> = {
  fajr: 'Fajr', sunrise: 'Sunrise', zawal: 'Zawal', dhuhr: 'Dhuhr',
  asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha', midnight: 'Midnight',
};

// Only evening entries may legitimately cross midnight (e.g. Ahmedabad's
// "Midnight" at 12:01 AM). Daytime values are never shifted, so a typo in the
// source can't silently move a prayer to another day.
const MAY_ROLL_OVER = new Set<PrayerKey>(['isha', 'midnight']);

function findRow(city: City, ymd: YMD): MosqueRow | undefined {
  const rows = city.timetable?.[MONTHS[ymd.m - 1]];
  if (!rows?.length) return undefined;
  // Exact day, else the closest earlier day — covers Feb 29, which neither
  // curated timetable includes.
  for (let d = ymd.d; d >= 1; d--) {
    const row = rows.find(r => Number(r.Date) === d);
    if (row) return row;
  }
  return undefined;
}

function fromTimetable(city: City, ymd: YMD): DayTimes | null {
  const row = findRow(city, ymd);
  if (!row) return null;
  const times: DayTimes['times'] = {};
  let prev = -1;
  for (const key of PRAYER_ORDER) {
    let minutes = parseClock(row[TIMETABLE_FIELDS[key]]);
    if (minutes === null) continue;
    if (minutes < prev && MAY_ROLL_OVER.has(key)) minutes += 1440;
    times[key] = wallClockToInstant(ymd, minutes, city.tzOffsetMin);
    prev = Math.max(prev, minutes);
  }
  return times.fajr === undefined && times.maghrib === undefined
    ? null
    : { ymd, times, source: 'mosque' };
}

function fromCalculation(city: City, ymd: YMD, opts: CalcOptions): DayTimes {
  const params = METHOD_FACTORIES[resolveMethod(city, opts)]();
  params.madhab = opts.madhab === 'hanafi' ? AdhanMadhab.Hanafi : AdhanMadhab.Shafi;
  // Adhan reads the calendar day from the Date's local components and returns
  // absolute instants, so this is independent of the device's timezone.
  const pt = new PrayerTimes(new Coordinates(city.lat, city.lon), new Date(ymd.y, ymd.m - 1, ymd.d), params);
  const sunnah = new SunnahTimes(pt);
  const raw: Partial<Record<PrayerKey, Date>> = {
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
    midnight: sunnah.middleOfTheNight,
    // No zawal: Adhan has no direct property for it, and an approximation
    // would present an invented value next to the real ones.
  };
  const times: DayTimes['times'] = {};
  for (const key of PRAYER_ORDER) {
    const t = raw[key]?.getTime();
    if (t !== undefined && Number.isFinite(t)) times[key] = t;
  }
  return { ymd, times, source: 'calculated' };
}

// ─── Public API ───────────────────────────────────────────────────────────────

const cache = new Map<string, DayTimes>();

export function getDayTimes(city: City, ymd: YMD, opts: CalcOptions): DayTimes {
  const key = `${city.id}|${ymdKey(ymd)}|${resolveMethod(city, opts)}|${opts.madhab}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const result = (city.timetable && fromTimetable(city, ymd)) || fromCalculation(city, ymd, opts);
  if (cache.size > 1500) cache.clear();
  cache.set(key, result);
  return result;
}

export function isMosqueCity(city: City): boolean {
  return !!city.timetable;
}

function entriesOf(day: DayTimes): TimelineEntry[] {
  return PRAYER_ORDER.filter(k => day.times[k] !== undefined).map(k => ({
    key: k,
    at: day.times[k]!,
    ymd: day.ymd,
  }));
}

export type PrayerState = {
  /** The city's calendar date right now. */
  today: YMD;
  todayTimes: DayTimes;
  /** Most recent time that has started (may belong to yesterday, e.g. before Fajr). */
  current: TimelineEntry | null;
  next: TimelineEntry | null;
};

export function getPrayerState(city: City, now: number, opts: CalcOptions): PrayerState {
  const today = ymdAt(now, city.tzOffsetMin);
  const todayTimes = getDayTimes(city, today, opts);
  const timeline = [-1, 0, 1]
    .flatMap(offset => entriesOf(offset === 0 ? todayTimes : getDayTimes(city, addDays(today, offset), opts)))
    .sort((a, b) => a.at - b.at);

  let currentIdx = -1;
  for (let i = 0; i < timeline.length; i++) {
    if (timeline[i].at <= now) currentIdx = i;
    else break;
  }
  return {
    today,
    todayTimes,
    current: currentIdx >= 0 ? timeline[currentIdx] : null,
    next: timeline[currentIdx + 1] ?? null,
  };
}

export function isSameEntry(a: TimelineEntry | null, key: PrayerKey, ymd: YMD): boolean {
  return !!a && a.key === key && sameYmd(a.ymd, ymd);
}

export function statusOf(state: PrayerState, key: PrayerKey, now: number): PrayerStatus {
  const at = state.todayTimes.times[key];
  if (isSameEntry(state.current, key, state.today)) return 'current';
  if (isSameEntry(state.next, key, state.today)) return 'next';
  return at !== undefined && at <= now ? 'past' : 'upcoming';
}

/** Fraction (0–1) of the way from the current time marker to the next one. */
export function periodProgress(state: PrayerState, now: number): number {
  if (!state.current || !state.next) return 0;
  const span = state.next.at - state.current.at;
  return span > 0 ? Math.min(1, Math.max(0, (now - state.current.at) / span)) : 0;
}

export type MonthTimes = { month: number; days: DayTimes[] };

export function getYearTimes(city: City, year: number, opts: CalcOptions, months?: number[]): MonthTimes[] {
  return (months ?? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).map(m => ({
    month: m,
    days: Array.from({ length: daysInMonth(year, m) }, (_, i) => getDayTimes(city, { y: year, m, d: i + 1 }, opts)),
  }));
}
