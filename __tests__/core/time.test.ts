import {
  addDays,
  formatClock,
  formatCountdown,
  formatCountdownCompact,
  parseClock,
  wallClockToInstant,
  ymdAt,
  ymdKey,
} from '../../src/core/time';

const IST = 330;

describe('parseClock', () => {
  it('parses 12-hour and 24-hour strings', () => {
    expect(parseClock('05:23 AM')).toBe(5 * 60 + 23);
    expect(parseClock('12:01 AM')).toBe(1);
    expect(parseClock('12:01 PM')).toBe(12 * 60 + 1);
    expect(parseClock('11:59 PM')).toBe(23 * 60 + 59);
    expect(parseClock('17:05')).toBe(17 * 60 + 5);
  });

  it('rejects placeholders and garbage instead of producing NaN', () => {
    expect(parseClock('XX:YY')).toBeNull();
    expect(parseClock('')).toBeNull();
    expect(parseClock(undefined)).toBeNull();
    expect(parseClock('13:00 PM')).toBeNull();
    expect(parseClock('10:75 AM')).toBeNull();
  });
});

describe('city wall clock', () => {
  it('round-trips a wall-clock time through an instant', () => {
    const ymd = { y: 2026, m: 10, d: 14 };
    const at = wallClockToInstant(ymd, 5 * 60 + 7, IST);
    expect(new Date(at).toISOString()).toBe('2026-10-13T23:37:00.000Z');
    expect(formatClock(at, IST)).toBe('5:07 AM');
    expect(formatClock(at, IST, { format: '24h' })).toBe('05:07');
    expect(ymdAt(at, IST)).toEqual(ymd);
  });

  it('uses the city date, not the UTC date, near midnight', () => {
    // 00:30 IST on Oct 15 is still Oct 14 in UTC.
    const at = Date.UTC(2026, 9, 14, 19, 0);
    expect(ymdKey(ymdAt(at, IST))).toBe('2026-10-15');
    expect(ymdKey(ymdAt(at, 0))).toBe('2026-10-14');
  });

  it('adds days across month and leap-year boundaries', () => {
    expect(addDays({ y: 2028, m: 2, d: 28 }, 1)).toEqual({ y: 2028, m: 2, d: 29 });
    expect(addDays({ y: 2026, m: 12, d: 31 }, 1)).toEqual({ y: 2027, m: 1, d: 1 });
    expect(addDays({ y: 2026, m: 3, d: 1 }, -1)).toEqual({ y: 2026, m: 2, d: 28 });
  });
});

describe('countdown formatting', () => {
  const ms = (h: number, m: number, s: number) => ((h * 60 + m) * 60 + s) * 1000;

  it('formats the in-app countdown', () => {
    expect(formatCountdown(ms(2, 5, 9))).toBe('2h 05m 09s');
    expect(formatCountdown(ms(0, 5, 9))).toBe('5m 09s');
    expect(formatCountdown(-500)).toBe('0m 00s');
  });

  it('drops seconds on the widget only while an hour or more remains', () => {
    expect(formatCountdownCompact(ms(1, 38, 20))).toBe('1h 38m');
    expect(formatCountdownCompact(ms(1, 0, 0))).toBe('1h 00m');
    expect(formatCountdownCompact(ms(0, 59, 12))).toBe('59m 12s');
  });
});
