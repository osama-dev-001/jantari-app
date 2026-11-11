import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { RootNav } from '../../app/navigation';
import { formatHijri } from '../../core/hijri';
import { isMosqueCity, METHOD_KEYS, METHOD_NAMES, methodDetail, resolveMethod } from '../../core/prayer/engine';
import type { MethodSetting } from '../../core/prayer/types';
import { LANGS, type Lang } from '../../data/adhkar';
import { formatClock, formatShortDate, ymdAt } from '../../core/time';
import { hijriNow, useCity, useNow, usePrayerState } from '../../hooks';
import { refreshAdhkar, remoteConfigured, useAdhkarCheckStatus, useAdhkarLibrary, type CheckStatus } from '../../store/adhkarLibrary';
import { updateSettings, useSettings, type ReminderSettings, type ThemeMode } from '../../store/settings';
import { ACCENT_OPTIONS, buildPalette } from '../../theme/palette';
import { ARABIC_FONTS, URDU_FONTS } from '../../theme/scripts';
import { useScripts, useTheme } from '../../theme/ThemeProvider';
import { RADIUS } from '../../theme/typography';
import { Icon, type IconName } from '../../ui/Icon';
import { Screen, ScreenTitle, Sheet } from '../../ui/layout';
import { AppText, Divider, PressableScale, Segmented } from '../../ui/primitives';
import { Block, Row, ToggleRow } from './parts';

const APP_VERSION = '2.3';

export function SettingsScreen() {
  const c = useTheme();
  const scripts = useScripts();
  const nav = useNavigation<RootNav>();
  const s = useSettings();
  const city = useCity();
  const now = useNow(60_000);
  const { state } = usePrayerState(now);
  const [pickMethod, setPickMethod] = useState(false);
  const mosque = isMosqueCity(city);
  const method = resolveMethod(city, s);

  return (
    <Screen header={<ScreenTitle title="Settings" subtitle="Islamic Daily" />}>
      <Block title="Location">
        <Row icon="map-pin" title={city.name} subtitle={`${city.country} · ${mosque ? 'Local mosque timetable' : 'Calculated offline'}`} onPress={() => nav.navigate('CityPicker')} />
      </Block>

      <Block
        title="Prayer calculation"
        note={mosque ? `${city.name} follows its mosque timetable, so method and madhab don't change its times.` : undefined}
      >
        <Row
          icon="compass"
          title="Method"
          subtitle={`${s.method === 'auto' ? 'Auto · ' : ''}${METHOD_NAMES[method]}`}
          onPress={() => setPickMethod(true)}
        />
        <Divider />
        <View style={{ paddingVertical: 12 }}>
          <AppText variant="bodyStrong" style={{ marginBottom: 8 }}>
            Asr time (madhab)
          </AppText>
          <Segmented
            value={s.madhab}
            onChange={madhab => updateSettings({ madhab })}
            options={[
              { key: 'shafi', label: "Shafi'i · earlier" },
              { key: 'hanafi', label: 'Hanafi · later' },
            ]}
          />
          <AppText variant="caption" tone="faint" style={{ marginTop: 8 }}>
            {s.madhab === 'hanafi'
              ? "Asr begins when an object's shadow is twice its height."
              : "Asr begins when an object's shadow equals its height (Shafi'i, Maliki, Hanbali)."}
          </AppText>
        </View>
        <Divider />
        <View style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AppText variant="bodyStrong" style={{ flex: 1 }}>
            Clock
          </AppText>
          <Segmented
            compact
            style={{ width: 150 }}
            value={s.timeFormat}
            onChange={timeFormat => updateSettings({ timeFormat })}
            options={[
              { key: '12h', label: '12-hour' },
              { key: '24h', label: '24-hour' },
            ]}
          />
        </View>
      </Block>

      <Block title="Hijri date" note="The Islamic calendar follows moon sighting, which differs by region. Adjust until it matches your local calendar. The date advances at Maghrib.">
        <View style={{ paddingVertical: 12 }}>
          <AppText variant="subheading">{formatHijri(hijriNow(state, now, s.hijriOffset))}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <AppText variant="caption" tone="muted" style={{ flex: 1 }}>
              Adjustment: {s.hijriOffset > 0 ? `+${s.hijriOffset}` : s.hijriOffset} day{Math.abs(s.hijriOffset) === 1 ? '' : 's'}
            </AppText>
            <Stepper value={s.hijriOffset} min={-2} max={2} onChange={hijriOffset => updateSettings({ hijriOffset })} />
          </View>
        </View>
      </Block>

      <Block title="Notifications">
        <Row icon="clock" title="Reminders" subtitle={reminderSummary(s.reminders)} onPress={() => nav.navigate('Reminders')} />
      </Block>

      <Block title="Appearance">
        <View style={{ paddingVertical: 12 }}>
          <AppText variant="bodyStrong" style={{ marginBottom: 8 }}>
            Theme
          </AppText>
          <Segmented<ThemeMode>
            value={s.themeMode}
            onChange={themeMode => updateSettings({ themeMode })}
            options={[
              { key: 'dark', label: 'Night' },
              { key: 'light', label: 'Day' },
              { key: 'system', label: 'System' },
            ]}
          />
        </View>
        <Divider />
        <View style={{ paddingVertical: 12 }}>
          <AppText variant="bodyStrong" style={{ marginBottom: 10 }}>
            Accent
          </AppText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {ACCENT_OPTIONS.map(a => {
              const swatch = buildPalette(c.isDark, a.key).accent;
              const active = s.accent === a.key;
              return (
                <PressableScale
                  key={a.key}
                  onPress={() => updateSettings({ accent: a.key })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={a.label}
                  style={{ alignItems: 'center', gap: 6, width: 64 }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: swatch,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 3,
                      borderColor: active ? c.text : 'transparent',
                    }}
                  >
                    {active && <Icon name="check" size={18} color={buildPalette(c.isDark, a.key).onAccent} strokeWidth={2.6} />}
                  </View>
                  <AppText variant="caption" tone={active ? 'text' : 'muted'}>
                    {a.label}
                  </AppText>
                </PressableScale>
              );
            })}
          </View>
        </View>
        <Divider />
        <Row
          icon="a-large-small"
          title="Arabic & Urdu text"
          subtitle={`${ARABIC_FONTS[s.arabicFont].name} · ${URDU_FONTS[s.urduFont].name} · sizes`}
          onPress={() => nav.navigate('FontSettings')}
        />
      </Block>

      <Block title="Dhikr">
        <LibraryRow />
        <Divider />
        <View style={{ paddingVertical: 12 }}>
          <AppText variant="bodyStrong" style={{ marginBottom: 8 }}>
            Translation language
          </AppText>
          <Segmented<Lang>
            value={s.translationLang}
            onChange={translationLang => updateSettings({ translationLang })}
            options={LANGS.map(l => ({ key: l.key, label: l.label, labelStyle: l.key === 'urdu' ? scripts.urdu(13, { label: true, align: 'center' }) : undefined }))}
          />
        </View>
        <Divider />
        <ToggleRow icon="vibrate" title="Vibrate on each count" value={s.haptics} onChange={haptics => updateSettings({ haptics })} />
      </Block>

      <Block title="About">
        <Row icon="info" title={`Islamic Daily ${APP_VERSION}`} subtitle="Offline prayer times, Jantari & adhkar" />
        <Divider />
        <View style={{ paddingVertical: 12 }}>
          <AppText variant="caption" tone="muted" style={{ lineHeight: 18 }}>
            Prayer times come from curated local mosque timetables where available, otherwise they are calculated on your phone with Adhan. No
            internet is needed. Hadith references are listed with every dhikr.
          </AppText>
          <AppText variant="caption" tone="faint" style={{ marginTop: 8, lineHeight: 18 }}>
            Fonts: Amiri, Noto Nastaliq Urdu, Manrope, Fraunces (SIL Open Font License). Icons: Lucide (ISC).
          </AppText>
        </View>
        {__DEV__ && (
          <>
            <Divider />
            <Row icon="list-checks" title="Widget preview" subtitle="Developer tool" onPress={() => nav.navigate('WidgetPreview')} />
          </>
        )}
      </Block>

      <MethodSheet visible={pickMethod} onClose={() => setPickMethod(false)} />
    </Screen>
  );
}

const CHECK_NOTE: Partial<Record<CheckStatus['state'], string>> = {
  checking: 'Checking for updates…',
  updated: 'Just updated',
  unchanged: 'Up to date',
  offline: 'Offline — will check again when connected',
};

/** Where the adhkar come from (online library or built-in), with a manual "check now". */
function LibraryRow() {
  const c = useTheme();
  const s = useSettings();
  const city = useCity();
  const lib = useAdhkarLibrary();
  const check = useAdhkarCheckStatus();
  const total = lib.favourites.length + lib.others.length;
  const when = (t: number) => `${formatShortDate(ymdAt(t, city.tzOffsetMin))}, ${formatClock(t, city.tzOffsetMin, { format: s.timeFormat })}`;

  if (!remoteConfigured()) {
    return <Row icon="book-open" title="Adhkar library" subtitle={`Built-in · ${total} adhkar`} />;
  }
  const base =
    lib.source === 'remote' && lib.fetchedAt ? `Online · ${total} adhkar · updated ${when(lib.fetchedAt)}` : `Built-in · ${total} adhkar`;
  const extra =
    check.state === 'empty' ? check.message : check.state === 'error' ? `Couldn't check: ${check.message}` : CHECK_NOTE[check.state];
  return (
    <Row
      icon="book-open"
      title="Adhkar library"
      subtitle={extra ? `${base}\n${extra}` : base}
      onPress={() => refreshAdhkar({ force: true })}
      right={check.state === 'checking' ? <ActivityIndicator size="small" color={c.accent} /> : <Icon name="refresh-cw" size={17} color={c.textFaint} />}
    />
  );
}

function reminderSummary(r: ReminderSettings): string {
  const on = [r.morning && 'Morning', r.evening && 'Evening', r.prayerAlerts && 'Prayer times'].filter(Boolean);
  return on.length ? `On · ${on.join(', ')}` : 'Off · morning & evening adhkar, prayer times';
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const c = useTheme();
  const btn = (delta: number, icon: IconName) => (
    <PressableScale
      onPress={() => onChange(Math.min(max, Math.max(min, value + delta)))}
      disabled={value + delta < min || value + delta > max}
      accessibilityLabel={delta > 0 ? 'Increase' : 'Decrease'}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.surfaceSunk,
        opacity: value + delta < min || value + delta > max ? 0.35 : 1,
      }}
    >
      <Icon name={icon} size={18} color={c.text} />
    </PressableScale>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {btn(-1, 'minus')}
      <AppText variant="number" style={{ width: 24, textAlign: 'center', fontSize: 17 }}>
        {value > 0 ? `+${value}` : value}
      </AppText>
      {btn(1, 'plus')}
    </View>
  );
}

function MethodSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useTheme();
  const s = useSettings();
  const city = useCity();
  const auto = resolveMethod(city, { method: 'auto', madhab: s.madhab });
  const options: { key: MethodSetting; title: string; detail: string }[] = [
    { key: 'auto', title: `Auto (${METHOD_NAMES[auto]})`, detail: `Recommended for ${city.country} · ${methodDetail(auto)}` },
    ...METHOD_KEYS.map(k => ({ key: k as MethodSetting, title: METHOD_NAMES[k], detail: methodDetail(k) })),
  ];
  return (
    <Sheet visible={visible} onClose={onClose} title="Calculation method">
      {options.map(o => {
        const active = s.method === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => {
              updateSettings({ method: o.key });
              onClose();
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 10,
              marginHorizontal: -10,
              borderRadius: RADIUS.sm,
              backgroundColor: pressed ? c.surfaceSunk : active ? c.accentSoft : 'transparent',
              borderBottomWidth: o.key === 'auto' ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: c.line,
            })}
          >
            <View style={{ flex: 1 }}>
              <AppText variant={active ? 'bodyStrong' : 'body'} tone={active ? 'accent' : 'text'}>
                {o.title}
              </AppText>
              <AppText variant="caption" tone="muted">
                {o.detail}
              </AppText>
            </View>
            {active && <Icon name="check" size={18} color={c.accent} />}
          </Pressable>
        );
      })}
    </Sheet>
  );
}
