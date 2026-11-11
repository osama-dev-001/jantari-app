import type { TextStyle } from 'react-native';
import type { ArabicFont, Settings, UrduFont } from '../store/settings';

// Arabic and Urdu text use the user's chosen fonts. Each font has its own
// vertical metrics: Nastaliq needs far more line height than Naskh, and the
// same point size looks larger or smaller depending on the design, so
// `size` evens that out. Files live in android/app/src/main/assets/fonts.

type ScriptFont = {
  name: string;
  note: string;
  family: string;
  /** Multiplier so every option looks about the same size. */
  size: number;
  /** Line height for paragraphs, as a multiple of font size. */
  body: number;
  /** Line height for single-line labels, plus the vertical trim that keeps them compact. */
  labelLh: number;
  trim: number;
};

export const ARABIC_FONTS: Record<ArabicFont, ScriptFont> = {
  amiri: { name: 'Amiri', note: 'Classic Naskh', family: 'Amiri-Regular', size: 1, body: 1.85, labelLh: 1.7, trim: 0.1 },
  scheherazade: {
    name: 'Scheherazade',
    note: 'Large and very clear',
    family: 'ScheherazadeNew-Regular',
    size: 1,
    body: 2.0,
    labelLh: 1.8,
    trim: 0.15,
  },
  naskh: { name: 'Noto Naskh', note: 'Clean and modern', family: 'NotoNaskhArabic-Regular', size: 0.9, body: 1.8, labelLh: 1.6, trim: 0.1 },
  lateef: { name: 'Lateef', note: 'South Asian Naskh', family: 'Lateef-Regular', size: 1.2, body: 1.75, labelLh: 1.5, trim: 0.1 },
};

export const URDU_FONTS: Record<UrduFont, ScriptFont> = {
  nastaliq: { name: 'Noto Nastaliq', note: 'Nastaliq', family: 'NotoNastaliqUrdu-Regular', size: 1, body: 2.1, labelLh: 1.85, trim: 0.35 },
  gulzar: { name: 'Gulzar', note: 'Nastaliq, calligraphic', family: 'Gulzar-Regular', size: 1.1, body: 1.9, labelLh: 1.7, trim: 0.3 },
  naskh: { name: 'Noto Naskh', note: 'Naskh, compact', family: 'NotoNaskhArabic-Regular', size: 1, body: 1.75, labelLh: 1.5, trim: 0.1 },
};

type Opts = {
  /** Apply the user's size setting (body text only, not decorative labels). */
  scale?: boolean;
  /** Compact single-line metrics. */
  label?: boolean;
  align?: TextStyle['textAlign'];
};

function styleFor(font: ScriptFont, base: number, userScale: number, { scale, label, align }: Opts, fallbackAlign: TextStyle['textAlign']): TextStyle {
  const fontSize = Math.round(base * font.size * (scale ? userScale : 1));
  return {
    fontFamily: font.family,
    fontSize,
    lineHeight: Math.round(fontSize * (label ? font.labelLh : font.body)),
    ...(label ? { marginVertical: -Math.round(fontSize * font.trim) } : null),
    writingDirection: 'rtl',
    textAlign: align ?? fallbackAlign,
  };
}

export type Scripts = {
  arabic: (size: number, opts?: Opts) => TextStyle;
  urdu: (size: number, opts?: Opts) => TextStyle;
};

export function buildScripts(s: Pick<Settings, 'arabicFont' | 'urduFont' | 'arabicScale' | 'urduScale'>): Scripts {
  const arabic = ARABIC_FONTS[s.arabicFont];
  const urdu = URDU_FONTS[s.urduFont];
  return {
    arabic: (size, opts = {}) => styleFor(arabic, size, s.arabicScale, opts, 'center'),
    urdu: (size, opts = {}) => styleFor(urdu, size, s.urduScale, opts, 'right'),
  };
}

/** Previews in the settings picker always render at a fixed scale. */
export function previewStyle(font: ScriptFont, size: number): TextStyle {
  return styleFor(font, size, 1, {}, 'right');
}
