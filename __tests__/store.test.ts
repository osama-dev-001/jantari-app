import type { YMD } from '../src/core/time';

// Each test gets fresh module singletons and an empty AsyncStorage.
function fresh() {
  jest.resetModules();
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return {
    AsyncStorage,
    settings: require('../src/store/settings') as typeof import('../src/store/settings'),
    progress: require('../src/store/progress') as typeof import('../src/store/progress'),
  };
}

const TODAY: YMD = { y: 2026, m: 10, d: 14 };

afterEach(async () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.clear();
});

describe('settings', () => {
  it('migrates the city and madhab saved by v1', async () => {
    const { AsyncStorage, settings } = fresh();
    await AsyncStorage.setItem('selected_city', 'amd');
    await AsyncStorage.setItem('prayer_madhab', 'hanafi');
    const s = await settings.settingsStore.load();
    expect(s.cityId).toBe('amd');
    expect(s.madhab).toBe('hanafi');
    expect(JSON.parse((await AsyncStorage.getItem('v2:settings'))!).cityId).toBe('amd');
  });

  it('falls back to defaults for unknown or corrupt values', async () => {
    const { AsyncStorage, settings } = fresh();
    await AsyncStorage.setItem('v2:settings', JSON.stringify({ cityId: 'atlantis', hijriOffset: 9, accent: 'neon', haptics: 'yes' }));
    const s = await settings.settingsStore.load();
    expect(s.cityId).toBe(settings.DEFAULT_SETTINGS.cityId);
    expect(s.hijriOffset).toBe(0);
    expect(s.accent).toBe('emerald');
    expect(s.haptics).toBe(true);
  });

  it('defaults and validates font and reminder settings', async () => {
    const { AsyncStorage, settings } = fresh();
    await AsyncStorage.setItem(
      'v2:settings',
      JSON.stringify({ arabicFont: 'comic', urduFont: 'gulzar', urduScale: 5, reminders: { morning: true, everyMin: 7, endingWindowMin: 60 } }),
    );
    const s = await settings.settingsStore.load();
    expect(s.arabicFont).toBe('amiri');
    expect(s.urduFont).toBe('gulzar');
    expect(s.urduScale).toBe(1);
    expect(s.reminders).toEqual({ ...settings.DEFAULT_REMINDERS, morning: true, endingWindowMin: 60 });
  });

  it('keeps reminders off for existing users until they opt in', async () => {
    const { AsyncStorage, settings } = fresh();
    await AsyncStorage.setItem('v2:settings', JSON.stringify({ cityId: 'amd' }));
    const s = await settings.settingsStore.load();
    expect(s.reminders.morning || s.reminders.evening || s.reminders.prayerAlerts).toBe(false);
  });

  it('survives unparseable JSON', async () => {
    const { AsyncStorage, settings } = fresh();
    await AsyncStorage.setItem('v2:settings', '{oops');
    await expect(settings.settingsStore.load()).resolves.toEqual(settings.DEFAULT_SETTINGS);
  });
});

describe('dhikr counts', () => {
  it('imports v1 per-key counts without deleting them', async () => {
    const { AsyncStorage, progress } = fresh();
    await AsyncStorage.setItem('dhikr_count_subhanallah_azeem_morning_2026-10-14', '37');
    await AsyncStorage.setItem('dhikr_count_sayyidul_istighfar_evening_2026-10-13', '1');
    const log = await progress.dhikrStore.load();
    expect(log['2026-10-14'].subhanallah_azeem_morning).toBe(37);
    expect(log['2026-10-13'].sayyidul_istighfar_evening).toBe(1);
    expect(await AsyncStorage.getItem('dhikr_count_subhanallah_azeem_morning_2026-10-14')).toBe('37');
  });

  it('counts every rapid tap, even before any re-render, and caps at the target', async () => {
    const { progress } = fresh();
    await progress.dhikrStore.load();
    for (let i = 0; i < 40; i++) progress.incrementDhikr(TODAY, 'x', 33);
    expect(progress.dhikrStore.get()['2026-10-14'].x).toBe(33);
    for (let i = 0; i < 5; i++) progress.incrementDhikr(TODAY, 'y', 100);
    expect(progress.dhikrStore.get()['2026-10-14'].y).toBe(5);
  });

  it('persists after the debounce', async () => {
    jest.useFakeTimers();
    const { AsyncStorage, progress } = fresh();
    progress.incrementDhikr(TODAY, 'z', 10);
    jest.advanceTimersByTime(300);
    jest.useRealTimers();
    await progress.dhikrStore.flush();
    await new Promise<void>(r => setTimeout(() => r(), 0));
    expect(JSON.parse((await AsyncStorage.getItem('v2:dhikr'))!)['2026-10-14'].z).toBe(1);
  });

  it('prunes days older than 90 days', async () => {
    const { progress } = fresh();
    progress.dhikrStore.set({ '2026-01-01': { a: 3 }, '2026-10-01': { b: 2 } });
    progress.setDhikrCount(TODAY, 'c', 1);
    const log = progress.dhikrStore.get();
    expect(log['2026-01-01']).toBeUndefined();
    expect(log['2026-10-01'].b).toBe(2);
  });
});

describe('prayer tracker', () => {
  it('toggles prayers and keeps them in prayer order', () => {
    const { progress } = fresh();
    progress.togglePrayed(TODAY, '2026-10-14', 'isha');
    progress.togglePrayed(TODAY, '2026-10-14', 'fajr');
    expect(progress.trackerStore.get()['2026-10-14']).toEqual(['fajr', 'isha']);
    progress.togglePrayed(TODAY, '2026-10-14', 'fajr');
    expect(progress.trackerStore.get()['2026-10-14']).toEqual(['isha']);
  });

  it('computes the streak of complete days', () => {
    const { progress } = fresh();
    const all = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
    const log = { '2026-10-12': [...all], '2026-10-13': [...all], '2026-10-14': ['fajr' as const] };
    // Today is incomplete, so it doesn't break the streak — it just doesn't count yet.
    expect(progress.trackerStreak(log, TODAY)).toBe(2);
    expect(progress.trackerStreak({ ...log, '2026-10-14': [...all] }, TODAY)).toBe(3);
    expect(progress.trackerStreak({ '2026-10-12': [...all] }, TODAY)).toBe(0);
  });
});
