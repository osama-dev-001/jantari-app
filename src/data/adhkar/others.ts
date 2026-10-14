import type { Dhikr } from './types';

// Added in the v2 rebuild (Oct 2026) — PENDING OWNER REVIEW of references and
// Urdu/Hindi wording before relying on them. Only narrations from Sahih Muslim
// or graded Sahih were chosen. Hadith texts are English-only for now; the UI
// falls back to English for missing languages.

export const OTHERS: Dhikr[] = [
  {
    id: 'istighfar_after_salah',
    name: 'Istighfar after Salah',
    nameAr: 'أَسْتَغْفِرُ اللَّهَ',
    time: 'salah',
    count: 4,
    source: 'Sahih Muslim 591',
    arabic: 'أَسْتَغْفِرُ اللَّهَ · اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    segments: [
      { arabic: 'أَسْتَغْفِرُ اللَّهَ', count: 3, label: 'Astaghfirullah' },
      {
        arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
        count: 1,
        label: 'Allahumma antas-salam',
      },
    ],
    translations: {
      urdu: 'میں اللہ سے مغفرت مانگتا ہوں (تین بار)۔ اے اللہ! تو ہی سلامتی والا ہے اور تجھ ہی سے سلامتی ہے، تو بڑی برکت والا ہے، اے جلال اور عزت والے۔',
      hindi: 'मैं अल्लाह से मग़फ़िरत माँगता हूँ (तीन बार)। ऐ अल्लाह! तू ही सलामती वाला है और तुझ ही से सलामती है, तू बड़ी बरकत वाला है, ऐ जलाल और इज़्ज़त वाले।',
      english: 'I seek the forgiveness of Allah (three times). O Allah, You are Peace and from You is peace. Blessed are You, O Owner of Majesty and Honour.',
    },
    virtue: {
      urdu: 'نبی ﷺ ہر فرض نماز کے سلام کے فوراً بعد یہ پڑھا کرتے تھے — یہ آپ ﷺ کی مستقل سنت ہے۔',
      hindi: 'नबी ﷺ हर फ़र्ज़ नमाज़ के सलाम के फ़ौरन बाद यह पढ़ा करते थे — यह आप ﷺ की मुस्तक़िल सुन्नत है।',
      english: 'The Prophet ﷺ said this immediately after the salam of every obligatory prayer — a constant Sunnah.',
    },
    hadith: {
      english:
        'Thawban (رضي الله عنه) reported: When the Messenger of Allah ﷺ finished his prayer, he would seek forgiveness three times and then say: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ" — O Allah, You are Peace and from You is peace; blessed are You, O Owner of Majesty and Honour. (Sahih Muslim 591)',
    },
  },

  {
    id: 'tasbih_after_salah',
    name: 'Tasbih after Salah',
    nameAr: 'سُبْحَانَ اللَّهِ · الْحَمْدُ لِلَّهِ · اللَّهُ أَكْبَرُ',
    time: 'salah',
    count: 100,
    source: 'Sahih Muslim 596',
    arabic: 'سُبْحَانَ اللَّهِ · الْحَمْدُ لِلَّهِ · اللَّهُ أَكْبَرُ',
    segments: [
      { arabic: 'سُبْحَانَ اللَّهِ', count: 33, label: 'SubhanAllah' },
      { arabic: 'الْحَمْدُ لِلَّهِ', count: 33, label: 'Alhamdulillah' },
      { arabic: 'اللَّهُ أَكْبَرُ', count: 34, label: 'Allahu Akbar' },
    ],
    translations: {
      urdu: 'اللہ پاک ہے (۳۳)۔ تمام تعریفیں اللہ کے لیے ہیں (۳۳)۔ اللہ سب سے بڑا ہے (۳۴)۔',
      hindi: 'अल्लाह पाक है (33)। तमाम तारीफ़ें अल्लाह के लिए हैं (33)। अल्लाह सबसे बड़ा है (34)।',
      english: 'Glory be to Allah (33). All praise is for Allah (33). Allah is the Greatest (34).',
    },
    virtue: {
      urdu: 'ہر فرض نماز کے بعد پڑھنے والا کبھی ناکام و نامراد نہیں ہوگا۔',
      hindi: 'हर फ़र्ज़ नमाज़ के बाद पढ़ने वाला कभी नाकाम व नामुराद नहीं होगा।',
      english: 'Whoever says these after every obligatory prayer will never be disappointed.',
    },
    hadith: {
      english:
        'Ka\'b ibn \'Ujrah (رضي الله عنه) reported that the Messenger of Allah ﷺ said: "There are phrases said after every obligatory prayer whose reciter will never be disappointed: thirty-three times SubhanAllah, thirty-three times Alhamdulillah, and thirty-four times Allahu Akbar." (Sahih Muslim 596)',
    },
  },

  {
    id: 'ayatul_kursi_after_salah',
    name: 'Ayat al-Kursi',
    nameAr: 'آيَةُ الْكُرْسِيِّ',
    time: 'salah',
    count: 1,
    source: "an-Nasa'i, al-Kubra 9928",
    arabic:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    translations: {
      urdu: 'اللہ — اس کے سوا کوئی معبود نہیں، وہ ہمیشہ زندہ رہنے والا، سب کو قائم رکھنے والا ہے۔ نہ اسے اونگھ آتی ہے نہ نیند۔ جو کچھ آسمانوں میں ہے اور جو کچھ زمین میں ہے سب اسی کا ہے۔ کون ہے جو اس کی اجازت کے بغیر اس کے پاس سفارش کر سکے؟ وہ جانتا ہے جو کچھ ان کے آگے ہے اور جو کچھ ان کے پیچھے ہے، اور وہ اس کے علم میں سے کسی چیز کا احاطہ نہیں کر سکتے مگر جتنا وہ چاہے۔ اس کی کرسی آسمانوں اور زمین پر چھائی ہوئی ہے، اور ان دونوں کی حفاظت اسے تھکاتی نہیں، اور وہی بلند مرتبہ، بڑی عظمت والا ہے۔',
      hindi: 'अल्लाह — उसके सिवा कोई माबूद नहीं, वह हमेशा ज़िंदा रहने वाला, सबको क़ायम रखने वाला है। न उसे ऊँघ आती है न नींद। जो कुछ आसमानों में है और जो कुछ ज़मीन में है सब उसी का है। कौन है जो उसकी इजाज़त के बग़ैर उसके पास सिफ़ारिश कर सके? वह जानता है जो कुछ उनके आगे है और जो कुछ उनके पीछे है, और वह उसके इल्म में से किसी चीज़ का इहाता नहीं कर सकते मगर जितना वह चाहे। उसकी कुर्सी आसमानों और ज़मीन पर छाई हुई है, और उन दोनों की हिफ़ाज़त उसे थकाती नहीं, और वही बुलंद मर्तबा, बड़ी अज़मत वाला है।',
      english:
        'Allah — there is no god except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who could intercede with Him except by His permission? He knows what is before them and what is behind them, and they encompass nothing of His knowledge except what He wills. His Kursi extends over the heavens and the earth, and guarding them does not tire Him. And He is the Most High, the Most Great. (al-Baqarah 2:255)',
    },
    virtue: {
      urdu: 'جو ہر فرض نماز کے بعد آیت الکرسی پڑھے، اسے جنت میں داخل ہونے سے موت کے سوا کوئی چیز نہیں روکتی۔',
      hindi: 'जो हर फ़र्ज़ नमाज़ के बाद आयतुल कुर्सी पढ़े, उसे जन्नत में दाख़िल होने से मौत के सिवा कोई चीज़ नहीं रोकती।',
      english: 'Whoever recites it after every obligatory prayer — nothing stands between him and Paradise except death.',
    },
    hadith: {
      english:
        'Abu Umamah (رضي الله عنه) reported that the Messenger of Allah ﷺ said: "Whoever recites Ayat al-Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death." (an-Nasa\'i, as-Sunan al-Kubra 9928 — graded Sahih by al-Albani)',
    },
  },

  ...(['morning', 'evening'] as const).map(
    (time): Dhikr => ({
      id: `bismillah_la_yadurr_${time}`,
      name: `Bismillahilladhi (${time === 'morning' ? 'Morning' : 'Evening'})`,
      nameAr: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ',
      time,
      count: 3,
      source: "Jami' at-Tirmidhi 3388",
      arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      translations: {
        urdu: 'اللہ کے نام کے ساتھ، جس کے نام کے ساتھ زمین اور آسمان میں کوئی چیز نقصان نہیں پہنچا سکتی، اور وہی خوب سننے والا، خوب جاننے والا ہے۔',
        hindi: 'अल्लाह के नाम के साथ, जिसके नाम के साथ ज़मीन और आसमान में कोई चीज़ नुक़सान नहीं पहुँचा सकती, और वही ख़ूब सुनने वाला, ख़ूब जानने वाला है।',
        english: 'In the name of Allah, with whose name nothing on the earth or in the heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
      },
      virtue: {
        urdu: 'صبح و شام تین تین مرتبہ پڑھنے والے کو کوئی چیز نقصان نہیں پہنچا سکتی۔',
        hindi: 'सुबह व शाम तीन-तीन मर्तबा पढ़ने वाले को कोई चीज़ नुक़सान नहीं पहुँचा सकती।',
        english: 'Whoever says it three times in the morning and three times in the evening — nothing will harm him.',
      },
      hadith: {
        english:
          '\'Uthman ibn \'Affan (رضي الله عنه) reported that the Messenger of Allah ﷺ said: "There is no servant who says, in the morning of every day and the evening of every night, three times: بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ — except that nothing will harm him." (Jami\' at-Tirmidhi 3388 — Hasan Sahih; also Sunan Abi Dawud 5088)',
      },
    }),
  ),
];
