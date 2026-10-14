import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { getYearTimes } from '../../core/prayer/engine';
import { PRAYER_META, PRAYER_ORDER, type DayTimes, type PrayerKey } from '../../core/prayer/types';
import { MONTHS, WEEKDAYS, formatClock, weekday, ymdKey } from '../../core/time';
import { useFocusedNow, usePrayerState } from '../../hooks';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS, RADIUS } from '../../theme/typography';
import { Star } from '../../ui/graphics';
import { Icon } from '../../ui/Icon';
import { AppText, PressableScale } from '../../ui/primitives';

const QUARTERS = {
  all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  q1: [1, 2, 3],
  q2: [4, 5, 6],
  q3: [7, 8, 9],
  q4: [10, 11, 12],
} as const;
type Quarter = keyof typeof QUARTERS;

const ROW_H = 34;
const HEADER_H = 38;
const DATE_W = 50;
const COL_W = 58;

type Row = { type: 'month'; month: number; key: string } | { type: 'day'; day: DayTimes; key: string };

export function YearlyTable() {
  const c = useTheme();
  // Minute resolution is plenty to know which row is "today".
  const now = useFocusedNow(60_000);
  const { city, opts, state, settings } = usePrayerState(now);
  const year = state.today.y;
  const todayKey = ymdKey(state.today);

  const [shownQuarter, setShownQuarter] = useState<Quarter>('all'); // highlights instantly
  const [quarter, setQuarter] = useState<Quarter>('all'); // drives the (deferred) data
  const [rows, setRows] = useState<Row[] | null>(null);
  const [height, setHeight] = useState(0);
  const list = useRef<FlatList<Row>>(null);
  const didAutoScroll = useRef(false);

  // Zawal only appears for cities whose timetable has it.
  const columns = useMemo<PrayerKey[]>(() => {
    const sample = getYearTimes(city, year, opts, [1])[0].days[0];
    return PRAYER_ORDER.filter(k => k !== 'zawal' || sample.times.zawal !== undefined);
  }, [city, year, opts]);

  // Heavy work (365 days) is deferred a couple of frames so the spinner and
  // button highlight paint first (InteractionManager is deprecated in RN 0.85).
  useEffect(() => {
    setRows(null);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const frame = requestAnimationFrame(() => {
      timer = setTimeout(build, 32);
    });
    function build() {
      const out: Row[] = [];
      for (const m of getYearTimes(city, year, opts, [...QUARTERS[quarter]])) {
        out.push({ type: 'month', month: m.month, key: `m${m.month}` });
        for (const day of m.days) out.push({ type: 'day', day, key: ymdKey(day.ymd) });
      }
      setRows(out);
    }
    return () => {
      cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
    };
  }, [city, year, opts, quarter]);

  const offsets = useMemo(() => {
    let y = 0;
    return (rows ?? []).map(r => {
      const at = y;
      y += r.type === 'month' ? HEADER_H : ROW_H;
      return at;
    });
  }, [rows]);

  const todayIndex = rows?.findIndex(r => r.key === todayKey) ?? -1;

  const scrollToToday = useCallback(
    (animated: boolean) => {
      if (todayIndex >= 0) list.current?.scrollToIndex({ index: todayIndex, viewPosition: 0.35, animated });
    },
    [todayIndex],
  );

  useEffect(() => {
    if (rows && !didAutoScroll.current && todayIndex >= 0 && height > 0) {
      didAutoScroll.current = true;
      requestAnimationFrame(() => scrollToToday(false));
    }
  }, [rows, todayIndex, height, scrollToToday]);

  const pickQuarter = (q: Quarter) => {
    if (q === shownQuarter) return;
    setShownQuarter(q);
    didAutoScroll.current = false;
    setQuarter(q);
  };

  const fmt = (t: number | undefined) =>
    t === undefined ? '—' : formatClock(t, city.tzOffsetMin, { format: settings.timeFormat, withPeriod: false });

  const renderItem = ({ item }: { item: Row }) => {
    if (item.type === 'month') {
      return (
        <View style={{ height: HEADER_H, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, backgroundColor: c.surfaceSunk }}>
          <Star size={10} color={c.gold} fill={c.gold} />
          <AppText variant="overline" tone="gold">
            {MONTHS[item.month - 1]} {year}
          </AppText>
        </View>
      );
    }
    const { day } = item;
    const isToday = item.key === todayKey;
    const wd = weekday(day.ymd);
    const friday = wd === 5;
    return (
      <View
        style={{
          height: ROW_H,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isToday ? c.accentSoft : 'transparent',
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: c.line,
        }}
      >
        <View style={{ width: DATE_W, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 3 }}>
          <AppText style={{ fontFamily: FONTS.bold, fontSize: 13, color: isToday ? c.accent : c.text, fontVariant: ['tabular-nums'] }}>
            {day.ymd.d}
          </AppText>
          <AppText style={{ fontFamily: FONTS.semibold, fontSize: 9.5, color: isToday ? c.accent : friday ? c.gold : c.textFaint }}>
            {WEEKDAYS[wd].slice(0, 2)}
          </AppText>
        </View>
        {columns.map(k => (
          <AppText
            key={k}
            style={{
              width: COL_W,
              textAlign: 'center',
              fontFamily: isToday ? FONTS.bold : FONTS.medium,
              fontSize: 12.5,
              fontVariant: ['tabular-nums'],
              color: isToday ? c.accent : PRAYER_META[k].kind === 'marker' ? c.textMuted : c.textSecondary,
            }}
          >
            {fmt(day.times[k])}
          </AppText>
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
        {(Object.keys(QUARTERS) as Quarter[]).map(q => {
          const active = q === shownQuarter;
          return (
            <PressableScale
              key={q}
              onPress={() => pickQuarter(q)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 7,
                borderRadius: RADIUS.sm,
                backgroundColor: active ? c.accent : c.surface,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: active ? c.accent : c.line,
              }}
            >
              <AppText variant="label" color={active ? c.onAccent : c.textMuted}>
                {q.toUpperCase()}
              </AppText>
            </PressableScale>
          );
        })}
        <PressableScale
          onPress={() => (todayIndex >= 0 ? scrollToToday(true) : pickQuarter('all'))}
          fill
          accessibilityRole="button"
          accessibilityLabel="Jump to today"
          style={{
            paddingHorizontal: 10,
            justifyContent: 'center',
            borderRadius: RADIUS.sm,
            backgroundColor: c.goldSoft,
          }}
        >
          <Icon name="calendar-days" size={17} color={c.gold} />
        </PressableScale>
      </View>

      <View
        style={{ flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden', backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: c.lineStrong }}
        onLayout={e => setHeight(e.nativeEvent.layout.height)}
      >
        {!rows || height === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={c.accent} size="large" />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
            <View style={{ height, width: DATE_W + columns.length * COL_W }}>
              <View style={{ flexDirection: 'row', paddingVertical: 10, backgroundColor: c.surfaceAlt, borderBottomWidth: 1, borderBottomColor: c.accentLine }}>
                <View style={{ width: DATE_W, alignItems: 'center' }}>
                  <Icon name="calendar" size={15} color={c.textMuted} />
                  <AppText variant="overline" tone="muted" style={{ fontSize: 9, marginTop: 3 }}>
                    Date
                  </AppText>
                </View>
                {columns.map(k => (
                  <View key={k} style={{ width: COL_W, alignItems: 'center' }}>
                    <AppText style={{ fontFamily: FONTS.urdu, fontSize: 11, lineHeight: 20, color: c.gold, marginTop: -3, marginBottom: -2 }}>
                      {PRAYER_META[k].ur}
                    </AppText>
                    <AppText variant="overline" tone="muted" style={{ fontSize: 9 }}>
                      {PRAYER_META[k].en}
                    </AppText>
                  </View>
                ))}
              </View>
              <FlatList
                ref={list}
                data={rows}
                keyExtractor={r => r.key}
                renderItem={renderItem}
                getItemLayout={(_, index) => ({
                  index,
                  offset: offsets[index] ?? 0,
                  length: rows[index]?.type === 'month' ? HEADER_H : ROW_H,
                })}
                initialNumToRender={24}
                maxToRenderPerBatch={20}
                windowSize={7}
                removeClippedSubviews
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        )}
      </View>
      <AppText variant="caption" tone="faint" style={{ marginTop: 8, textAlign: 'center' }}>
        {settings.timeFormat === '12h' ? '12-hour times · AM/PM omitted · ' : ''}
        {city.name} {year}
      </AppText>
    </View>
  );
}
