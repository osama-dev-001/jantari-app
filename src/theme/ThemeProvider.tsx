import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettings } from '../store/settings';
import { buildPalette, type Palette } from './palette';

const ThemeContext = createContext<Palette>(buildPalette(true, 'emerald'));

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeMode, accent } = useSettings();
  const scheme = useColorScheme();
  const isDark = themeMode === 'system' ? scheme !== 'light' : themeMode === 'dark';
  const palette = useMemo(() => buildPalette(isDark, accent), [isDark, accent]);
  return <ThemeContext.Provider value={palette}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/** Memoised StyleSheet factory keyed on the palette. */
export function useStyles<T>(factory: (c: Palette) => T): T {
  const c = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(c), [c]);
}
