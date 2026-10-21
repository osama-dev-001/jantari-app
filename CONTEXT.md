# Islamic Daily — architecture notes (v2)

v2 is a from-scratch rewrite (Oct 2026) in TypeScript. v1 is preserved at the git tag
`backup/v1.2-pre-rebuild`. Android-only React Native 0.85 (bare, New Architecture,
Hermes, edge-to-edge). Package `com.jantariapp` / component `JantariApp` are unchanged
so installs update in place and placed widgets keep working.

## Layout

```
App.tsx                 providers, splash hide, widget sync + store flush on background
index.js                registers the app and the widget task handler
src/core/               pure logic, no React Native imports — unit tested
  time.ts               city-timezone dates/clocks (fixed UTC offsets; no DST zones)
  prayer/engine.ts      day times (mosque timetable → Adhan fallback), current/next, year table
  hijri.ts  qibla.ts    tabular Hijri calendar (+ user offset), great-circle bearing
  reminders.ts          plans adhkar/prayer notifications (pure)
src/data/               cities.ts, mosque/{varanasi,ahmedabad}.ts, adhkar/{favourites,others}.ts
src/store/              persisted stores (AsyncStorage JSON, debounced) + v1 migration
src/theme/              palette (Night/Day × 4 accents), typography, scripts (Arabic/Urdu fonts), ThemeProvider
src/native/             JS wrappers for the app's own Kotlin modules
src/ui/                 Icon (Lucide subset + mosque/beads), primitives, layout, graphics (SVG)
src/features/           today/ prayer/ dhikr/ settings/ dev/ (widget preview, __DEV__ only)
src/widget/             model.ts (pure), PrayerWidget.tsx (RemoteViews), taskHandler.tsx
```

## Prayer times

- Every time is an absolute instant (epoch ms). A city's wall clock is its fixed UTC
  offset, so results don't depend on the phone's timezone.
- Mosque timetables are parsed as-is; unparseable cells (e.g. Varanasi Apr 30 Midnight
  `XX:YY`) are treated as missing, never guessed. Isha/Midnight may roll past 00:00
  (Ahmedabad's Midnight is 12:01 AM). Feb 29 falls back to Feb 28.
- Calculated cities: Adhan with the city's regional method when the setting is Auto
  (Karachi for South Asia, Umm al-Qura, Dubai, Qatar, Kuwait, MWL, Singapore). No Zawal
  for calculated cities (Adhan has no direct value; an approximation isn't shown).
- `getPrayerState` looks at yesterday + today + tomorrow, so "current" is correct after
  midnight (e.g. before Fajr the current period is last night's Midnight).

## Storage keys

| Key | Shape |
|---|---|
| `v2:settings` | `Settings` (migrated from v1 `selected_city`, `prayer_madhab`) |
| `v2:dhikr` | `{ 'YYYY-MM-DD': { [dhikrId]: count } }`, 90 days (migrated from v1 `dhikr_count_*`) |
| `v2:tracker` | `{ 'YYYY-MM-DD': PrayerKey[] }`, 90 days |
| `v2:tasbih` | `{ count, target, total }` |

v1 keys are left in place, so rolling back to v1 still works. Dhikr/tracker days follow
the selected city's calendar date. Increments read the store's current value
(`incrementDhikr`), so taps landing before a re-render are never lost.

## Reminders (v2.1)

- `core/reminders.ts` builds a 7-day plan: morning window Fajr → Zawal (Dhuhr where the city has
  no Zawal), evening Asr → Isha. First reminder `startAfterMin` after the window opens, then every
  `everyMin`, then every `endingEveryMin` during the last `endingWindowMin`. Windows whose
  Favourites are all done are skipped (`stopWhenDone`). Optional alerts at each fard prayer.
- `store/reminderSync.ts` hands the plan to the native module, which replaces all pending alarms.
  Resynced on settings change, dhikr progress (debounced), app foreground/background and, when stale
  (>6 h), from the widget task — so the week stays topped up even if the app isn't opened.
- Native (`android/.../reminders/`, no third-party library): exact `setExactAndAllowWhileIdle`
  alarms (`USE_EXACT_ALARM`), JSON plan in SharedPreferences, `BootReceiver` restores after
  reboot/update/time change, the receiver drops reminders >20 min late. Channels: `adhkar`,
  `adhkar_ending` (high), `prayer` (high). One notification slot per window per day, so reminders
  replace each other. Taps deep-link to `islamicdaily://dhikr` / `islamicdaily://today`.
- Reminders are **off by default**; turning one on requests `POST_NOTIFICATIONS` (Android 13+).

## Fonts

Arabic (Amiri, Scheherazade New, Noto Naskh Arabic, Lateef) and Urdu (Noto Nastaliq, Gulzar, Noto
Naskh) are user-selectable, with separate size settings. Always style Arabic/Urdu text through
`useScripts().arabic(size, opts)` / `.urdu(size, opts)` — each font carries its own size and
line-height metrics (Nastaliq needs ~2× line height). `label: true` gives compact single-line metrics.

## Widget

Provider `com.jantariapp.widget.Jantari`, widget name `Jantari` (don't rename). Computes
everything offline from saved settings. Refreshes every 30 min (Android minimum), when
tapped (↻), every minute while the app is open, and when the app goes to background.
The RemoteViews layout rules learned on devices are listed at the top of `PrayerWidget.tsx`.

## Platform quirks handled

- **Fabric rounded corners**: a view whose background appears after mount, or whose
  `transform` animates, loses its border radius. `PressableScale` keeps visuals on an
  inner view; selection highlights are keyed to remount.
- **Edge-to-edge**: windows don't resize for the keyboard; screens/sheets add the
  keyboard height themselves (`useKeyboardHeight`). Avoid `TextInput` inside `Modal`:
  the first tap after the keyboard opens only dismisses it — the city picker is a screen.
- **Fonts**: family = file name in `android/app/src/main/assets/fonts`; never use
  `fontWeight` with them.
- **PressableScale** splits styles: placement on the animated outer view, visuals on an inner
  view; percentage sizes stay on the outer one only. Pass `fill` when the parent stretches it.

## Content

Adhkar entries carry `source` (shown as a chip). Missing translations fall back to
English with a note. `others.ts` was added in v2 and is pending owner review.
