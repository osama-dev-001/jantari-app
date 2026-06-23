# Jantari App — React Native (Android)

## Stack
React Native 0.85 bare workflow (no Expo). Java 21.0.11, Gradle 8.13, Android SDK 36. Package: `com.jantariapp`. JAVA_HOME set at User level (not Machine).

## Theme
Dark purple/black theme throughout. Key colors: `#0f1923` (background), `#1e293b` (cards), `#6d28d9` (primary purple), `#a78bfa` (accent purple/text), `#34d399` (green/countdown), `#1a0f2e` / `#1a1040` (deep purple panels), `#3b1f6e` (muted purple border).

## Features Built
- Live prayer times (Fajr, Sunrise, Zawal, Dhuhr, Asr, Maghrib, Isha, Midnight) with live clock and countdown to next Salah
- Static data for Varanasi (`vns.js`) and Ahmedabad (`amd.js`, no Zawal key — handled via `.filter(name => timings[name])`); Aladhan API fallback with 12h AsyncStorage cache for other cities
- City switcher as header dropdown (bottom sheet modal via `CityDropdown` component)
- Two tabs: **Live Schedule** and **Yearly Jantari**
  - Live Schedule: compact "Next Salah" banner (replaced old giant clock) showing current salah (purple), next salah + countdown (green); current row gets green tint (`rowCurrent`), next row gets purple tint (`rowNext`)
  - Yearly Jantari: Q1–Q4 quarter filter, horizontally + vertically scrollable table, sticky header row (emoji + label per column), glowing purple border card wrapper (`glowCard`/`glowCardInner`), TODAY badge on current date, cycling purple-shade row dividers (`ROW_GLOW_COLORS`, 4-shade rotation), full-screen height via `flex: 1` cascade (no outer ScrollView wrapping it)
- Sehri/Iftar line at bottom of live view
- Home screen widget via `react-native-android-widget`:
  - Shows current salah (left) + countdown to next (right), divider line between, city label, tap to open app
  - Refresh icon was removed/lost during recent edits — needs re-adding
- App icon and splash screen via `react-native-bootsplash` v7
- Signed release APK via keystore

## Key Files
- `src/screens/HomeScreen.jsx` — main screen, all tabs, city dropdown, YearlyView component, all StyleSheets (`s`, `d`, `y`)
- `src/data/vns.js` / `amd.js` — static prayer data (`vnsData` / `amdData`)
- `src/utils/prayerUtils.js` — `getTodayTimings`, `getCurrentAndNext`, `getCountdown`, `parseTime`, `normalizeApiTimings`. PRAYERS array now includes Midnight; wrap-to-tomorrow only triggers after Midnight passes
- `src/utils/api.js` — `resolveTimings` (static-first, API fallback), `fetchTimings` (Aladhan + cache)
- `src/widget/JantariWidget.jsx` — widget UI (`FlexWidget`/`TextWidget`), currently row-layout showing current|divider|next+countdown
- `src/widget/widgetTaskHandler.js` — handles `WIDGET_ADDED`, `WIDGET_UPDATE`, `WIDGET_CLICK`, `WIDGET_RESIZED`
- `android/app/src/main/java/com/jantariapp/widget/Jantari.java` — native widget provider class
- `index.js` — registers app + `registerWidgetTaskHandler`

## Known Issues / Next Steps
- Widget is still 2×2, needs to become 2×1 — need to locate/share the widget size config (likely `android/app/src/main/res/xml/jantari_widget_info.xml`) (it's now 2x1 but designed got messed up)
- Widget refresh button missing, needs to be added back
- MIUI devices (e.g., Redmi Note 7S) need "Install via USB" enabled in Developer Options + SIM inserted for verification, or use `adb install` directly to bypass

## In Progress
Dhikr/Adhkar section: favourites, Arabic text, translation dropdown (Urdu/Hindi/English), Hadith reference, interactive tap counter with animated progress border around the dhikr card.