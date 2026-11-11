// Tabular (arithmetical) Islamic calendar. Real months begin with moon
// sighting, which varies by region and can differ from any formula by a day
// or two — so the app exposes a user adjustment (−2…+2 days) on top of this.
import type { YMD } from './time';

export type HijriDate = { y: number; m: number; d: number };

export const HIJRI_MONTHS = [
  { en: 'Muharram', ur: 'محرم', ar: 'مُحَرَّم' },
  { en: 'Safar', ur: 'صفر', ar: 'صَفَر' },
  { en: 'Rabi al-Awwal', ur: 'ربیع الاول', ar: 'رَبِيع الأَوَّل' },
  { en: 'Rabi al-Thani', ur: 'ربیع الثانی', ar: 'رَبِيع الثَّانِي' },
  { en: 'Jumada al-Ula', ur: 'جمادی الاول', ar: 'جُمَادَى الأُولَى' },
  { en: 'Jumada al-Thani', ur: 'جمادی الثانی', ar: 'جُمَادَى الآخِرَة' },
  { en: 'Rajab', ur: 'رجب', ar: 'رَجَب' },
  { en: 'Shaban', ur: 'شعبان', ar: 'شَعْبَان' },
  { en: 'Ramadan', ur: 'رمضان', ar: 'رَمَضَان' },
  { en: 'Shawwal', ur: 'شوال', ar: 'شَوَّال' },
  { en: 'Dhul Qadah', ur: 'ذوالقعدہ', ar: 'ذُو القَعْدَة' },
  { en: 'Dhul Hijjah', ur: 'ذوالحجہ', ar: 'ذُو الحِجَّة' },
] as const;

const ISLAMIC_EPOCH = 1948439.5;

function gregorianToJd({ y, m, d }: YMD): number {
  // Julian Day Number at midnight, proleptic Gregorian calendar.
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jdn =
    d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  return jdn - 0.5;
}

function hijriToJd(y: number, m: number, d: number): number {
  return d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + ISLAMIC_EPOCH - 1;
}

export function toHijri(ymd: YMD, adjustDays = 0): HijriDate {
  const jd = Math.floor(gregorianToJd(ymd) + adjustDays) + 0.5;
  const y = Math.floor((30 * (jd - ISLAMIC_EPOCH) + 10646) / 10631);
  const m = Math.min(12, Math.ceil((jd - (29 + hijriToJd(y, 1, 1))) / 29.5) + 1);
  const d = jd - hijriToJd(y, m, 1) + 1;
  return { y, m, d };
}

const URDU_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
export const toUrduDigits = (n: number | string) => String(n).replace(/\d/g, c => URDU_DIGITS[Number(c)]);

export function formatHijri(h: HijriDate): string {
  return `${h.d} ${HIJRI_MONTHS[h.m - 1].en} ${h.y} AH`;
}

export function formatHijriUrdu(h: HijriDate): string {
  return `${toUrduDigits(h.d)} ${HIJRI_MONTHS[h.m - 1].ur} ${toUrduDigits(h.y)}ھ`;
}

export const isRamadan = (h: HijriDate) => h.m === 9;

/** Notable days shown as a small banner on the Today screen. */
export function notableDay(h: HijriDate): string | null {
  if (h.m === 1 && h.d === 1) return 'Islamic New Year';
  if (h.m === 1 && h.d === 10) return 'Day of Ashura';
  if (h.m === 9 && h.d === 1) return 'First day of Ramadan';
  if (h.m === 9 && h.d >= 21) return 'The last ten nights of Ramadan';
  if (h.m === 10 && h.d === 1) return 'Eid al-Fitr';
  if (h.m === 12 && h.d === 9) return 'Day of Arafah';
  if (h.m === 12 && h.d === 10) return 'Eid al-Adha';
  if (h.m === 12 && h.d >= 11 && h.d <= 13) return 'Days of Tashreeq';
  if (h.d >= 13 && h.d <= 15) return 'Ayyam al-Bid — the white days';
  return null;
}
