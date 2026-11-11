import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import type { RootNav } from '../../app/navigation';
import { TIME_META, groupByTime, type Dhikr, type DhikrTime } from '../../data/adhkar';
import type { AdhkarLibrary, DhikrListKey } from '../../data/adhkar/types';
import { refreshAdhkar, remoteConfigured, useAdhkarCheckStatus, useAdhkarLibrary } from '../../store/adhkarLibrary';
import { useCityToday, useFocusedNow, usePrayerState } from '../../hooks';
import { useDhikrDay } from '../../store/progress';
import { useScripts, useTheme } from '../../theme/ThemeProvider';
import { RADIUS } from '../../theme/typography';
import { ProgressRing } from '../../ui/graphics';
import { Icon, type IconName } from '../../ui/Icon';
import { GUTTER, Screen, ScreenTitle } from '../../ui/layout';
import { AppText, Card, IconButton, PressableScale, Segmented } from '../../ui/primitives';

export type { DhikrListKey };

/** The order items are shown in (grouped by time) — also the swipe order in the counter. */
export function orderedList(lib: AdhkarLibrary, key: DhikrListKey): Dhikr[] {
  return groupByTime(lib[key]).flatMap(g => g.items);
}

const TIME_ICON: Record<DhikrTime, IconName> = { morning: 'sunrise', any: 'sparkles', evening: 'sunset', salah: 'mosque' };

type DayHalf = 'morning' | 'evening' | null;

/** Midnight → Asr is the morning half, Asr → midnight the evening half (dhikr days reset at midnight). */
function dayHalf(asr: number | undefined, now: number): DayHalf {
  if (asr === undefined) return null;
  return now >= asr ? 'evening' : 'morning';
}

/** Finished groups, and the morning/evening group outside its half of the day, start folded. */
function startsFolded(time: DhikrTime, complete: boolean, half: DayHalf) {
  if (complete) return true;
  return (time === 'morning' && half === 'evening') || (time === 'evening' && half === 'morning');
}

export function DhikrListScreen() {
  const c = useTheme();
  const scripts = useScripts();
  const nav = useNavigation<RootNav>();
  const now = useFocusedNow(60_000);
  const today = useCityToday(now);
  const counts = useDhikrDay(today.key);
  const [tab, setTab] = useState<DhikrListKey>('favourites');
  const lib = useAdhkarLibrary();
  const check = useAdhkarCheckStatus();
  const groups = useMemo(() => groupByTime(lib[tab]), [lib, tab]);
  const list = lib[tab];
  const done = list.filter(d => (counts[d.id] ?? 0) >= d.count).length;
  const half = dayHalf(usePrayerState(now).state.todayTimes.times.asr, now);
  // Taps that open or fold a group, over its default.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const header = (
    <>
      <ScreenTitle
        title="Dhikr"
        subtitle="ذکر · Remembrance"
        right={
          <IconButton label="Open tasbih counter" onPress={() => nav.navigate('Tasbih')}>
            <Icon name="beads" size={21} color={c.accent} />
          </IconButton>
        }
      />
      <Segmented<DhikrListKey>
        style={{ marginHorizontal: GUTTER, marginBottom: 8 }}
        value={tab}
        onChange={setTab}
        options={[
          { key: 'favourites', label: 'Favourites' },
          { key: 'others', label: 'More adhkar' },
        ]}
      />
    </>
  );

  return (
    <Screen
      header={header}
      refreshControl={
        remoteConfigured() ? (
          <RefreshControl
            refreshing={check.state === 'checking'}
            onRefresh={() => refreshAdhkar({ force: true })}
            colors={[c.accent]}
            progressBackgroundColor={c.surface}
          />
        ) : undefined
      }
    >
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, marginBottom: 18, marginTop: 6 }}>
        <ProgressRing size={48} stroke={4} progress={list.length ? done / list.length : 0} color={c.accent} track={c.surfaceSunk}>
          <AppText variant="label" tone={done === list.length ? 'accent' : 'text'}>
            {done}
          </AppText>
        </ProgressRing>
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong">{done === list.length && list.length > 0 ? 'All complete today' : `${done} of ${list.length} complete`}</AppText>
          <AppText variant="caption" tone="muted">
            Counts reset each day at midnight
          </AppText>
        </View>
        {done === list.length && list.length > 0 && <Icon name="circle-check" size={24} color={c.accent} />}
      </Card>

      {list.length === 0 && (
        <AppText tone="muted" style={{ textAlign: 'center', paddingVertical: 40 }}>
          No adhkar in this list yet.
        </AppText>
      )}

      {groups.map(({ time, items }) => {
        const groupDone = items.filter(d => (counts[d.id] ?? 0) >= d.count).length;
        const complete = groupDone === items.length;
        // Keyed by day and half-day, so the defaults come back at Asr and at midnight.
        const key = `${today.key}:${half}:${tab}:${time}`;
        const open = toggled[key] ?? !startsFolded(time, complete, half);
        return (
          <View key={time} style={{ marginBottom: open ? 14 : 6 }}>
            <PressableScale
              onPress={() => setToggled(t => ({ ...t, [key]: !open }))}
              scaleTo={0.98}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              accessibilityLabel={`${TIME_META[time].label}, ${groupDone} of ${items.length} done`}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, marginBottom: open ? 4 : 0 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name={TIME_ICON[time]} size={16} color={c.dhikrTime[time]} />
                <AppText variant="overline" tone="muted">
                  {TIME_META[time].label}
                </AppText>
                {/* Remounted on a theme change: re-coloured Nastaliq can lose its last word (کسی بھی وقت). */}
                <AppText key={c.isDark ? 'dark' : 'light'} style={[scripts.urdu(13, { label: true }), { color: c.textFaint }]}>
                  {TIME_META[time].ur}
                </AppText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText variant="caption" tone={complete ? 'accent' : 'faint'}>
                  {groupDone}/{items.length}
                </AppText>
                <Icon name={open ? 'chevron-down' : 'chevron-right'} size={16} color={c.textMuted} />
              </View>
            </PressableScale>
            {open &&
              items.map(item => (
                <DhikrCard key={item.id} item={item} count={counts[item.id] ?? 0} onPress={() => nav.navigate('DhikrCounter', { list: tab, id: item.id })} />
              ))}
          </View>
        );
      })}
    </Screen>
  );
}

function DhikrCard({ item, count, onPress }: { item: Dhikr; count: number; onPress: () => void }) {
  const c = useTheme();
  const scripts = useScripts();
  const complete = count >= item.count;
  const progress = Math.min(1, count / item.count);
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={`${item.name}, ${count} of ${item.count}`} style={{ marginBottom: 10 }}>
      <View
        style={{
          borderRadius: RADIUS.lg,
          overflow: 'hidden',
          backgroundColor: complete ? c.accentSoft : c.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: complete ? c.accentLine : c.line,
        }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}>
          <AppText numberOfLines={2} style={[scripts.arabic(19, { align: 'right' }), { color: c.text }]}>
            {item.arabic}
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
            <AppText variant="label" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>
              {item.name}
            </AppText>
            <AppText variant="number" tone={complete ? 'accent' : 'muted'} style={{ fontSize: 13 }}>
              {count}/{item.count}
            </AppText>
            {complete && <Icon name="circle-check" size={17} color={c.accent} />}
          </View>
        </View>
        <View style={{ height: 3, backgroundColor: c.surfaceSunk }}>
          <View style={{ width: `${progress * 100}%`, height: 3, backgroundColor: complete ? c.accent : c.gold }} />
        </View>
      </View>
    </PressableScale>
  );
}
