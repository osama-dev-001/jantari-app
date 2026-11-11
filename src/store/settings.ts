import AsyncStorage from '@react-native-async-storage/async-storage';
import { METHOD_KEYS } from '../core/prayer/engine';
import type { CalcOptions, Madhab, MethodSetting } from '../core/prayer/types';
import type { TimeFormat } from '../core/time';
import { DEFAULT_CITY_ID, isKnownCity } from '../data/cities';
import { createPersistedStore, isRecord, useStore } from './persisted';

export type ThemeMode = 'system' | 'dark' | 'light';
export type Accent = 'emerald' | 'lapis' | 'saffron' | 'violet';
export type Lang = 'urdu' | 'hindi' | 'english';
export type ArabicFont = 'amiri' | 'scheherazade' | 'naskh' | 'lateef';
export type UrduFont = 'nastaliq' | 'gulzar' | 'naskh';
/**
 * App sounds live in android/app/src/main/res/raw; 'system' is the phone's own notification sound.
 * Retired sounds (chime, harp) fall back to the default when settings load.
 */
export type ReminderSound = 'bell' | 'birds' | 'system';

export type ReminderSettings = {
  /** Fajr → Zawal (Dhuhr where a city has no Zawal). */
  morning: boolean;
  /** Asr → Isha. */
  evening: boolean;
  /** First reminder this many minutes after the window opens. */
  startAfterMin: number;
  /** Regular reminder spacing. */
  everyMin: number;
  /** Final stretch of the window with frequent reminders (0 = off). */
  endingWindowMin: number;
  endingEveryMin: number;
  /** Skip the rest of a window once its adhkar are all done. */
  stopWhenDone: boolean;
  /** One alert as each of the five prayers begins. */
  prayerAlerts: boolean;
  sound: ReminderSound;
};

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
  arabicFont: ArabicFont;
  urduFont: UrduFont;
  /** Multiplier for Urdu translation text. */
  urduScale: number;
  reminders: ReminderSettings;
  /** The Today screen's "turn on reminders" card was dismissed. */
  reminderPromptDismissed: boolean;
};

export const DEFAULT_REMINDERS: ReminderSettings = {
  morning: false,
  evening: false,
  startAfterMin: 15,
  everyMin: 60,
  endingWindowMin: 30,
  endingEveryMin: 10,
  stopWhenDone: true,
  prayerAlerts: false,
  sound: 'bell',
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
  arabicFont: 'amiri',
  urduFont: 'nastaliq',
  urduScale: 1,
  reminders: DEFAULT_REMINDERS,
  reminderPromptDismissed: false,
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
    arabicFont: oneOf<ArabicFont>(r.arabicFont, ['amiri', 'scheherazade', 'naskh', 'lateef'], d.arabicFont),
    urduFont: oneOf<UrduFont>(r.urduFont, ['nastaliq', 'gulzar', 'naskh'], d.urduFont),
    urduScale: num(r.urduScale, 0.8, 1.6, d.urduScale),
    reminders: sanitizeReminders(r.reminders),
    reminderPromptDismissed: r.reminderPromptDismissed === true,
  };
}

function sanitizeReminders(raw: unknown): ReminderSettings {
  const r = isRecord(raw) ? raw : {};
  const d = DEFAULT_REMINDERS;
  const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
  const pick = (v: unknown, allowed: number[], fallback: number) => (allowed.includes(v as number) ? (v as number) : fallback);
  return {
    morning: bool(r.morning, d.morning),
    evening: bool(r.evening, d.evening),
    startAfterMin: pick(r.startAfterMin, START_AFTER_OPTIONS, d.startAfterMin),
    everyMin: pick(r.everyMin, EVERY_OPTIONS, d.everyMin),
    endingWindowMin: pick(r.endingWindowMin, ENDING_WINDOW_OPTIONS, d.endingWindowMin),
    endingEveryMin: pick(r.endingEveryMin, ENDING_EVERY_OPTIONS, d.endingEveryMin),
    stopWhenDone: bool(r.stopWhenDone, d.stopWhenDone),
    prayerAlerts: bool(r.prayerAlerts, d.prayerAlerts),
    sound: oneOf<ReminderSound>(r.sound, REMINDER_SOUNDS, d.sound),
  };
}

export const START_AFTER_OPTIONS = [0, 15, 30];
export const EVERY_OPTIONS = [30, 60, 120];
export const ENDING_WINDOW_OPTIONS = [0, 30, 60];
export const ENDING_EVERY_OPTIONS = [5, 10, 15];
export const REMINDER_SOUNDS: ReminderSound[] = ['bell', 'birds', 'system'];

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

export function updateReminders(patch: Partial<ReminderSettings>) {
  settingsStore.set(prev => ({ ...prev, reminders: { ...prev.reminders, ...patch } }));
}

export const calcOptionsOf = (s: Settings): CalcOptions => ({ method: s.method, madhab: s.madhab });
