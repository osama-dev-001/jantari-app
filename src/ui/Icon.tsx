import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';
import { LUCIDE, type IconElement } from './icons/lucide';

// Two glyphs Lucide doesn't have, drawn on the same 24×24 / round-stroke grid.
const beads: IconElement[] = Array.from({ length: 10 }, (_, i): IconElement => {
  const a = ((-90 + i * 36) * Math.PI) / 180;
  return ['circle', { cx: (12 + 6 * Math.cos(a)).toFixed(2), cy: (9.5 + 6 * Math.sin(a)).toFixed(2), r: '1.3' }];
});

const CUSTOM: Record<string, IconElement[]> = {
  mosque: [
    ['circle', { cx: '12', cy: '3.6', r: '1' }],
    ['path', { d: 'M12 4.6v2.9' }],
    ['path', { d: 'M7 12.5a5 5 0 0 1 10 0' }],
    ['path', { d: 'M5.5 21v-8.5h13V21' }],
    ['path', { d: 'M10 21v-3a2 2 0 0 1 4 0v3' }],
    ['path', { d: 'M3 21v-9l1-2 1 2v9' }],
    ['path', { d: 'M19 21v-9l1-2 1 2v9' }],
    ['path', { d: 'M2 21h20' }],
  ],
  beads: [...beads, ['path', { d: 'M12 16.8v2.4' }], ['path', { d: 'M10.6 22l1.4-2.8 1.4 2.8' }]],
  kaaba: [
    ['path', { d: 'M4 8l8-3.5L20 8v10l-8 3.5L4 18z' }],
    ['path', { d: 'M4 8l8 3.5L20 8' }],
    ['path', { d: 'M12 11.5v10' }],
    ['path', { d: 'M4 10.5l8 3.5 8-3.5' }],
  ],
};

const ICONS = { ...LUCIDE, ...CUSTOM } as Record<string, IconElement[]>;

export type IconName = keyof typeof LUCIDE | 'mosque' | 'beads' | 'kaaba';

const ELEMENTS = { path: Path, circle: Circle, rect: Rect, line: Line, polyline: Polyline, polygon: Polygon, ellipse: Ellipse };

type Props = { name: IconName; size?: number; color: string; strokeWidth?: number; fill?: string };

export function Icon({ name, size = 22, color, strokeWidth = 1.8, fill = 'none' }: Props) {
  const elements = ICONS[name] ?? [];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {elements.map(([tag, attrs], i) => {
        const El = ELEMENTS[tag] as unknown as React.ComponentType<Record<string, string | number>>;
        return <El key={i} {...attrs} />;
      })}
    </Svg>
  );
}
