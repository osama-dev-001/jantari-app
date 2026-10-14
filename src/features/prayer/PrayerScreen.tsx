import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { RootNav } from '../../app/navigation';
import { getDayTimes, isMosqueCity, methodDetail, METHOD_NAMES, resolveMethod, statusOf } from '../../core/prayer/engine';
import { PRAYER_META, PRAYER_ORDER, type CalcOptions, type City, type PrayerStatus } from '../../core/prayer/types';
import { compassPoint, distanceToKaabaKm, qiblaBearing } from '../../core/qibla';
import { addDays, formatClock, formatShortDate } from '../../core/time';
import { useCity, useFocusedNow, usePrayerState } from '../../hooks';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS, RADIUS, urduStyle } from '../../theme/typography';
import { QiblaDial } from '../../ui/graphics';
import { Icon } from '../../ui/Icon';
import { GUTTER, Screen, ScreenTitle } from '../../ui/layout';
import { AppText, Card, IconButton, Pill, PressableScale, Segmented, SectionHeader } from '../../ui/primitives';
import { PRAYER_ICON } from '../today/TodayScreen';
import { CityPill } from './CityPicker';
import { YearlyTable } from './YearlyTable';

type Tab = 'day' | 'year';

export function PrayerScreen() {
  const [tab, setTab] = useState<Tab>('day');
  const city = useCity();

  const header = (
    <>
      <ScreenTitle title="Prayer Times" subtitle="جنتری · Jantari" right={<CityPill city={city} />} />
      <Segmented<Tab>
        style={{ marginHorizontal: GUTTER, marginBottom: 12 }}
        value={tab}
        onChange={setTab}
        options={[
          { key: 'day', label: 'Daily' },
          { key: 'year', label: 'Yearly Jantari' },
        ]}
      />
    </>
  );

  return (
    <>
      {tab === 'day' ? (
        <Screen header={header}>
          <DailyView />
        </Screen>
      ) : (
        <Screen header={header} scroll={false} contentStyle={{ paddingHorizontal: GUTTER, paddingBottom: 12 }}>
          <YearlyTable />
        </Screen>
      )}
    </>
  );
}

function DailyView() {
  const c = useTheme();
  const now = useFocusedNow(1000);
  const nav = useNavigation<RootNav>();
  const { city, opts, state, settings } = usePrayerState(now);
  const [offset, setOffset] = useState(0);
  const viewing = addDays(state.today, offset);
  const isToday = offset === 0;
  const day = useMemo(() => getDayTimes(city, viewing, opts), [city, viewing.y, viewing.m, viewing.d, opts]); // eslint-disable-line react-hooks/exhaustive-deps
  const fmt = (t: number) => formatClock(t, city.tzOffsetMin, { format: settings.timeFormat });
  const keys = PRAYER_ORDER.filter(k => day.times[k] !== undefined);

  const statusFor = (k: (typeof keys)[number]): PrayerStatus => {
    if (isToday) return statusOf(state, k, now);
    return offset < 0 ? 'past' : 'upcoming';
  };

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <IconButton label="Previous day" onPress={() => setOffset(o => o - 1)}>
          <Icon name="chevron-left" size={20} color={c.text} />
        </IconButton>
        <PressableScale
          onPress={() => setOffset(0)}
          disabled={isToday}
          accessibilityLabel="Back to today"
          style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}
        >
          <AppText variant="subheading">{formatShortDate(viewing)}</AppText>
          <AppText variant="caption" tone={isToday ? 'accent' : 'gold'}>
            {isToday ? 'Today' : offset === 1 ? 'Tomorrow · tap for today' : offset === -1 ? 'Yesterday · tap for today' : 'Tap to return to today'}
          </AppText>
        </PressableScale>
        <IconButton label="Next day" onPress={() => setOffset(o => o + 1)}>
          <Icon name="chevron-right" size={20} color={c.text} />
        </IconButton>
      </View>

      <Card style={{ overflow: 'hidden', marginBottom: 14 }}>
        {keys.map((k, i) => {
          const status = statusFor(k);
          const meta = PRAYER_META[k];
          const isCurrent = status === 'current';
          const isNext = status === 'next';
          const dim = status === 'past';
          const nameColor = isCurrent ? c.accent : isNext ? c.gold : dim ? c.textMuted : c.text;
          return (
            <View
              key={k}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: meta.kind === 'salah' ? 12 : 9,
                backgroundColor: isCurrent ? c.accentSoft : isNext ? c.goldSoft : 'transparent',
                borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                borderTopColor: c.line,
              }}
            >
              {isCurrent && <View style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, backgroundColor: c.accent }} />}
              <Icon name={PRAYER_ICON[k]} size={meta.kind === 'salah' ? 20 : 17} color={isCurrent ? c.accent : isNext ? c.gold : c.textMuted} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <AppText variant={meta.kind === 'salah' ? 'bodyStrong' : 'body'} color={nameColor} style={meta.kind === 'marker' ? { fontSize: 14 } : undefined}>
                    {meta.en}
                  </AppText>
                  {isCurrent && <Pill tone="accent" label="Now" />}
                  {isNext && <Pill tone="gold" label="Next" />}
                </View>
                {meta.note && (
                  <AppText variant="caption" tone="faint" numberOfLines={1}>
                    {meta.note}
                  </AppText>
                )}
              </View>
              {/* Salah rows only: marker rows need the width for their note, and
                  Nastaliq glyphs overhang their box, so the column has a fixed width. */}
              {meta.kind === 'salah' && (
                <AppText numberOfLines={1} style={[urduStyle(14), { color: c.textFaint, width: 70, marginLeft: 8, marginRight: 12, lineHeight: 26, marginVertical: -6 }]}>
                  {meta.ur}
                </AppText>
              )}
              <AppText
                style={{
                  fontFamily: meta.kind === 'salah' ? FONTS.bold : FONTS.semibold,
                  fontSize: meta.kind === 'salah' ? 16 : 14,
                  color: dim ? c.textMuted : nameColor,
                  fontVariant: ['tabular-nums'],
                  minWidth: 74,
                  textAlign: 'right',
                }}
              >
                {fmt(day.times[k]!)}
              </AppText>
            </View>
          );
        })}
      </Card>

      <QiblaCard city={city} />

      <SourceNote city={city} opts={opts} onOpenSettings={() => nav.navigate('Tabs', { screen: 'Settings' })} />
    </>
  );
}

function QiblaCard({ city }: { city: City }) {
  const c = useTheme();
  const bearing = qiblaBearing(city.lat, city.lon);
  const km = Math.round(distanceToKaabaKm(city.lat, city.lon));
  return (
    <Card style={{ padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <QiblaDial size={104} bearing={bearing} ring={c.lineStrong} text={c.text} accent={c.accent} gold={c.gold} />
      <View style={{ flex: 1 }}>
        <SectionHeader title="Qibla direction" style={{ marginBottom: 4 }} />
        <AppText style={{ fontFamily: FONTS.extrabold, fontSize: 26, color: c.text }}>
          {bearing.toFixed(1)}° <AppText variant="subheading" tone="gold">{compassPoint(bearing)}</AppText>
        </AppText>
        <AppText variant="caption" tone="muted" style={{ marginTop: 2 }}>
          Clockwise from true north · {km.toLocaleString()} km to the Kaaba
        </AppText>
        <AppText variant="caption" tone="faint" style={{ marginTop: 6 }}>
          Align with a compass app; phone compasses need calibration.
        </AppText>
      </View>
    </Card>
  );
}

function SourceNote({ city, opts, onOpenSettings }: { city: City; opts: CalcOptions; onOpenSettings: () => void }) {
  const c = useTheme();
  const mosque = isMosqueCity(city);
  const method = resolveMethod(city, opts);
  return (
    <PressableScale onPress={onOpenSettings} accessibilityRole="button" accessibilityLabel="Calculation settings">
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          padding: 14,
          borderRadius: RADIUS.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.line,
          borderStyle: 'dashed',
        }}
      >
        <Icon name="info" size={17} color={c.textMuted} />
        <View style={{ flex: 1 }}>
          {mosque ? (
            <AppText variant="caption" tone="muted">
              {city.name} uses its curated local mosque timetable. Calculation settings don't change these times.
            </AppText>
          ) : (
            <AppText variant="caption" tone="muted">
              Calculated offline for {city.name} · {METHOD_NAMES[method]} ({methodDetail(method)}) · Asr {opts.madhab === 'hanafi' ? 'Hanafi' : "Shafi'i"}. Tap to
              change.
            </AppText>
          )}
        </View>
      </View>
    </PressableScale>
  );
}

