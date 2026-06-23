import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, StatusBar, ScrollView,
  Modal, Dimensions, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_SIZE = width - 64;
const DOT_SIZE = 6;
const DOT_GAP = 8;
const DOT_STEP = DOT_SIZE + DOT_GAP;

// ─── Storage helpers ──────────────────────────────────────────────────────────

function todayKey(id) {
  const d = new Date().toISOString().slice(0, 10);
  return `dhikr_count_${id}_${d}`;
}

async function loadCount(id) {
  try {
    const val = await AsyncStorage.getItem(todayKey(id));
    return val ? parseInt(val, 10) : 0;
  } catch { return 0; }
}

async function saveCount(id, count) {
  try {
    await AsyncStorage.setItem(todayKey(id), String(count));
  } catch {}
}

// ─── Dot Progress Border ──────────────────────────────────────────────────────

function buildPerimeterDots(W, H) {
  const pts = [];
  // top: left → right
  for (let x = 0; x + DOT_SIZE <= W; x += DOT_STEP) pts.push([x, 0]);
  // right: top → bottom (start after top-right corner dot)
  for (let y = DOT_STEP; y + DOT_SIZE <= H; y += DOT_STEP) pts.push([W - DOT_SIZE, y]);
  // bottom: right → left
  for (let x = W - DOT_SIZE - DOT_STEP; x >= 0; x -= DOT_STEP) pts.push([x, H - DOT_SIZE]);
  // left: bottom → top
  for (let y = H - DOT_SIZE - DOT_STEP; y >= DOT_STEP; y -= DOT_STEP) pts.push([0, y]);
  return pts;
}

function DotProgressBorder({ current, total, cardHeight, color = '#6d28d9', doneColor = '#34d399' }) {
  const pts = buildPerimeterDots(CARD_SIZE, cardHeight);
  const filledCount = total > 0 ? Math.round((current / total) * pts.length) : 0;
  const isComplete = current >= total && total > 0;
  const activeColor = isComplete ? doneColor : color;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pts.slice(0, filledCount).map(([x, y], i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: x, top: y,
            width: DOT_SIZE, height: DOT_SIZE,
            borderRadius: DOT_SIZE / 2,
            backgroundColor: activeColor,
          }}
        />
      ))}
    </View>
  );
}

// ─── Hadith Modal ─────────────────────────────────────────────────────────────

function HadithModal({ visible, hadith, onClose }) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={onClose}>
        <View style={m.sheet}>
          <Text style={m.title}>📖 HADITH REFERENCE</Text>
          <Text style={m.hadith}>
            {hadith?.startsWith('// TODO') ? 'Reference coming soon...' : hadith}
          </Text>
          <TouchableOpacity style={m.closeBtn} onPress={onClose}>
            <Text style={m.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Translation Dropdown ─────────────────────────────────────────────────────

const LANGS = [
  { key: 'urdu', label: 'اردو' },
  { key: 'hindi', label: 'हिंदी' },
  { key: 'english', label: 'English' },
];

function TranslationDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = LANGS.find(l => l.key === value);

  return (
    <>
      <TouchableOpacity style={tr.pill} onPress={() => setOpen(true)}>
        <Text style={tr.pillText}>{current?.label}</Text>
        <Text style={tr.arrow}>▾</Text>
      </TouchableOpacity>
      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={m.sheet}>
            <Text style={m.title}>TRANSLATION LANGUAGE</Text>
            {LANGS.map(l => (
              <TouchableOpacity
                key={l.key}
                style={tr.option}
                onPress={() => { onChange(l.key); setOpen(false); }}
              >
                <Text style={[tr.optionText, value === l.key && tr.optionTextActive]}>
                  {l.label}
                </Text>
                {value === l.key && <Text style={tr.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DhikrDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const [count, setCount] = useState(0);
  const [lang, setLang] = useState('urdu');
  const [hadithVisible, setHadithVisible] = useState(false);
  const completed = count >= item.count;

  useEffect(() => {
    loadCount(item.id).then(setCount);
  }, [item.id]);

  const handleTap = () => {
    if (completed) return;
    const next = count + 1;
    setCount(next);
    saveCount(item.id, next);
    Vibration.vibrate(30);
  };

  const handleReset = () => {
    setCount(0);
    saveCount(item.id, 0);
  };

  const translation = item.translations[lang];
  const isTodo = translation?.startsWith('// TODO');

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f1923" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.title} numberOfLines={1}>{item.name}</Text>
          <Text style={s.titleAr}>{item.nameAr}</Text>
        </View>
        <TouchableOpacity onPress={() => setHadithVisible(true)} style={s.hadithBtn}>
          <Text style={s.hadithIcon}>📖</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleTap}
          style={[s.card, completed && s.cardDone]}
        >
          <DotProgressBorder current={count} total={item.count} />
          <Text style={s.arabic}>{item.arabic}</Text>
          <View style={s.countRow}>
            <Text style={[s.countNum, completed && s.countNumDone]}>{count}</Text>
            <Text style={s.countSep}>/</Text>
            <Text style={s.countTotal}>{item.count}</Text>
          </View>
          <Text style={[s.tapHint, completed && s.tapHintDone]}>
            {completed ? '✓ Complete' : 'TAP TO COUNT'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.resetBtn} onPress={handleReset}>
          <Text style={s.resetText}>↺ Reset</Text>
        </TouchableOpacity>

        <View style={s.translationBox}>
          <View style={s.translationHeader}>
            <Text style={s.translationLabel}>TRANSLATION</Text>
            <TranslationDropdown value={lang} onChange={setLang} />
          </View>
          <Text style={[s.translationText, isTodo && s.translationTodo]}>
            {isTodo ? 'Translation coming soon...' : translation}
          </Text>
        </View>

      </ScrollView>

      <HadithModal
        visible={hadithVisible}
        hadith={item.hadith}
        onClose={() => setHadithVisible(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f1923' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  back: { fontSize: 24, color: '#6b7280', width: 32 },
  title: { fontSize: 16, fontWeight: '700', color: '#fff' },
  titleAr: { fontSize: 13, color: '#6b7280', fontFamily: 'serif' },
  hadithBtn: { width: 32, alignItems: 'flex-end' },
  hadithIcon: { fontSize: 20 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  card: {
    width: CARD_SIZE, minHeight: CARD_SIZE * 0.85,
    backgroundColor: '#1e293b', borderRadius: 20,
    padding: 28, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', marginTop: 8, marginBottom: 16,
  },
  cardDone: { backgroundColor: '#0a1f1a' },
  arabic: {
    fontSize: 22, color: '#fff', fontFamily: 'serif',
    textAlign: 'center', lineHeight: 42, marginBottom: 24,
    writingDirection: 'rtl',
  },
  countRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 8 },
  countNum: { fontSize: 40, fontWeight: '700', color: '#a78bfa' },
  countNumDone: { color: '#34d399' },
  countSep: { fontSize: 24, color: '#6b7280' },
  countTotal: { fontSize: 24, color: '#6b7280' },
  tapHint: { fontSize: 11, color: '#6b7280', letterSpacing: 2, fontWeight: '700' },
  tapHintDone: { color: '#34d399' },
  resetBtn: {
    paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 20,
  },
  resetText: { color: '#6b7280', fontWeight: '600', fontSize: 14 },
  translationBox: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, padding: 18 },
  translationHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  translationLabel: { color: '#6b7280', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  translationText: { color: '#d1d5db', fontSize: 15, lineHeight: 26 },
  translationTodo: { color: '#4b5563', fontStyle: 'italic' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1e293b', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, padding: 24, paddingBottom: 40,
  },
  title: { color: '#6b7280', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 16 },
  hadith: { color: '#d1d5db', fontSize: 15, lineHeight: 24 },
  closeBtn: {
    marginTop: 20, backgroundColor: '#0f1923',
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  closeBtnText: { color: '#6b7280', fontWeight: '600' },
});

const tr = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0f1923', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6, gap: 4,
  },
  pillText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  arrow: { color: '#6b7280', fontSize: 10 },
  option: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#0f1923',
  },
  optionText: { fontSize: 16, color: '#d1d5db' },
  optionTextActive: { color: '#a78bfa', fontWeight: '700' },
  check: { color: '#a78bfa' },
});