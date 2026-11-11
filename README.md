# Islamic Daily

An offline Android app for South Asian Muslims: prayer times with a yearly Jantari,
morning/evening adhkar with a tap counter, and a home-screen widget. Urdu, Hindi and
English throughout. No internet needed.

## Features

- **Today** — next prayer with a live countdown, Hijri date (Urdu + English, advances
  at Maghrib), Sehri/Iftar times in Ramadan, adhkar progress.
- **Prayer** — daily schedule (browse any day), Qibla bearing and distance, and the
  **Yearly Jantari** table (ALL / Q1–Q4, jumps to today).
- **Dhikr** — curated favourites plus more adhkar, grouped by time of day (finished and
  out-of-time groups fold away); a counter
  with a tasbih-bead ring, multi-part counts (33·33·34), swipe between adhkar,
  translation and hadith/virtue in Urdu, Hindi or English. Plus a free tasbih counter.
- **Cities** — Varanasi and Ahmedabad use curated local-mosque timetables; ~60 more
  cities across India, Pakistan, Bangladesh, Nepal, Sri Lanka, the Gulf and Malaysia
  are calculated on the phone with [Adhan](https://github.com/batoulapps/adhan-js).
- **Online adhkar** — when a Supabase project is configured, the adhkar list is downloaded
  and cached, so edits in the database reach phones without a new build (see
  [supabase/README.md](supabase/README.md)). Offline it uses the last download or the built-in list.
- **Reminders** — optional notifications during the morning (Fajr → Zawal) and evening
  (Asr → Isha) adhkar times: hourly, then every 10 minutes near the end, stopping once done;
  plus optional prayer-time alerts. All intervals are adjustable. Works offline, survives reboots.
  Plays the app's own chime by default; Bell, Harp or the phone's sound can be picked instead.
- **Fonts** — choose the Arabic font (Amiri, Scheherazade, Noto Naskh, Lateef) and Urdu font
  (Noto Nastaliq, Gulzar, Noto Naskh), each with its own size. Arabic is shown in IndoPak script,
  as in South Asian dua books — khari zabar, ulta pesh, khari zer, madd, sukun on long و/ي and
  alif without hamza (لَآ اِلٰهَ اِلَّا اللّٰهُ وَحْدَهٗ لَا شَرِيْكَ لَهٗ) — in every font.
- **Settings** — calculation method (Auto picks the regional standard), Asr madhab,
  12/24-hour clock, Hijri adjustment (±2 days), Night/Day/System theme, four accents,
  default translation language, haptics.
- **Widget** — resizable; shows the current period, countdown and (when tall enough)
  the day's schedule.

## Develop

Requires Node ≥ 22.11, JDK 21 and the Android SDK.

```sh
npm install
npm start                 # Metro
npm run android           # debug build → "Islamic Daily Dev" (com.jantariapp.dev)
npm test                  # Jest: engine, Hijri, Qibla, storage migration, content, widget
npx tsc --noEmit && npm run lint
```

## Release APK

```sh
cd android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Output: `android/app/build/outputs/apk/release/app-release.apk` (installs over earlier
versions as `com.jantariapp`). Signing passwords are read from `~/.gradle/gradle.properties`
(`JANTARI_*`); the keystore `android/app/jantari.keystore` is git-ignored.

See [CONTEXT.md](CONTEXT.md) for architecture and [docs/](docs/) for the prayer-time strategy.
