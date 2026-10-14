import type { Dhikr } from './types';

// Curated favourites. count = target repetitions per day.
// Missing translations are simply absent; the UI falls back to English.
export const FAVOURITES: Dhikr[] = [

  // ── MORNING ─────────────────────────────────────────────────────────────────
  {
    id: 'la_ilaha_illallah_post_fajr',
    name: 'La ilaha illallah (Post-Fajr)',
    nameAr: 'لَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ',
    time: 'morning',
    count: 10,
    source: "Jami' at-Tirmidhi 3474",
    arabic: 'لَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translations: {
      urdu: 'اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کی بادشاہت ہے، اسی کی تعریفیں ہیں، وہی زندگی دیتا ہے اور وہی موت دیتا ہے، اور وہ ہر چیز پر قادر ہے۔',
      hindi: 'अल्लाह के सिवा कोई माबूद नहीं, वो अकेला है, उसका कोई शरीक नहीं, उसी की बादशाहत है, उसी की तारीफें हैं, वही ज़िंदगी देता है और वही मौत देता है, और वो हर चीज़ पर क़ादिर है।',
      english: 'There is no god but Allah, alone, without partner; His is the dominion and His is the praise; He gives life and causes death; and He has power over all things.',
    },
    virtue: {
      urdu: 'فجر کے فوراً بعد (بات کرنے سے پہلے) دس مرتبہ: ۱۰ نیکیاں لکھی جاتی ہیں، ۱۰ گناہ مٹائے جاتے ہیں، ۱۰ درجے بلند کیے جاتے ہیں، اور پورے دن شیطان اور ہر ناپسندیدہ چیز سے حفاظت — اس دن شرک کے سوا کوئی گناہ نہیں نقصان نہیں پہچا سکتا۔',
      hindi: 'फ़ज्र के फ़ौरन बाद (बिना बात किये): 10 नेकियाँ लिखी जाती हैं, 10 गुनाह माफ़ किये जाते हैं, 10 दर्जा बुलंद किया जाता है , उस दिन हर बुरी चीज़ और शैतान से उसकी हिफाज़त होती है — उस दिन शिर्क के सिवा कोई गुनाह उसे नुक़सान नहीं पहुँचा सकता।',
      english: 'Recite 10 times right after Fajr (before speaking): 10 good deeds recorded, 10 sins wiped, raised 10 degrees, protected from everything disliked and from Shaytan all day — no sin will touch him that day except shirk.',
    },
    hadith: {
      urdu: 'رسول اللہ صلی اللہ علیہ وسلم نے فرمایا: ”جو شخص نماز فجر کے بعد جب کہ وہ پیر موڑے  ( دو زانوں )  بیٹھا ہوا ہو اور کوئی بات بھی نہ کی ہو: «لا إله إلا الله وحده لا شريك له له الملك وله الحمد يحيي ويميت وهو على كل شيء» دس مرتبہ پڑھے تو اس کے لیے دس نیکیاں لکھی جائیں گی، اور اس کی دس برائیاں مٹا دی جائیں گی، اس کے لیے دس درجے بلند کئے جائیں گے اور وہ اس دن پورے دن بھر ہر طرح کی مکروہ و ناپسندیدہ چیز سے محفوظ رہے گا، اور شیطان کے زیر اثر نہ آ پانے کے لیے اس کی نگہبانی کی جائے گی، اور کوئی گناہ اسے اس دن سوائے شرک باللہ کے ہلاکت سے دوچار نہ کر سکے گا۔',
      hindi: 'रसूलुल्लाह ﷺ ने फ़रमाया: "जो शख़्स नमाज़-ए-फ़ज्र के बाद जब कि वह अपने पैर मोड़े (दो ज़ानू/तशह्हुद की हालत में) बैठा हुआ हो और कोई बात भी न की हो: «ला इलाहा इल्लल्लाहु वहदहू ला शरीका लहू, लहुल मुल्कु व लहुल हम्दु, युह्यी व युमीतु, व हुवा अला कुल्लि शयइन् क़दीर» दस मर्तबा पढ़े, तो उसके लिए दस नेकियां लिखी जाएंगी, और उसकी दस बुराइयां (गुनाह) मिटा दी जाएंगी, उसके लिए दस दर्जे बुलंद किए जाएंगे और वह उस दिन पूरे दिन भर हर तरह की मकरूह (नापसंदीदा) चीज़ से महफ़ूज़ (सुरक्षित) रहेगा, और शैतान के ज़ेर-ए-असर न आ पाने के लिए उसकी निगहबानी (हिफ़ाज़त) की जाएगी, और कोई गुनाह उसे उस दिन सिवाय शिर्क बिल्लाह (अल्लाह के साथ शिर्क करने) के हलाकत (तबाही) से दोचार नहीं कर सकेगा।',
      english: 'Narrated by Abu Dharr (رضي الله عنه): The Messenger of Allah ﷺ said: "Whoever says, right after the Fajr prayer, while still sitting with his legs folded and before speaking to anyone: لَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ ten times — ten good deeds are recorded for him, ten sins are wiped away, he is raised ten degrees, and for that whole day he is safeguarded from everything disliked and protected from Shaytan; no sin will touch him that day except shirk." (Jami\' al-Tirmidhi 3474)',
    },
  },

  {
    id: 'sayyidul_istighfar_morning',
    name: 'Sayyidul Istighfar',
    nameAr: 'سَيِّدُ الِاسْتِغْفَار',
    time: 'morning',
    count: 1,
    source: "Sahih al-Bukhari 6306",
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    translations: {
      urdu: 'اے اللہ! تو ہی میرا رب ہے، تیرے سوا کوئی معبود نہیں۔ تو نے ہی مجھے پیدا کیا اور میں تیرا بندہ ہوں ۔ میں اپنی استطاعت کے مطابق تیرے عہد اور وعدے پر قائم ہوں۔ میں اپنے کیے کاموں کے شر (برے نتیجے) سے تیری پناہ مانگتا ہوں۔ میں تیرے سامنے تیری ان نعمتوں کا اقرار کرتا ہوں جو تو نے مجھ پر کی ہیں اور میں اپنے گناہوں کا اعتراف کرتا ہوں، پس مجھے معاف کر دے کیونکہ تیرے سوا کوئی گناہوں کو معاف نہیں کر سکتا۔',
      hindi: 'ऐ अल्लाह! तू ही मेरा रब (पालने वाला) है, तेरे सिवा कोई माबूद (इबादत के लायक) नहीं। तूने ही मुझे पैदा किया और मैं तेरा बंदा हूँ, और मैं अपनी ताकत के मुताबिक तेरे अहद और वादे पर कायम  हूँ। उन कामो की बुराई से जो मैंने की हैं तेरी पनाह मांगता हूँ। मैं तेरे सामने तेरी उन नेमतों का इकरार करता हूँ जो तूने मुझ पर की हैं और मैं अपने गुनाहों का एतराफ़ (स्वीकार) करता हूँ, बस मुझे माफ़ कर दे क्योंकि तेरे सिवा कोई गुनाहों को माफ़ नहीं कर सकता।',
      english: 'O Allah, You are my Lord. There is no god but You. You created me and I am Your servant, and I am upon Your covenant and promise as best as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for there is none who forgives sins except You.',
    },
    virtue: {
      urdu: 'جو شخص یقینِ کامل کے ساتھ دن میں یہ دعا پڑھے اور شام ہونے سے پہلے وفات پائے — یا رات میں پڑھے اور صبح ہونے سے پہلے وفات پائے — وہ جنتیوں میں سے ہوگا۔',
      hindi: 'आनहज़रत (नबी करीम) ﷺ ने फ़रमाया कि जिसने इस दुआ के अल्फ़ाज़ पर यक़ीन रखते हुए दिल से इनको कह लिया और उसी दिन शाम होने से पहले उसका इंतक़ाल (निधन) हो गया, तो वह जन्नती है; और जिसने इस दुआ के अल्फ़ाज़ पर यक़ीन रखते हुए रात में इनको पढ़ लिया और फिर उसका सुबह होने से पहले इंतक़ाल हो गया, तो वह (भी) जन्नती है।',
      english: 'Whoever recites this with firm conviction during the day and dies before evening — or at night and dies before morning — will be among the people of Paradise.',
    },
    hadith: {
      urdu: 'اور ان سے رسول اللہ ﷺ نے کہ سیدالاستغفار ( مغفرت مانگنے کے سب کلمات کا سردار ) یہ ہے کہ یوں کہے ” اے اللہ ! تو میرا رب ہے ، تیرے سوا کوئی معبود نہیں ۔ تو نے ہی مجھے پیدا کیا اور میں تیرا ہی بندہ ہوں میں اپنی طاقت کے مطابق تجھ سے کئے ہوئے عہد اور وعدہ پر قائم ہوں ۔ ان بری حرکتوں کے عذاب سے جو میں نے کی ہیں تیری پناہ مانگتا ہوں مجھ پر نعمتیں تیری ہیں اس کا اقرار کرتا ہوں ۔ میری مغفرت کر دے کہ تیرے سوا اور کوئی بھی گناہ نہیں معاف کرتا ۔“ آنحضرت ﷺ نے فرمایا کہ جس نے اس دعا کے الفاظ پر یقین رکھتے ہوئے دل سے ان کو کہہ لیا اور اسی دن اس کا انتقال ہو گیا شام ہونے سے پہلے ، تو وہ جنتی ہے اور جس نے اس دعا کے الفاظ پر یقین رکھتے ہوئے رات میں  ان کو پڑھ لیا اور پھر اس کا صبح ہونے سے پہلے انتقال ہو گیا تو وہ جنتی ہے۔ (صحیح البخاری: 6306)',
      hindi: 'और उनसे रसूलुल्लाह ﷺ ने (फ़रमाया) कि सैय्यदुल इस्तगफ़ार (मग़फ़िरत/माफ़ी मांगने के सब कलमात का सरदार) यह है कि यूं कहे: ”ऐ अल्लाह! तू मेरा रब है, तेरे सिवा कोई माबूद नहीं। तूने ही मुझे पैदा किया और मैं तेरा ही बंदा हूँ, मैं अपनी ताक़त के मुताबिक़ तुझसे किए हुए अहद (वादे) और इक़रार पर क़ायम हूँ। इन बुरी हरकतों के अज़ाब (शर्त) से जो मैंने की हैं, तेरी पन्हा मांगता हूँ। मुझ पर जो तेरी नेमतें हैं, उसका इक़रार करता हूँ। मेरी मग़फ़िरत कर दे कि तेरे सिवा और कोई भी गुनाह माफ़ नहीं करता। \“आनहज़रत (नबी करीम) ﷺ ने फ़रमाया कि जिसने इस दुआ के अल्फ़ाज़ पर यक़ीन रखते हुए दिल से इनको कह लिया और उसी दिन शाम होने से पहले उसका इंतक़ाल (निधन) हो गया, तो वह जन्नती है; और जिसने इस दुआ के अल्फ़ाज़ पर यक़ीन रखते हुए रात में इनको पढ़ लिया और फिर उसका सुबह होने से पहले इंतक़ाल हो गया, तो वह (भी) जन्नती है। (सहीह  अल-बुखारी  6306)',
      english: 'Narrated by Shaddad ibn Aws (رضي الله عنه): The Messenger of Allah ﷺ said: "The master of prayers for forgiveness is to say this dua. Whoever says it during the day with firm conviction and dies before evening comes — he will be among the people of Paradise. And whoever says it at night with firm conviction and dies before morning comes — he will be among the people of Paradise." (Sahih al-Bukhari 6306)',
    },
  },

  {
    id: 'subhanallah_adad_khalq',
    name: 'SubhanAllah Adada Khalqihi',
    nameAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ',
    time: 'morning',
    count: 3,
    source: "Sahih Muslim 2726",
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    translations: {
      urdu: 'اللہ پاک ہے اور اس کی حمد ہے، اس کی مخلوق کی تعداد کے برابر، اس کی ذات کی خوشنودی کے برابر، اس کے عرش کے وزن کے برابر، اور اس کے کلمات کی روشنائی کے برابر۔',
      hindi: 'अल्लाह पाक है और उसकी तारीफ़ है, उसकी मख़लूक़ की गिनती के बराबर, उसकी ज़ात की ख़ुशी के बराबर, उसके अर्श के वज़न के बराबर, और उसके कलिमात की स्याही के बराबर।',
      english: 'Glory be to Allah and praise be to Him, to the number of His creation, to His pleasure, to the weight of His Throne, and to the ink of His words.',
    },
    virtue: {
      urdu: 'صرف ۳ مرتبہ پڑھنے سے یہ کلمات گھنٹوں کے ذکر پر بھاری ہیں۔ نبی ﷺ نے جویریہ ؓ کو بتایا کہ یہ کلمات ۳ مرتبہ کہنا ان کی پوری صبح کے ذکر سے میزان میں بھاری ہیں۔',
      hindi: 'सिर्फ 3 मर्तबा पढ़ने से यह कलमात घंटों के ज़िक्र पर भारी हैं। नबी ﷺ ने जुवैरिया ؓ को बताया कि यह कलमात 3 मर्तबा कहना उनकी पूरी सुबह के ज़िक्र से मीज़ान (तराज़ू) में भारी हैं।',
      english: 'Say just 3 times, these words outweigh hours of continuous dhikr. The Prophet ﷺ told Juwairiyah ؓ that saying this 3 times is heavier in the scale than her entire morning of remembrance.',
    },
    hadith: {
      urdu: 'حضرت جویریہ بنت حارث (رضی اللہ عنہا) سے روایت ہے: نبی کریم ﷺ چاشت کے وقت (دیر سے) ان کے پاس واپس تشریف لائے تو انہیں اپنے مصلے (نماز کی جگہ) پر ہی بیٹھے ہوئے پایا۔ آپ ﷺ نے فرمایا: "میں نے تمہارے پاس سے جانے کے بعد چار کلمات تین مرتبہ کہے ہیں، اگر ان کا وزن ان تمام کلمات کے ساتھ کیا جائے جو تم نے آج صبح سے پڑھے ہیں، تو یہ ان پر بھاری ہو جائیں گے، (وہ کلمات یہ ہیں): «سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ» (اللہ پاک ہے اپنی تعریفوں کے ساتھ، اپنی مخلوق کی تعداد کے برابر، اپنی ذات کی رضا کے مطابق، اپنے عرش کے وزن کے برابر اور اپنے کلمات کی روشنائی کے برابر۔)(صحیح مسلم: ٢٧٢٦)',
      hindi: 'हज़रत जुवैरिया बिन्त अल-हारिस (रज़ियल्लाहु अन्हा) से रिवायत है: नबी करीम ﷺ चाश्त के वक़्त (देर से) उनके पास वापस तशरीफ़ लाए तो उन्हें अपने मुसल्ले (नमाज़ की जगह) पर ही बैठे हुए पाया। आप ﷺ ने फ़रमाया: "मैंने तुम्हारे पास से जाने के बाद चार कलमात तीन मर्तबा कहे हैं, अगर उनका वज़न उन तमाम कलमात के साथ किया जाए जो तुमने आज सुबह से पढ़े हैं, तो यह उन पर भारी हो जाएंगे, (वह कलमात यह हैं): «सुब्हानल्लाही व बिहम्दिही अददा ख़ल्क़िही, व रिज़ा नफ़्सिही, व ज़िनता अर्शिही, व मिदादा कलिमातिही» (अल्लाह पवित्र है अपनी तारीफ़ों के साथ, अपनी मख़्लूक़ (सृष्टि) की तादाद के बराबर, अपनी ज़ात की रज़ा के मुताबिक़, अपने अर्श के वज़न के बराबर और अपने कलमात की रोशनाई (स्याही) के बराबर।) (सहीह मुस्लिम: 2726)"',
      english: 'Narrated by Juwairiyah bint al-Harith (رضي الله عنها): The Prophet ﷺ came back to her in the late morning and found her still sitting in her prayer place. He said: "I recited four words three times after I left you, and if these were to be weighed against all that you have recited this morning, they would outweigh them: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ" (Sahih Muslim 2726)',
    },
  },

  {
    id: 'subhanallah_wabihamdihi_morning',
    name: 'SubhanAllah wa biHamdihi (Morning)',
    nameAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    time: 'morning',
    count: 100,
    source: "Sahih Muslim 2692",
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    translations: {
      urdu: 'اللہ پاک ہے اور حمد اسی کے لیے ہے۔',
      hindi: 'अल्लाह पाक है और उसकी तारीफ़ है।',
      english: 'Glory be to Allah, and praise be to Him.',
    },
    virtue: {
      urdu: 'گناہ معاف — چاہے سمندر کی جھاگ کے برابر ہوں (بخاری 6405)۔ زبان پر ہلکا، میزان میں بھاری، اور رحمٰن کو سب سے زیادہ محبوب (بخاری 6406 — متفق علیہ)۔',
      hindi: "गुनाह माफ़ — चाहे समुंदर की झाग के बराबर हों (बुख़ारी 6405)। ज़बान पर हल्का, मीज़ान में भारी, और रहमान को सबसे ज़्यादा महबूब (बुख़ारी 6406 — मुत्तफ़क़ अलैह)।",
      english: 'Sins forgiven even if they were as much as the foam of the sea (Bukhari 6405). Light on the tongue, heavy in the scales, and most beloved to the Most Merciful (Bukhari 6406 — Muttafaqun ʿalayh).',
    },
    hadith: {
      english: 'Narrated by Abu Hurairah (رضي الله عنه): The Prophet ﷺ said: "He who recites سُبْحَانَ اللَّهِ وَبِحَمْدِهِ in the morning and in the evening one hundred times will not bring on the Day of Resurrection anything more excellent than this, except one who utters these words or more." (Sahih Muslim 2692)\n\nAlso: "Whoever says it 100 times a day, his sins will be forgiven even if they were as much as the foam of the sea." (Sahih al-Bukhari 6405)\n\nAlso: "There are two expressions which are very easy for the tongue to say, but very heavy in the scales, and most beloved to the Most Merciful: سُبْحَانَ اللَّهِ الْعَظِيمِ and سُبْحَانَ اللَّهِ وَبِحَمْدِهِ." (Sahih al-Bukhari 6406 — Muttafaqun \'alayh)',
    },
  },

  {
    id: 'subhanallah_azeem_morning',
    name: 'SubhanAllah Al-Azeem (Morning)',
    nameAr: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ',
    time: 'morning',
    count: 100,
    source: "Sunan Abi Dawud 5091",
    arabic: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ',
    translations: {
      urdu: 'اللہ پاک ہے، بہت عظمت والا ہے اور تمام تعریفیں اسی کے لیے ہیں ۔',
      hindi: 'अल्लाह पाक है, बहुत अज़मत वाला है और तमाम तारीफ़ें उसी के लिए हैं।',
      english: 'Glory be to Allah the Almighty, and praise be to Him.',
    },
    virtue: {
      urdu: 'جو شخص یہ صبح ۱۰۰ مرتبہ اور شام ۱۰۰ مرتبہ کہے — قیامت کے دن اس سے بڑھ کر کوئی چیز لے کر کوئی نہیں آ سکتا۔',
      hindi: "जो शख़्स यह सुबह 100 मर्तबा और शाम 100 मर्तबा कहे — क़ियामत के दिन उससे बढ़कर कोई चीज़ लेकर कोई नहीं आ सकता।",
      english: 'Whoever says this 100 times in the morning and 100 times in the evening — no one from all of creation will bring anything equal to what he will bring on the Day of Resurrection.',
    },
    hadith: {
      english: 'Narrated by Abu Hurairah (رضي الله عنه): The Messenger of Allah ﷺ said: "Whoever says in the morning سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ one hundred times, and likewise in the evening, no one from all of creation will bring anything equal to what he will bring." (Sunan Abi Dawud 5091 — Sahih, authenticated by Al-Albani)',
    },
  },

  {
    id: 'la_ilaha_illallah_morning',
    name: 'La ilaha illallah (Morning)',
    nameAr: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ',
    time: 'morning',
    count: 100,
    source: "Sahih Muslim 2693",
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translations: {
      urdu: 'اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کی بادشاہت ہے، اسی کی تعریفیں ہیں، اور وہ ہر چیز پر قادر ہے۔',
      hindi: 'अल्लाह के सिवा कोई माबूद नहीं, वो अकेला है, उसका कोई शरीक नहीं, उसी की बादशाहत है, उसी की तारीफ़ है, और वो हर चीज़ पर क़ादिर है।',
      english: 'There is no god but Allah, alone, without partner. His is the dominion and His is the praise, and He is over all things capable.',
    },
    virtue: {
      urdu: '۱۰۰ مرتبہ کہنا دس غلام آزاد کرنے کے برابر، ۱۰۰ نیکیاں لکھی جاتی ہیں، ۱۰۰ گناہ مٹائے جاتے ہیں، اور شام تک شیطان سے حفاظت ہوتی ہے۔',
      hindi: "100 मर्तबा कहना दस ग़ुलाम आज़ाद करने के बराबर, 100 नेकियाँ लिखी जाती हैं, 100 गुनाह मिटाए जाते हैं, और शाम तक शैतान से हिफ़ाज़त होती है।",
      english: 'Saying this 100 times is equivalent to freeing 10 slaves, earns 100 good deeds, wipes away 100 sins, and is a protection from Shaytan for the entire day until evening.',
    },
    hadith: {
      english: 'Narrated by Abu Hurairah (رضي الله عنه): The Messenger of Allah ﷺ said: "He who says لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ one hundred times a day: it is equivalent to him having freed ten slaves, one hundred good deeds are recorded for him, one hundred sins are wiped away, and it is a protection against Shaytan for that day until evening. No one can bring anything more excellent except one who does more than this." (Sahih Muslim 2693)',
    },
  },

  // ── ANY TIME ──────────────────────────────────────────────────────────────────

  {
    id: 'subhanallah_wabihamdihi_azeem',
    name: 'SubhanAllah wa biHamdihi Al-Azeem',
    nameAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    time: 'any',
    count: 100,
    source: "Sahih al-Bukhari 6682",
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    translations: {
      urdu: 'اللہ پاک ہے اور حمد اسی کے لیے ہے۔اللہ پاک ہے اور وہ بہت عظمت والا ہے۔',
      hindi: 'अल्लाह पाक है और उसकी तारीफ़ है। अल्लाह बड़ी अज़मत वाला पाक है।',
      english: 'Glory be to Allah and praise be to Him. Glory be to Allah the Almighty.',
    },
    virtue: {
      urdu: 'اللہ کو سب سے زیادہ پسند دو کلمے — زبان پر ہلکے، قیامت کے دن میزان میں بھاری۔ (صحیح بخاری 6406، متفق علیہ)',
      hindi: "अल्लाह को सबसे ज़्यादा पसंद दो कलिमे — ज़बान पर हल्के, क़ियामत के दिन मीज़ान में भारी। (सहीह बुख़ारी 6406, मुत्तफ़क़ अलैह)",
      english: 'The two most beloved phrases to Allah — light on the tongue but heavy in the scale on the Day of Resurrection. (Sahih al-Bukhari 6406, Muttafaqun ʿalayh)',
    },
    hadith: {
      english: 'Narrated by Abu Hurairah (رضي الله عنه): The Prophet ﷺ said: "There are two expressions which are very easy for the tongue to say, but very heavy in the scales, and most beloved to the Most Merciful (Allah): سُبْحَانَ اللَّهِ الْعَظِيمِ and سُبْحَانَ اللَّهِ وَبِحَمْدِهِ." (Sahih al-Bukhari 6682 — Muttafaqun \'alayh)',
    },
  },

  // ── EVENING ──────────────────────────────────────────────────────────────────

  {
    id: 'subhanallah_wabihamdihi_evening',
    name: 'SubhanAllah wa biHamdihi (Sham)',
    nameAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    time: 'evening',
    count: 100,
    source: "Sahih Muslim 2692",
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    translations: {
      urdu: 'اللہ پاک ہے اور حمد اسی کے لیے ہے۔',
      hindi: 'अल्लाह पाक है और उसकी तारीफ़ है।',
      english: 'Glory be to Allah, and praise be to Him.',
    },
    virtue: {
      urdu: 'گناہ معاف — چاہے سمندر کی جھاگ کے برابر ہوں (بخاری 6405)۔ زبان پر ہلکا، میزان میں بھاری، اور رحمٰن کو سب سے زیادہ محبوب (بخاری 6406 — متفق علیہ)۔',
      hindi: "गुनाह माफ़ — चाहे समुंदर की झाग के बराबर हों (बुख़ारी 6405)। ज़बान पर हल्का, मीज़ान में भारी, और रहमान को सबसे ज़्यादा महबूब (बुख़ारी 6406 — मुत्तफ़क़ अलैह)।",
      english: 'Sins forgiven even if they were as much as the foam of the sea (Bukhari 6405). Light on the tongue, heavy in the scales, and most beloved to the Most Merciful (Bukhari 6406 — Muttafaqun ʿalayh).',
    },
    hadith: {
      english: 'Narrated by Abu Hurairah (رضي الله عنه): The Prophet ﷺ said: "He who recites سُبْحَانَ اللَّهِ وَبِحَمْدِهِ in the morning and in the evening one hundred times will not bring on the Day of Resurrection anything more excellent than this, except one who utters these words or more." (Sahih Muslim 2692)\n\nAlso: "Whoever says it 100 times a day, his sins will be forgiven even if they were as much as the foam of the sea." (Sahih al-Bukhari 6405)\n\nAlso: "There are two expressions which are very easy for the tongue to say, but very heavy in the scales, and most beloved to the Most Merciful: سُبْحَانَ اللَّهِ الْعَظِيمِ and سُبْحَانَ اللَّهِ وَبِحَمْدِهِ." (Sahih al-Bukhari 6406 — Muttafaqun \'alayh)',
    },
  },
  
  {
    id: 'subhanallah_azeem_evening',
    name: 'SubhanAllah Al-Azeem (Sham)',
    nameAr: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ',
    time: 'evening',
    count: 100,
    source: "Sunan Abi Dawud 5091",
    arabic: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ',
    translations: {
      urdu: 'اللہ پاک ہے، بہت عظمت والا ہے اور تمام تعریفیں اسی کے لیے ہیں ۔',
      hindi: 'अल्लाह पाक है, बहुत अज़मत वाला है और तमाम तारीफ़ें उसी के लिए हैं।',
      english: 'Glory be to Allah the Almighty, and praise be to Him.',
    },
    virtue: {
      urdu: 'جو شخص یہ صبح ۱۰۰ مرتبہ اور شام ۱۰۰ مرتبہ کہے — قیامت کے دن اس سے بڑھ کر کوئی چیز لے کر کوئی نہیں آ سکتا۔',
      hindi: "जो शख़्स यह सुबह 100 मर्तबा और शाम 100 मर्तबा कहे — क़ियामत के दिन उससे बढ़कर कोई चीज़ लेकर कोई नहीं आ सकता।",
      english: 'Whoever says this 100 times in the morning and 100 times in the evening — no one from all of creation will bring anything equal to what he will bring on the Day of Resurrection.',
    },
    hadith: {
      english: 'Narrated by Abu Hurairah (رضي الله عنه): The Messenger of Allah ﷺ said: "Whoever says in the morning سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ one hundred times, and likewise in the evening, no one from all of creation will bring anything equal to what he will bring." (Sunan Abi Dawud 5091 — Sahih, authenticated by Al-Albani)',
    },
  },

  {
    id: 'la_ilaha_illallah_post_maghrib',
    name: 'La ilaha illallah (Post-Maghrib)',
    nameAr: 'لَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ',
    time: 'evening',
    count: 10,
    source: "Jami' at-Tirmidhi 3534",
    arabic: 'لَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translations: {
      urdu: 'اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کی بادشاہت ہے، اسی کی تعریفیں ہیں، وہی زندگی دیتا ہے اور وہی موت دیتا ہے، اور وہ ہر چیز پر قادر ہے۔',
      hindi: 'अल्लाह के सिवा कोई माबूद नहीं, वो अकेला है, उसका कोई शरीक नहीं, उसी की बादशाहत है, उसी की तारीफ़ है, वो ज़िंदगी देता है और मौत देता है, और वो हर चीज़ पर क़ादिर है।',
      english: 'There is no god but Allah, alone, without partner; His is the dominion and His is the praise; He gives life and causes death; and He has power over all things.',
    },
    virtue: {
      urdu: 'مغرب کے فوراً بعد دس مرتبہ: اللہ محافظ فرشتے بھیجتا ہے جو صبح تک شیطان سے بچاتے ہیں، ۱۰ پکی نیکیاں لکھی جاتی ہیں، ۱۰ ہلاکت خیز گناہ مٹائے جاتے ہیں، اور دس مومن غلام آزاد کرنے کے برابر ثواب ملتا ہے۔',
      hindi: "मग़रिब के फ़ौरन बाद दस मर्तबा: अल्लाह मुहाफ़िज़ फ़रिश्ते भेजता है जो सुबह तक शैतान से बचाते हैं, 10 पक्की नेकियाँ लिखी जाती हैं, 10 हलाकत-ख़ेज़ गुनाह मिटाए जाते हैं, और दस मोमिन ग़ुलाम आज़ाद करने के बराबर सवाब मिलता है।",
      english: 'Recite 10 times right after Maghrib: Allah sends guardian angels to protect you from Shaytan until morning, records 10 decisive good deeds, wipes 10 destructive sins, and it is equivalent to freeing 10 believing slaves.',
    },
    hadith: {
      urdu: 'جو شخص مغرب کی نماز کے فوراً بعد یہی کلمات دس مرتبہ کہے — تو اللہ اُس کے لیے محافظ فرشتے بھیجتا ہے جو صبح تک اُسے شیطان سے بچاتے ہیں، اور اللہ اُس کے لیے دس پکی نیکیاں لکھتا ہے، اُس کے دس ہلاکت خیز گناہ مٹا دیتا ہے، اور یہ عمل دس مومن غلام آزاد کرنے کے برابر ہوتا ہے۔ (جامع الترمذی 3534)',
      hindi: "जो शख़्स मग़रिब की नमाज़ के फ़ौरन बाद यही कलिमात दस मर्तबा कहे — तो अल्लाह उसके लिए मुहाफ़िज़ फ़रिश्ते भेजता है जो सुबह तक उसे शैतान से बचाते हैं, और अल्लाह उसके लिए दस पक्की नेकियाँ लिखता है, उसके दस हलाकत-ख़ेज़ गुनाह मिटा देता है, और यह अमल दस मोमिन ग़ुलाम आज़ाद करने के बराबर होता है। (जामे अत-तिर्मिज़ी 3534)",
      english: 'Narrated by \'Umarah bin Shabib al-Saba\'i: The Messenger of Allah ﷺ said: "Whoever says لَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ ten times right after Maghrib — Allah sends guardians to protect him from Shaytan until morning, records ten decisive good deeds for him, wipes away ten destructive sins, and it is equivalent to freeing ten believing slaves." (Jami\' al-Tirmidhi 3534)',
    },
  },

  {
    id: 'sayyidul_istighfar_evening',
    name: 'Sayyidul Istighfar',
    nameAr: 'سَيِّدُ الِاسْتِغْفَار',
    time: 'evening',
    count: 1,
    source: "Sahih al-Bukhari 6306",
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    translations: {
      urdu: 'اے اللہ! تو ہی میرا رب ہے، تیرے سوا کوئی معبود نہیں۔ تو نے ہی مجھے پیدا کیا اور میں تیرا بندہ ہوں ۔ میں اپنی استطاعت کے مطابق تیرے عہد اور وعدے پر قائم ہوں۔ میں اپنے کیے کاموں کے شر (برے نتیجے) سے تیری پناہ مانگتا ہوں۔ میں تیرے سامنے تیری ان نعمتوں کا اقرار کرتا ہوں جو تو نے مجھ پر کی ہیں اور میں اپنے گناہوں کا اعتراف کرتا ہوں، پس مجھے معاف کر دے کیونکہ تیرے سوا کوئی گناہوں کو معاف نہیں کر سکتا۔',
      hindi: 'ऐ अल्लाह! तू ही मेरा रब (पालने वाला) है, तेरे सिवा कोई माबूद (इबादत के लायक) नहीं। तूने ही मुझे पैदा किया और मैं तेरा बंदा हूँ, और मैं अपनी ताकत के मुताबिक तेरे अहद और वादे पर कायम  हूँ। उन कामो की बुराई से जो मैंने की हैं तेरी पनाह मांगता हूँ। मैं तेरे सामने तेरी उन नेमतों का इकरार करता हूँ जो तूने मुझ पर की हैं और मैं अपने गुनाहों का एतराफ़ (स्वीकार) करता हूँ, बस मुझे माफ़ कर दे क्योंकि तेरे सिवा कोई गुनाहों को माफ़ नहीं कर सकता।',
      english: 'O Allah, You are my Lord. There is no god but You. You created me and I am Your servant, and I am upon Your covenant and promise as best as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for there is none who forgives sins except You.',
    },
    virtue: {
      urdu: 'جو شخص یقینِ کامل کے ساتھ دن میں یہ دعا پڑھے اور شام ہونے سے پہلے وفات پائے — یا رات میں پڑھے اور صبح ہونے سے پہلے وفات پائے — وہ جنتیوں میں سے ہوگا۔',
      hindi: 'आनहज़रत (नबी करीम) ﷺ ने फ़रमाया कि जिसने इस दुआ के अल्फ़ाज़ पर यक़ीन रखते हुए दिल से इनको कह लिया और उसी दिन शाम होने से पहले उसका इंतक़ाल (निधन) हो गया, तो वह जन्नती है; और जिसने इस दुआ के अल्फ़ाज़ पर यक़ीन रखते हुए रात में इनको पढ़ लिया और फिर उसका सुबह होने से पहले इंतक़ाल हो गया, तो वह (भी) जन्नती है।',
      english: 'Whoever recites this with firm conviction during the day and dies before evening — or at night and dies before morning — will be among the people of Paradise.',
    },
    hadith: {
      urdu: 'اور ان سے رسول اللہ ﷺ نے کہ سیدالاستغفار ( مغفرت مانگنے کے سب کلمات کا سردار ) یہ ہے کہ یوں کہے ” اے اللہ ! تو میرا رب ہے ، تیرے سوا کوئی معبود نہیں ۔ تو نے ہی مجھے پیدا کیا اور میں تیرا ہی بندہ ہوں میں اپنی طاقت کے مطابق تجھ سے کئے ہوئے عہد اور وعدہ پر قائم ہوں ۔ ان بری حرکتوں کے عذاب سے جو میں نے کی ہیں تیری پناہ مانگتا ہوں مجھ پر نعمتیں تیری ہیں اس کا اقرار کرتا ہوں ۔ میری مغفرت کر دے کہ تیرے سوا اور کوئی بھی گناہ نہیں معاف کرتا ۔“ آنحضرت ﷺ نے فرمایا کہ جس نے اس دعا کے الفاظ پر یقین رکھتے ہوئے دل سے ان کو کہہ لیا اور اسی دن اس کا انتقال ہو گیا شام ہونے سے پہلے ، تو وہ جنتی ہے اور جس نے اس دعا کے الفاظ پر یقین رکھتے ہوئے رات میں  ان کو پڑھ لیا اور پھر اس کا صبح ہونے سے پہلے انتقال ہو گیا تو وہ جنتی ہے۔ (صحیح البخاری: 6306)',
      hindi: 'और उनसे रसूलुल्लाह ﷺ ने (फ़रमाया) कि सैय्यदुल इस्तगफ़ार (मग़फ़िरत/माफ़ी मांगने के सब कलमात का सरदार) यह है कि यूं कहे: ”ऐ अल्लाह! तू मेरा रब है, तेरे सिवा कोई माबूद नहीं। तूने ही मुझे पैदा किया और मैं तेरा ही बंदा हूँ, मैं अपनी ताक़त के मुताबिक़ तुझसे किए हुए अहद (वादे) और इक़रार पर क़ायम हूँ। इन बुरी हरकतों के अज़ाब (शर्त) से जो मैंने की हैं, तेरी पन्हा मांगता हूँ। मुझ पर जो तेरी नेमतें हैं, उसका इक़रार करता हूँ। मेरी मग़फ़िरत कर दे कि तेरे सिवा और कोई भी गुनाह माफ़ नहीं करता। \“आनहज़रत (नबी करीम) ﷺ ने फ़रमाया कि जिसने इस दुआ के अल्फ़ाज़ पर यक़ीन रखते हुए दिल से इनको कह लिया और उसी दिन शाम होने से पहले उसका इंतक़ाल (निधन) हो गया, तो वह जन्नती है; और जिसने इस दुआ के अल्फ़ाज़ पर यक़ीन रखते हुए रात में इनको पढ़ लिया और फिर उसका सुबह होने से पहले इंतक़ाल हो गया, तो वह (भी) जन्नती है। (सहीह  अल-बुखारी  6306)',
      english: 'Narrated by Shaddad ibn Aws (رضي الله عنه): The Messenger of Allah ﷺ said: "The master of prayers for forgiveness is to say this dua. Whoever says it during the day with firm conviction and dies before evening comes — he will be among the people of Paradise. And whoever says it at night with firm conviction and dies before morning comes — he will be among the people of Paradise." (Sahih al-Bukhari 6306)',
    },
  },

];

