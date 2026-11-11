import {
  getDayTimes,
  getPrayerState,
  getYearTimes,
  methodDetail,
  periodProgress,
  resolveMethod,
  statusOf,
} from '../../src/core/prayer/engine';
import type { CalcOptions } from '../../src/core/prayer/types';
import { formatClock, wallClockToInstant } from '../../src/core/time';
import { CITIES, getCity } from '../../src/data/cities';

const IST = 330;
const SHAFI: CalcOptions = { method: 'auto', madhab: 'shafi' };
const HANAFI: CalcOptions = { method: 'auto', madhab: 'hanafi' };
const vns = getCity('vns');
const amd = getCity('amd');
const del = getCity('del');

const istAt = (y: number, m: number, d: number, h: number, min: number) =>
  wallClockToInstant({ y, m, d }, h * 60 + min, IST);

describe('mosque timetables', () => {
  it('reads the curated Varanasi row exactly', () => {
    const day = getDayTimes(vns, { y: 2026, m: 1, d: 1 }, SHAFI);
    expect(day.source).toBe('mosque');
    expect(formatClock(day.times.fajr!, IST)).toBe('5:23 AM');
    expect(formatClock(day.times.zawal!, IST)).toBe('11:21 AM');
    expect(formatClock(day.times.midnight!, IST)).toBe('11:21 PM');
  });

  it('places an after-midnight "Midnight" on the following calendar day', () => {
    const day = getDayTimes(amd, { y: 2026, m: 1, d: 1 }, SHAFI);
    expect(day.times.midnight).toBe(istAt(2026, 1, 2, 0, 1));
    expect(day.times.midnight!).toBeGreaterThan(day.times.isha!);
  });

  it('treats the April 30 "XX:YY" placeholder as missing, not as a time', () => {
    const day = getDayTimes(vns, { y: 2026, m: 4, d: 30 }, SHAFI);
    expect(day.times.midnight).toBeUndefined();
    expect(day.times.isha).toBeDefined();
  });

  it('falls back to Feb 28 in leap years (no Feb 29 row exists)', () => {
    const leap = getDayTimes(vns, { y: 2028, m: 2, d: 29 }, SHAFI);
    expect(formatClock(leap.times.fajr!, IST)).toBe(
      formatClock(getDayTimes(vns, { y: 2028, m: 2, d: 28 }, SHAFI).times.fajr!, IST),
    );
  });

  it('ignores madhab for mosque cities (fixed local schedule)', () => {
    const a = getDayTimes(vns, { y: 2026, m: 6, d: 1 }, SHAFI);
    const b = getDayTimes(vns, { y: 2026, m: 6, d: 1 }, HANAFI);
    expect(a.times.asr).toBe(b.times.asr);
  });

  it('has a complete, chronologically ordered year for both curated cities', () => {
    for (const city of [vns, amd]) {
      const year = getYearTimes(city, 2026, SHAFI);
      expect(year.flatMap(m => m.days)).toHaveLength(365);
      for (const day of year.flatMap(m => m.days)) {
        const t = day.times;
        expect(t.fajr! < t.sunrise! && t.sunrise! < t.dhuhr! && t.dhuhr! < t.asr!).toBe(true);
        expect(t.asr! < t.maghrib! && t.maghrib! < t.isha!).toBe(true);
      }
    }
  });
});

describe('calculated cities', () => {
  it('uses Karachi for South Asia and regional methods elsewhere', () => {
    expect(resolveMethod(del, SHAFI)).toBe('karachi');
    expect(resolveMethod(getCity('makkah'), SHAFI)).toBe('ummalqura');
    expect(resolveMethod(getCity('dubai'), SHAFI)).toBe('dubai');
    expect(resolveMethod(del, { method: 'mwl', madhab: 'shafi' })).toBe('mwl');
    expect(methodDetail('karachi')).toBe('Fajr 18° · Isha 18°');
  });

  it('produces plausible, ordered Delhi times on the summer solstice', () => {
    const day = getDayTimes(del, { y: 2026, m: 6, d: 21 }, SHAFI);
    expect(day.source).toBe('calculated');
    expect(day.times.zawal).toBeUndefined();
    const f = (k: keyof typeof day.times) => formatClock(day.times[k]!, IST, { format: '24h' });
    expect(f('fajr') >= '03:40' && f('fajr') <= '04:05').toBe(true);
    expect(f('sunrise') >= '05:15' && f('sunrise') <= '05:35').toBe(true);
    expect(f('maghrib') >= '19:15' && f('maghrib') <= '19:30').toBe(true);
  });

  it('moves Asr later under the Hanafi madhab', () => {
    const ymd = { y: 2026, m: 10, d: 14 };
    const shafi = getDayTimes(del, ymd, SHAFI).times.asr!;
    const hanafi = getDayTimes(del, ymd, HANAFI).times.asr!;
    const diffMin = (hanafi - shafi) / 60000;
    expect(diffMin).toBeGreaterThan(30);
    expect(diffMin).toBeLessThan(90);
  });

  it('computes every catalog city without gaps', () => {
    for (const city of CITIES) {
      const day = getDayTimes(city, { y: 2026, m: 3, d: 15 }, SHAFI);
      for (const k of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const) {
        expect(Number.isFinite(day.times[k])).toBe(true);
      }
    }
  });
});

describe('current / next', () => {
  it('before Fajr, the current period is last night\'s Midnight, and Fajr is next', () => {
    const now = istAt(2026, 1, 10, 3, 0);
    const state = getPrayerState(vns, now, SHAFI);
    expect(state.current?.key).toBe('midnight');
    expect(state.current?.ymd).toEqual({ y: 2026, m: 1, d: 9 });
    expect(state.next?.key).toBe('fajr');
    expect(state.next?.ymd).toEqual({ y: 2026, m: 1, d: 10 });
    expect(statusOf(state, 'fajr', now)).toBe('next');
  });

  it('after Isha in Ahmedabad, the next marker is the after-midnight "Midnight"', () => {
    const now = istAt(2026, 1, 1, 22, 0);
    const state = getPrayerState(amd, now, SHAFI);
    expect(state.current?.key).toBe('isha');
    expect(state.next?.key).toBe('midnight');
    expect(state.next?.at).toBe(istAt(2026, 1, 2, 0, 1));
  });

  it('marks statuses for the day list', () => {
    const now = istAt(2026, 1, 1, 13, 0); // after Dhuhr (12:01 PM), before Asr (2:59 PM)
    const state = getPrayerState(vns, now, SHAFI);
    expect(statusOf(state, 'fajr', now)).toBe('past');
    expect(statusOf(state, 'dhuhr', now)).toBe('current');
    expect(statusOf(state, 'asr', now)).toBe('next');
    expect(statusOf(state, 'isha', now)).toBe('upcoming');
    const p = periodProgress(state, now);
    expect(p).toBeGreaterThan(0.3);
    expect(p).toBeLessThan(0.4);
  });

  it('wraps from Midnight to tomorrow\'s Fajr', () => {
    const now = istAt(2026, 1, 1, 23, 30); // after Varanasi Midnight (11:21 PM)
    const state = getPrayerState(vns, now, SHAFI);
    expect(state.current?.key).toBe('midnight');
    expect(state.next?.key).toBe('fajr');
    expect(state.next?.ymd).toEqual({ y: 2026, m: 1, d: 2 });
  });
});
