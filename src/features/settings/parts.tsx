import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, Switch, View } from 'react-native';
import type { RootNav } from '../../app/navigation';
import { useTheme } from '../../theme/ThemeProvider';
import { Icon, type IconName } from '../../ui/Icon';
import { Screen, ScreenTitle } from '../../ui/layout';
import { AppText, Card, IconButton, Segmented, SectionHeader } from '../../ui/primitives';

export function Row({
  icon,
  title,
  subtitle,
  right,
  onPress,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const c = useTheme();
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
      {icon && (
        <View style={{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accentSoft }}>
          <Icon name={icon} size={18} color={c.accent} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" style={{ marginTop: 1 }}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron-right" size={18} color={c.textFaint} /> : null)}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" android_ripple={{ color: c.line }}>
      {body}
    </Pressable>
  ) : (
    body
  );
}

export function Block({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <SectionHeader title={title} />
      <Card style={{ paddingHorizontal: 14, paddingVertical: 4 }}>{children}</Card>
      {note ? (
        <AppText variant="caption" tone="faint" style={{ marginTop: 8, paddingHorizontal: 4 }}>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

export function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const c = useTheme();
  return (
    <Row
      icon={icon}
      title={title}
      subtitle={subtitle}
      right={
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ true: c.accentLine, false: c.surfaceSunk }}
          thumbColor={value ? c.accent : c.textFaint}
          accessibilityLabel={title}
        />
      }
    />
  );
}

/** A labelled segmented choice inside a Block. */
export function ChoiceRow<K extends string>({
  title,
  hint,
  value,
  options,
  onChange,
  disabled,
}: {
  title: string;
  hint?: string;
  value: K;
  options: { key: K; label: string }[];
  onChange: (k: K) => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ paddingVertical: 12, opacity: disabled ? 0.45 : 1 }} pointerEvents={disabled ? 'none' : 'auto'}>
      <AppText variant="bodyStrong" style={{ marginBottom: 8 }}>
        {title}
      </AppText>
      <Segmented<K> value={value} onChange={onChange} options={options} />
      {hint ? (
        <AppText variant="caption" tone="faint" style={{ marginTop: 8 }}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

/** Screen pushed from Settings, with a back button. */
export function SubScreen({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const c = useTheme();
  const nav = useNavigation<RootNav>();
  return (
    <Screen
      header={
        <ScreenTitle
          title={title}
          subtitle={subtitle}
          left={
            <IconButton label="Back" onPress={() => nav.goBack()}>
              <Icon name="arrow-left" size={20} color={c.text} />
            </IconButton>
          }
        />
      }
    >
      {children}
    </Screen>
  );
}
