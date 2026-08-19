import React from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme';

const { width } = Dimensions.get('window');

const SECTIONS = [
  {
    key: 'jantari',
    label: 'Jantari',
    arabic: 'جنتری',
    description: 'Prayer times & yearly calendar',
    icon: '🕌',
    accent: COLORS.primary,
    screen: 'Home',
  },
  {
    key: 'dhikr',
    label: 'Dhikr',
    arabic: 'ذِکر',
    description: 'Morning & evening adhkar',
    icon: '📿',
    accent: COLORS.gold,
    screen: 'Dhikr',
  },
];

export default function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Greeting */}
      <View style={s.header}>
        <Text style={s.brand}>Islamic Daily</Text>
        <Text style={s.title}>مرحبا</Text>
        <Text style={s.subtitle}>Welcome</Text>
      </View>

      {/* Section cards */}
      <View style={s.cards}>
        {SECTIONS.map(sec => (
          <TouchableOpacity
            key={sec.key}
            style={[s.card, { borderColor: sec.accent }]}
            onPress={() => navigation.navigate(sec.screen)}
            activeOpacity={0.85}
          >
            <Text style={s.cardIcon}>{sec.icon}</Text>
            <Text style={s.cardArabic}>{sec.arabic}</Text>
            <Text style={[s.cardLabel, { color: sec.accent }]}>{sec.label}</Text>
            <Text style={s.cardDesc}>{sec.description}</Text>

            {/* Accent bar at bottom */}
            <View style={[s.cardBar, { backgroundColor: sec.accent }]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings */}
      <TouchableOpacity
        style={s.settingsRow}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.85}
      >
        <Text style={s.settingsIcon}>⚙️</Text>
        <Text style={s.settingsLabel}>Settings</Text>
        <Text style={s.settingsArrow}>›</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brand: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryLight,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    fontFamily: 'serif',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textFaint,
    marginTop: 6,
    fontFamily: 'serif',
  },
  cards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 200,
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  cardArabic: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontFamily: 'serif',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 11,
    color: COLORS.textFaint,
    textAlign: 'center',
    lineHeight: 16,
  },
  cardBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginHorizontal: 20,
    marginTop: 16,
  },
  settingsIcon: { fontSize: 18, marginRight: 10 },
  settingsLabel: { flex: 1, color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },
  settingsArrow: { color: COLORS.textFaint, fontSize: 18 },
});