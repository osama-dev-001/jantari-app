import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../theme';

const MADHAB_KEY = 'prayer_madhab';

const MADHAB_OPTIONS = [
  { key: 'shafi', label: "Shafi'i", hint: "Asr begins when a shadow reaches 1× an object's height (Shafi'i, Maliki, Hanbali)." },
  { key: 'hanafi', label: 'Hanafi', hint: "Asr begins when a shadow reaches 2× an object's height (Hanafi) — a later Asr time." },
];

export default function SettingsScreen({ navigation }) {
  const [madhab, setMadhab] = useState('shafi');

  useEffect(() => {
    AsyncStorage.getItem(MADHAB_KEY).then(v => { if (v) setMadhab(v); });
  }, []);

  const selectMadhab = useCallback((key) => {
    setMadhab(key);
    AsyncStorage.setItem(MADHAB_KEY, key);
  }, []);

  const activeHint = MADHAB_OPTIONS.find(o => o.key === madhab)?.hint;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.title}>Settings</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>PRAYER CALCULATION</Text>

        <View style={s.card}>
          <Text style={s.cardTitle}>Madhab (Asr time)</Text>
          <View style={s.optionRow}>
            {MADHAB_OPTIONS.map(opt => {
              const active = madhab === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[s.optionBtn, active && s.optionBtnActive]}
                  onPress={() => selectMadhab(opt.key)}
                >
                  <Text style={[s.optionLabel, active && s.optionLabelActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={s.cardHint}>{activeHint}</Text>
        </View>

        <Text style={s.note}>
          Applies only to calculated cities (Delhi, Mumbai, Pune). Varanasi and Ahmedabad
          use fixed local mosque schedules and are not affected by this setting.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  back: { fontSize: 24, color: COLORS.textFaint, width: 32 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: {
    color: COLORS.textFaint, fontSize: 12, fontWeight: '700',
    letterSpacing: 2, marginTop: 8, marginBottom: 12,
  },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, marginBottom: 12 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 14 },
  optionRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  optionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 12, backgroundColor: COLORS.bg,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  optionBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionLabel: { color: COLORS.textMuted, fontWeight: '600', fontSize: 14 },
  optionLabelActive: { color: COLORS.textPrimary },
  cardHint: { color: COLORS.textFaint, fontSize: 12, lineHeight: 18 },
  note: { color: COLORS.textFainter, fontSize: 12, lineHeight: 18, paddingHorizontal: 4 },
});
