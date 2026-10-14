import type { Accent } from '../store/settings';

// "Mughal Night" / "Marble Day": ink-green night surfaces and warm marble day
// surfaces, ivory/ink text, a brass-gold highlight shared by both modes, and
// one swappable accent. Gold marks *time* (countdowns, next prayer); the
// accent marks *you* (selection, progress, completion).

export type Palette = {
  isDark: boolean;
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceSunk: string;
  line: string;
  lineStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  gold: string;
  goldSoft: string;
  positive: string;
  warn: string;
  overlay: string;
  accent: string;
  accentSoft: string;
  accentLine: string;
  onAccent: string;
  hero: { from: string; to: string; text: string; sub: string; gold: string; ornament: string; track: string };
  tabBar: string;
  statusBar: 'light-content' | 'dark-content';
};

const ACCENTS: Record<Accent, { dark: string; darkOn: string; light: string }> = {
  emerald: { dark: '#4CC9A0', darkOn: '#04241A', light: '#0E7558' },
  lapis: { dark: '#8FA8FF', darkOn: '#0B1A4A', light: '#2D4CC8' },
  saffron: { dark: '#F0A35E', darkOn: '#331805', light: '#B0561D' },
  violet: { dark: '#B39BFF', darkOn: '#1E1240', light: '#6A35D0' },
};

export const ACCENT_OPTIONS: { key: Accent; label: string }[] = [
  { key: 'emerald', label: 'Emerald' },
  { key: 'lapis', label: 'Lapis' },
  { key: 'saffron', label: 'Saffron' },
  { key: 'violet', label: 'Violet' },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Linear blend of two hex colours; t=0 → a, t=1 → b. */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
}

export function alpha(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function buildPalette(isDark: boolean, accentKey: Accent): Palette {
  const a = ACCENTS[accentKey];
  if (isDark) {
    const bg = '#0B1210';
    const accent = a.dark;
    return {
      isDark,
      bg,
      surface: '#131C1A',
      surfaceAlt: '#19241F',
      surfaceSunk: '#0E1614',
      line: 'rgba(232, 214, 170, 0.08)',
      lineStrong: 'rgba(232, 214, 170, 0.16)',
      text: '#F1EEE6',
      textSecondary: '#C3C9C2',
      textMuted: '#8F9B94',
      textFaint: '#5F6C66',
      gold: '#D9B46A',
      goldSoft: 'rgba(217, 180, 106, 0.13)',
      positive: '#5FD0A0',
      warn: '#E8906E',
      overlay: 'rgba(2, 5, 4, 0.7)',
      accent,
      accentSoft: alpha(accent, 0.13),
      accentLine: alpha(accent, 0.35),
      onAccent: a.darkOn,
      hero: {
        from: mix(bg, accent, 0.26),
        to: mix(bg, accent, 0.06),
        text: '#F4F1E9',
        sub: 'rgba(241, 238, 230, 0.66)',
        gold: '#E9C87F',
        ornament: 'rgba(233, 200, 127, 0.16)',
        track: 'rgba(241, 238, 230, 0.12)',
      },
      tabBar: '#0F1715',
      statusBar: 'light-content',
    };
  }
  const accent = a.light;
  return {
    isDark,
    bg: '#F4EFE6',
    surface: '#FFFCF6',
    surfaceAlt: '#FAF5EB',
    surfaceSunk: '#ECE5D7',
    line: 'rgba(70, 55, 25, 0.10)',
    lineStrong: 'rgba(70, 55, 25, 0.18)',
    text: '#18211E',
    textSecondary: '#46524D',
    textMuted: '#6F7A75',
    textFaint: '#9EA6A1',
    gold: '#9C6F1F',
    goldSoft: 'rgba(164, 118, 36, 0.12)',
    positive: '#1E8A5E',
    warn: '#B4532F',
    overlay: 'rgba(24, 18, 8, 0.45)',
    accent,
    accentSoft: alpha(accent, 0.1),
    accentLine: alpha(accent, 0.3),
    onAccent: '#FFFFFF',
    hero: {
      from: mix(accent, '#000000', 0.42),
      to: mix(accent, '#000000', 0.1),
      text: '#FFFBF2',
      sub: 'rgba(255, 251, 242, 0.74)',
      gold: '#F2D28E',
      ornament: 'rgba(242, 210, 142, 0.2)',
      track: 'rgba(255, 251, 242, 0.2)',
    },
    tabBar: '#FFFCF6',
    statusBar: 'dark-content',
  };
}

/** The widget always uses the night palette — it sits on arbitrary wallpapers. */
export const WIDGET_COLORS = {
  bgFrom: '#0F1A17E6',
  bgTo: '#0B1210D9',
  label: '#E9C87F',
  countdown: '#F4F1E9',
  hint: '#9FAAA3',
  refresh: '#7F8B85',
  past: '#5F6C66',
  current: '#4CC9A0',
  next: '#E9C87F',
  future: '#C3C9C2',
  divider: '#E8D6AA22',
} as const;
