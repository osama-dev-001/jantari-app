import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Keyboard, Pressable, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootNav } from '../../app/navigation';
import { isMosqueCity } from '../../core/prayer/engine';
import type { City } from '../../core/prayer/types';
import { CITIES } from '../../data/cities';
import { updateSettings, useSettings } from '../../store/settings';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS, RADIUS } from '../../theme/typography';
import { Icon } from '../../ui/Icon';
import { GUTTER, ThemedStatusBar, useKeyboardHeight } from '../../ui/layout';
import { AppText, IconButton, PressableScale } from '../../ui/primitives';

export function CityPill({ city }: { city: City }) {
  const c = useTheme();
  const nav = useNavigation<RootNav>();
  return (
    <PressableScale
      onPress={() => nav.navigate('CityPicker')}
      accessibilityRole="button"
      accessibilityLabel={`City: ${city.name}. Change city`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 10,
        paddingRight: 8,
        paddingVertical: 7,
        borderRadius: RADIUS.pill,
        backgroundColor: c.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.lineStrong,
      }}
    >
      <Icon name="map-pin" size={15} color={c.accent} />
      <AppText variant="label" numberOfLines={1} style={{ maxWidth: 130 }}>
        {city.name}
      </AppText>
      <Icon name="chevron-down" size={15} color={c.textMuted} />
    </PressableScale>
  );
}

// A full screen rather than a bottom sheet: on Android, a TextInput inside a
// Modal loses the first tap after the keyboard opens (it only dismisses the
// keyboard), which made search results feel unresponsive.
export function CityPickerScreen() {
  const c = useTheme();
  const nav = useNavigation<RootNav>();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();
  const { cityId } = useSettings();
  const [query, setQuery] = useState('');

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = CITIES.filter(city => !q || city.name.toLowerCase().includes(q) || city.country.toLowerCase().includes(q));
    const byCountry = new Map<string, City[]>();
    for (const city of matches) byCountry.set(city.country, [...(byCountry.get(city.country) ?? []), city]);
    return [...byCountry.entries()].map(([title, data]) => ({ title, data }));
  }, [query]);

  const choose = (id: string) => {
    Keyboard.dismiss();
    updateSettings({ cityId: id });
    nav.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ThemedStatusBar />
      <View style={{ height: insets.top }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: GUTTER - 4, paddingTop: 8, paddingBottom: 10 }}>
        <IconButton label="Back" onPress={() => nav.goBack()}>
          <Icon name="arrow-left" size={20} color={c.text} />
        </IconButton>
        <AppText variant="title">Choose city</AppText>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginHorizontal: GUTTER,
          marginBottom: 6,
          paddingHorizontal: 12,
          backgroundColor: c.surface,
          borderRadius: RADIUS.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.lineStrong,
        }}
      >
        <Icon name="search" size={17} color={c.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search city or country"
          placeholderTextColor={c.textFaint}
          style={{ flex: 1, color: c.text, fontFamily: FONTS.medium, fontSize: 15, paddingVertical: 11 }}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
            <Icon name="x" size={17} color={c.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={city => city.id}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, keyboard) + 16 }}
        ListEmptyComponent={
          <AppText tone="muted" style={{ paddingVertical: 40, textAlign: 'center' }}>
            No matching city yet.
          </AppText>
        }
        renderSectionHeader={({ section }) => (
          <AppText variant="overline" tone="faint" style={{ paddingHorizontal: GUTTER, paddingTop: 16, paddingBottom: 6, backgroundColor: c.bg }}>
            {section.title}
          </AppText>
        )}
        renderItem={({ item: city }) => {
          const active = city.id === cityId;
          return (
            <Pressable
              onPress={() => choose(city.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              android_ripple={{ color: c.line }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 13,
                paddingHorizontal: GUTTER,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: c.line,
              }}
            >
              <View style={{ flex: 1 }}>
                <AppText variant={active ? 'bodyStrong' : 'body'} tone={active ? 'accent' : 'text'}>
                  {city.name}
                </AppText>
                {isMosqueCity(city) && (
                  <AppText variant="caption" tone="gold" style={{ marginTop: 1 }}>
                    Local mosque timetable
                  </AppText>
                )}
              </View>
              {active && <Icon name="check" size={18} color={c.accent} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
