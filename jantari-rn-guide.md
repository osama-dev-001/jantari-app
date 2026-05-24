# Jantari — React Native (Android) Implementation Guide

---

## 1. Project Setup

```bash
npx @react-native-community/cli init JantariApp --template react-native-template-typescript
cd JantariApp

# Core dependencies
npm install react-native-android-widget
npm install @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

npx pod-install  # skip if Android only
```

---

## 2. File Structure

```
JantariApp/
├── src/
│   ├── data/
│   │   ├── vns.js                  # your existing Varanasi data (export as module)
│   │   └── amd.js                  # your existing Ahmedabad data (export as module)
│   ├── utils/
│   │   ├── prayerUtils.js          # core timing logic
│   │   └── api.js                  # Aladhan API + AsyncStorage cache
│   ├── widget/
│   │   ├── JantariWidget.jsx       # widget UI
│   │   └── widgetTaskHandler.js    # background widget data handler
│   └── screens/
│       ├── HomeScreen.jsx
│       └── YearlyScreen.jsx
├── android/app/src/main/
│   ├── AndroidManifest.xml         # add widget receiver here
│   └── res/xml/
│       └── jantari_widget_info.xml
├── App.tsx
└── index.js
```

---

## 3. Data Files

### src/data/vns.js
Take your existing `vns.js` and add one line at the top:

```js
export const vnsData = {
  // ... your existing object, unchanged
};
```

### src/data/amd.js
Same — just add:
```js
export const amdData = {
  // ... your existing object, unchanged
};
```

---

## 4. src/utils/prayerUtils.js

```js
const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/**
 * Returns today's row from static data object
 */
export function getTodayTimings(data) {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'long' });
  const day = String(now.getDate()).padStart(2, '0');
  return data[month]?.find(d => d.Date === day) || null;
}

/**
 * Parses "05:23 AM" -> Date (today, at that time)
 */
export function parseTime(timeStr) {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Returns { current, next } — both have { name, time (Date), timeStr }
 * If all prayers are past, wraps around to Fajr of next day.
 */
export function getCurrentAndNext(timings) {
  const now = new Date();

  const prayers = PRAYERS.map(name => ({
    name,
    timeStr: timings[name],
    time: parseTime(timings[name]),
  }));

  const nextIndex = prayers.findIndex(p => p.time > now);

  if (nextIndex === -1) {
    // All prayers done — current is Isha, next is Fajr (tomorrow)
    return {
      current: prayers[prayers.length - 1],
      next: { ...prayers[0], label: 'Fajr (tomorrow)' },
    };
  }

  return {
    current: nextIndex === 0 ? null : prayers[nextIndex - 1],
    next: prayers[nextIndex],
  };
}

/**
 * Returns countdown string "2h 14m 33s" to a given Date
 */
export function getCountdown(targetDate) {
  const now = new Date();
  let diff = targetDate - now;
  if (diff < 0) diff += 24 * 60 * 60 * 1000;

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

/**
 * Normalize timings from Aladhan API response to match static data shape
 */
export function normalizeApiTimings(apiTimings) {
  // Aladhan returns 24h format — convert to 12h to match static data
  const to12h = t => {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  };

  return {
    Fajr: to12h(apiTimings.Fajr),
    Sunrise: to12h(apiTimings.Sunrise),
    Dhuhr: to12h(apiTimings.Dhuhr),
    Asr: to12h(apiTimings.Asr),
    Maghrib: to12h(apiTimings.Maghrib),
    Isha: to12h(apiTimings.Isha),
  };
}
```

---

## 5. src/utils/api.js

```js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeApiTimings } from './prayerUtils';

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function cacheKey(city, date) {
  return `jantari_${city}_${date}`;
}

function todayDateStr() {
  return new Date().toISOString().slice(0, 10); // "2026-05-05"
}

/**
 * Fetch prayer timings from Aladhan API.
 * Uses cache — only hits network if no valid cache exists.
 *
 * @param {string} city   - City name, e.g. "Delhi"
 * @param {string} country - Country name, e.g. "India"
 * @param {number} method  - Calculation method (1 = University of Islamic Sciences, Karachi)
 */
export async function fetchTimings(city, country = 'India', method = 1) {
  const date = todayDateStr();
  const key = cacheKey(`${city}_${country}`, date);

  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const { timings, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        return timings; // fresh cache
      }
    }
  } catch (_) {}

  // Cache miss or stale — hit the API
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Aladhan API error: ${res.status}`);

  const json = await res.json();
  const raw = json.data.timings;
  const timings = normalizeApiTimings(raw);

  // Store in cache
  await AsyncStorage.setItem(key, JSON.stringify({ timings, timestamp: Date.now() }));

  return timings;
}

/**
 * Resolve timings for a city.
 * Static cities (vns, amd) return immediately — no network.
 * Others fall through to Aladhan.
 */
export async function resolveTimings(cityKey, staticDataMap) {
  if (staticDataMap[cityKey]) {
    const { getTodayTimings } = require('./prayerUtils');
    return getTodayTimings(staticDataMap[cityKey]);
  }

  // Dynamic cities — expects cityKey like "delhi|India" or just "delhi"
  const [city, country = 'India'] = cityKey.split('|');
  return await fetchTimings(city, country);
}
```

---

## 6. src/widget/JantariWidget.jsx

```jsx
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function JantariWidget({ city, currentSalah, nextSalah, nextTime, countdown }) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#0f1923',
        borderRadius: 20,
        padding: 16,
      }}
    >
      {/* City label */}
      <TextWidget
        text={city.toUpperCase()}
        style={{
          fontSize: 11,
          color: '#6b7280',
          fontFamily: 'sans-serif-medium',
          letterSpacing: 2,
          marginBottom: 6,
        }}
      />

      {/* Current Salah */}
      {currentSalah ? (
        <TextWidget
          text={`${currentSalah} time`}
          style={{
            fontSize: 13,
            color: '#9ca3af',
            fontFamily: 'sans-serif',
            marginBottom: 2,
          }}
        />
      ) : null}

      {/* Next Salah */}
      <TextWidget
        text={`Next: ${nextSalah}`}
        style={{
          fontSize: 20,
          fontFamily: 'sans-serif-medium',
          color: '#ffffff',
          marginBottom: 2,
        }}
      />

      <TextWidget
        text={nextTime}
        style={{
          fontSize: 14,
          color: '#a78bfa',
          fontFamily: 'sans-serif',
          marginBottom: 8,
        }}
      />

      {/* Countdown */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#1e293b',
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}
      >
        <TextWidget
          text={`⏱ ${countdown}`}
          style={{
            fontSize: 14,
            color: '#34d399',
            fontFamily: 'sans-serif-medium',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
```

---

## 7. src/widget/widgetTaskHandler.js

```js
import React from 'react';
import { vnsData } from '../data/vns';
import { amdData } from '../data/amd';
import { resolveTimings } from '../utils/api';
import { getCurrentAndNext, getCountdown } from '../utils/prayerUtils';
import { JantariWidget } from './JantariWidget';
import AsyncStorage from '@react-native-async-storage/async-storage';

const staticDataMap = { vns: vnsData, amd: amdData };

async function buildWidgetProps() {
  // Read last selected city from storage (set by the app)
  const cityKey = (await AsyncStorage.getItem('selected_city')) || 'vns';
  const cityLabel = cityKey === 'vns' ? 'Varanasi' : cityKey === 'amd' ? 'Ahmedabad' : cityKey;

  try {
    const timings = await resolveTimings(cityKey, staticDataMap);
    if (!timings) throw new Error('No timings');

    const { current, next } = getCurrentAndNext(timings);
    const countdown = getCountdown(next.time);

    return {
      city: cityLabel,
      currentSalah: current?.name || null,
      nextSalah: next.label || next.name,
      nextTime: next.timeStr,
      countdown,
    };
  } catch (e) {
    return {
      city: cityLabel,
      currentSalah: null,
      nextSalah: '---',
      nextTime: '--:-- --',
      countdown: '--h --m --s',
    };
  }
}

export async function widgetTaskHandler(props) {
  const { widgetAction, renderWidget } = props;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const widgetProps = await buildWidgetProps();
      renderWidget(<JantariWidget {...widgetProps} />);
      break;
    }
    case 'WIDGET_CLICK':
      // Optional: open app on widget tap
      break;
    default:
      break;
  }
}
```

---

## 8. src/screens/HomeScreen.jsx

```jsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, StatusBar, ScrollView,
} from 'react-native';
import { vnsData } from '../data/vns';
import { amdData } from '../data/amd';
import { resolveTimings } from '../utils/api';
import { getCurrentAndNext, getCountdown, getTodayTimings, parseTime } from '../utils/prayerUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestWidgetUpdate } from 'react-native-android-widget';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const CITIES = [
  { key: 'vns', label: 'Varanasi' },
  { key: 'amd', label: 'Ahmedabad' },
];
const staticDataMap = { vns: vnsData, amd: amdData };

export default function HomeScreen() {
  const [cityKey, setCityKey] = useState('vns');
  const [timings, setTimings] = useState(null);
  const [nextSalah, setNextSalah] = useState(null);
  const [currentSalah, setCurrentSalah] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [clock, setClock] = useState('');

  // Load city from storage on mount
  useEffect(() => {
    AsyncStorage.getItem('selected_city').then(c => { if (c) setCityKey(c); });
  }, []);

  // Fetch timings when city changes
  useEffect(() => {
    resolveTimings(cityKey, staticDataMap).then(setTimings);
    AsyncStorage.setItem('selected_city', cityKey);
  }, [cityKey]);

  // Countdown + clock tick
  useEffect(() => {
    if (!timings) return;
    const tick = () => {
      const { current, next } = getCurrentAndNext(timings);
      setCurrentSalah(current);
      setNextSalah(next);
      setCountdown(getCountdown(next.time));
      setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timings]);

  const switchCity = async (key) => {
    setCityKey(key);
    // Trigger widget refresh
    await requestWidgetUpdate({
      widgetName: 'Jantari',
      renderWidget: () => null, // widget re-renders via task handler
    });
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const todayRow = timings ? timings : null;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f1923" />
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.appTitle}>Jantari</Text>
          <Text style={s.dateStr}>{today}</Text>
        </View>

        {/* City switcher */}
        <View style={s.cityRow}>
          {CITIES.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[s.cityBtn, cityKey === c.key && s.cityBtnActive]}
              onPress={() => switchCity(c.key)}
            >
              <Text style={[s.cityBtnText, cityKey === c.key && s.cityBtnTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Clock */}
        <View style={s.clockBox}>
          <Text style={s.clockText}>{clock}</Text>
          {nextSalah && (
            <View style={s.countdownRow}>
              <Text style={s.nextLabel}>NEXT: {nextSalah.label || nextSalah.name}</Text>
              <Text style={s.countdownText}>{countdown}</Text>
            </View>
          )}
        </View>

        {/* Daily schedule */}
        <View style={s.scheduleCard}>
          {PRAYERS.map(name => {
            const timeStr = todayRow?.[name] || '---';
            const isNext = nextSalah?.name === name;
            const isCurrent = currentSalah?.name === name;
            return (
              <View key={name} style={[s.row, isNext && s.rowNext]}>
                <Text style={[s.prayerName, isNext && s.textAccent]}>{name}</Text>
                <Text style={[s.prayerTime, isNext && s.textAccent]}>{timeStr}</Text>
                {isNext && <Text style={s.badge}>NEXT</Text>}
                {isCurrent && !isNext && <Text style={s.badgeCurrent}>NOW</Text>}
              </View>
            );
          })}
        </View>

        <Text style={s.sehriIftar}>
          Sehri: {todayRow?.Fajr || '---'} · Iftar: {todayRow?.Maghrib || '---'}
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f1923' },
  scroll: { padding: 20 },
  header: { marginBottom: 20 },
  appTitle: { fontSize: 32, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  dateStr: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  cityRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  cityBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#1e293b', alignItems: 'center',
  },
  cityBtnActive: { backgroundColor: '#6d28d9' },
  cityBtnText: { color: '#9ca3af', fontWeight: '600' },
  cityBtnTextActive: { color: '#fff' },
  clockBox: {
    backgroundColor: '#1e293b', borderRadius: 20,
    padding: 24, marginBottom: 20, alignItems: 'center',
  },
  clockText: { fontSize: 40, fontWeight: '700', color: '#fff', letterSpacing: 2 },
  countdownRow: { marginTop: 12, alignItems: 'center' },
  nextLabel: { fontSize: 12, color: '#6b7280', letterSpacing: 2 },
  countdownText: { fontSize: 22, color: '#34d399', fontWeight: '700', marginTop: 4 },
  scheduleCard: { backgroundColor: '#1e293b', borderRadius: 20, overflow: 'hidden', marginBottom: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#0f1923',
  },
  rowNext: { backgroundColor: '#1a1040' },
  prayerName: { flex: 1, fontSize: 16, color: '#d1d5db', fontWeight: '500' },
  prayerTime: { fontSize: 16, color: '#9ca3af' },
  textAccent: { color: '#a78bfa' },
  badge: {
    marginLeft: 10, backgroundColor: '#6d28d9',
    color: '#fff', fontSize: 10, fontWeight: '700',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
    letterSpacing: 1,
  },
  badgeCurrent: {
    marginLeft: 10, backgroundColor: '#065f46',
    color: '#34d399', fontSize: 10, fontWeight: '700',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  sehriIftar: {
    textAlign: 'center', color: '#6b7280', fontSize: 13, marginBottom: 20,
  },
});
```

---

## 9. App.tsx

```tsx
import React from 'react';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return <HomeScreen />;
}
```

---

## 10. index.js (modified)

```js
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './src/widget/widgetTaskHandler';

AppRegistry.registerComponent(appName, () => App);

// Register the widget background task
registerWidgetTaskHandler(widgetTaskHandler);
```

---

## 11. Android Native Config

### android/app/src/main/res/xml/jantari_widget_info.xml
Create this file:

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="110dp"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/rn_widget"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:description="@string/app_name" />
```

### android/app/src/main/AndroidManifest.xml
Add inside `<application>` tag:

```xml
<receiver
    android:name="com.reactnativeandroidwidget.RNWidgetProvider"
    android:exported="true"
    android:label="Jantari Widget">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/jantari_widget_info" />
</receiver>

<service
    android:name="com.reactnativeandroidwidget.RNWidgetBackgroundTaskService"
    android:permission="android.permission.BIND_JOB_SERVICE"
    android:exported="false" />
```

---

## 12. Adding More Cities (Dynamic)

To add a city that has no static data, just pass its key in the format `"cityname|Country"`:

```js
// In HomeScreen, add to CITIES array:
{ key: 'delhi|India', label: 'Delhi' }
// resolveTimings() will hit Aladhan API automatically, cache for 12h
```

---

## 13. Build & Run

```bash
npx react-native run-android
```

To add widget to home screen:
1. Long press home screen
2. Widgets > JantariApp > Jantari Widget
3. Place it

Widget auto-updates every 30 minutes (set in `updatePeriodMillis`). Switching city in-app triggers an immediate widget refresh.

---

## Summary

| Feature | Implementation |
|---|---|
| Static cities | vns.js, amd.js — zero network calls |
| Dynamic cities | Aladhan API with 12h AsyncStorage cache |
| Widget | `react-native-android-widget` — JS-defined, native rendered |
| Widget data | Same utils as app — shared logic |
| City switch | Persisted via AsyncStorage, widget refreshes on switch |
| Countdown | Ticks every second in-app; static snapshot in widget |
