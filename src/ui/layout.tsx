import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { RADIUS } from '../theme/typography';
import { AppText } from './primitives';

export const GUTTER = 20;

export function ThemedStatusBar() {
  const c = useTheme();
  // Edge-to-edge: the bar is always transparent; only the icon colour is ours to set.
  return <StatusBar barStyle={c.statusBar} />;
}

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  /** Rendered above the scroll area, outside of it (e.g. a sticky segmented control). */
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

export function Screen({ children, scroll = true, contentStyle, header, footer }: ScreenProps) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ThemedStatusBar />
      <View style={{ height: insets.top }} />
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[{ paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 32 }, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
      )}
      {footer}
    </View>
  );
}

export function ScreenTitle({
  title,
  subtitle,
  right,
  left,
  style,
}: {
  title: string;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  left?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: GUTTER, paddingTop: 6, paddingBottom: 12 }, style]}>
      {left}
      <View style={{ flex: 1 }}>
        <AppText variant="title" numberOfLines={1}>
          {title}
        </AppText>
        {typeof subtitle === 'string' ? (
          <AppText variant="caption" tone="muted" style={{ marginTop: 2 }} numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : (
          subtitle
        )}
      </View>
      {right}
    </View>
  );
}

// ─── Bottom sheet ────────────────────────────────────────────────────────────

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  scroll?: boolean;
};

/** Edge-to-edge windows (incl. Modals) don't resize for the keyboard, so sheets lift themselves. */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

export function Sheet({ visible, onClose, title, children, scroll = true }: SheetProps) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();
  const [mounted, setMounted] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(anim, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(
        ({ finished }) => finished && setMounted(false),
      );
    }
  }, [visible, anim]);

  if (!mounted) return null;
  const Body = scroll ? ScrollView : View;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.overlay, opacity: anim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '86%',
          backgroundColor: c.surface,
          borderTopLeftRadius: RADIUS.xl,
          borderTopRightRadius: RADIUS.xl,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.lineStrong,
          paddingBottom: Math.max(insets.bottom, keyboard) + 12,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }],
        }}
      >
        <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.lineStrong }} />
        </View>
        {title ? (
          <AppText variant="overline" tone="muted" style={{ paddingHorizontal: GUTTER, paddingTop: 6, paddingBottom: 12 }}>
            {title}
          </AppText>
        ) : null}
        <Body
          {...(scroll
            ? { contentContainerStyle: { paddingHorizontal: GUTTER, paddingBottom: 8 }, keyboardShouldPersistTaps: 'handled' as const }
            : { style: { paddingHorizontal: GUTTER } })}
        >
          {children}
        </Body>
      </Animated.View>
    </Modal>
  );
}
