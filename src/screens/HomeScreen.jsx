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
import { JantariWidget } from '../widget/JantariWidget';
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
  await AsyncStorage.setItem('selected_city', key);

  // Confirm it saved
  const saved = await AsyncStorage.getItem('selected_city');
  console.log('Saved city:', saved);

  try {
    const cityLabel = key === 'vns' ? 'Varanasi' : key === 'amd' ? 'Ahmedabad' : key;
    const newTimings = await resolveTimings(key, staticDataMap);
    console.log('Timings resolved:', !!newTimings);

    if (newTimings) {
      const { current, next } = getCurrentAndNext(newTimings);
      console.log('Next salah:', next?.name);

      await requestWidgetUpdate({
        widgetName: 'Jantari',
        renderWidget: () => (
          <JantariWidget
            city={cityLabel}
            currentSalah={current?.name || null}
            nextSalah={next.label || next.name}
            nextTime={next.timeStr}
            countdown={getCountdown(next.time)}
          />
        ),
      });
      console.log('Widget update triggered');
    }
  } catch (e) {
    console.error('Widget update error:', e);
  }
};

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const todayRow = timings ? timings : null;
useEffect(() => {
  if (!timings) return;
  const cityLabel = cityKey === 'vns' ? 'Varanasi' : cityKey === 'amd' ? 'Ahmedabad' : cityKey;
  const { current, next } = getCurrentAndNext(timings);

  requestWidgetUpdate({
    widgetName: 'Jantari',
    renderWidget: () => (
      <JantariWidget
        city={cityLabel}
        currentSalah={current?.name || null}
        nextSalah={next.label || next.name}
        nextTime={next.timeStr}
        countdown={getCountdown(next.time)}
      />
    ),
    widgetNotFound: () => console.warn('No widget found with name: Jantari'),
  }).then(r => console.log('Widget result:', r))
    .catch(e => console.error('Widget error:', e.message));
}, [cityKey, timings]);


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