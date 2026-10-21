import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { DEFAULT_SETTINGS, useSettings } from '../store/settings';
import { buildPalette, type Palette } from './palette';
import { buildScripts, type Scripts } from './scripts';

const ThemeContext = createContext<Palette>(buildPalette(true, 'emerald'));
const ScriptContext = createContext<Scripts>(buildScripts(DEFAULT_SETTINGS));

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeMode, accent, arabicFont, urduFont, arabicScale, urduScale } = useSettings();
  const scheme = useColorScheme();
  const isDark = themeMode === 'system' ? scheme !== 'light' : themeMode === 'dark';
  const palette = useMemo(() => buildPalette(isDark, accent), [isDark, accent]);
  const scripts = useMemo(
    () => buildScripts({ arabicFont, urduFont, arabicScale, urduScale }),
    [arabicFont, urduFont, arabicScale, urduScale],
  );
  return (
    <ThemeContext.Provider value={palette}>
      <ScriptContext.Provider value={scripts}>{children}</ScriptContext.Provider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

/** Arabic / Urdu text styles in the user's chosen fonts. */
export const useScripts = () => useContext(ScriptContext);

/** Memoised StyleSheet factory keyed on the palette. */
export function useStyles<T>(factory: (c: Palette) => T): T {
  const c = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(c), [c]);
}
