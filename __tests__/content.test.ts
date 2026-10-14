import { FAVOURITES, OTHERS, groupByTime, pickLang, segmentAt } from '../src/data/adhkar';
import { wallClockToInstant } from '../src/core/time';
import { DEFAULT_SETTINGS } from '../src/store/settings';
import { buildWidgetModel } from '../src/widget/model';

const ALL = [...FAVOURITES, ...OTHERS];

describe('adhkar data', () => {
  it('has unique ids and complete core fields', () => {
    expect(new Set(ALL.map(d => d.id)).size).toBe(ALL.length);
    for (const d of ALL) {
      expect(d.arabic.length).toBeGreaterThan(0);
      expect(d.count).toBeGreaterThan(0);
      expect(d.translations.english).toBeTruthy();
      expect(d.source).toBeTruthy();
      if (d.segments) expect(d.segments.reduce((n, s) => n + s.count, 0)).toBe(d.count);
    }
  });

  it('contains no leftover TODO placeholders', () => {
    expect(JSON.stringify(ALL)).not.toMatch(/TODO/);
  });

  it('no longer shows the post-Fajr text for post-Maghrib in Hindi', () => {
    const maghrib = FAVOURITES.find(d => d.id === 'la_ilaha_illallah_post_maghrib')!;
    expect(maghrib.virtue?.hindi).toMatch(/मग़रिब/);
    expect(maghrib.virtue?.hindi).not.toMatch(/फ़ज्र/);
    expect(maghrib.hadith?.hindi).toMatch(/मग़रिब/);
  });

  it('falls back to English when a language is missing', () => {
    expect(pickLang({ english: 'E' }, 'urdu')).toEqual({ text: 'E', lang: 'english', fellBack: true });
    expect(pickLang({ urdu: 'U', english: 'E' }, 'urdu')).toEqual({ text: 'U', lang: 'urdu', fellBack: false });
  });

  it('tracks the active part of a 33·33·34 tasbih', () => {
    const t = OTHERS.find(d => d.id === 'tasbih_after_salah')!;
    expect(segmentAt(t, 0)).toMatchObject({ index: 0, done: 0 });
    expect(segmentAt(t, 33)).toMatchObject({ index: 1, done: 0 });
    expect(segmentAt(t, 40)).toMatchObject({ index: 1, done: 7 });
    expect(segmentAt(t, 99)).toMatchObject({ index: 2, done: 33 });
    expect(segmentAt(t, 100)).toMatchObject({ index: 2, done: 34 });
  });

  it('groups by time of day in a stable order', () => {
    expect(groupByTime(FAVOURITES).map(g => g.time)).toEqual(['morning', 'evening', 'any']);
    expect(groupByTime(OTHERS).map(g => g.time)).toEqual(['morning', 'evening', 'salah']);
  });
});

describe('widget model', () => {
  const at = (h: number, m: number) => wallClockToInstant({ y: 2026, m: 1, d: 1 }, h * 60 + m, 330);

  it('shows the current period, the next name and a compact countdown', () => {
    const model = buildWidgetModel(DEFAULT_SETTINGS, at(13, 0)); // Varanasi, between Dhuhr and Asr (2:59 PM)
    expect(model.label).toBe('DHUHR');
    expect(model.hint).toBe('→ Asr');
    expect(model.countdown).toBe('1h 59m');
    expect(model.rows.find(r => r.status === 'current')?.name).toBe('Dhuhr');
  });

  it('shows seconds once under an hour remains', () => {
    const model = buildWidgetModel(DEFAULT_SETTINGS, at(14, 30));
    expect(model.countdown).toBe('29m 00s');
  });

  it('works offline for calculated cities', () => {
    const model = buildWidgetModel({ ...DEFAULT_SETTINGS, cityId: 'mum' }, at(13, 0));
    expect(model.rows.length).toBeGreaterThanOrEqual(7);
    expect(model.label).not.toBe('—');
  });
});
