import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { periodProgress } from '../../core/prayer/engine';
import { FARD, PRAYER_META, type PrayerKey } from '../../core/prayer/types';
import { formatHijri, formatHijriUrdu, isRamadan, notableDay } from '../../core/hijri';
import { formatClock, formatCountdown, formatLongDate, ymdKey, type YMD } from '../../core/time';
import { TIME_META, type DhikrTime } from '../../data/adhkar';
import { useAdhkarLibrary } from '../../store/adhkarLibrary';
import { haptics, hijriNow, useCityToday, useFocusedNow, usePrayerState } from '../../hooks';
import type { RootNav } from '../../app/navigation';
import { countPrayed, isPrayed, lastNDays, togglePrayed, trackerStreak, useDhikrDay, useTasbih, useTracker } from '../../store/progress';
import { updateSettings, useSettings } from '../../store/settings';
import { useScripts, useTheme } from '../../theme/ThemeProvider';
import { enableReminders } from '../settings/RemindersScreen';
import { FONTS, RADIUS } from '../../theme/typography';
import { GradientFill, ProgressRing, Star, StarLattice } from '../../ui/graphics';
import { Icon, type IconName } from '../../ui/Icon';
import { Screen } from '../../ui/layout';
import { AppText, Card, Pill, PressableScale, SectionHeader } from '../../ui/primitives';
import { CityPill } from '../prayer/CityPicker';

export const PRAYER_ICON: Record<PrayerKey, IconName> = {
  fajr: 'moon-star',
  sunrise: 'sunrise',
  zawal: 'sun',
  dhuhr: 'sun',
  asr: 'sun',
  maghrib: 'sunset',
  isha: 'moon',
  midnight: 'moon-star',
};

export function TodayScreen() {
  const c = useTheme();
  const scripts = useScripts();
  const nav = useNavigation<RootNav>();
  const now = useFocusedNow(1000);
  const { city, state, settings } = usePrayerState(now);
  const today = useCityToday(now);
  const fmt = (t: number) => formatClock(t, city.tzOffsetMin, { format: settings.timeFormat });

  const hijri = hijriNow(state, now, settings.hijriOffset);
  const notable = notableDay(hijri);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 4 }}>
        <View style={{ flex: 1 }}>
          <AppText style={[scripts.arabic(26, { label: true, align: 'left' }), { color: c.gold }]}>السَّلَامُ عَلَيْكُمْ</AppText>
          <AppText variant="caption" tone="muted" style={{ marginTop: -2 }}>
            Assalamu Alaikum
          </AppText>
        </View>
        <CityPill city={city} />
      </View>

      <View style={{ marginTop: 14, marginBottom: 16 }}>
        <AppText variant="heading">{formatLongDate(state.today)}</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <AppText variant="label" tone="secondary">
            {formatHijri(hijri)}
          </AppText>
          <AppText style={[scripts.urdu(15, { label: true }), { color: c.textMuted }]}>{formatHijriUrdu(hijri)}</AppText>
        </View>
        {notable && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Star size={11} color={c.gold} fill={c.gold} />
            <AppText variant="label" tone="gold">
              {notable}
            </AppText>
          </View>
        )}
      </View>

      <NextPrayerHero now={now} fmt={fmt} />

      <PrayerTracker now={now} today={today} fmt={fmt} />

      <FastingCard ramadan={isRamadan(hijri)} now={now} fmt={fmt} />

      <ReminderPrompt onCustomise={() => nav.navigate('Reminders')} />

      <DhikrSummary dayKey={today.key} onOpen={() => nav.navigate('Tabs', { screen: 'Dhikr' })} />

      <TasbihShortcut onOpen={() => nav.navigate('Tasbih')} />

    </Screen>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function NextPrayerHero({ now, fmt }: { now: number; fmt: (t: number) => string }) {
  const c = useTheme();
  const scripts = useScripts();
  const { state } = usePrayerState(now);
  const { current, next } = state;
  if (!next) return null;
  const meta = PRAYER_META[next.key];
  const progress = periodProgress(state, now);

  return (
    <View style={{ borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: c.hero.ornament }}>
      <GradientFill from={c.hero.from} to={c.hero.to} />
      <StarLattice color={c.hero.ornament} tile={46} />
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="overline" color={c.hero.sub}>
            {meta.kind === 'salah' ? 'Next prayer' : 'Coming up'}
          </AppText>
          {/* Urdu sits up here so long English names (Midnight, Maghrib) keep the full width. */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <AppText style={[scripts.urdu(20, { label: true }), { color: c.hero.gold }]}>{meta.ur}</AppText>
            <Icon name={PRAYER_ICON[next.key]} size={20} color={c.hero.gold} />
          </View>
        </View>

        <AppText variant="display" color={c.hero.text} numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: 40, lineHeight: 48, marginTop: 6 }}>
          {meta.en}
        </AppText>
        <AppText variant="subheading" color={c.hero.sub}>
          {meta.note ? `${meta.note} · ` : 'at '}
          {fmt(next.at)}
        </AppText>

        <AppText
          accessibilityLabel={`Time remaining ${formatCountdown(next.at - now)}`}
          style={{ fontFamily: FONTS.extrabold, fontSize: 34, lineHeight: 42, color: c.hero.gold, fontVariant: ['tabular-nums'], marginTop: 14 }}
        >
          {formatCountdown(next.at - now)}
        </AppText>

        <View style={{ height: 4, borderRadius: 2, backgroundColor: c.hero.track, marginTop: 12, overflow: 'hidden' }}>
          <View style={{ width: `${progress * 100}%`, height: 4, borderRadius: 2, backgroundColor: c.hero.gold }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <AppText variant="caption" color={c.hero.sub}>
            {current ? `${PRAYER_META[current.key].en} · ${fmt(current.at)}` : ''}
          </AppText>
          <AppText variant="caption" color={c.hero.sub}>
            {`${meta.en} · ${fmt(next.at)}`}
          </AppText>
        </View>
      </View>
    </View>
  );
}

// ─── Salah tracker ───────────────────────────────────────────────────────────

function PrayerTracker({ now, today, fmt }: { now: number; today: { ymd: YMD; key: string }; fmt: (t: number) => string }) {
  const c = useTheme();
  const { state } = usePrayerState(now);
  const log = useTracker();
  const prayedToday = log[today.key];
  const done = countPrayed(prayedToday);
  const streak = trackerStreak(log, today.ymd);
  const week = lastNDays(today.ymd, 7);

  return (
    <Card style={{ padding: 16, marginBottom: 14 }}>
      <SectionHeader
        title="Today's salah"
        right={
          <AppText variant="label" tone={done === 5 ? 'accent' : 'muted'}>
            {done}/5 prayed
          </AppText>
        }
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {FARD.map(key => {
          const at = state.todayTimes.times[key];
          const started = at !== undefined && at <= now;
          const prayed = isPrayed(prayedToday, key);
          return (
            <PressableScale
              key={key}
              disabled={!started && !prayed}
              onPress={() => {
                haptics.tap();
                togglePrayed(today.ymd, today.key, key);
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: prayed, disabled: !started && !prayed }}
              accessibilityLabel={`${PRAYER_META[key].en}${prayed ? ', prayed' : ''}`}
              style={{ alignItems: 'center', width: 56, opacity: started || prayed ? 1 : 0.45 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: prayed ? c.accent : c.surfaceSunk,
                  borderWidth: prayed ? 0 : 1,
                  borderColor: started ? c.accentLine : c.line,
                }}
              >
                {prayed ? <Icon name="check" size={20} color={c.onAccent} strokeWidth={2.6} /> : <Icon name={PRAYER_ICON[key]} size={18} color={c.textMuted} />}
              </View>
              <AppText variant="label" tone={prayed ? 'accent' : 'secondary'} style={{ marginTop: 6 }}>
                {PRAYER_META[key].en}
              </AppText>
              <AppText variant="caption" tone="faint" style={{ fontSize: 10.5 }}>
                {at !== undefined ? fmt(at).replace(/ (AM|PM)$/, '') : '—'}
              </AppText>
            </PressableScale>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {week.map(day => {
            const n = countPrayed(log[ymdKey(day)]);
            return (
              <View
                key={ymdKey(day)}
                style={{ width: 22, height: 6, borderRadius: 3, backgroundColor: n === 5 ? c.accent : n > 0 ? c.accentLine : c.surfaceSunk }}
              />
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="flame" size={14} color={streak > 0 ? c.gold : c.textFaint} />
          <AppText variant="caption" tone={streak > 0 ? 'gold' : 'faint'}>
            {streak > 0 ? `${streak}-day streak` : 'Last 7 days'}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

// ─── Fasting ─────────────────────────────────────────────────────────────────

function FastingCard({ ramadan, now, fmt }: { ramadan: boolean; now: number; fmt: (t: number) => string }) {
  const c = useTheme();
  const scripts = useScripts();
  const { state } = usePrayerState(now);
  const sehri = state.todayTimes.times.fajr;
  const iftar = state.todayTimes.times.maghrib;
  if (sehri === undefined || iftar === undefined) return null;
  const fasting = now >= sehri && now < iftar;
  const items: [string, string, number, IconName][] = [
    ['Sehri ends', 'سحری', sehri, 'moon-star'],
    ['Iftar', 'افطار', iftar, 'sunset'],
  ];
  return (
    <Card style={{ padding: 16, marginBottom: 14, borderColor: ramadan ? c.goldSoft : c.line }}>
      <SectionHeader
        title={ramadan ? 'Ramadan fasting' : 'Fasting times'}
        right={ramadan && fasting ? <Pill tone="gold" label={`Iftar in ${formatCountdown(iftar - now).replace(/ \d+s$/, '')}`} /> : undefined}
      />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {items.map(([label, ur, at, icon]) => (
          <View key={label} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: c.goldSoft }}>
              <Icon name={icon} size={18} color={c.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText variant="caption" tone="muted">
                  {label}
                </AppText>
                <AppText style={[scripts.urdu(12, { label: true }), { color: c.textFaint }]}>{ur}</AppText>
              </View>
              <AppText variant="subheading" style={{ fontFamily: FONTS.bold }}>
                {fmt(at)}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

// ─── Dhikr summary ───────────────────────────────────────────────────────────

function DhikrSummary({ dayKey, onOpen }: { dayKey: string; onOpen: () => void }) {
  const c = useTheme();
  const counts = useDhikrDay(dayKey);
  const { favourites } = useAdhkarLibrary();
  const groups = useMemo(() => {
    const times: DhikrTime[] = ['morning', 'evening'];
    return times.map(time => {
      const items = favourites.filter(d => d.time === time);
      const done = items.filter(d => (counts[d.id] ?? 0) >= d.count).length;
      return { time, done, total: items.length };
    });
  }, [counts, favourites]);

  return (
    <PressableScale onPress={onOpen} accessibilityRole="button" accessibilityLabel="Open dhikr" style={{ marginBottom: 14 }}>
      <Card style={{ padding: 16 }}>
        <SectionHeader title="Daily adhkar" right={<Icon name="chevron-right" size={18} color={c.textMuted} />} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {groups.map(g => (
            <View key={g.time} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <ProgressRing size={46} stroke={4} progress={g.total ? g.done / g.total : 0} color={c.accent} track={c.surfaceSunk}>
                <Icon name={g.time === 'morning' ? 'sunrise' : 'sunset'} size={17} color={g.total > 0 && g.done === g.total ? c.accent : c.textMuted} />
              </ProgressRing>
              <View>
                <AppText variant="label">{TIME_META[g.time].label}</AppText>
                <AppText variant="caption" tone={g.total > 0 && g.done === g.total ? 'accent' : 'muted'}>
                  {g.total === 0 ? 'None listed' : g.done === g.total ? 'Complete' : `${g.done} of ${g.total} done`}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </PressableScale>
  );
}

/** One-time invitation to turn on adhkar reminders (off by default; needs notification permission). */
function ReminderPrompt({ onCustomise }: { onCustomise: () => void }) {
  const c = useTheme();
  const { reminders, reminderPromptDismissed } = useSettings();
  if (reminderPromptDismissed || reminders.morning || reminders.evening) return null;
  return (
    <Card style={{ padding: 16, marginBottom: 14, borderColor: c.goldSoft }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.goldSoft }}>
          <Icon name="clock" size={19} color={c.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong">Adhkar reminders</AppText>
          <AppText variant="caption" tone="muted" style={{ marginTop: 2, lineHeight: 17 }}>
            Gentle hourly reminders from Fajr to Zawal and Asr to Isha — every 10 minutes when the time is nearly over.
          </AppText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <PressableScale
          onPress={() => enableReminders({ morning: true, evening: true })}
          accessibilityRole="button"
          style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: RADIUS.md, backgroundColor: c.accent }}
        >
          <AppText variant="label" color={c.onAccent}>
            Turn on
          </AppText>
        </PressableScale>
        <PressableScale onPress={onCustomise} accessibilityRole="button" style={{ paddingVertical: 10, paddingHorizontal: 12 }}>
          <AppText variant="label" tone="accent">
            Customise
          </AppText>
        </PressableScale>
        <PressableScale onPress={() => updateSettings({ reminderPromptDismissed: true })} accessibilityRole="button" style={{ paddingVertical: 10, paddingHorizontal: 8 }}>
          <AppText variant="label" tone="muted">
            Not now
          </AppText>
        </PressableScale>
      </View>
    </Card>
  );
}

function TasbihShortcut({ onOpen }: { onOpen: () => void }) {
  const c = useTheme();
  const t = useTasbih();
  return (
    <PressableScale onPress={onOpen} accessibilityRole="button" accessibilityLabel="Open tasbih counter">
      <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accentSoft }}>
          <Icon name="beads" size={22} color={c.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong">Tasbih counter</AppText>
          <AppText variant="caption" tone="muted">
            {t.total > 0 ? `${t.total.toLocaleString()} counted in total` : 'Free counting with a target'}
          </AppText>
        </View>
        <AppText variant="number" tone="accent" style={{ fontSize: 22 }}>
          {t.count}
        </AppText>
      </Card>
    </PressableScale>
  );
}
