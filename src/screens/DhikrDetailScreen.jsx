import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, StatusBar, ScrollView,
  Modal, Dimensions, Vibration, PanResponder,
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

const CARD_RADIUS = 20;

function buildPerimeterDots(W, H) {
  const R = CARD_RADIUS;
  const DOT_R = DOT_SIZE / 2;
  const innerR = R - DOT_R;

  const arcLen = (Math.PI / 2) * innerR;
  const totalLen = 2 * (W - 2 * R) + 2 * (H - 2 * R) + 4 * arcLen;
  const count = Math.floor(totalLen / DOT_STEP);
  const step = totalLen / count;

  function posAt(d) {
    if (d < arcLen) {
      const θ = Math.PI + (d / arcLen) * (Math.PI / 2);
      return [R + innerR * Math.cos(θ) - DOT_R, R + innerR * Math.sin(θ) - DOT_R];
    }
    d -= arcLen;
    const topLen = W - 2 * R;
    if (d < topLen) return [R + d - DOT_R, 0];
    d -= topLen;

    if (d < arcLen) {
      const θ = 3 * Math.PI / 2 + (d / arcLen) * (Math.PI / 2);
      return [(W - R) + innerR * Math.cos(θ) - DOT_R, R + innerR * Math.sin(θ) - DOT_R];
    }
    d -= arcLen;
    const rightLen = H - 2 * R;
    if (d < rightLen) return [W - DOT_SIZE, R + d - DOT_R];
    d -= rightLen;

    if (d < arcLen) {
      const θ = (d / arcLen) * (Math.PI / 2);
      return [(W - R) + innerR * Math.cos(θ) - DOT_R, (H - R) + innerR * Math.sin(θ) - DOT_R];
    }
    d -= arcLen;
    const bottomLen = W - 2 * R;
    if (d < bottomLen) return [(W - R) - d - DOT_R, H - DOT_SIZE];
    d -= bottomLen;

    if (d < arcLen) {
      const θ = Math.PI / 2 + (d / arcLen) * (Math.PI / 2);
      return [R + innerR * Math.cos(θ) - DOT_R, (H - R) + innerR * Math.sin(θ) - DOT_R];
    }
    d -= arcLen;
    return [0, (H - R) - d - DOT_R];
  }

  const pts = [];
  for (let i = 0; i < count; i++) pts.push(posAt(i * step));
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

function ModalLangPicker({ lang, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
      {LANGS.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          onPress={() => onChange(key)}
          style={{
            paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
            backgroundColor: lang === key ? '#6d28d9' : 'rgba(255,255,255,0.08)',
          }}
        >
          <Text style={{ fontSize: 12, color: lang === key ? '#fff' : '#9ca3af' }}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function HadithModal({ visible, hadith, onClose }) {
  const [lang, setLang] = useState('urdu');
  const text = hadith?.[lang];
  const isTodo = !text || text.startsWith('// TODO');
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <Text style={m.title}>📖 HADITH REFERENCE</Text>
          <ModalLangPicker lang={lang} onChange={setLang} />
          <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
            <Text style={[m.hadith, isTodo && m.todoText]}>
              {isTodo ? 'Reference coming soon...' : text}
            </Text>
          </ScrollView>
          <TouchableOpacity style={m.closeBtn} onPress={onClose}>
            <Text style={m.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function VirtueModal({ visible, virtue, onClose }) {
  const [lang, setLang] = useState('urdu');
  const text = virtue?.[lang];
  const isTodo = !text || text.startsWith('// TODO');
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <Text style={m.title}>✨ VIRTUE & REWARD</Text>
          <ModalLangPicker lang={lang} onChange={setLang} />
          <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
            <Text style={[m.hadith, isTodo && m.todoText]}>
              {isTodo ? 'Virtue coming soon...' : text}
            </Text>
          </ScrollView>
          <TouchableOpacity style={m.closeBtn} onPress={onClose}>
            <Text style={m.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  const { item: singleItem, items: paramItems, index: paramIndex } = route.params;
  const items = paramItems ?? (singleItem ? [singleItem] : []);
  const [currentIndex, setCurrentIndex] = useState(paramIndex ?? 0);
  const item = items[currentIndex];

  const [count, setCount] = useState(0);
  const [lang, setLang] = useState('urdu');
  const [hadithVisible, setHadithVisible] = useState(false);
  const [virtueVisible, setVirtueVisible] = useState(false);
  const [cardHeight, setCardHeight] = useState(Math.round(CARD_SIZE * 0.85));
  const completed = count >= item.count;

  useEffect(() => {
    setCount(0);
    loadCount(item.id).then(setCount);
  }, [item.id]);

  const navigate = useCallback((dir) => {
    setCurrentIndex(prev => {
      const next = prev + dir;
      if (next < 0 || next >= items.length) return prev;
      return next;
    });
  }, [items.length]);

  // Swipe left/right on card to navigate between dhikr
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 15,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -60) setCurrentIndex(prev => Math.min(prev + 1, items.length - 1));
        else if (gs.dx > 60) setCurrentIndex(prev => Math.max(prev - 1, 0));
      },
    })
  ).current;

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

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

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
        <View style={s.headerIcons}>
          <TouchableOpacity onPress={() => setVirtueVisible(true)} style={s.hadithBtn}>
            <Text style={s.hadithIcon}>✨</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setHadithVisible(true)} style={s.hadithBtn}>
            <Text style={s.hadithIcon}>📖</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Card with swipe gesture */}
        <View {...panResponder.panHandlers}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleTap}
            style={[s.card, completed && s.cardDone]}
            onLayout={e => setCardHeight(Math.round(e.nativeEvent.layout.height))}
          >
            <DotProgressBorder current={count} total={item.count} cardHeight={cardHeight} />
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
        </View>

        <TouchableOpacity style={s.resetBtn} onPress={handleReset}>
          <Text style={s.resetText}>↺ Reset</Text>
        </TouchableOpacity>

        {/* Prev / Next navigation */}
        {items.length > 1 && (
          <View style={s.navRow}>
            <TouchableOpacity
              style={[s.navBtn, !hasPrev && s.navBtnDisabled]}
              onPress={() => navigate(-1)}
              disabled={!hasPrev}
              activeOpacity={0.7}
            >
              <Text style={[s.navArrow, !hasPrev && s.navDimmed]}>‹</Text>
              <Text style={[s.navLabel, !hasPrev && s.navDimmed]} numberOfLines={1}>
                {hasPrev ? items[currentIndex - 1].name : 'First'}
              </Text>
            </TouchableOpacity>

            <View style={s.navPill}>
              <Text style={s.navCurrent}>{currentIndex + 1}</Text>
              <Text style={s.navSlash}> / </Text>
              <Text style={s.navTotal}>{items.length}</Text>
            </View>

            <TouchableOpacity
              style={[s.navBtn, s.navBtnRight, !hasNext && s.navBtnDisabled]}
              onPress={() => navigate(1)}
              disabled={!hasNext}
              activeOpacity={0.7}
            >
              <Text style={[s.navLabel, s.navLabelRight, !hasNext && s.navDimmed]} numberOfLines={1}>
                {hasNext ? items[currentIndex + 1].name : 'Last'}
              </Text>
              <Text style={[s.navArrow, !hasNext && s.navDimmed]}>›</Text>
            </TouchableOpacity>
          </View>
        )}

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
      <VirtueModal
        visible={virtueVisible}
        virtue={item.virtue}
        onClose={() => setVirtueVisible(false)}
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
  headerIcons: { flexDirection: 'row', gap: 4 },
  hadithBtn: { width: 32, alignItems: 'center' },
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
    backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 16,
  },
  resetText: { color: '#6b7280', fontWeight: '600', fontSize: 14 },

  // ─── Nav row ───────────────────────────────────────────────────────────────
  navRow: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', marginBottom: 20, gap: 8,
  },
  navBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e293b', borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 10, gap: 6,
  },
  navBtnRight: { justifyContent: 'flex-end' },
  navBtnDisabled: { opacity: 0.35 },
  navArrow: { fontSize: 22, color: '#a78bfa', fontWeight: '700', lineHeight: 26 },
  navLabel: { flex: 1, fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  navLabelRight: { textAlign: 'right' },
  navDimmed: { color: '#4b5563' },
  navPill: {
    flexDirection: 'row', alignItems: 'baseline',
    backgroundColor: '#1e293b', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  navCurrent: { fontSize: 16, fontWeight: '700', color: '#a78bfa' },
  navSlash: { fontSize: 12, color: '#4b5563' },
  navTotal: { fontSize: 12, color: '#6b7280', fontWeight: '600' },

  // ─── Translation ────────────────────────────────────────────────────────────
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
  todoText: { color: '#4b5563', fontStyle: 'italic' },
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
