import { useSyncExternalStore } from 'react';
import { ADHKAR_TABLE, SUPABASE_ANON_KEY, SUPABASE_URL } from '../config/remote';
import { toIndoPak } from '../core/arabic';
import { FAVOURITES, OTHERS } from '../data/adhkar';
import { rowsToLibrary } from '../data/adhkar/remote';
import type { AdhkarLibrary, Dhikr, LocalizedText } from '../data/adhkar/types';
import { createPersistedStore, isRecord, useStore } from './persisted';

// The adhkar shown in the app come from, in order of preference:
//   1. the latest download from Supabase (cached, so it works offline),
//   2. the adhkar bundled with the app.
// A download that fails, or returns no usable rows, never replaces what the
// user already has — an empty table falls back to the bundled list.

export const BUNDLED: AdhkarLibrary = { favourites: FAVOURITES, others: OTHERS };

type Snapshot = { rows: unknown[]; fetchedAt: number };

export const adhkarCache = createPersistedStore<Snapshot | null>('v2:adhkar-remote', null, {
  sanitize: raw =>
    isRecord(raw) && Array.isArray(raw.rows) && typeof raw.fetchedAt === 'number' ? { rows: raw.rows, fetchedAt: raw.fetchedAt } : null,
});

export type LibraryState = AdhkarLibrary & { source: 'remote' | 'bundled'; fetchedAt?: number };

/** Text as the screens show it: IndoPak script (see core/arabic). */
function forDisplay(lib: AdhkarLibrary): AdhkarLibrary {
  const local = (t: LocalizedText | undefined) =>
    t && (Object.fromEntries(Object.entries(t).map(([lang, v]) => [lang, v && toIndoPak(v)])) as LocalizedText);
  const dhikr = (d: Dhikr): Dhikr => ({
    ...d,
    nameAr: toIndoPak(d.nameAr),
    arabic: toIndoPak(d.arabic),
    translations: local(d.translations) ?? {},
    virtue: local(d.virtue),
    hadith: local(d.hadith),
    segments: d.segments?.map(seg => ({ ...seg, arabic: toIndoPak(seg.arabic) })),
  });
  return { favourites: lib.favourites.map(dhikr), others: lib.others.map(dhikr) };
}

let bundledForDisplay: AdhkarLibrary | undefined;
let derivedFrom: Snapshot | null | undefined;
let derived: LibraryState | undefined;

/** The adhkar currently in use (remote cache if it has any valid rows, else bundled). */
export function getAdhkarLibrary(): LibraryState {
  const snap = adhkarCache.get();
  if (!derived || snap !== derivedFrom) {
    derivedFrom = snap;
    const lib = snap ? rowsToLibrary(snap.rows) : null;
    if (lib && lib.total > 0) {
      derived = { ...forDisplay(lib), source: 'remote', fetchedAt: snap!.fetchedAt };
    } else {
      bundledForDisplay = bundledForDisplay ?? forDisplay(BUNDLED);
      derived = { ...bundledForDisplay, source: 'bundled' };
    }
  }
  return derived;
}

export function useAdhkarLibrary(): LibraryState {
  useStore(adhkarCache);
  return getAdhkarLibrary();
}

// ─── Downloading ─────────────────────────────────────────────────────────────

export const remoteConfigured = () => SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

export type CheckStatus = {
  state: 'idle' | 'checking' | 'updated' | 'unchanged' | 'empty' | 'offline' | 'error' | 'disabled';
  at?: number;
  message?: string;
};

let status: CheckStatus = { state: remoteConfigured() ? 'idle' : 'disabled' };
const statusListeners = new Set<() => void>();
const setStatus = (s: CheckStatus) => {
  status = s;
  statusListeners.forEach(l => l());
};
const subscribeStatus = (listener: () => void) => {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
};
export const useAdhkarCheckStatus = () => useSyncExternalStore(subscribeStatus, () => status, () => status);

/** Requests the table through Supabase's REST API (PostgREST). */
export async function fetchAdhkarRows(fetchImpl: typeof fetch = fetch, timeoutMs = 12_000): Promise<unknown[]> {
  const url =
    `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/${ADHKAR_TABLE}` +
    '?select=*&is_active=eq.true&order=list.asc,sort_order.asc,id.asc';
  const headers: Record<string, string> = { apikey: SUPABASE_ANON_KEY, Accept: 'application/json' };
  // Legacy anon keys are JWTs and also go in Authorization; new publishable keys don't.
  if (SUPABASE_ANON_KEY.startsWith('eyJ')) headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { headers, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body: unknown = await res.json();
    if (!Array.isArray(body)) throw new Error('Unexpected response');
    return body;
  } finally {
    clearTimeout(timer);
  }
}

const MIN_INTERVAL_MS = 15 * 60_000;
let lastAttempt = 0;
let inFlight: Promise<CheckStatus> | null = null;

/**
 * Downloads the latest adhkar if online. Throttled to once per 15 minutes
 * unless `force` (e.g. pull-to-refresh). Never throws.
 */
export function refreshAdhkar({ force = false, fetchImpl }: { force?: boolean; fetchImpl?: typeof fetch } = {}): Promise<CheckStatus> {
  if (!remoteConfigured()) return Promise.resolve(status);
  if (inFlight) return inFlight;
  if (!force && Date.now() - lastAttempt < MIN_INTERVAL_MS) return Promise.resolve(status);
  lastAttempt = Date.now();
  setStatus({ ...status, state: 'checking' });

  inFlight = (async (): Promise<CheckStatus> => {
    let next: CheckStatus;
    try {
      const rows = await fetchAdhkarRows(fetchImpl);
      const lib = rowsToLibrary(rows);
      if (lib.total === 0) {
        next = { state: 'empty', at: Date.now(), message: 'The online table has no adhkar yet — using the built-in list.' };
      } else {
        const prev = adhkarCache.get();
        const changed = !prev || JSON.stringify(prev.rows) !== JSON.stringify(rows);
        adhkarCache.set({ rows, fetchedAt: Date.now() });
        await adhkarCache.flush();
        const skipped = lib.rejected ? ` (${lib.rejected} invalid row${lib.rejected === 1 ? '' : 's'} skipped)` : '';
        next = { state: changed ? 'updated' : 'unchanged', at: Date.now(), message: `${lib.total} adhkar${skipped}` };
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const offline = /network|abort|failed to fetch|timed? ?out/i.test(msg);
      next = { state: offline ? 'offline' : 'error', at: Date.now(), message: offline ? 'No connection' : msg };
    }
    setStatus(next);
    inFlight = null;
    return next;
  })();
  return inFlight;
}

/** Test helper: forget throttling and status between tests. */
export function __resetAdhkarSync() {
  lastAttempt = 0;
  inFlight = null;
  setStatus({ state: remoteConfigured() ? 'idle' : 'disabled' });
}
