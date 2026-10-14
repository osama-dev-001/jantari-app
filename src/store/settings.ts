import AsyncStorage from '@react-native-async-storage/async-storage';
import { METHOD_KEYS } from '../core/prayer/engine';
import type { CalcOptions, Madhab, MethodSetting } from '../core/prayer/types';
import type { TimeFormat } from '../core/time';
import { DEFAULT_CITY_ID, isKnownCity } from '../data/cities';
import { createPersistedStore, isRecord, useStore } from './persisted';

export type ThemeMode = 'system' | 'dark' | 'light';
export type Accent = 'emerald' | 'lapis' | 'saffron' | 'violet';
export type Lang = 'urdu' | 'hindi' | 'english';

export type Settings = {
  cityId: string;
  method: MethodSetting;
  madhab: Madhab;
  /** Days added to the calculated Hijri date to match local moon sighting. */
  hijriOffset: number;
  timeFormat: TimeFormat;
  themeMode: ThemeMode;
  accent: Accent;
  translationLang: Lang;
  haptics: boolean;
  /** Multiplier for Arabic dhikr text. */
  arabicScale: number;
};

export const DEFAULT_SETTINGS: Settings = {
  cityId: DEFAULT_CITY_ID,
  method: 'auto',
  madhab: 'shafi',
  hijriOffset: 0,
  timeFormat: '12h',
  themeMode: 'dark',
  accent: 'emerald',
  translationLang: 'urdu',
  haptics: true,
  arabicScale: 1,
};

const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;

function sanitize(raw: unknown): Settings {
  const r = isRecord(raw) ? raw : {};
  const d = DEFAULT_SETTINGS;
  const num = (v: unknown, lo: number, hi: number, fallback: number) =>
    typeof v === 'number' && v >= lo && v <= hi ? v : fallback;
  return {
    cityId: isKnownCity(r.cityId as string) ? (r.cityId as string) : d.cityId,
    method: oneOf<MethodSetting>(r.method, ['auto', ...METHOD_KEYS], d.method),
    madhab: oneOf<Madhab>(r.madhab, ['shafi', 'hanafi'], d.madhab),
    hijriOffset: Math.round(num(r.hijriOffset, -2, 2, d.hijriOffset)),
    timeFormat: oneOf<TimeFormat>(r.timeFormat, ['12h', '24h'], d.timeFormat),
    themeMode: oneOf<ThemeMode>(r.themeMode, ['system', 'dark', 'light'], d.themeMode),
    accent: oneOf<Accent>(r.accent, ['emerald', 'lapis', 'saffron', 'violet'], d.accent),
    translationLang: oneOf<Lang>(r.translationLang, ['urdu', 'hindi', 'english'], d.translationLang),
    haptics: typeof r.haptics === 'boolean' ? r.haptics : d.haptics,
    arabicScale: num(r.arabicScale, 0.8, 1.6, d.arabicScale),
  };
}

/** Carries the city and madhab over from v1, which stored them as bare keys. */
async function migrateFromV1(): Promise<Settings | null> {
  const [city, madhab] = await Promise.all([
    AsyncStorage.getItem('selected_city'),
    AsyncStorage.getItem('prayer_madhab'),
  ]);
  if (!city && !madhab) return null;
  return sanitize({ ...DEFAULT_SETTINGS, cityId: city, madhab });
}

export const settingsStore = createPersistedStore<Settings>('v2:settings', DEFAULT_SETTINGS, {
  sanitize,
  migrate: migrateFromV1,
  debounceMs: 50,
});

export const useSettings = () => useStore(settingsStore);

export function updateSettings(patch: Partial<Settings>) {
  settingsStore.set(prev => ({ ...prev, ...patch }));
}

export const calcOptionsOf = (s: Settings): CalcOptions => ({ method: s.method, madhab: s.madhab });
