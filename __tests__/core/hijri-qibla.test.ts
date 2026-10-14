import { formatHijri, formatHijriUrdu, toHijri } from '../../src/core/hijri';
import { compassPoint, distanceToKaabaKm, qiblaBearing } from '../../src/core/qibla';
import { diffDays } from '../../src/core/time';

describe('hijri', () => {
  // Reference dates (Umm al-Qura). The tabular calendar may legitimately
  // differ by a day — that is what the user adjustment is for.
  const anchors: Array<[{ y: number; m: number; d: number }, number, number, number]> = [
    [{ y: 2024, m: 7, d: 7 }, 1446, 1, 1],
    [{ y: 2024, m: 3, d: 11 }, 1445, 9, 1],
    [{ y: 2025, m: 3, d: 1 }, 1446, 9, 1],
    [{ y: 2026, m: 6, d: 16 }, 1448, 1, 1],
  ];

  it.each(anchors)('%j is within a day of %i/%i/%i', (g, hy, hm, hd) => {
    const h = toHijri(g);
    const offsets = [-1, 0, 1].map(o => toHijri(g, o));
    expect(offsets.some(x => x.y === hy && x.m === hm && x.d === hd)).toBe(true);
    expect(h.y).toBeGreaterThanOrEqual(hy - 1);
  });

  it('advances one day per Gregorian day and applies the adjustment', () => {
    const a = toHijri({ y: 2026, m: 10, d: 14 });
    const b = toHijri({ y: 2026, m: 10, d: 14 }, 1);
    const c = toHijri({ y: 2026, m: 10, d: 15 });
    expect(b).toEqual(c);
    expect(a.m).toBe(5); // Jumada al-Ula 1448
    expect(a.y).toBe(1448);
  });

  it('formats in English and Urdu', () => {
    expect(formatHijri({ y: 1448, m: 9, d: 1 })).toBe('1 Ramadan 1448 AH');
    expect(formatHijriUrdu({ y: 1448, m: 9, d: 1 })).toBe('۱ رمضان ۱۴۴۸ھ');
  });

  it('never produces day 0 or day 31 across a full year', () => {
    let g = { y: 2026, m: 1, d: 1 };
    for (let i = 0; i < 400; i++) {
      const h = toHijri(g);
      expect(h.d).toBeGreaterThanOrEqual(1);
      expect(h.d).toBeLessThanOrEqual(30);
      const next = new Date(Date.UTC(g.y, g.m - 1, g.d + 1));
      g = { y: next.getUTCFullYear(), m: next.getUTCMonth() + 1, d: next.getUTCDate() };
    }
    expect(diffDays({ y: 2026, m: 1, d: 1 }, g)).toBe(400);
  });
});

describe('qibla', () => {
  it('matches published bearings', () => {
    expect(qiblaBearing(51.5074, -0.1278)).toBeCloseTo(119.0, 0); // London
    expect(qiblaBearing(40.7128, -74.006)).toBeCloseTo(58.5, 0); // New York
    expect(qiblaBearing(28.6139, 77.209)).toBeCloseTo(266.6, 0); // Delhi
    expect(compassPoint(qiblaBearing(25.3176, 82.9739))).toBe('W');
  });

  it('measures distance to the Kaaba', () => {
    const km = distanceToKaabaKm(28.6139, 77.209);
    expect(km).toBeGreaterThan(3800);
    expect(km).toBeLessThan(3870);
  });
});
