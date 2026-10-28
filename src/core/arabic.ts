// Arabic is shown in IndoPak (South Asian) script, as in Qur'ans and dua books
// printed in India and Pakistan. Our adhkar — bundled and from Supabase — are
// typed in ordinary Arabic spelling, so they are rewritten when the library is
// assembled. Text that's already IndoPak passes through unchanged.
//
//   khari zabar  a long ā with no alif: اللّٰهِ, إِلٰهَ, عَلٰى, الرَّحْمٰنِ, هٰذَا
//   ulta pesh    the pronoun "hu" read long: وَحْدَهٗ, لَهٗ
//   khari zer    the pronoun "hi" read long: بِحَمْدِهٖ, خَلْقِهٖ
//   madd         a long vowel before a hamza: لَآ اِلٰهَ, شَآءَ, عِنْدَهٗٓ اِلَّا
//   sukun        on a long و or ي: شَرِيْكَ, قَدِيْرٌ, اَعُوْذُ, رَبِّيْٓ
//   alif         a voweled hamza on an alif is a plain alif: اَنْتَ, اِلٰهَ, اٰيَةُ,
//                and text that opens with al- shows its zabar: اَللّٰهُمَّ
//
// A vowel before a silent alif (لَهُ الْمُلْكُ, عَلَى الَّذِيْنَ, فِي الْاَرْضِ) isn't
// pronounced long, so it stays short and unmarked, as in the mushaf.

const ZABAR = '\u064E';
const PESH = '\u064F';
const ZER = '\u0650';
const SHADDA = '\u0651';
const SUKUN = '\u0652';
const MADD = '\u0653';
const KHARI_ZER = '\u0656';
const ULTA_PESH = '\u0657';
const KHARI_ZABAR = '\u0670';
const ALIF = '\u0627';
const ALIF_MAQSURA = '\u0649';
const LAM = '\u0644';
const HEH = '\u0647';
/** Tanween, zabar, pesh, zer, shadda, sukun. */
const MARK = '\u064B-\u0652';
const SHORT_VOWEL = `${ZABAR}${PESH}${ZER}`;
const LETTER = '\u0621-\u064A\u0671-\u06D3';
/** A consonant (any letter but alif) carrying a short vowel, with or without shadda. */
const VOWELED = `[\u0621-\u0626\u0628-\u064A](?:${SHADDA}?[${SHORT_VOWEL}]|[${SHORT_VOWEL}]${SHADDA})`;
/** ء أ ؤ إ ئ آ */
const HAMZA = '\u0621-\u0626';
const WORD_END = `(?![${LETTER}${MARK}])`;
/** Start of a word, or after a one-letter prefix such as وَ, فَ, بِ, لِ or كَ. */
const WORD_START = `(^|[^${LETTER}${MARK}]|[\u0648\u0641\u0628\u0644\u0643][${MARK}]*)`;
/** The next word begins with a silent alif (الْ…, ٱ). */
const SILENT_ALIF_NEXT = `${WORD_END}\\s+(?:\u0671|${ALIF}(?![${MARK}]))`;
/** The next word begins with a hamza, or with an IndoPak alif that stands for one (اَنْتَ). */
const HAMZA_NEXT = `${WORD_END}\\s+(?:[${HAMZA}]|${ALIF}[${SHORT_VOWEL}])`;

const re = (source: string) => new RegExp(source, 'g');

const RULES: [RegExp, string][] = [
  // Lam-alif typed with its marks after the alif (لاَ, إِلاَّ): move them to the lam.
  [re(`${LAM}${ALIF}([${ZABAR}${SHADDA}]+)`), `${LAM}$1${ALIF}`],

  // ─── Khari zabar ───
  // Allah, in every form: اللّٰهِ, لِلّٰهِ, بِاللّٰهِ, اللّٰهُمَّ. Not اللَّهَبِ (flame), اللَّهْوُ (play),
  // or a lone لَّهُ ("lahu", one lam).
  [
    re(`(${LAM}[${MARK}]?)${LAM}(?:${ZABAR}${SHADDA}|${SHADDA}${ZABAR}?)${HEH}(?!${SUKUN})(?![\u064B-\u0650]?[\u0621-\u0644\u0646-\u064A\u0671-\u06D3])`),
    `$1${LAM}${SHADDA}${KHARI_ZABAR}${HEH}`,
  ],
  // Common words whose ā has no alif in ordinary spelling.
  [re(`(\u0625${ZER}?${LAM})${ZABAR}(?=${HEH})`), `$1${KHARI_ZABAR}`], // إِلٰهَ
  [re(`(\u0631${SHADDA}?${ZABAR}?${SHADDA}?\u062D${SUKUN}?\u0645)${ZABAR}(?=\u0646)`), `$1${KHARI_ZABAR}`], // الرَّحْمٰنِ
  [re(`${WORD_START}${HEH}${ZABAR}(?=\u0630[${ZABAR}${ZER}]|\u0624)`), `$1${HEH}${KHARI_ZABAR}`], // هٰذَا, هٰذِهِ, هٰؤُلَاءِ
  [re(`${WORD_START}\u0630${ZABAR}(?=${LAM}${ZER}\u0643)`), `$1\u0630${KHARI_ZABAR}`], // ذٰلِكَ
  [re(`${WORD_START}${LAM}${ZABAR}(?=\u0643${ZER}\u0646)`), `$1${LAM}${KHARI_ZABAR}`], // لٰكِنْ
  [re(`(\u0623${PESH}?\u0648${SUKUN}?${LAM})${ZABAR}(?=\u0626)`), `$1${KHARI_ZABAR}`], // أُولٰئِكَ
  // Alif maqsoorah at the end of a word: عَلٰى, إِلٰى, تَعَالٰى.
  [re(`${ZABAR}(?=${ALIF_MAQSURA}(?![${KHARI_ZABAR}])${WORD_END}(?!${SILENT_ALIF_NEXT}))`), KHARI_ZABAR],
  // Madinah-mushaf text writes a zabar as well (إِلَٰهَ); IndoPak shows the khari zabar alone.
  [re(`${ZABAR}${KHARI_ZABAR}`), KHARI_ZABAR],

  // ─── Ulta pesh and khari zer ───
  // The pronoun ـهُ / ـهِ is read long after a voweled letter (وَحْدَهٗ, بِحَمْدِهٖ), short
  // after a sukun or long vowel (مِنْهُ, فِيهِ, عَلَيْهِ). Allah has no short vowel before its heh.
  [re(`(${VOWELED})${HEH}${PESH}${WORD_END}(?!${SILENT_ALIF_NEXT})`), `$1${HEH}${ULTA_PESH}`],
  [re(`(${VOWELED})${HEH}${ZER}${WORD_END}(?!${SILENT_ALIF_NEXT})`), `$1${HEH}${KHARI_ZER}`],

  // ─── Madd ───
  // A long vowel followed by a hamza, in the same word or the next: لَآ اِلٰهَ, السَّمَآءِ,
  // اَبُوٓءُ, رَبِّيٓ اِلَّا, عِلْمِهٖٓ اِلَّا, اُولٰٓئِكَ. A plural's silent alif may follow the
  // waw (قَالُوٓا اِنَّا). (Not before a shadda: a prefix + silent alif, as in فَاتَّقُوا,
  // can't be told apart from a long ā there.)
  [
    re(
      `(${ZABAR}${SHADDA}?${ALIF}|${PESH}${SHADDA}?\u0648${SUKUN}?|${ZER}${SHADDA}?\u064A${SUKUN}?|${KHARI_ZABAR}|${KHARI_ZER}|${ULTA_PESH})(?=[${ALIF_MAQSURA}${ALIF}]?(?:[${HAMZA}]|${HAMZA_NEXT}))`,
    ),
    `$1${MADD}`,
  ],

  // ─── Sukun on a long و or ي ───
  // شَرِيْكَ, يُحْيِيْ, الْقَيُّوْمُ, قَالُوْا. Not where a silent alif follows (فِي الْاَرْضِ),
  // nor the silent waw of اُولٰٓئِكَ, اُولِي, اُولُوا (a waw after أُ, before lam).
  [
    re(
      `((?:^|[^\u0623\u0627])${PESH}${SHADDA}?\u0648|[\u0623\u0627]${PESH}\u0648(?!${LAM})|${ZER}${SHADDA}?\u064A)(?![${MARK}])(?!${ALIF}?${SILENT_ALIF_NEXT})`,
    ),
    `$1${SUKUN}`,
  ],

  // ─── Alif ───
  [re(`[\u0623\u0625](?=[${MARK}])`), ALIF], // اَنْتَ, اِلٰهَ, الْاَرْضِ, تَاْخُذُهٗ
  [re('\u0622'), `${ALIF}${KHARI_ZABAR}`], // اٰيَةُ, الْقُرْاٰنُ
  // At the very start the al- alif is pronounced: اَللّٰهُمَّ, اَلْحَمْدُ. (Voweled text only, so
  // Urdu's اللہ is left alone.)
  [re(`^(\\s*)${ALIF}(?=${LAM}(?:${SUKUN}|[\u0628-\u064A][${SHORT_VOWEL}]?${SHADDA}))`), `$1${ALIF}${ZABAR}`],
];

export const toIndoPak = (text: string) => RULES.reduce((t, [pattern, replacement]) => t.replace(pattern, replacement), text);
