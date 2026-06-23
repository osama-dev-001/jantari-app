Reference summary for your next chat:

Jantari App — React Native (Android)
Built a React Native 0.85 Android app from scratch. Stack: React Native bare workflow, no Expo.
Features built:

Live prayer times (Fajr, Zawal, Dhuhr, Asr, Maghrib, Isha, Midnight) with live clock and countdown to next Salah
Static data for Varanasi (vns.js) and Ahmedabad (amd.js); Aladhan API fallback with 12h AsyncStorage cache for other cities
City switcher as header dropdown (bottom sheet modal)
Two tabs: Live Schedule and Yearly Jantari (with Q1–Q4 filter, horizontally scrollable table, today highlighted)
Sehri/Iftar line at bottom of live view
Home screen widget (2×2) via react-native-android-widget showing current/next Salah + countdown, refresh icon, tap to open app
App icon and splash screen via react-native-bootsplash v7
Signed release APK via keystore

Key files:

src/screens/HomeScreen.jsx — main screen with all tabs and city dropdown
src/data/vns.js / amd.js — static prayer data exported as vnsData / amdData
src/utils/prayerUtils.js — getTodayTimings, getCurrentAndNext, getCountdown, parseTime, normalizeApiTimings
src/utils/api.js — resolveTimings (static-first, API fallback), fetchTimings (Aladhan + cache)
src/widget/JantariWidget.jsx — widget UI using FlexWidget / TextWidget
src/widget/widgetTaskHandler.js — handles WIDGET_ADDED, WIDGET_UPDATE, WIDGET_CLICK
android/app/src/main/java/com/jantariapp/widget/Jantari.java — native widget provider class
index.js — registers app + registerWidgetTaskHandler

Environment:

Java 21.0.11, Gradle 8.13, Android SDK 36
JAVA_HOME set at User level (not Machine — User overrides Machine on this setup)
Package name: com.jantariapp

In progress feature: Dhikr/Adhkar section with favourites, Arabic text, translation dropdown (Urdu/Hindi/English), Hadith reference, and interactive tap counter with animated progress border surrounding the dhikr card.
