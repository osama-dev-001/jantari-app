const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];


/**
 * Returns today's row from static data object
 */
export function getTodayTimings(data) {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'long' });
  const day = String(now.getDate()).padStart(2, '0');
  return data[month]?.find(d => d.Date === day) || null;
}

/**
 * Parses "05:23 AM" -> Date (today, at that time)
 */
export function parseTime(timeStr) {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Returns { current, next } — both have { name, time (Date), timeStr }
 * If all prayers are past, wraps around to Fajr of next day.
 */
export function getCurrentAndNext(timings) {
  const now = new Date();

  const prayers = PRAYERS.map(name => ({
    name,
    timeStr: timings[name],
    time: parseTime(timings[name]),
  }));

  const nextIndex = prayers.findIndex(p => p.time > now);

  if (nextIndex === -1) {
    // All prayers done — current is Isha, next is Fajr (tomorrow)
    return {
      current: prayers[prayers.length - 1],
      next: { ...prayers[0], label: 'Fajr (tomorrow)' },
    };
  }

  return {
    current: nextIndex === 0 ? null : prayers[nextIndex - 1],
    next: prayers[nextIndex],
  };
}

/**
 * Returns countdown string "2h 14m 33s" to a given Date
 */
export function getCountdown(targetDate) {
  const now = new Date();
  let diff = targetDate - now;
  if (diff < 0) diff += 24 * 60 * 60 * 1000;

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

/**
 * Normalize timings from Aladhan API response to match static data shape
 */
export function normalizeApiTimings(apiTimings) {
  // Aladhan returns 24h format — convert to 12h to match static data
  const to12h = t => {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  };

  return {
    Fajr: to12h(apiTimings.Fajr),
    Sunrise: to12h(apiTimings.Sunrise),
    Dhuhr: to12h(apiTimings.Dhuhr),
    Asr: to12h(apiTimings.Asr),
    Maghrib: to12h(apiTimings.Maghrib),
    Isha: to12h(apiTimings.Isha),
  };
}