import React, { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/app/navigation';
import { adhkarCache, refreshAdhkar } from './src/store/adhkarLibrary';
import { flushAllStores } from './src/store/persisted';
import { dhikrStore, tasbihStore } from './src/store/progress';
import { syncReminders } from './src/store/reminderSync';
import { settingsStore, useSettings } from './src/store/settings';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { refreshWidgets } from './src/widget/taskHandler';

/** Keeps widgets and scheduled reminders current while the app is open, and saves on exit. */
function BackgroundSync() {
  const settings = useSettings();

  useEffect(() => {
    refreshWidgets();
    syncReminders().catch(() => {});
  }, [settings]);

  // Progress (and a new adhkar list from the server) changes reminder text and
  // can end a window early; batch rapid taps.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const resync = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => syncReminders().catch(() => {}), 3000);
    };
    const unsubscribers = [dhikrStore.subscribe(resync), adhkarCache.subscribe(resync)];
    return () => {
      unsubscribers.forEach(u => u());
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Fetch the latest adhkar when online: at launch, then on return (throttled).
  useEffect(() => {
    refreshAdhkar();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') refreshWidgets();
    }, 60_000);
    const sub = AppState.addEventListener('change', s => {
      if (s !== 'active') {
        flushAllStores();
        refreshWidgets();
      } else {
        refreshAdhkar();
      }
      syncReminders().catch(() => {});
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  return null;
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([settingsStore.load(), dhikrStore.load(), tasbihStore.load(), adhkarCache.load()]).finally(() =>
      setReady(true),
    );
  }, []);

  useEffect(() => {
    if (ready) BootSplash.hide({ fade: true });
  }, [ready]);

  // The splash screen stays up until saved settings are loaded, so the app
  // never flashes the default city or theme.
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppNavigator />
          <BackgroundSync />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
