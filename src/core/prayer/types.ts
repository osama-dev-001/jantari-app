import type { MosqueTimetable } from '../../data/mosque/types';
import type { YMD } from '../time';

export type PrayerKey =
  | 'fajr'
  | 'sunrise'
  | 'zawal'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha'
  | 'midnight';

/** Chronological order within one day. */
export const PRAYER_ORDER: PrayerKey[] = [
  'fajr', 'sunrise', 'zawal', 'dhuhr', 'asr', 'maghrib', 'isha', 'midnight',
];

/** The five obligatory prayers (used by the tracker). */
export const FARD: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const PRAYER_META: Record<
  PrayerKey,
  { en: string; ur: string; ar: string; kind: 'salah' | 'marker'; note?: string }
> = {
  fajr: { en: 'Fajr', ur: 'فجر', ar: 'الفجر', kind: 'salah' },
  sunrise: { en: 'Sunrise', ur: 'طلوع آفتاب', ar: 'الشروق', kind: 'marker', note: 'Fajr time ends' },
  zawal: { en: 'Zawal', ur: 'زوال', ar: 'الزوال', kind: 'marker', note: 'Sun at its zenith' },
  dhuhr: { en: 'Dhuhr', ur: 'ظہر', ar: 'الظهر', kind: 'salah' },
  asr: { en: 'Asr', ur: 'عصر', ar: 'العصر', kind: 'salah' },
  maghrib: { en: 'Maghrib', ur: 'مغرب', ar: 'المغرب', kind: 'salah' },
  isha: { en: 'Isha', ur: 'عشاء', ar: 'العشاء', kind: 'salah' },
  midnight: { en: 'Midnight', ur: 'نصف شب', ar: 'منتصف الليل', kind: 'marker', note: 'Middle of the night' },
};

export type Madhab = 'shafi' | 'hanafi';

export type MethodKey =
  | 'karachi'
  | 'mwl'
  | 'ummalqura'
  | 'egyptian'
  | 'dubai'
  | 'qatar'
  | 'kuwait'
  | 'singapore'
  | 'isna';

export type MethodSetting = 'auto' | MethodKey;

export type Region =
  | 'IN' | 'PK' | 'BD' | 'NP' | 'LK'
  | 'SA' | 'AE' | 'QA' | 'KW' | 'OM' | 'BH'
  | 'MY' | 'SG';

export type City = {
  id: string;
  name: string;
  country: string;
  region: Region;
  lat: number;
  lon: number;
  /** Fixed UTC offset in minutes (all supported zones have no DST). */
  tzOffsetMin: number;
  /** Curated local-mosque timetable; when present it takes priority over calculation. */
  timetable?: MosqueTimetable;
};

export type CalcOptions = { method: MethodSetting; madhab: Madhab };

/** One day's times as absolute instants (epoch ms). Missing keys = not available. */
export type DayTimes = {
  ymd: YMD;
  times: Partial<Record<PrayerKey, number>>;
  source: 'mosque' | 'calculated';
};

export type TimelineEntry = { key: PrayerKey; at: number; ymd: YMD };

export type PrayerStatus = 'past' | 'current' | 'next' | 'upcoming';
