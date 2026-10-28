import React from 'react';
import { StyleSheet, View } from 'react-native';
import { toIndoPak } from '../../core/arabic';
import { updateSettings, useSettings, type ArabicFont, type UrduFont } from '../../store/settings';
import { ARABIC_FONTS, URDU_FONTS, previewStyle } from '../../theme/scripts';
import { useScripts, useTheme } from '../../theme/ThemeProvider';
import { RADIUS } from '../../theme/typography';
import { Icon } from '../../ui/Icon';
import { AppText, Card, PressableScale, SectionHeader } from '../../ui/primitives';
import { ChoiceRow, SubScreen } from './parts';

const SIZES = [
  { key: '0.9', label: 'Small' },
  { key: '1', label: 'Normal' },
  { key: '1.15', label: 'Large' },
  { key: '1.3', label: 'Largest' },
];

const ARABIC_SAMPLE = toIndoPak('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ');
const URDU_SAMPLE = 'اللہ پاک ہے اور حمد اسی کے لیے ہے، اللہ پاک ہے اور وہ بہت عظمت والا ہے۔';

type FontMeta = { name: string; note: string; family: string };

function FontGrid<K extends string>({
  fonts,
  value,
  onChange,
  sample,
}: {
  fonts: Record<K, FontMeta & Parameters<typeof previewStyle>[0]>;
  value: K;
  onChange: (k: K) => void;
  sample: string;
}) {
  const c = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {(Object.keys(fonts) as K[]).map(key => {
        const f = fonts[key];
        const active = key === value;
        return (
          <PressableScale
            key={key}
            onPress={() => onChange(key)}
            fill
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${f.name}, ${f.note}`}
            style={{
              width: '47.5%',
              padding: 12,
              borderRadius: RADIUS.md,
              backgroundColor: active ? c.accentSoft : c.surfaceSunk,
              borderWidth: active ? 1.5 : StyleSheet.hairlineWidth,
              borderColor: active ? c.accent : c.line,
            }}
          >
            <AppText numberOfLines={1} style={[previewStyle(f, 24), { color: c.text, textAlign: 'center' }]}>
              {sample}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <View style={{ flex: 1 }}>
                <AppText variant="label" tone={active ? 'accent' : 'text'}>
                  {f.name}
                </AppText>
                <AppText variant="caption" tone="muted" style={{ fontSize: 11 }}>
                  {f.note}
                </AppText>
              </View>
              {active && <Icon name="circle-check" size={18} color={c.accent} />}
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

export function FontSettingsScreen() {
  const c = useTheme();
  const s = useSettings();
  const scripts = useScripts();

  return (
    <SubScreen title="Arabic & Urdu text" subtitle="Fonts and sizes for dhikr and translations">
      <SectionHeader title="Arabic" />
      <FontGrid<ArabicFont> fonts={ARABIC_FONTS} value={s.arabicFont} onChange={arabicFont => updateSettings({ arabicFont })} sample={toIndoPak('بِسْمِ اللَّهِ')} />
      <Card style={{ paddingHorizontal: 14, paddingVertical: 4, marginTop: 12 }}>
        <ChoiceRow title="Size" value={String(s.arabicScale)} options={SIZES} onChange={v => updateSettings({ arabicScale: Number(v) })} />
        <AppText style={[scripts.arabic(26, { scale: true }), { color: c.text, paddingBottom: 12 }]}>{ARABIC_SAMPLE}</AppText>
      </Card>

      <SectionHeader title="Urdu" style={{ marginTop: 26 }} />
      <FontGrid<UrduFont> fonts={URDU_FONTS} value={s.urduFont} onChange={urduFont => updateSettings({ urduFont })} sample="اردو زبان" />
      <Card style={{ paddingHorizontal: 14, paddingVertical: 4, marginTop: 12 }}>
        <ChoiceRow title="Size" value={String(s.urduScale)} options={SIZES} onChange={v => updateSettings({ urduScale: Number(v) })} />
        <AppText style={[scripts.urdu(17, { scale: true }), { color: c.textSecondary, paddingBottom: 12 }]}>{URDU_SAMPLE}</AppText>
      </Card>
      <AppText variant="caption" tone="faint" style={{ marginTop: 10, paddingHorizontal: 4 }}>
        The Urdu font is used everywhere Urdu appears; the size applies to translations, virtues and hadith.
      </AppText>
    </SubScreen>
  );
}
