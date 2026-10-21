import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import type { RootNav } from '../../app/navigation';
import { TIME_META, groupByTime, type Dhikr } from '../../data/adhkar';
import type { AdhkarLibrary, DhikrListKey } from '../../data/adhkar/types';
import { refreshAdhkar, remoteConfigured, useAdhkarCheckStatus, useAdhkarLibrary } from '../../store/adhkarLibrary';
import { useCityToday, useFocusedNow } from '../../hooks';
import { useDhikrDay } from '../../store/progress';
import { useScripts, useTheme } from '../../theme/ThemeProvider';
import { RADIUS } from '../../theme/typography';
import { ProgressRing } from '../../ui/graphics';
import { Icon } from '../../ui/Icon';
import { GUTTER, Screen, ScreenTitle } from '../../ui/layout';
import { AppText, Card, IconButton, PressableScale, Segmented } from '../../ui/primitives';

export type { DhikrListKey };

/** The order items are shown in (grouped by time) — also the swipe order in the counter. */
export function orderedList(lib: AdhkarLibrary, key: DhikrListKey): Dhikr[] {
  return groupByTime(lib[key]).flatMap(g => g.items);
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
        return (
          <View key={time} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon
                  name={time === 'morning' ? 'sunrise' : time === 'evening' ? 'sunset' : time === 'salah' ? 'mosque' : 'sparkles'}
                  size={16}
                  color={c.gold}
                />
                <AppText variant="overline" tone="muted">
                  {TIME_META[time].label}
                </AppText>
                <AppText style={[scripts.urdu(13, { label: true }), { color: c.textFaint }]}>{TIME_META[time].ur}</AppText>
              </View>
              <AppText variant="caption" tone={groupDone === items.length ? 'accent' : 'faint'}>
                {groupDone}/{items.length}
              </AppText>
            </View>
            {items.map(item => (
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
