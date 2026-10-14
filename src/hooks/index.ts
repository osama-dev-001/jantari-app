import { useIsFocused } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { AppState, Vibration } from 'react-native';
import { getPrayerState, type PrayerState } from '../core/prayer/engine';
import { toHijri, type HijriDate } from '../core/hijri';
import { addDays, ymdAt, ymdKey } from '../core/time';
import { getCity } from '../data/cities';
import { calcOptionsOf, settingsStore, useSettings } from '../store/settings';

/**
 * Current time, re-rendering every `intervalMs` aligned to the wall clock.
 * Pauses while the app is in the background or the screen is unfocused.
 */
export function useNow(intervalMs = 1000, active = true): number {
  const [now, setNow] = useState(() => Date.now());
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const sub = AppState.addEventListener('change', s => setAppActive(s === 'active'));
    return () => sub.remove();
  }, []);

  const running = active && appActive;
  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    let interval: ReturnType<typeof setInterval> | undefined;
    const align = setTimeout(() => {
      setNow(Date.now());
      interval = setInterval(() => setNow(Date.now()), intervalMs);
    }, intervalMs - (Date.now() % intervalMs) + 5);
    return () => {
      clearTimeout(align);
      if (interval) clearInterval(interval);
    };
  }, [running, intervalMs]);

  return now;
}

/** Ticks only while the calling screen is focused. */
export function useFocusedNow(intervalMs = 1000): number {
  return useNow(intervalMs, useIsFocused());
}

export function useCity() {
  const { cityId } = useSettings();
  return useMemo(() => getCity(cityId), [cityId]);
}

export function usePrayerState(now: number) {
  const settings = useSettings();
  const city = useCity();
  const opts = useMemo(() => calcOptionsOf(settings), [settings]);
  const state = useMemo(() => getPrayerState(city, now, opts), [city, now, opts]);
  return { city, opts, state, settings };
}

/** The selected city's calendar date (key + YMD); dhikr and tracker days follow it. */
export function useCityToday(now: number) {
  const city = useCity();
  const ymd = ymdAt(now, city.tzOffsetMin);
  const key = ymdKey(ymd);
  return useMemo(() => ({ ymd, key }), [key]); // eslint-disable-line react-hooks/exhaustive-deps
}

export const haptics = {
  tap() {
    if (settingsStore.get().haptics) Vibration.vibrate(18);
  },
  success() {
    if (settingsStore.get().haptics) Vibration.vibrate([0, 35, 80, 45]);
  },
};

/** Hijri date for "now": the Islamic day begins at Maghrib, so it advances then. */
export function hijriNow(state: PrayerState, now: number, offset: number): HijriDate {
  const maghrib = state.todayTimes.times.maghrib;
  return toHijri(maghrib !== undefined && now >= maghrib ? addDays(state.today, 1) : state.today, offset);
}
