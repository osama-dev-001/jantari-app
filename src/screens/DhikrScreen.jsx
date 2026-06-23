import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAVOURITES, OTHERS } from '../data/adhkar';

const TIME_LABEL = { morning: 'صبح', evening: 'شام', any: '' };
const TIME_COLOR = { morning: '#d97706', evening: '#6d28d9', any: '#0e7490' };

function todayKey(id) {
  const d = new Date().toISOString().slice(0, 10);
  return `dhikr_count_${id}_${d}`;
}

async function loadAllCounts(list) {
  const counts = {};
  await Promise.all(list.map(async item => {
    try {
      const val = await AsyncStorage.getItem(todayKey(item.id));
      counts[item.id] = val ? parseInt(val, 10) : 0;
    } catch {
      counts[item.id] = 0;
    }
  }));
  return counts;
}

function DhikrCard({ item, count, onPress }) {
  const completed = count >= item.count;
  const progress = Math.min(count / item.count, 1);

  return (
    <TouchableOpacity
      style={[s.card, completed && s.cardDone]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      {/* Thin progress bar at top of card */}
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${progress * 100}%` }, completed && s.progressDone]} />
      </View>

      <View style={s.cardTop}>
        <Text style={s.cardArabic} numberOfLines={2}>{item.arabic}</Text>
        <View style={s.rightCol}>
          {item.time !== 'any' && (
            <View style={[s.timeBadge, { backgroundColor: TIME_COLOR[item.time] + '22' }]}>
              <Text style={[s.timeBadgeText, { color: TIME_COLOR[item.time] }]}>
                {TIME_LABEL[item.time]}
              </Text>
            </View>
          )}
          {completed && (
            <View style={s.doneBadge}>
              <Text style={s.doneText}>✓</Text>
            </View>
          )}
        </View>
      </View>

      <View style={s.cardBottom}>
        <Text style={s.cardName}>{item.name}</Text>
        <Text style={[s.countText, completed && s.countTextDone]}>
          {count}/{item.count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DhikrScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('favourites');
  const [counts, setCounts] = useState({});
  const list = activeTab === 'favourites' ? FAVOURITES : OTHERS;

  const refreshCounts = useCallback(async () => {
    const all = [...FAVOURITES, ...OTHERS];
    const c = await loadAllCounts(all);
    setCounts(c);
  }, []);

  // Load on mount and every time screen is focused
  useEffect(() => {
    refreshCounts();
    const unsub = navigation.addListener('focus', refreshCounts);
    return unsub;
  }, [navigation, refreshCounts]);

  const completedCount = list.filter(i => (counts[i.id] || 0) >= i.count).length;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f1923" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.title}>Dhikr</Text>
          <Text style={s.titleAr}>ذِکر</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Progress summary */}
      {list.length > 0 && (
        <View style={s.summaryRow}>
          <Text style={s.summaryText}>
            {completedCount}/{list.length} completed today
          </Text>
          {completedCount === list.length && (
            <Text style={s.summaryDone}> · All done ✓</Text>
          )}
        </View>
      )}

      {/* Tab switcher */}
      <View style={s.tabRow}>
        {['favourites', 'others'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'favourites' ? '⭐ Favourites' : '📚 Others'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {list.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>No adhkar added yet</Text>
          </View>
        ) : (
          list.map(item => (
            <DhikrCard
              key={item.id}
              item={item}
              count={counts[item.id] || 0}
              onPress={item => navigation.navigate('DhikrDetail', { item })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f1923' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  back: { fontSize: 24, color: '#6b7280', width: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center' },
  titleAr: { fontSize: 14, color: '#6b7280', textAlign: 'center', fontFamily: 'serif' },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'center',
    marginBottom: 8, paddingHorizontal: 20,
  },
  summaryText: { fontSize: 12, color: '#6b7280' },
  summaryDone: { fontSize: 12, color: '#34d399', fontWeight: '700' },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
    backgroundColor: '#1e293b', borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#0e7490' },
  tabText: { color: '#6b7280', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  scroll: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    backgroundColor: '#1e293b', borderRadius: 16,
    marginBottom: 12, overflow: 'hidden',
  },
  cardDone: { backgroundColor: '#0d1f1a' },
  progressTrack: { height: 2, backgroundColor: '#0f1923' },
  progressFill: { height: 2, backgroundColor: '#6d28d9', borderRadius: 1 },
  progressDone: { backgroundColor: '#34d399' },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: 18, paddingBottom: 8,
  },
  cardArabic: {
    flex: 1, fontSize: 18, color: '#fff',
    fontFamily: 'serif', lineHeight: 30,
    textAlign: 'right', marginRight: 8,
  },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  timeBadge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  timeBadgeText: { fontSize: 12, fontWeight: '700', fontFamily: 'serif' },
  doneBadge: {
    backgroundColor: '#14532d', width: 24, height: 24,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  doneText: { color: '#34d399', fontSize: 13, fontWeight: '700' },
  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 18, paddingBottom: 14,
  },
  cardName: { fontSize: 13, color: '#6b7280', flex: 1 },
  countText: { color: '#6b7280', fontSize: 13, fontWeight: '600' },
  countTextDone: { color: '#34d399' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});