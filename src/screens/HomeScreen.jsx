import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, StatusBar, ScrollView,
  Modal, FlatList, SectionList,
} from 'react-native';
import { vnsData } from '../data/vns';
import { amdData } from '../data/amd';
import { resolveTimings } from '../utils/api';
import { getCurrentAndNext, getCountdown } from '../utils/prayerUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JantariWidget } from '../widget/JantariWidget';
import { requestWidgetUpdate } from 'react-native-android-widget';

// ─── Constants ───────────────────────────────────────────────────────────────

const PRAYERS = ['Fajr', 'Zawal', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Midnight'];
const TABLE_COLS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const CITIES = [
  { key: 'vns', label: 'Varanasi' },
  { key: 'amd', label: 'Ahmedabad' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const QUARTERS = {
  all: MONTHS,
  q1: MONTHS.slice(0, 3),
  q2: MONTHS.slice(3, 6),
  q3: MONTHS.slice(6, 9),
  q4: MONTHS.slice(9, 12),
};

const staticDataMap = { vns: vnsData, amd: amdData };

// ─── Yearly View ─────────────────────────────────────────────────────────────

function YearlyView({ cityKey }) {
  const [quarter, setQuarter] = useState('all');
  const data = staticDataMap[cityKey];

  const today = new Date();
  const todayMonth = today.toLocaleString('en-US', { month: 'long' });
  const todayDate = String(today.getDate()).padStart(2, '0');

  const sections = QUARTERS[quarter]
    .filter(m => data?.[m])
    .map(month => ({
      title: month,
      data: data[month],
    }));

  return (
    <View style={{ flex: 1 }}>
      {/* Quarter filter */}
      <View style={y.quarterRow}>
        {Object.keys(QUARTERS).map(q => (
          <TouchableOpacity
            key={q}
            style={[y.qBtn, quarter === q && y.qBtnActive]}
            onPress={() => setQuarter(q)}
          >
            <Text style={[y.qBtnText, quarter === q && y.qBtnTextActive]}>
              {q.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Table header */}
          <View style={y.tableHeader}>
            <Text style={[y.th, y.colDate]}>Date</Text>
            {TABLE_COLS.map(col => (
              <Text key={col} style={[y.th, y.colTime]}>{col}</Text>
            ))}
          </View>

          <SectionList
            sections={sections}
            keyExtractor={(item, i) => `${item.Date}-${i}`}
            scrollEnabled={false}
            renderSectionHeader={({ section }) => (
              <View style={y.monthHeader}>
                <Text style={y.monthTitle}>{section.title}</Text>
              </View>
            )}
            renderItem={({ item }) => {
              const isToday = item.Date === todayDate && todayMonth === sections.find(s => s.data.includes(item))?.title;
              return (
                <View style={[y.row, isToday && y.rowToday]}>
                  <Text style={[y.td, y.colDate, isToday && y.tdToday]}>{item.Date}</Text>
                  {TABLE_COLS.map(col => (
                    <Text key={col} style={[y.td, y.colTime, isToday && y.tdToday]}>
                      {item[col] || '---'}
                    </Text>
                  ))}
                </View>
              );
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── City Dropdown ────────────────────────────────────────────────────────────

function CityDropdown({ cityKey, onChange }) {
  const [open, setOpen] = useState(false);
  const current = CITIES.find(c => c.key === cityKey);

  return (
    <>
      <TouchableOpacity style={d.pill} onPress={() => setOpen(true)}>
        <Text style={d.pillText}>{current?.label}</Text>
        <Text style={d.pillArrow}>▾</Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={d.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={d.sheet}>
            <Text style={d.sheetTitle}>Select City</Text>
            {CITIES.map(c => (
              <TouchableOpacity
                key={c.key}
                style={[d.option, c.key === cityKey && d.optionActive]}
                onPress={() => { onChange(c.key); setOpen(false); }}
              >
                <Text style={[d.optionText, c.key === cityKey && d.optionTextActive]}>
                  {c.label}
                </Text>
                {c.key === cityKey && <Text style={d.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [cityKey, setCityKey] = useState('vns');
  const [timings, setTimings] = useState(null);
  const [nextSalah, setNextSalah] = useState(null);
  const [currentSalah, setCurrentSalah] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [clock, setClock] = useState('');
  const [activeTab, setActiveTab] = useState('live');

  // Load city on mount
  useEffect(() => {
    AsyncStorage.getItem('selected_city').then(c => { if (c) setCityKey(c); });
  }, []);

  // Fetch timings on city change
  useEffect(() => {
    resolveTimings(cityKey, staticDataMap).then(setTimings);
    AsyncStorage.setItem('selected_city', cityKey);
  }, [cityKey]);

  // Clock + countdown tick
  useEffect(() => {
    if (!timings) return;
    const tick = () => {
      const { current, next } = getCurrentAndNext(timings);
      setCurrentSalah(current);
      setNextSalah(next);
      setCountdown(getCountdown(next.time));
      setClock(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timings]);

  // Widget update
  useEffect(() => {
    if (!timings) return;
    const cityLabel = CITIES.find(c => c.key === cityKey)?.label || cityKey;
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
      widgetNotFound: () => {},
    }).catch(() => {});
  }, [cityKey, timings]);

  const switchCity = useCallback((key) => {
    setCityKey(key);
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f1923" />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.appTitle}>Jantari</Text>
          <Text style={s.dateStr}>{today}</Text>
        </View>
        <CityDropdown cityKey={cityKey} onChange={switchCity} />
      </View>

      {/* ── Tab switcher ── */}
      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tab, activeTab === 'live' && s.tabActive]}
          onPress={() => setActiveTab('live')}
        >
          <Text style={[s.tabText, activeTab === 'live' && s.tabTextActive]}>Live Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, activeTab === 'yearly' && s.tabActive]}
          onPress={() => setActiveTab('yearly')}
        >
          <Text style={[s.tabText, activeTab === 'yearly' && s.tabTextActive]}>Yearly Jantari</Text>
        </TouchableOpacity>
      </View>

      {/* ── Tab Content ── */}
      {activeTab === 'live' ? (
        <ScrollView contentContainerStyle={s.scroll}>
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
            {PRAYERS.filter(name => timings?.[name]).map(name => {
              const isNext = nextSalah?.name === name;
              const isCurrent = currentSalah?.name === name;
              return (
                <View key={name} style={[s.row, isNext && s.rowNext]}>
                  <Text style={[s.prayerName, isNext && s.textAccent]}>{name}</Text>
                  <Text style={[s.prayerTime, isNext && s.textAccent]}>{timings[name]}</Text>
                  {isNext && <Text style={s.badge}>NEXT</Text>}
                  {isCurrent && !isNext && <Text style={s.badgeCurrent}>NOW</Text>}
                </View>
              );
            })}
          </View>

          <Text style={s.sehriIftar}>
            Sehri: {timings?.Fajr || '---'} · Iftar: {timings?.Maghrib || '---'}
          </Text>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={s.scroll}>
          <YearlyView cityKey={cityKey} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f1923' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  appTitle: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  dateStr: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 12,
    backgroundColor: '#1e293b', borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#6d28d9' },
  tabText: { color: '#6b7280', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  scroll: { paddingHorizontal: 20, paddingBottom: 30 },
  clockBox: {
    backgroundColor: '#1e293b', borderRadius: 20,
    padding: 24, marginBottom: 16, alignItems: 'center',
  },
  clockText: { fontSize: 38, fontWeight: '700', color: '#fff', letterSpacing: 2 },
  countdownRow: { marginTop: 10, alignItems: 'center' },
  nextLabel: { fontSize: 11, color: '#6b7280', letterSpacing: 2 },
  countdownText: { fontSize: 22, color: '#34d399', fontWeight: '700', marginTop: 4 },
  scheduleCard: {
    backgroundColor: '#1e293b', borderRadius: 20,
    overflow: 'hidden', marginBottom: 14,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#0f1923',
  },
  rowNext: { backgroundColor: '#1a1040' },
  prayerName: { flex: 1, fontSize: 15, color: '#d1d5db', fontWeight: '500' },
  prayerTime: { fontSize: 15, color: '#9ca3af' },
  textAccent: { color: '#a78bfa' },
  badge: {
    marginLeft: 8, backgroundColor: '#6d28d9', color: '#fff',
    fontSize: 9, fontWeight: '700', paddingHorizontal: 7,
    paddingVertical: 2, borderRadius: 5, letterSpacing: 1,
  },
  badgeCurrent: {
    marginLeft: 8, backgroundColor: '#065f46', color: '#34d399',
    fontSize: 9, fontWeight: '700', paddingHorizontal: 7,
    paddingVertical: 2, borderRadius: 5,
  },
  sehriIftar: { textAlign: 'center', color: '#6b7280', fontSize: 12, marginBottom: 10 },
});

// Dropdown styles
const d = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e293b', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, gap: 6,
  },
  pillText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  pillArrow: { color: '#6b7280', fontSize: 12 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1e293b', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, padding: 20, paddingBottom: 36,
  },
  sheetTitle: {
    color: '#6b7280', fontSize: 11, fontWeight: '700',
    letterSpacing: 2, marginBottom: 12,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#0f1923',
  },
  optionActive: {},
  optionText: { fontSize: 16, color: '#d1d5db', fontWeight: '500' },
  optionTextActive: { color: '#a78bfa', fontWeight: '700' },
  check: { color: '#a78bfa', fontSize: 16 },
});

// Yearly styles
const y = StyleSheet.create({
  quarterRow: {
    flexDirection: 'row', gap: 8, marginBottom: 14,
  },
  qBtn: {
    flex: 1, paddingVertical: 7, alignItems: 'center',
    backgroundColor: '#1e293b', borderRadius: 8,
  },
  qBtnActive: { backgroundColor: '#6d28d9' },
  qBtnText: { color: '#6b7280', fontSize: 12, fontWeight: '700' },
  qBtnTextActive: { color: '#fff' },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#1e293b',
    paddingVertical: 10, paddingHorizontal: 4,
    borderRadius: 10, marginBottom: 4,
  },
  th: { color: '#6b7280', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  colDate: { width: 36, textAlign: 'center' },
  colTime: { width: 82, textAlign: 'center' },
  monthHeader: {
    backgroundColor: '#0f1923', paddingVertical: 8, paddingHorizontal: 4,
    marginTop: 8,
  },
  monthTitle: { color: '#a78bfa', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  row: {
    flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: '#1e293b',
  },
  rowToday: { backgroundColor: '#1a1040' },
  td: { color: '#9ca3af', fontSize: 12 },
  tdToday: { color: '#a78bfa', fontWeight: '700' },
});