import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { WidgetPreview } from 'react-native-android-widget';
import type { RootNav } from '../../app/navigation';
import { useNow } from '../../hooks';
import { useSettings } from '../../store/settings';
import { useTheme } from '../../theme/ThemeProvider';
import { Icon } from '../../ui/Icon';
import { Screen, ScreenTitle } from '../../ui/layout';
import { AppText, IconButton } from '../../ui/primitives';
import { buildWidgetModel } from '../../widget/model';
import { PrayerWidget } from '../../widget/PrayerWidget';

// Developer-only: renders the home-screen widget at common launcher sizes
// so layout changes can be checked without placing a real widget.
const SIZES: [number, number][] = [
  [110, 58],
  [180, 80],
  [250, 110],
  [250, 180],
  [320, 250],
  [120, 250],
];

export function WidgetPreviewScreen() {
  const c = useTheme();
  const nav = useNavigation<RootNav>();
  const settings = useSettings();
  // Once a minute: each render re-rasterises every preview natively.
  const now = useNow(60_000);
  const model = buildWidgetModel(settings, now);
  return (
    <Screen
      header={
        <ScreenTitle
          title="Widget preview"
          subtitle="Rendered by the real widget code"
          left={
            <IconButton label="Back" onPress={() => nav.goBack()}>
              <Icon name="arrow-left" size={20} color={c.text} />
            </IconButton>
          }
        />
      }
    >
      <View style={{ backgroundColor: '#3a4a5a', borderRadius: 16, padding: 14, gap: 16 }}>
        {SIZES.map(([w, h]) => (
          <View key={`${w}x${h}`}>
            <AppText variant="caption" color="#dfe6ee" style={{ marginBottom: 6 }}>
              {w}×{h} dp
            </AppText>
            <WidgetPreview renderWidget={() => <PrayerWidget width={w} height={h} {...model} />} width={w} height={h} />
          </View>
        ))}
      </View>
    </Screen>
  );
}
