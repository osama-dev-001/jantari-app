import { adhkarWindow, buildReminderPlan, windowTimes, type PlanInput } from '../../src/core/reminders';
import { getDayTimes } from '../../src/core/prayer/engine';
import { formatClock, wallClockToInstant } from '../../src/core/time';
import { getCity } from '../../src/data/cities';
import { DEFAULT_REMINDERS, type ReminderSettings } from '../../src/store/settings';

const IST = 330;
const vns = getCity('vns');
const del = getCity('del');
const opts = { method: 'auto' as const, madhab: 'shafi' as const };
const at = (d: number, h: number, m: number) => wallClockToInstant({ y: 2026, m: 10, d }, h * 60 + m, IST);
const clock = (t: number) => formatClock(t, IST, { format: '24h' });
const ON: ReminderSettings = { ...DEFAULT_REMINDERS, morning: true, evening: true };
const none = () => ({ done: 0, total: 6 });

function plan(over: Partial<PlanInput> = {}) {
  return buildReminderPlan({ city: vns, opts, settings: ON, timeFormat: '12h', now: at(15, 0, 30), days: 1, progress: none, ...over });
}

describe('adhkar windows', () => {
  it('runs Fajr → Zawal and Asr → Isha, using Dhuhr where there is no Zawal', () => {
    const v = getDayTimes(vns, { y: 2026, m: 10, d: 15 }, opts);
    expect(adhkarWindow(v, 'morning')?.endsAt).toBe('Zawal');
    expect(clock(adhkarWindow(v, 'morning')!.end)).toBe('11:05');
    expect(clock(adhkarWindow(v, 'evening')!.start)).toBe('15:03');
    const d = getDayTimes(del, { y: 2026, m: 10, d: 15 }, opts);
    expect(adhkarWindow(d, 'morning')?.endsAt).toBe('Dhuhr');
  });

  it('spaces reminders hourly, then every 10 minutes in the last 30', () => {
    const start = at(15, 4, 40);
    const end = at(15, 11, 5);
    const times = windowTimes(start, end, ON).map(t => `${clock(t.at)}${t.ending ? '!' : ''}`);
    expect(times).toEqual(['04:55', '05:55', '06:55', '07:55', '08:55', '09:55', '10:35!', '10:45!', '10:55!']);
  });

  it('drops a regular reminder that would land just before the first "ending" one', () => {
    const times = windowTimes(at(15, 15, 3), at(15, 18, 50), ON).map(t => `${clock(t.at)}${t.ending ? '!' : ''}`);
    // 18:18 regular would be 2 min before 18:20 ending → dropped.
    expect(times).toEqual(['15:18', '16:18', '17:18', '18:20!', '18:30!', '18:40!']);
  });

  it('never schedules before the window opens, even in very short windows', () => {
    const start = at(15, 10, 0);
    const times = windowTimes(start, at(15, 10, 25), ON);
    expect(times.every(t => t.at >= start + 15 * 60000)).toBe(true);
    expect(times.length).toBeGreaterThan(0);
  });

  it('respects a disabled ending window', () => {
    const times = windowTimes(at(15, 4, 40), at(15, 11, 5), { ...ON, endingWindowMin: 0, everyMin: 120 });
    expect(times.map(t => clock(t.at))).toEqual(['04:55', '06:55', '08:55', '10:55']);
    expect(times.some(t => t.ending)).toBe(false);
  });
});

describe('plan', () => {
  it('is empty when everything is off', () => {
    expect(plan({ settings: DEFAULT_REMINDERS })).toEqual([]);
  });

  it('skips past times and a window that is already complete', () => {
    const now = at(15, 9, 0);
    const morningDone = (_: string, kind: string) => (kind === 'morning' ? { done: 6, total: 6 } : { done: 0, total: 4 });
    const p = plan({ now, progress: morningDone });
    expect(p.every(r => r.at > now)).toBe(true);
    expect(p.some(r => r.title.startsWith('Morning'))).toBe(false);
    expect(p.some(r => r.title.startsWith('Evening'))).toBe(true);
  });

  it('keeps reminding when "stop when done" is off', () => {
    const p = plan({ now: at(15, 9, 0), settings: { ...ON, stopWhenDone: false }, progress: () => ({ done: 6, total: 6 }) });
    expect(p.some(r => r.title.startsWith('Morning'))).toBe(true);
  });

  it('writes clear text with progress for today', () => {
    const p = plan({ now: at(15, 9, 0), progress: () => ({ done: 2, total: 6 }) });
    const first = p[0];
    expect(first.body).toBe('Time for your morning adhkar · until Zawal, 11:05 AM · 2 of 6 done');
    const ending = p.find(r => r.channel === 'adhkar_ending')!;
    expect(ending.title).toBe('Morning adhkar time is ending');
    expect(ending.body).toBe('30 min left — ends at Zawal, 11:05 AM · 2 of 6 done');
    expect(ending.link).toBe('islamicdaily://dhikr');
  });

  it('uses one notification slot per window per day, and unique alarm ids', () => {
    const p = plan({ days: 7 });
    expect(new Set(p.map(r => r.id)).size).toBe(p.length);
    const slots = new Set(p.map(r => r.notifyId));
    expect(slots.size).toBe(14); // 7 days × morning/evening
    expect(p.length).toBeLessThan(150); // well under Android's per-app alarm limit
  });

  it('adds prayer-time alerts when enabled', () => {
    const p = plan({ settings: { ...DEFAULT_REMINDERS, prayerAlerts: true }, now: at(15, 0, 30) });
    expect(p.map(r => r.title.split(' ·')[0])).toEqual(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']);
    expect(p[0].body).toBe("It's time for Fajr (4:40 AM) in Varanasi");
    expect(p[0].channel).toBe('prayer');
  });
});
