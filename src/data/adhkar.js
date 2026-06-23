// src/data/adhkar.js
// Arabic text added where known with confidence.
// Translations marked TODO — fill in Urdu/Hindi/English as needed.
// count = target repetitions

export const FAVOURITES = [
  {
    id: 'sayyidul_istighfar_fajr',
    name: 'Sayyidul Istighfar',
    nameAr: 'سَيِّدُ الِاسْتِغْفَار',
    time: 'morning',
    count: 1,
    arabic: `اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ`,
    translations: {
      urdu: '// TODO',
      hindi: '// TODO',
      english: 'O Allah, You are my Lord. There is no god but You. You created me and I am Your servant, and I am upon Your covenant and promise as best as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for there is none who forgives sins except You.',
    },
    hadith: 'Sahih al-Bukhari 6306',
  },
  {
    id: 'subhanallah_azeem_fajr',
    name: "SubhanAllah Al-Azeem (Fajr)",
    nameAr: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ',
    time: 'morning',
    count: 100,
    arabic: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ',
    translations: {
      urdu: '// TODO',
      hindi: '// TODO',
      english: 'Glory be to Allah the Almighty and praise be to Him.',
    },
    hadith: 'Sahih Muslim 2692',
  },
  {
    id: 'maghfirah_muslimeen',
    name: 'Dua for Muslims',
    nameAr: 'اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ',
    time: 'morning',
    count: 10,
    arabic: 'اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ وَالْمُسْلِمَاتِ، وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ، الْأَحْيَاءِ مِنْهُمْ وَالْأَمْوَاتِ',
    translations: {
      urdu: '// TODO',
      hindi: '// TODO',
      english: 'O Allah, forgive the Muslim men and women, and the believing men and women, among both the living and the dead.',
    },
    hadith: '// TODO',
  },
  {
    id: 'subhanallah_adad_khalq',
    name: "SubhanAllah Adada Khalqihi",
    nameAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ',
    time: 'morning',
    count: 3,
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    translations: {
      urdu: '// TODO',
      hindi: '// TODO',
      english: 'Glory be to Allah and praise be to Him, to the number of His creation, to His pleasure, to the weight of His Throne, and to the ink of His words.',
    },
    hadith: 'Sahih Muslim 2726',
  },
  {
    id: 'la_ilaha_illallah_fajr',
    name: 'La ilaha illallah (Fajr)',
    nameAr: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ',
    time: 'morning',
    count: 10,
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translations: {
      urdu: '// TODO',
      hindi: '// TODO',
      english: 'There is no god but Allah, alone, without partner. His is the dominion and His is the praise, and He is over all things capable.',
    },
    hadith: 'Sahih Muslim 2693',
  },
  {
    id: 'subhanallah_wabihamdihi_azeem',
    name: 'SubhanAllah wa biHamdihi',
    nameAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    time: 'any',
    count: 1,
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    translations: {
      urdu: '// TODO',
      hindi: '// TODO',
      english: 'Glory be to Allah and praise be to Him. Glory be to Allah the Almighty.',
    },
    hadith: 'Sahih al-Bukhari 6682',
  },
  {
    id: 'subhanallah_azeem_sham',
    name: "SubhanAllah Al-Azeem (Sham)",
    nameAr: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ',
    time: 'evening',
    count: 100,
    arabic: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ',
    translations: {
      urdu: '// TODO',
      hindi: '// TODO',
      english: 'Glory be to Allah the Almighty and praise be to Him.',
    },
    hadith: 'Sahih Muslim 2692',
  },
];

export const OTHERS = [
  // Add more adhkar here later
];