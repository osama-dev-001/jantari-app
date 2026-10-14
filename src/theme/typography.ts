import type { TextStyle } from 'react-native';

// Font files live in android/app/src/main/assets/fonts; on Android the
// family name is the file name. Weight is chosen by family, never by
// fontWeight, which would make Android synthesise a fake bold.
export const FONTS = {
  regular: 'Manrope-Regular',
  medium: 'Manrope-Medium',
  semibold: 'Manrope-SemiBold',
  bold: 'Manrope-Bold',
  extrabold: 'Manrope-ExtraBold',
  display: 'Fraunces-SemiBold',
  displayBold: 'Fraunces-Bold',
  arabic: 'Amiri-Regular',
  arabicBold: 'Amiri-Bold',
  urdu: 'NotoNastaliqUrdu-Regular',
} as const;

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'overline'
  | 'number';

export const TYPE: Record<TextVariant, TextStyle> = {
  display: { fontFamily: FONTS.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.3 },
  title: { fontFamily: FONTS.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.2 },
  heading: { fontFamily: FONTS.bold, fontSize: 18, lineHeight: 24 },
  subheading: { fontFamily: FONTS.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: FONTS.semibold, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: FONTS.semibold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: FONTS.medium, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: FONTS.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.4, textTransform: 'uppercase' },
  number: { fontFamily: FONTS.extrabold, fontSize: 15, fontVariant: ['tabular-nums'] },
};

/** Nastaliq has very tall ascenders/descenders; it clips unless given generous line height. */
export const urduStyle = (size: number): TextStyle => ({
  fontFamily: FONTS.urdu,
  fontSize: size,
  lineHeight: Math.round(size * 2.1),
  writingDirection: 'rtl',
  textAlign: 'right',
});

export const arabicStyle = (size: number): TextStyle => ({
  fontFamily: FONTS.arabic,
  fontSize: size,
  lineHeight: Math.round(size * 1.85),
  writingDirection: 'rtl',
  textAlign: 'center',
});

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;
export const RADIUS = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;
