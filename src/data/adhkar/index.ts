import { FAVOURITES } from './favourites';
import { OTHERS } from './others';
import type { Dhikr, DhikrTime, Lang } from './types';

export { FAVOURITES, OTHERS };
export type { Dhikr, DhikrTime, Lang };

/** `order` is the group order on the Dhikr screen and the swipe order in the counter. */
export const TIME_META: Record<DhikrTime, { label: string; ur: string; order: number }> = {
  morning: { label: 'Morning', ur: 'صبح', order: 0 },
  any: { label: 'Any time', ur: 'کسی بھی وقت', order: 1 },
  evening: { label: 'Evening', ur: 'شام', order: 2 },
  salah: { label: 'After Salah', ur: 'بعد نماز', order: 3 },
};

export const LANGS: { key: Lang; label: string }[] = [
  { key: 'urdu', label: 'اردو' },
  { key: 'hindi', label: 'हिंदी' },
  { key: 'english', label: 'English' },
];

/** Text in the requested language, else English (and whether it fell back). */
export function pickLang(text: Partial<Record<Lang, string>> | undefined, lang: Lang) {
  const value = text?.[lang];
  if (value) return { text: value, lang, fellBack: false };
  return { text: text?.english ?? '', lang: 'english' as Lang, fellBack: lang !== 'english' };
}

/** Which segment a running count falls in, for multi-part adhkar. */
export function segmentAt(item: Dhikr, count: number) {
  if (!item.segments) return null;
  let start = 0;
  for (let i = 0; i < item.segments.length; i++) {
    const seg = item.segments[i];
    if (count < start + seg.count || i === item.segments.length - 1) {
      return { index: i, segment: seg, done: Math.min(seg.count, Math.max(0, count - start)) };
    }
    start += seg.count;
  }
  return null;
}

/** Groups a list by time of day, preserving the curated order within each group. */
export function groupByTime(list: Dhikr[]) {
  const groups = new Map<DhikrTime, Dhikr[]>();
  for (const d of list) groups.set(d.time, [...(groups.get(d.time) ?? []), d]);
  return [...groups.entries()]
    .sort((a, b) => TIME_META[a[0]].order - TIME_META[b[0]].order)
    .map(([time, items]) => ({ time, items }));
}
