import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer, type LinkingOptions, type NavigatorScreenParams } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets, type StackNavigationProp } from '@react-navigation/stack';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DhikrCounterScreen } from '../features/dhikr/DhikrCounterScreen';
import { DhikrListScreen, type DhikrListKey } from '../features/dhikr/DhikrListScreen';
import { TasbihScreen } from '../features/dhikr/TasbihScreen';
import { WidgetPreviewScreen } from '../features/dev/WidgetPreviewScreen';
import { CityPickerScreen } from '../features/prayer/CityPicker';
import { PrayerScreen } from '../features/prayer/PrayerScreen';
import { FontSettingsScreen } from '../features/settings/FontSettingsScreen';
import { RemindersScreen } from '../features/settings/RemindersScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { TodayScreen } from '../features/today/TodayScreen';
import { useTheme } from '../theme/ThemeProvider';
import { Icon, type IconName } from '../ui/Icon';
import { AppText } from '../ui/primitives';

export type TabParams = { Today: undefined; Prayer: undefined; Dhikr: undefined; Settings: undefined };

export type RootStackParams = {
  Tabs: NavigatorScreenParams<TabParams>;
  DhikrCounter: { list: DhikrListKey; id: string };
  Tasbih: undefined;
  CityPicker: undefined;
  FontSettings: undefined;
  Reminders: undefined;
  WidgetPreview: undefined;
};

export type RootNav = StackNavigationProp<RootStackParams>;

// Reminder notifications open islamicdaily://dhikr or islamicdaily://today.
const linking: LinkingOptions<RootStackParams> = {
  prefixes: ['islamicdaily://'],
  config: { screens: { Tabs: { screens: { Today: 'today', Prayer: 'prayer', Dhikr: 'dhikr', Settings: 'settings' } }, Reminders: 'reminders' } },
};

const Tab = createBottomTabNavigator<TabParams>();
const Stack = createStackNavigator<RootStackParams>();

const TAB_META: Record<keyof TabParams, { icon: IconName; label: string }> = {
  Today: { icon: 'house', label: 'Today' },
  Prayer: { icon: 'mosque', label: 'Prayer' },
  Dhikr: { icon: 'beads', label: 'Dhikr' },
  Settings: { icon: 'settings', label: 'Settings' },
};

function TabBar({ state, navigation }: BottomTabBarProps) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: c.tabBar,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: c.lineStrong,
        paddingBottom: insets.bottom,
      }}
    >
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const meta = TAB_META[route.name as keyof TabParams];
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.label}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={{ flex: 1, alignItems: 'center', paddingTop: 8, paddingBottom: 8 }}
          >
            {/* Keyed so the highlight remounts: Fabric drops borderRadius when a
                background appears on an already-mounted view. */}
            <View
              key={focused ? "on" : "off"}
              style={{
                width: 56,
                height: 30,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? c.accentSoft : 'transparent',
              }}
            >
              <Icon name={meta.icon} size={21} color={focused ? c.accent : c.textMuted} strokeWidth={focused ? 2 : 1.7} />
            </View>
            <AppText variant="caption" color={focused ? c.accent : c.textMuted} style={{ marginTop: 3, fontSize: 11 }}>
              {meta.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const renderTabBar = (props: BottomTabBarProps) => <TabBar {...props} />;

function Tabs() {
  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={{ headerShown: false, lazy: true }}>
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Prayer" component={PrayerScreen} />
      <Tab.Screen name="Dhikr" component={DhikrListScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const c = useTheme();
  const navTheme = useMemo(() => {
    const base = c.isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: { ...base.colors, background: c.bg, card: c.surface, text: c.text, border: c.line, primary: c.accent, notification: c.gold },
    };
  }, [c]);

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: c.bg },
          ...TransitionPresets.SlideFromRightIOS,
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="DhikrCounter" component={DhikrCounterScreen} />
        <Stack.Screen name="Tasbih" component={TasbihScreen} />
        <Stack.Screen name="CityPicker" component={CityPickerScreen} />
        <Stack.Screen name="FontSettings" component={FontSettingsScreen} />
        <Stack.Screen name="Reminders" component={RemindersScreen} />
        {__DEV__ && <Stack.Screen name="WidgetPreview" component={WidgetPreviewScreen} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
