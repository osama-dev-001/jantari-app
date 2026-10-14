import React, { useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Palette } from '../theme/palette';
import { RADIUS, TYPE, type TextVariant } from '../theme/typography';

// ─── Text ────────────────────────────────────────────────────────────────────

type Tone = 'text' | 'secondary' | 'muted' | 'faint' | 'accent' | 'gold' | 'positive' | 'warn' | 'onAccent';

const toneColor = (c: Palette, tone: Tone) =>
  ({
    text: c.text,
    secondary: c.textSecondary,
    muted: c.textMuted,
    faint: c.textFaint,
    accent: c.accent,
    gold: c.gold,
    positive: c.positive,
    warn: c.warn,
    onAccent: c.onAccent,
  })[tone];

type AppTextProps = TextProps & { variant?: TextVariant; tone?: Tone; color?: string; style?: StyleProp<TextStyle> };

export function AppText({ variant = 'body', tone = 'text', color, style, ...rest }: AppTextProps) {
  const c = useTheme();
  return <Text {...rest} style={[TYPE[variant], { color: color ?? toneColor(c, tone) }, style]} />;
}

// ─── Pressable with a gentle scale-down ──────────────────────────────────────

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  /** Stretch the visual layer to the touch target's size (when the parent stretches it). */
  fill?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Styles that place the element in its parent: outer (animated) view only.
const OUTER_KEYS = new Set([
  'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf', 'margin', 'marginTop', 'marginBottom', 'marginLeft',
  'marginRight', 'marginHorizontal', 'marginVertical', 'position', 'top', 'bottom', 'left', 'right', 'zIndex', 'opacity',
]);
// Explicit sizes apply to both layers so the visual layer matches the touch target.
const SIZE_KEYS = new Set(['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight']);

/**
 * The scale animation lives on an outer view that carries only layout; all
 * visual styles (background, border, radius, padding) sit on an inner view.
 * On RN 0.85 / Fabric, updating `transform` on a view with a rounded
 * background redraws that background with square corners.
 */
export function PressableScale({ style, scaleTo = 0.97, fill, onPressIn, onPressOut, children, ...rest }: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  const [outer, inner] = useMemo(() => {
    const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
    const o: Record<string, unknown> = {};
    const i: Record<string, unknown> = fill ? { flexGrow: 1 } : {};
    for (const [k, v] of Object.entries(flat)) {
      if (OUTER_KEYS.has(k)) o[k] = v;
      else if (SIZE_KEYS.has(k)) o[k] = i[k] = v;
      else i[k] = v;
    }
    return [o as ViewStyle, i as ViewStyle];
  }, [style, fill]);
  return (
    <AnimatedPressable
      {...rest}
      style={[outer, { transform: [{ scale }] }]}
      onPressIn={e => {
        animate(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={e => {
        animate(1);
        onPressOut?.(e);
      }}
    >
      <View style={inner}>{children as React.ReactNode}</View>
    </AnimatedPressable>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({ style, children, tone = 'surface' }: { style?: StyleProp<ViewStyle>; children: React.ReactNode; tone?: 'surface' | 'sunk' }) {
  const c = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: tone === 'surface' ? c.surface : c.surfaceSunk,
          borderRadius: RADIUS.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.line,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

export function SectionHeader({ title, right, style }: { title: string; right?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }, style]}>
      <AppText variant="overline" tone="muted">
        {title}
      </AppText>
      {right}
    </View>
  );
}

// ─── Segmented control ───────────────────────────────────────────────────────

type SegOption<K extends string> = { key: K; label: string; labelStyle?: StyleProp<TextStyle> };

export function Segmented<K extends string>({
  options,
  value,
  onChange,
  style,
  compact,
}: {
  options: SegOption<K>[];
  value: K;
  onChange: (k: K) => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const c = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={[
        { flexDirection: 'row', backgroundColor: c.surfaceSunk, borderRadius: RADIUS.md, padding: 3, borderWidth: StyleSheet.hairlineWidth, borderColor: c.line },
        style,
      ]}
    >
      {options.map(o => {
        const active = o.key === value;
        return (
          <Pressable
            // Remount on selection change — see the borderRadius note in TabBar.
            key={`${o.key}-${active}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.key)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: compact ? 6 : 9,
              borderRadius: RADIUS.md - 3,
              backgroundColor: active ? c.surface : 'transparent',
              borderWidth: active ? StyleSheet.hairlineWidth : 0,
              borderColor: c.lineStrong,
            }}
          >
            <AppText variant="label" tone={active ? 'text' : 'muted'} style={o.labelStyle} numberOfLines={1}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Small pill / chip ───────────────────────────────────────────────────────

export function Pill({
  label,
  tone = 'neutral',
  style,
}: {
  label: string;
  tone?: 'neutral' | 'accent' | 'gold' | 'positive';
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const bg = { neutral: c.surfaceSunk, accent: c.accentSoft, gold: c.goldSoft, positive: c.accentSoft }[tone];
  const fg = { neutral: c.textMuted, accent: c.accent, gold: c.gold, positive: c.positive }[tone];
  return (
    <View style={[{ backgroundColor: bg, borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' }, style]}>
      <AppText variant="overline" color={fg} style={{ fontSize: 9.5, letterSpacing: 1 }}>
        {label}
      </AppText>
    </View>
  );
}

// ─── Icon button ─────────────────────────────────────────────────────────────

export function IconButton({
  onPress,
  children,
  label,
  style,
  disabled,
}: {
  onPress: () => void;
  children: React.ReactNode;
  label: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const c = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={[
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: c.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.line,
          opacity: disabled ? 0.35 : 1,
        },
        style,
      ]}
    >
      {children}
    </PressableScale>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: c.line }, style]} />;
}
