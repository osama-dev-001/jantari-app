import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootNav } from '../../app/navigation';
import { haptics } from '../../hooks';
import { tasbihStore, useTasbih } from '../../store/progress';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS, RADIUS } from '../../theme/typography';
import { ProgressRing, StarLattice } from '../../ui/graphics';
import { Icon } from '../../ui/Icon';
import { GUTTER, ThemedStatusBar } from '../../ui/layout';
import { AppText, IconButton, PressableScale } from '../../ui/primitives';

const TARGETS = [33, 99, 100, 1000, 0];

export function TasbihScreen() {
  const c = useTheme();
  const nav = useNavigation<RootNav>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const t = useTasbih();
  const ring = Math.min(width - 72, 300);
  const reached = t.target > 0 && t.count >= t.target;

  const tap = () => {
    tasbihStore.set(prev => {
      // After reaching the target, the next tap starts a fresh round.
      const restart = prev.target > 0 && prev.count >= prev.target;
      const count = restart ? 1 : prev.count + 1;
      if (prev.target > 0 && count === prev.target) haptics.success();
      else haptics.tap();
      return { ...prev, count, total: prev.total + 1 };
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ThemedStatusBar />
      <View style={{ height: insets.top }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: GUTTER - 4, paddingVertical: 8 }}>
        <IconButton label="Back" onPress={() => nav.goBack()}>
          <Icon name="arrow-left" size={20} color={c.text} />
        </IconButton>
        <View style={{ flex: 1 }}>
          <AppText variant="subheading">Tasbih</AppText>
          <AppText variant="caption" tone="muted">
            {t.total.toLocaleString()} counted in total
          </AppText>
        </View>
        <IconButton label="Reset count" onPress={() => tasbihStore.set(p => ({ ...p, count: 0 }))} disabled={t.count === 0}>
          <Icon name="rotate-ccw" size={19} color={c.text} />
        </IconButton>
      </View>

      <Pressable onPress={tap} accessibilityRole="button" accessibilityLabel={`Count. ${t.count}`} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <StarLattice color={c.goldSoft} tile={52} />
        <ProgressRing
          size={ring}
          stroke={12}
          progress={t.target > 0 ? t.count / t.target : (t.count % 100) / 100}
          color={reached ? c.accent : c.gold}
          track={c.surface}
          bead={reached ? undefined : c.gold}
        >
          <AppText style={{ fontFamily: FONTS.extrabold, fontSize: 76, lineHeight: 86, color: c.text, fontVariant: ['tabular-nums'] }}>{t.count}</AppText>
          <AppText variant="label" tone={reached ? 'accent' : 'muted'}>
            {reached ? 'Target reached · tap to begin again' : t.target > 0 ? `of ${t.target}` : 'no target'}
          </AppText>
        </ProgressRing>
        <AppText variant="caption" tone="faint" style={{ marginTop: 22 }}>
          Tap anywhere to count
        </AppText>
      </Pressable>

      <View style={{ paddingHorizontal: GUTTER, paddingBottom: insets.bottom + 16, paddingTop: 8 }}>
        <AppText variant="overline" tone="muted" style={{ marginBottom: 8, textAlign: 'center' }}>
          Target
        </AppText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {TARGETS.map(target => {
            const active = target === t.target;
            return (
              <PressableScale
                key={target}
                onPress={() => tasbihStore.set(p => ({ ...p, target, count: 0 }))}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderRadius: RADIUS.md,
                  backgroundColor: active ? c.accent : c.surface,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: active ? c.accent : c.line,
                }}
              >
                <AppText variant="label" color={active ? c.onAccent : c.textSecondary}>
                  {target === 0 ? '∞' : target}
                </AppText>
              </PressableScale>
            );
          })}
        </View>
      </View>
    </View>
  );
}
