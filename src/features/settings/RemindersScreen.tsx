import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { buildReminderPlan } from '../../core/reminders';
import { formatClock, formatShortDate, sameYmd, ymdAt } from '../../core/time';
import { useCity, useNow } from '../../hooks';
import { nativeReminders, type ReminderStatus } from '../../native/reminders';
import { syncReminders } from '../../store/reminderSync';
import {
  calcOptionsOf,
  ENDING_EVERY_OPTIONS,
  ENDING_WINDOW_OPTIONS,
  EVERY_OPTIONS,
  REMINDER_SOUNDS,
  START_AFTER_OPTIONS,
  updateReminders,
  useSettings,
  type ReminderSettings,
  type ReminderSound,
} from '../../store/settings';
import { useTheme } from '../../theme/ThemeProvider';
import { RADIUS } from '../../theme/typography';
import { Icon } from '../../ui/Icon';
import { AppText, Divider, PressableScale } from '../../ui/primitives';
import { Block, ChoiceRow, Row, SubScreen, ToggleRow } from './parts';

const SOUND_META: Record<ReminderSound, { name: string; note: string }> = {
  chime: { name: 'Chime', note: 'Three soft rising notes' },
  bell: { name: 'Bell', note: 'A single warm bell' },
  harp: { name: 'Harp', note: 'A quick plucked arpeggio' },
  system: { name: 'Phone default', note: "Your phone's notification sound" },
};

const minutes = (m: number) => (m === 0 ? 'At start' : m < 60 ? `${m} min` : m % 60 === 0 ? `${m / 60} hr` : `${m} min`);

/** Turning a reminder on asks for notification permission first (Android 13+). */
export async function enableReminders(patch: Partial<ReminderSettings>) {
  const granted = await nativeReminders.requestPermission();
  updateReminders(patch);
  return granted;
}

function useReminderStatus() {
  const [status, setStatus] = useState<ReminderStatus | null>(null);
  const refresh = useCallback(() => {
    nativeReminders.status().then(setStatus).catch(() => {});
  }, []);
  useFocusEffect(
    useCallback(() => {
      refresh();
      // Coming back from the system settings page should update the warning.
      const sub = AppState.addEventListener('change', st => st === 'active' && refresh());
      return () => sub.remove();
    }, [refresh]),
  );
  return { status, refresh };
}

export function RemindersScreen() {
  const c = useTheme();
  const s = useSettings();
  const r = s.reminders;
  const city = useCity();
  const now = useNow(60_000);
  const { status, refresh } = useReminderStatus();
  const [testSent, setTestSent] = useState(false);
  const anyOn = r.morning || r.evening || r.prayerAlerts;

  // The same plan the scheduler receives, ignoring progress, to show what's coming.
  const upcoming = useMemo(() => {
    if (!anyOn) return [];
    return buildReminderPlan({
      city,
      opts: calcOptionsOf(s),
      settings: { ...r, stopWhenDone: false },
      timeFormat: s.timeFormat,
      now,
      days: 2,
      progress: () => ({ done: 0, total: 0 }),
    }).slice(0, 6);
  }, [anyOn, city, s, r, now]);

  const toggle = (key: 'morning' | 'evening' | 'prayerAlerts') => async (on: boolean) => {
    if (on) await enableReminders({ [key]: true });
    else updateReminders({ [key]: false });
    setTimeout(refresh, 600);
  };

  const today = ymdAt(now, city.tzOffsetMin);
  const when = (at: number) => {
    const d = ymdAt(at, city.tzOffsetMin);
    const day = sameYmd(d, today) ? 'Today' : formatShortDate(d);
    return `${day}, ${formatClock(at, city.tzOffsetMin, { format: s.timeFormat })}`;
  };

  return (
    <SubScreen title="Reminders" subtitle={`Adhkar and prayer notifications · ${city.name}`}>
      {status && anyOn && !status.canPost && (
        <Warning
          text="Notifications are turned off for Islamic Daily, so reminders can't appear."
          action="Open notification settings"
          onPress={() => nativeReminders.openNotificationSettings()}
        />
      )}
      {status && anyOn && status.canPost && !status.exactAlarms && (
        <Warning
          text="Exact alarms aren't allowed, so reminders may arrive a few minutes late."
          action="Allow exact alarms"
          onPress={() => nativeReminders.openExactAlarmSettings()}
        />
      )}

      <Block title="Adhkar reminders">
        <ToggleRow icon="sunrise" title="Morning adhkar" subtitle="From Fajr until Zawal" value={r.morning} onChange={toggle('morning')} />
        <Divider />
        <ToggleRow icon="sunset" title="Evening adhkar" subtitle="From Asr until Isha" value={r.evening} onChange={toggle('evening')} />
        <Divider />
        <ChoiceRow
          title="Remind me every"
          value={String(r.everyMin)}
          options={EVERY_OPTIONS.map(m => ({ key: String(m), label: minutes(m) }))}
          onChange={v => updateReminders({ everyMin: Number(v) })}
          disabled={!r.morning && !r.evening}
        />
        <Divider />
        <ChoiceRow
          title="First reminder"
          hint="How long after Fajr / Asr begins."
          value={String(r.startAfterMin)}
          options={START_AFTER_OPTIONS.map(m => ({ key: String(m), label: m === 0 ? 'At start' : `+${m} min` }))}
          onChange={v => updateReminders({ startAfterMin: Number(v) })}
          disabled={!r.morning && !r.evening}
        />
        <Divider />
        <ChoiceRow
          title="When time is about to end"
          hint="Remind more often in the last stretch before Zawal / Isha."
          value={String(r.endingWindowMin)}
          options={ENDING_WINDOW_OPTIONS.map(m => ({ key: String(m), label: m === 0 ? 'Off' : `Last ${m} min` }))}
          onChange={v => updateReminders({ endingWindowMin: Number(v) })}
          disabled={!r.morning && !r.evening}
        />
        <ChoiceRow
          title="…every"
          value={String(r.endingEveryMin)}
          options={ENDING_EVERY_OPTIONS.map(m => ({ key: String(m), label: `${m} min` }))}
          onChange={v => updateReminders({ endingEveryMin: Number(v) })}
          disabled={(!r.morning && !r.evening) || r.endingWindowMin === 0}
        />
        <Divider />
        <ToggleRow
          title="Stop once done"
          subtitle="No more reminders once all Favourites for that time are complete"
          value={r.stopWhenDone}
          onChange={stopWhenDone => updateReminders({ stopWhenDone })}
        />
      </Block>

      <Block title="Prayer times">
        <ToggleRow icon="mosque" title="Prayer time alerts" subtitle="A notification as each of the five prayers begins" value={r.prayerAlerts} onChange={toggle('prayerAlerts')} />
      </Block>

      <Block title="Sound" note="Tap a sound to hear it. Used for both adhkar and prayer reminders.">
        {REMINDER_SOUNDS.map((key, i) => (
          <View key={key}>
            {i > 0 && <Divider />}
            <Row
              title={SOUND_META[key].name}
              subtitle={SOUND_META[key].note}
              onPress={() => {
                updateReminders({ sound: key });
                nativeReminders.previewSound(key);
              }}
              right={r.sound === key ? <Icon name="circle-check" size={20} color={c.accent} /> : <View style={{ width: 20 }} />}
            />
          </View>
        ))}
      </Block>

      {anyOn && (
        <Block title="Coming up" note={status ? `${status.pending} reminders scheduled for the next 7 days.` : undefined}>
          {upcoming.length === 0 ? (
            <AppText variant="caption" tone="muted" style={{ paddingVertical: 12 }}>
              Nothing more today or tomorrow.
            </AppText>
          ) : (
            upcoming.map((u, i) => (
              <View key={u.id}>
                {i > 0 && <Divider />}
                <View style={{ paddingVertical: 10 }}>
                  <AppText variant="caption" tone={u.channel === 'adhkar_ending' ? 'warn' : 'gold'}>
                    {when(u.at)}
                  </AppText>
                  <AppText variant="label" numberOfLines={1}>
                    {u.title}
                  </AppText>
                  <AppText variant="caption" tone="muted" numberOfLines={1}>
                    {u.body}
                  </AppText>
                </View>
              </View>
            ))
          )}
        </Block>
      )}

      <PressableScale
        onPress={async () => {
          await nativeReminders.requestPermission();
          await nativeReminders.showNow('Test reminder · اذکار', 'Reminders from Islamic Daily will look like this.');
          setTestSent(true);
          syncReminders().catch(() => {});
          setTimeout(refresh, 600);
        }}
        accessibilityRole="button"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 13,
          borderRadius: RADIUS.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.lineStrong,
          backgroundColor: c.surface,
        }}
      >
        <Icon name="sparkles" size={17} color={c.gold} />
        <AppText variant="label">{testSent ? 'Sent — check your notifications' : 'Send a test notification'}</AppText>
      </PressableScale>

      <AppText variant="caption" tone="faint" style={{ marginTop: 14, paddingHorizontal: 4, lineHeight: 18 }}>
        Reminders work offline and survive restarts. Some phones (Xiaomi/MIUI, OnePlus, Oppo) stop alarms for apps they "optimise" — if
        reminders don't arrive, allow Islamic Daily to run in the background and enable Autostart for it.
      </AppText>
    </SubScreen>
  );
}

function Warning({ text, action, onPress }: { text: string; action: string; onPress: () => void }) {
  const c = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10, padding: 14, marginBottom: 18, borderRadius: RADIUS.md, backgroundColor: c.goldSoft }}>
      <Icon name="info" size={18} color={c.warn} />
      <View style={{ flex: 1 }}>
        <AppText variant="caption" tone="secondary" style={{ lineHeight: 18 }}>
          {text}
        </AppText>
        <PressableScale onPress={onPress} accessibilityRole="button" style={{ marginTop: 6, alignSelf: 'flex-start' }}>
          <AppText variant="label" tone="gold">
            {action} ›
          </AppText>
        </PressableScale>
      </View>
    </View>
  );
}
