import { toIndoPak } from '../../src/core/arabic';
import { FAVOURITES, OTHERS } from '../../src/data/adhkar';

/**
 * Compared as Unicode canonical equivalents (NFC): marks typed in another order, or آ for
 * alif + madd, look identical on screen. (The code writes alif + madd as two characters,
 * since it turns a typed آ into اٰ.)
 */
const printsAs = (input: string, printed: string) => expect(toIndoPak(input).normalize('NFC')).toBe(printed.normalize('NFC'));

describe('toIndoPak', () => {
  it('writes adhkar the way IndoPak dua books print them', () => {
    printsAs(
      'لَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      'لَآ اِلٰهَ اِلَّا اللّٰهُ وَحْدَهٗ لَا شَرِيْكَ لَهٗ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِيْ وَيُمِيْتُ، وَهُوَ عَلٰى كُلِّ شَيْءٍ قَدِيْرٌ',
    );
    printsAs(
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ',
      'اَللّٰهُ لَآ اِلٰهَ اِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ ۚ لَا تَاْخُذُهٗ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهٗ مَا فِي السَّمَاوَاتِ وَمَا فِي الْاَرْضِ ۗ مَن ذَا الَّذِيْ يَشْفَعُ عِندَهٗٓ اِلَّا بِاِذْنِهٖ',
    );
    printsAs('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ', 'سُبْحَانَ اللّٰهِ وَبِحَمْدِهٖ عَدَدَ خَلْقِهٖ');
  });

  it('writes Allah with a standing alif on the shadda, in every form', () => {
    printsAs('بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ');
    printsAs('الْحَمْدُ لِلَّهِ', 'اَلْحَمْدُ لِلّٰهِ');
    printsAs('اللَّهُمَّ أَنْتَ رَبِّي', 'اَللّٰهُمَّ اَنْتَ رَبِّيْ');
    printsAs('بِاللَّهِ، وَاللَّهُ', 'بِاللّٰهِ، وَاللّٰهُ');
  });

  it('accepts shadda typed before the zabar, and an unvoweled shadda', () => {
    const allahIndoPak = '\u0628\u0627\u0644\u0644\u0651\u0670\u0647\u0650'; // bi-llahi: lam, shadda, khari zabar, heh, zer
    expect(toIndoPak('\u0628\u0627\u0644\u0644\u0651\u064E\u0647\u0650')).toBe(allahIndoPak); // shadda, then zabar
    expect(toIndoPak('\u0628\u0627\u0644\u0644\u0651\u0647\u0650')).toBe(allahIndoPak); // shadda alone
  });

  it('marks the long ā of words spelled without an alif', () => {
    printsAs('هَذَا وَهَذِهِ', 'هٰذَا وَهٰذِهٖ');
    printsAs('ذَلِكَ وَلَكِنْ', 'ذٰلِكَ وَلٰكِنْ');
    printsAs('أُولَئِكَ', 'اُولٰٓئِكَ');
    printsAs('لَا إِلَٰهَ إِلَّا هُوَ', 'لَآ اِلٰهَ اِلَّا هُوَ'); // zabar and small alif together
  });

  it('marks alif maqsoorah, except before a silent alif', () => {
    printsAs('سُبْحَانَهُ وَتَعَالَى', 'سُبْحَانَهٗ وَتَعَالٰى');
    printsAs('وَأَنَا عَلَى عَهْدِكَ', 'وَاَنَا عَلٰى عَهْدِكَ');
    printsAs('بِسْمِ اللَّهِ عَلَى الَّذِينَ', 'بِسْمِ اللّٰهِ عَلَى الَّذِيْنَ');
  });

  it('lengthens the pronoun only after a voweled letter, and not before a silent alif', () => {
    printsAs('رَبَّهُ مِنْهُ فِيهِ عَلَيْهِ', 'رَبَّهٗ مِنْهُ فِيْهِ عَلَيْهِ');
    printsAs('مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ', 'مِنْ عِلْمِهٖٓ اِلَّا بِمَا شَآءَ');
    printsAs('وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ', 'وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ');
  });

  it('adds madd to a long vowel before a hamza', () => {
    printsAs('مِنَ السَّمَاءِ', 'مِنَ السَّمَآءِ');
    printsAs('وَأَبُوءُ لَكَ', 'وَاَبُوْٓءُ لَكَ');
    printsAs('رَبِّي إِلَّا أَنْتَ', 'رَبِّيْٓ اِلَّآ اَنْتَ');
    printsAs('لَا يَضُرُّ', 'لَا يَضُرُّ');
    printsAs('قَالُوا إِنَّا', 'قَالُوْٓا اِنَّا');
  });

  it('puts a sukun on a long و or ي, except where it is not read long', () => {
    printsAs('أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ', 'اَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ');
    printsAs('يُحِيطُونَ بِشَيْءٍ', 'يُحِيْطُوْنَ بِشَيْءٍ');
    printsAs('وَقَالُوا الْحَمْدُ لِلَّهِ', 'وَقَالُوا الْحَمْدُ لِلّٰهِ'); // silent alif next
    printsAs('أُولَئِكَ أُولِي الْأَلْبَابِ', 'اُولٰٓئِكَ اُولِي الْاَلْبَابِ'); // silent waw
    printsAs('أُوتِيَ', 'اُوْتِيَ');
    printsAs('عَلَيَّ إِيَّاكَ', 'عَلَيَّ اِيَّاكَ'); // ya with shadda is a consonant
  });

  it('writes a voweled hamza on an alif as a plain alif', () => {
    printsAs('بِإِذْنِهِ يَعْلَمُ', 'بِاِذْنِهٖ يَعْلَمُ');
    printsAs('آيَةُ الْكُرْسِيِّ', 'اٰيَةُ الْكُرْسِيِّ');
    printsAs('الْأَرْضِ', 'اَلْاَرْضِ');
  });

  it('leaves unvoweled, Urdu and English text alone', () => {
    for (const text of ['الله', 'لا إله إلا الله', 'اللہ پاک ہے', 'اللہ کے رسول ﷺ', 'The Messenger of Allah ﷺ', 'شَيْءٍ', 'هُدًى', 'لَكُنْتُ', 'مِنَ اللَّهَبِ']) {
      expect(toIndoPak(text)).toBe(text);
    }
  });

  it('is idempotent over every bundled dhikr', () => {
    for (const d of [...FAVOURITES, ...OTHERS]) {
      for (const text of [d.arabic, d.nameAr, ...(d.segments ?? []).map(s => s.arabic)]) {
        const once = toIndoPak(text);
        expect(toIndoPak(once)).toBe(once);
      }
    }
  });
});
