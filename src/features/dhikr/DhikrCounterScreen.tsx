import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootNav, RootStackParams } from '../../app/navigation';
import { LANGS, TIME_META, pickLang, segmentAt, type Dhikr, type Lang } from '../../data/adhkar';
import { haptics, useCityToday, useFocusedNow } from '../../hooks';
import { dhikrStore, incrementDhikr, setDhikrCount, useDhikrDay } from '../../store/progress';
import { updateSettings, useSettings } from '../../store/settings';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS, RADIUS, arabicStyle, urduStyle } from '../../theme/typography';
import { ProgressRing, StarLattice } from '../../ui/graphics';
import { Icon } from '../../ui/Icon';
import { GUTTER, Sheet, ThemedStatusBar } from '../../ui/layout';
import { AppText, Card, IconButton, Pill, PressableScale, Segmented } from '../../ui/primitives';
import { orderedList } from './DhikrListScreen';

const SCALES = [1, 1.15, 1.3, 0.9];

export function DhikrCounterScreen() {
  const c = useTheme();
  const nav = useNavigation<RootNav>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { params } = useRoute<RouteProp<RootStackParams, 'DhikrCounter'>>();
  const items = useMemo(() => orderedList(params.list), [params.list]);
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      items.findIndex(d => d.id === params.id),
    ),
  );
  const item = items[index];

  const now = useFocusedNow(60_000);
  const today = useCityToday(now);
  const counts = useDhikrDay(today.key);
  const count = counts[item.id] ?? 0;
  const complete = count >= item.count;
  const seg = segmentAt(item, count);

  const settings = useSettings();
  const [sheet, setSheet] = useState<'virtue' | 'hadith' | null>(null);

  const go = (dir: 1 | -1) => setIndex(i => Math.min(items.length - 1, Math.max(0, i + dir)));
  const goRef = useRef(go);
  goRef.current = go;

  // Horizontal swipe anywhere moves between adhkar; vertical scroll is untouched.
  // Uses gesture-handler (not PanResponder): the navigator's native gesture
  // handlers cancel JS-responder pans before they can complete.
  const swipe = usePanGesture({
    activeOffsetX: [-24, 24],
    failOffsetY: [-20, 20],
    runOnJS: true,
    onDeactivate: e => {
      if (e.canceled) return;
      if (e.translationX < -60) goRef.current(1);
      else if (e.translationX > 60) goRef.current(-1);
    },
  });

  const tap = () => {
    const before = dhikrStore.get()[today.key]?.[item.id] ?? 0;
    if (before >= item.count) return;
    const after = incrementDhikr(today.ymd, item.id, item.count);
    if (after >= item.count) haptics.success();
    else haptics.tap();
  };

  const ringSize = Math.min(150, Math.round(width * 0.4));
  const arabicSize = Math.round((seg ? 30 : item.arabic.length > 120 ? 22 : item.arabic.length > 50 ? 25 : 30) * settings.arabicScale);

  return (
    <GestureDetector gesture={swipe}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ThemedStatusBar />
        <View style={{ height: insets.top }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: GUTTER - 4, paddingVertical: 8 }}>
          <IconButton label="Back" onPress={() => nav.goBack()}>
            <Icon name="arrow-left" size={20} color={c.text} />
          </IconButton>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <AppText variant="subheading" numberOfLines={1}>
              {item.name}
            </AppText>
            <AppText style={{ fontFamily: FONTS.arabic, fontSize: 14, lineHeight: 24, color: c.textMuted }} numberOfLines={1}>
              {item.nameAr}
            </AppText>
          </View>
          <IconButton label="Virtue and reward" onPress={() => setSheet('virtue')} disabled={!item.virtue}>
            <Icon name="sparkles" size={19} color={c.gold} />
          </IconButton>
          <IconButton label="Hadith reference" onPress={() => setSheet('hadith')} disabled={!item.hadith}>
            <Icon name="book-open" size={19} color={c.gold} />
          </IconButton>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 4, flexWrap: 'wrap' }}>
            <Pill tone="gold" label={TIME_META[item.time].label} />
            {item.source && <Pill label={item.source} />}
            <View style={{ flex: 1 }} />
            <PressableScale
              onPress={() => updateSettings({ arabicScale: SCALES[(SCALES.indexOf(settings.arabicScale) + 1) % SCALES.length] })}
              accessibilityLabel="Change Arabic text size"
              hitSlop={8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: RADIUS.pill,
                backgroundColor: c.surface,
              }}
            >
              <Icon name="a-large-small" size={16} color={c.textMuted} />
              <AppText variant="caption" tone="muted">
                {Math.round(settings.arabicScale * 100)}%
              </AppText>
            </PressableScale>
          </View>

          <View style={{ borderRadius: RADIUS.xl, overflow: 'hidden', backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: c.line }}>
            <StarLattice color={c.goldSoft} tile={40} />
            <View style={{ paddingHorizontal: 18, paddingTop: 22, paddingBottom: 16 }}>
              <AppText style={[arabicStyle(arabicSize), { color: c.text }]}>{seg ? seg.segment.arabic : item.arabic}</AppText>
              {seg && item.segments && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                  {item.segments.map((s, i) => {
                    const state = i < seg.index || complete ? 'done' : i === seg.index ? 'active' : 'todo';
                    return (
                      <View
                        key={s.label}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: RADIUS.pill,
                          backgroundColor: state === 'done' ? c.accentSoft : state === 'active' ? c.goldSoft : c.surfaceSunk,
                        }}
                      >
                        <AppText variant="caption" tone={state === 'done' ? 'accent' : state === 'active' ? 'gold' : 'faint'}>
                          {s.label} · {state === 'active' ? `${seg.done}/` : ''}
                          {s.count}
                        </AppText>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          <TranslationCard item={item} lang={settings.translationLang} />
        </ScrollView>

        {/* Counter dock — sits in the thumb zone */}
        <View
          style={{
            paddingTop: 14,
            paddingBottom: insets.bottom + 12,
            paddingHorizontal: GUTTER,
            backgroundColor: c.surface,
            borderTopLeftRadius: RADIUS.xl,
            borderTopRightRadius: RADIUS.xl,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: c.lineStrong,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <NavButton dir={-1} item={items[index - 1]} onPress={() => go(-1)} />
            <PressableScale
              onPress={tap}
              scaleTo={0.94}
              accessibilityRole="button"
              accessibilityLabel={complete ? 'Completed' : `Count. ${count} of ${item.count}`}
              style={{ borderRadius: ringSize / 2 }}
            >
              <ProgressRing
                size={ringSize}
                stroke={8}
                progress={count / item.count}
                color={complete ? c.accent : c.gold}
                track={c.surfaceSunk}
                bead={complete ? undefined : c.gold}
              >
                {complete ? (
                  <>
                    <Icon name="check" size={34} color={c.accent} strokeWidth={2.6} />
                    <AppText variant="label" tone="accent">
                      Complete
                    </AppText>
                  </>
                ) : (
                  <>
                    <AppText style={{ fontFamily: FONTS.extrabold, fontSize: 42, lineHeight: 48, color: c.text, fontVariant: ['tabular-nums'] }}>
                      {count}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      of {item.count} · tap
                    </AppText>
                  </>
                )}
              </ProgressRing>
            </PressableScale>
            <NavButton dir={1} item={items[index + 1]} onPress={() => go(1)} highlight={complete} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <PressableScale
              onPress={() => setDhikrCount(today.ymd, item.id, 0)}
              disabled={count === 0}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, opacity: count === 0 ? 0.4 : 1 }}
            >
              <Icon name="rotate-ccw" size={16} color={c.textMuted} />
              <AppText variant="label" tone="muted">
                Reset
              </AppText>
            </PressableScale>
            <AppText variant="caption" tone="faint">
              {index + 1} of {items.length} · swipe to move
            </AppText>
            <PressableScale
              onPress={() => {
                setDhikrCount(today.ymd, item.id, item.count);
                haptics.success();
              }}
              disabled={complete}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, opacity: complete ? 0.4 : 1 }}
            >
              <Icon name="check" size={16} color={c.accent} />
              <AppText variant="label" tone="accent">
                Mark done
              </AppText>
            </PressableScale>
          </View>
        </View>

        <TextSheet item={item} kind={sheet} onClose={() => setSheet(null)} lang={settings.translationLang} />
      </View>
    </GestureDetector>
  );
}

function NavButton({ dir, item, onPress, highlight }: { dir: 1 | -1; item?: Dhikr; onPress: () => void; highlight?: boolean }) {
  const c = useTheme();
  const disabled = !item;
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={item ? `${dir > 0 ? 'Next' : 'Previous'}: ${item.name}` : undefined}
      style={{ width: 72, alignItems: 'center', gap: 6, opacity: disabled ? 0.3 : 1 }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: highlight && !disabled ? c.accent : c.surfaceSunk,
        }}
      >
        <Icon name={dir > 0 ? 'chevron-right' : 'chevron-left'} size={22} color={highlight && !disabled ? c.onAccent : c.text} />
      </View>
      <AppText variant="caption" tone="muted" numberOfLines={2} style={{ textAlign: 'center', fontSize: 10.5, lineHeight: 13 }}>
        {item ? item.name : dir > 0 ? 'Last' : 'First'}
      </AppText>
    </PressableScale>
  );
}

function LocalizedBody({ text, lang }: { text: string; lang: Lang }) {
  const c = useTheme();
  if (lang === 'urdu') return <AppText style={[urduStyle(17), { color: c.textSecondary }]}>{text}</AppText>;
  return (
    <AppText variant="body" tone="secondary" style={{ fontSize: 15.5, lineHeight: 25 }}>
      {text}
    </AppText>
  );
}

function LangSwitch({ lang }: { lang: Lang }) {
  return (
    <Segmented<Lang>
      compact
      value={lang}
      onChange={l => updateSettings({ translationLang: l })}
      options={LANGS.map(l => ({
        key: l.key,
        label: l.label,
        labelStyle: l.key === 'urdu' ? { fontFamily: FONTS.urdu, fontSize: 13, lineHeight: 24, marginVertical: -4 } : undefined,
      }))}
      style={{ marginBottom: 14 }}
    />
  );
}

function TranslationCard({ item, lang }: { item: Dhikr; lang: Lang }) {
  const picked = pickLang(item.translations, lang);
  return (
    <Card style={{ padding: 16, marginTop: 14 }}>
      <LangSwitch lang={lang} />
      {picked.fellBack && <FallbackNote />}
      <LocalizedBody text={picked.text} lang={picked.lang} />
    </Card>
  );
}

function FallbackNote() {
  return (
    <AppText variant="caption" tone="faint" style={{ marginBottom: 8 }}>
      Not yet available in this language — showing English.
    </AppText>
  );
}

function TextSheet({ item, kind, onClose, lang }: { item: Dhikr; kind: 'virtue' | 'hadith' | null; onClose: () => void; lang: Lang }) {
  const [lastKind, setLastKind] = useState<'virtue' | 'hadith'>('virtue');
  if (kind && kind !== lastKind) setLastKind(kind);
  const shown = kind ?? lastKind;
  const picked = pickLang(shown === 'virtue' ? item.virtue : item.hadith, lang);
  return (
    <Sheet visible={!!kind} onClose={onClose} title={shown === 'virtue' ? 'Virtue & reward' : 'Hadith reference'}>
      <LangSwitch lang={lang} />
      {picked.fellBack && <FallbackNote />}
      <LocalizedBody text={picked.text} lang={picked.lang} />
      {item.source && <Pill label={item.source} style={{ marginTop: 14 }} />}
    </Sheet>
  );
}
