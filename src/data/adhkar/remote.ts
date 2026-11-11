// Mapping between rows of the Supabase table public.daily_adhkar
// (supabase/migrations/…_daily_adhkar.sql) and the app's Dhikr objects.
// Shared by the app (download) and scripts/export-adhkar.js (CSV/SQL seed),
// so the two can't drift apart.
import type { AdhkarLibrary, Dhikr, DhikrListKey, DhikrSegment, DhikrTime, LocalizedText } from './types';

export type AdhkarRow = {
  id: string;
  list: DhikrListKey;
  time_of_day: DhikrTime;
  sort_order: number;
  name: string;
  name_ar: string;
  arabic: string;
  count: number;
  segments: string | null;
  translation_ur: string | null;
  translation_hi: string | null;
  translation_en: string | null;
  virtue_ur: string | null;
  virtue_hi: string | null;
  virtue_en: string | null;
  hadith_ur: string | null;
  hadith_hi: string | null;
  hadith_en: string | null;
  source: string | null;
  is_active: boolean;
};

/** Column order used for the CSV and SQL seed files. */
export const ROW_COLUMNS: (keyof AdhkarRow)[] = [
  'id', 'list', 'time_of_day', 'sort_order', 'name', 'name_ar', 'arabic', 'count', 'segments',
  'translation_ur', 'translation_hi', 'translation_en',
  'virtue_ur', 'virtue_hi', 'virtue_en',
  'hadith_ur', 'hadith_hi', 'hadith_en',
  'source', 'is_active',
];

const LISTS: DhikrListKey[] = ['favourites', 'others'];
const TIMES: DhikrTime[] = ['morning', 'evening', 'salah', 'any'];

// ─── App → row (for the seed files) ──────────────────────────────────────────

export function dhikrToRow(d: Dhikr, list: DhikrListKey, sortOrder: number): AdhkarRow {
  const t = (v: string | undefined) => v ?? null;
  return {
    id: d.id,
    list,
    time_of_day: d.time,
    sort_order: sortOrder,
    name: d.name,
    name_ar: d.nameAr,
    arabic: d.arabic,
    count: d.count,
    segments: d.segments ? JSON.stringify(d.segments) : null,
    translation_ur: t(d.translations.urdu),
    translation_hi: t(d.translations.hindi),
    translation_en: t(d.translations.english),
    virtue_ur: t(d.virtue?.urdu),
    virtue_hi: t(d.virtue?.hindi),
    virtue_en: t(d.virtue?.english),
    hadith_ur: t(d.hadith?.urdu),
    hadith_hi: t(d.hadith?.hindi),
    hadith_en: t(d.hadith?.english),
    source: t(d.source),
    is_active: true,
  };
}

/** Rows for a whole library, ordered as the app shows them (sort_order in steps of 10). */
export function libraryToRows(lib: AdhkarLibrary): AdhkarRow[] {
  return LISTS.flatMap(list => lib[list].map((d, i) => dhikrToRow(d, list, (i + 1) * 10)));
}

// ─── Row → app (downloaded data is untrusted: validate everything) ──────────

const text = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const s = v.trim();
  return s ? s : undefined;
};

function localized(ur: unknown, hi: unknown, en: unknown): LocalizedText | undefined {
  const out: LocalizedText = {};
  const u = text(ur);
  const h = text(hi);
  const e = text(en);
  if (u) out.urdu = u;
  if (h) out.hindi = h;
  if (e) out.english = e;
  return Object.keys(out).length ? out : undefined;
}

function parseSegments(raw: unknown): DhikrSegment[] | undefined {
  const s = text(raw);
  if (!s) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch {
    return undefined;
  }
  if (!Array.isArray(parsed) || parsed.length < 2) return undefined;
  const segments: DhikrSegment[] = [];
  for (const p of parsed) {
    if (typeof p !== 'object' || p === null) return undefined;
    const seg = p as Record<string, unknown>;
    const arabic = text(seg.arabic);
    const label = text(seg.label);
    const count = seg.count;
    if (!arabic || !label || typeof count !== 'number' || !Number.isInteger(count) || count < 1) return undefined;
    segments.push({ arabic, count, label });
  }
  return segments;
}

export type ParsedRow = { list: DhikrListKey; order: number; dhikr: Dhikr };

/** Null when the row is unusable (missing required fields or bad values). */
export function rowToDhikr(raw: unknown): ParsedRow | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const id = text(r.id);
  const name = text(r.name);
  const arabic = text(r.arabic);
  const list = r.list as DhikrListKey;
  const time = r.time_of_day as DhikrTime;
  const count = typeof r.count === 'number' ? r.count : Number(r.count);
  if (!id || !/^[a-z0-9_]+$/.test(id) || !name || !arabic) return null;
  if (!LISTS.includes(list) || !TIMES.includes(time)) return null;
  if (r.is_active === false) return null;

  const segments = parseSegments(r.segments);
  // With segments, their sum is the target — the counter steps through them.
  const target = segments ? segments.reduce((n, s) => n + s.count, 0) : count;
  if (!Number.isInteger(target) || target < 1 || target > 100000) return null;

  const translations = localized(r.translation_ur, r.translation_hi, r.translation_en) ?? {};
  const dhikr: Dhikr = { id, name, nameAr: text(r.name_ar) ?? '', time, count: target, arabic, translations };
  const virtue = localized(r.virtue_ur, r.virtue_hi, r.virtue_en);
  const hadith = localized(r.hadith_ur, r.hadith_hi, r.hadith_en);
  const source = text(r.source);
  if (virtue) dhikr.virtue = virtue;
  if (hadith) dhikr.hadith = hadith;
  if (source) dhikr.source = source;
  if (segments) dhikr.segments = segments;

  const order = typeof r.sort_order === 'number' && Number.isFinite(r.sort_order) ? r.sort_order : 0;
  return { list, order, dhikr };
}

export type ParsedLibrary = AdhkarLibrary & { total: number; rejected: number };

export function rowsToLibrary(rows: unknown[]): ParsedLibrary {
  const parsed: ParsedRow[] = [];
  const seen = new Set<string>();
  let rejected = 0;
  for (const raw of rows) {
    const p = rowToDhikr(raw);
    if (!p || seen.has(p.dhikr.id)) {
      rejected++;
      continue;
    }
    seen.add(p.dhikr.id);
    parsed.push(p);
  }
  // Stable: equal sort_order keeps the server's order.
  const ordered = parsed.map((p, i) => ({ ...p, i })).sort((a, b) => a.order - b.order || a.i - b.i);
  const pick = (list: DhikrListKey) => ordered.filter(p => p.list === list).map(p => p.dhikr);
  return { favourites: pick('favourites'), others: pick('others'), total: parsed.length, rejected };
}
