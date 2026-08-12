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
- Home screen widget (2×1) — see Widget section below
- App icon and splash screen via `react-native-bootsplash` v7
- Signed release APK via keystore

## Key Files
- `src/screens/HomeScreen.jsx` — main screen, all tabs, city dropdown, YearlyView component, all StyleSheets (`s`, `d`, `y`)
- `src/data/vns.js` / `amd.js` — static prayer data (`vnsData` / `amdData`)
- `src/utils/prayerUtils.js` — `getTodayTimings`, `getCurrentAndNext`, `getCountdown`, `parseTime`, `normalizeApiTimings`. PRAYERS array includes Midnight; wrap-to-tomorrow only triggers after Midnight passes
- `src/utils/api.js` — `resolveTimings` (static-first, API fallback), `fetchTimings` (Aladhan + cache)
- `src/widget/JantariWidget.jsx` — widget UI component
- `src/widget/widgetTaskHandler.js` — handles `WIDGET_ADDED`, `WIDGET_UPDATE`, `WIDGET_CLICK`, `WIDGET_RESIZED`
- `android/app/src/main/java/com/jantariapp/widget/Jantari.java` — native widget provider class
- `index.js` — registers app + `registerWidgetTaskHandler`

## Widget (2×1)
File: `src/widget/JantariWidget.jsx`

### Layout
```
LABEL (current salah)          ↻ (top-right corner)
COUNTDOWN (large green)   → NEXT (small muted)
```
- Outer container: `flexDirection: 'column'`, `justifyContent: 'space-between'`, `height/width: 'match_parent'`
- Top row and bottom row both have `width: 'match_parent'` — **critical**: without this, inner FlexWidgets default to `wrap_content` in Android widgets and `justifyContent: 'space-between'` has no space to distribute
- Top row: `justifyContent: 'space-between'`, `alignItems: 'flex-start'` — label at left, ↻ pinned to top-right corner
- Bottom row: `justifyContent: 'space-between'`, `alignItems: 'flex-end'` — countdown at left, next salah hint at right
- Refresh FlexWidget must have explicit `width: 24, height: 24` — FlexWidget with `clickAction` collapses to 0×0 without explicit size

### Props
`JantariWidget({ label, hint, countdown })`
- `label` — current salah name uppercased (e.g. `"MIDNIGHT"`); if current is null (pre-Fajr window, before first prayer of the day), uses next salah name instead (e.g. `"FAJR"`)
- `hint` — `"→ Fajr"` style string when current exists; empty string `""` when current is null (avoids redundancy since label already shows the target)
- `countdown` — formatted string from `widgetCountdown()`: `"Xh XXm"` when ≥1 hour, `"XXm XXs"` when <1 hour

### widgetTaskHandler logic
- Always uses `next.name` (never `next.label`) — `next.label` is `"Fajr (tomorrow)"` in the wrap-around case and would overflow the widget
- `label = current ? current.name.toUpperCase() : next.name.toUpperCase()`
- `hint = current ? "→ " + next.name : ""`

### Android widget layout rules (hard-learned)
- `justifyContent: 'space-between'` between TextWidget siblings in a row TRUNCATES long text (e.g. "Maghrib" → "M") — only use it when both texts are short
- `flex: 1` on a FlexWidget wrapping a single large-font TextWidget causes "Δ" clipping rendering bug
- FlexWidget with `clickAction` collapses to 0×0 without explicit `width`/`height`
- `fontFamily: 'sans-serif-medium'` causes rendering issues on some devices — never use on TextWidgets
- Inner FlexWidgets need `width: 'match_parent'` to stretch full-width; without it they wrap content and `space-between` does nothing
- `alignItems: 'flex-start'` on inner FlexWidget without `width: 'match_parent'` causes the FlexWidget to shrink to wrap_content width

### Widget config
`android/app/src/main/res/xml/jantari_widget_info.xml`: `targetCellWidth="2"`, `targetCellHeight="1"`, `minWidth="110dp"`, `minHeight="58dp"`, `updatePeriodMillis="1800000"`, `resizeMode="none"`

## Dhikr / Adhkar Feature (almost done)
Files: `src/screens/DhikrScreen.jsx`, `src/screens/DhikrDetailScreen.jsx`, `src/data/adhkar.js`

**DhikrScreen** — list view with two tabs (Favourites / Others), daily progress tracking via AsyncStorage (key: `dhikr_count_{id}_{YYYY-MM-DD}`), each card shows Arabic text + count badge + thin progress bar at top (height:3, background `rgba(255,255,255,0.06)`, fill `#6d28d9`) + time badge (morning/evening).

**DhikrDetailScreen** — tap-to-count screen with:
- Dot progress border circling the card (purple while counting → green on completion). Uses `onLayout` to get actual card height (`cardHeight` state, initial estimate `CARD_SIZE * 0.85`). Dots follow rounded-rectangle perimeter via trigonometry (`innerR = CARD_RADIUS - DOT_R = 17`, arc formula: `θ` sweeps each corner). Only filled dots rendered (no placeholder dots). `overflow: 'hidden'` + `borderRadius: 20` naturally clips corner dots.
- Count display: large number (purple → green on completion), `/total` muted
- Translation dropdown (Urdu/Hindi/English) via bottom sheet Modal
- Hadith reference via bottom sheet Modal (📖 icon in header)
- Vibration on each tap (30ms)
- Reset button

**adhkar.js** — exports `FAVOURITES` and `OTHERS` arrays. Structure: `{ id, name, nameAr, time ('morning'|'evening'|'any'), count, arabic, translations: { urdu, hindi, english }, hadith }`. Many translations still marked `// TODO`.

## Known Issues / Next Steps
- MIUI devices (e.g., Redmi Note 7S) need "Install via USB" enabled in Developer Options + SIM inserted for verification, or use `adb install` directly to bypass
- Widget ↻ corner positioning pending visual confirmation on device
- Many Dhikr translations marked `// TODO` — need to be filled in
