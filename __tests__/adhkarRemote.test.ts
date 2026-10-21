import { FAVOURITES, OTHERS } from '../src/data/adhkar';
import { libraryToRows, rowToDhikr, rowsToLibrary, type AdhkarRow } from '../src/data/adhkar/remote';

const BUNDLED = { favourites: FAVOURITES, others: OTHERS };
const rows = () => libraryToRows(BUNDLED);
const base = (): AdhkarRow => ({ ...rows()[0] });

describe('row mapping', () => {
  it('round-trips the bundled adhkar exactly', () => {
    const lib = rowsToLibrary(rows());
    expect(lib.rejected).toBe(0);
    expect(lib.favourites).toEqual(FAVOURITES);
    expect(lib.others).toEqual(OTHERS);
  });

  it('rejects rows missing required fields or with unknown values', () => {
    expect(rowToDhikr({ ...base(), name: '  ' })).toBeNull();
    expect(rowToDhikr({ ...base(), arabic: '' })).toBeNull();
    expect(rowToDhikr({ ...base(), list: 'popular' })).toBeNull();
    expect(rowToDhikr({ ...base(), time_of_day: 'noon' })).toBeNull();
    expect(rowToDhikr({ ...base(), id: 'Has Spaces' })).toBeNull();
    expect(rowToDhikr({ ...base(), count: 0 })).toBeNull();
    expect(rowToDhikr({ ...base(), is_active: false })).toBeNull();
    expect(rowToDhikr(null)).toBeNull();
    expect(rowToDhikr('nope')).toBeNull();
  });

  it('treats empty text as missing, so the UI falls back to English', () => {
    const d = rowToDhikr({ ...base(), translation_ur: '', virtue_hi: '   ', hadith_ur: null, hadith_hi: null, hadith_en: null, source: '' })!.dhikr;
    expect(d.translations.urdu).toBeUndefined();
    expect(d.virtue?.hindi).toBeUndefined();
    expect(d.hadith).toBeUndefined();
    expect(d.source).toBeUndefined();
  });

  it('accepts numbers sent as strings (e.g. from a CSV export)', () => {
    expect(rowToDhikr({ ...base(), count: '10' })!.dhikr.count).toBe(10);
  });

  it('uses the segment total as the target, and ignores malformed segments', () => {
    const seg = JSON.stringify([
      { arabic: 'سُبْحَانَ اللَّهِ', count: 33, label: 'SubhanAllah' },
      { arabic: 'اللَّهُ أَكْبَرُ', count: 34, label: 'Allahu Akbar' },
    ]);
    expect(rowToDhikr({ ...base(), count: 5, segments: seg })!.dhikr.count).toBe(67);
    const broken = rowToDhikr({ ...base(), count: 5, segments: '[{"arabic":"x"' })!.dhikr;
    expect(broken.segments).toBeUndefined();
    expect(broken.count).toBe(5);
    expect(rowToDhikr({ ...base(), segments: '[{"arabic":"x","count":-1,"label":"y"},{"arabic":"x","count":1,"label":"y"}]' })!.dhikr.segments).toBeUndefined();
  });

  it('orders by sort_order within each list and drops duplicate ids', () => {
    const r = rows();
    const shuffled = [{ ...r[1], sort_order: 5 }, r[0], { ...r[0], name: 'Duplicate' }];
    const lib = rowsToLibrary(shuffled);
    expect(lib.favourites.map(d => d.id)).toEqual([r[1].id, r[0].id]);
    expect(lib.rejected).toBe(1);
  });
});

describe('library download', () => {
  function setup(configured = true) {
    jest.resetModules();
    jest.doMock('../src/config/remote', () => ({
      SUPABASE_URL: configured ? 'https://demo.supabase.co/' : '',
      SUPABASE_ANON_KEY: configured ? 'sb_publishable_demo' : '',
      ADHKAR_TABLE: 'daily_adhkar',
    }));
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const mod = require('../src/store/adhkarLibrary') as typeof import('../src/store/adhkarLibrary');
    return { AsyncStorage, ...mod };
  }

  const respond = (body: unknown, status = 200) =>
    jest.fn().mockResolvedValue({ ok: status < 300, status, json: async () => body } as Response);

  afterEach(async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.clear();
  });

  it('uses the bundled adhkar when no server is configured', async () => {
    const lib = setup(false);
    const fetchImpl = respond(rows());
    expect((await lib.refreshAdhkar({ force: true, fetchImpl })).state).toBe('disabled');
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(lib.getAdhkarLibrary().source).toBe('bundled');
  });

  it('keeps the bundled list when the table is empty', async () => {
    const lib = setup();
    await lib.adhkarCache.load();
    const s = await lib.refreshAdhkar({ force: true, fetchImpl: respond([]) });
    expect(s.state).toBe('empty');
    expect(lib.getAdhkarLibrary().source).toBe('bundled');
    expect(lib.getAdhkarLibrary().favourites).toEqual(FAVOURITES);
  });

  it('replaces the list with server data, caches it, and survives going offline', async () => {
    const lib = setup();
    await lib.adhkarCache.load();
    const server = rows().map(r => (r.id === 'sayyidul_istighfar_morning' ? { ...r, name: 'Sayyidul Istighfar (from server)' } : r));
    const fetchImpl = respond(server);
    expect((await lib.refreshAdhkar({ force: true, fetchImpl })).state).toBe('updated');

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://demo.supabase.co/rest/v1/daily_adhkar?select=*&is_active=eq.true&order=list.asc,sort_order.asc,id.asc');
    expect(init.headers).toEqual({ apikey: 'sb_publishable_demo', Accept: 'application/json' });

    const current = lib.getAdhkarLibrary();
    expect(current.source).toBe('remote');
    expect(current.favourites.find(d => d.id === 'sayyidul_istighfar_morning')?.name).toBe('Sayyidul Istighfar (from server)');

    expect((await lib.refreshAdhkar({ force: true, fetchImpl })).state).toBe('unchanged');
    const offline = await lib.refreshAdhkar({ force: true, fetchImpl: jest.fn().mockRejectedValue(new TypeError('Network request failed')) });
    expect(offline.state).toBe('offline');
    expect(lib.getAdhkarLibrary().source).toBe('remote');

    // A fresh start without network reads the cached download. (resetModules
    // also resets the storage mock, so carry the persisted value across.)
    const persisted = await lib.AsyncStorage.getItem('v2:adhkar-remote');
    expect(persisted).toContain('Sayyidul Istighfar (from server)');
    jest.resetModules();
    await require('@react-native-async-storage/async-storage').default.setItem('v2:adhkar-remote', persisted);
    const again = require('../src/store/adhkarLibrary') as typeof import('../src/store/adhkarLibrary');
    await again.adhkarCache.load();
    expect(again.getAdhkarLibrary().favourites.find(d => d.id === 'sayyidul_istighfar_morning')?.name).toBe(
      'Sayyidul Istighfar (from server)',
    );
  });

  it('reports server errors without touching the list', async () => {
    const lib = setup();
    await lib.adhkarCache.load();
    const s = await lib.refreshAdhkar({ force: true, fetchImpl: respond({ message: 'Invalid API key' }, 401) });
    expect(s).toMatchObject({ state: 'error', message: 'HTTP 401' });
    expect(lib.getAdhkarLibrary().source).toBe('bundled');
  });

  it('throttles automatic checks to every 15 minutes', async () => {
    const lib = setup();
    await lib.adhkarCache.load();
    const fetchImpl = respond(rows());
    await lib.refreshAdhkar({ fetchImpl });
    await lib.refreshAdhkar({ fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    await lib.refreshAdhkar({ fetchImpl, force: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('sends legacy JWT anon keys as a bearer token too', async () => {
    jest.resetModules();
    jest.doMock('../src/config/remote', () => ({ SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'eyJhbGciOi.demo', ADHKAR_TABLE: 'daily_adhkar' }));
    const { fetchAdhkarRows } = require('../src/store/adhkarLibrary') as typeof import('../src/store/adhkarLibrary');
    const fetchImpl = respond([]);
    await fetchAdhkarRows(fetchImpl);
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('Bearer eyJhbGciOi.demo');
  });
});
