export type Lang = 'urdu' | 'hindi' | 'english';

/** Missing languages fall back to English in the UI (with a note). */
export type LocalizedText = Partial<Record<Lang, string>>;

export type DhikrTime = 'morning' | 'evening' | 'any' | 'salah';

/** For multi-part adhkar (e.g. 33 × SubhanAllah, 33 × Alhamdulillah, 34 × Allahu Akbar). */
export type DhikrSegment = { arabic: string; count: number; label: string };

export type Dhikr = {
  id: string;
  name: string;
  nameAr: string;
  time: DhikrTime;
  /** Target repetitions per day (sum of segments when present). */
  count: number;
  arabic: string;
  translations: LocalizedText;
  virtue?: LocalizedText;
  hadith?: LocalizedText;
  /** Short reference shown as a chip, e.g. "Sahih al-Bukhari 6306". */
  source?: string;
  segments?: DhikrSegment[];
};
