import React from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SECTIONS = [
  {
    key: 'jantari',
    label: 'Jantari',
    arabic: 'جنتری',
    description: 'Prayer times & yearly calendar',
    icon: '🕌',
    accent: '#6d28d9',
    screen: 'Home',
  },
  {
    key: 'dhikr',
    label: 'Dhikr',
    arabic: 'ذِکر',
    description: 'Morning & evening adhkar',
    icon: '📿',
    accent: '#0e7490',
    screen: 'Dhikr',
  },
];

export default function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f1923" />

      {/* App title */}
      <View style={s.header}>
        <Text style={s.title}>Digital Jantari</Text>
        <Text style={s.subtitle}>رمضان مبارک</Text>
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f1923',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
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
    backgroundColor: '#1e293b',
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
    color: '#d1d5db',
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
    color: '#6b7280',
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
});