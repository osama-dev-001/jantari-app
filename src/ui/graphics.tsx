import React, { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Pattern, Polygon, Rect, Stop } from 'react-native-svg';

// ─── Eight-point star (khatam) lattice ───────────────────────────────────────

function starPoints(cx: number, cy: number, R: number): string {
  // {8/2} star: two overlapping squares. Inner vertices sit at R·cos45°/cos22.5°.
  const r = (R * Math.cos(Math.PI / 4)) / Math.cos(Math.PI / 8);
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

const TILE = 44;
const STAR = starPoints(TILE / 2, TILE / 2, 12);
const SMALL = starPoints(0, 0, 5);

/** Tiled geometric lattice, drawn with hairlines; place absolutely behind content. */
export function StarLattice({ color, style, tile = TILE }: { color: string; style?: StyleProp<ViewStyle>; tile?: number }) {
  const id = useId().replace(/:/g, '');
  const s = tile / TILE;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id={`p${id}`} patternUnits="userSpaceOnUse" width={tile} height={tile}>
            <G transform={`scale(${s})`} stroke={color} strokeWidth={1 / s} fill="none">
              <Polygon points={STAR} />
              <Line x1={TILE / 2} y1={0} x2={TILE / 2} y2={TILE / 2 - 12} />
              <Line x1={TILE / 2} y1={TILE / 2 + 12} x2={TILE / 2} y2={TILE} />
              <Line x1={0} y1={TILE / 2} x2={TILE / 2 - 12} y2={TILE / 2} />
              <Line x1={TILE / 2 + 12} y1={TILE / 2} x2={TILE} y2={TILE / 2} />
              {[
                [0, 0],
                [TILE, 0],
                [0, TILE],
                [TILE, TILE],
              ].map(([x, y]) => (
                <Polygon key={`${x}-${y}`} points={SMALL} transform={`translate(${x} ${y})`} />
              ))}
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#p${id})`} />
      </Svg>
    </View>
  );
}

/** A single star used as a divider glyph or badge. */
export function Star({ size = 12, color, fill }: { size?: number; color: string; fill?: string }) {
  return (
    <Svg width={size} height={size} viewBox="-6 -6 12 12">
      <Polygon points={starPoints(0, 0, 5.4)} stroke={color} strokeWidth={0.9} fill={fill ?? 'none'} />
    </Svg>
  );
}

export function OrnamentDivider({ color, style }: { color: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
      <Star size={10} color={color} />
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color }} />
    </View>
  );
}

// ─── Gradient fill ───────────────────────────────────────────────────────────

export function GradientFill({
  from,
  to,
  angle = 'diagonal',
  radius = 0,
}: {
  from: string;
  to: string;
  angle?: 'vertical' | 'diagonal';
  radius?: number;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={`g${id}`} x1="0" y1="0" x2={angle === 'diagonal' ? '1' : '0'} y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#g${id})`} />
      </Svg>
    </View>
  );
}

// ─── Progress ring ───────────────────────────────────────────────────────────

export function ProgressRing({
  size,
  stroke,
  progress,
  color,
  track,
  children,
  bead,
}: {
  size: number;
  stroke: number;
  progress: number;
  color: string;
  track: string;
  children?: React.ReactNode;
  /** Draws a bead at the head of the arc, like a tasbih. */
  bead?: string;
}) {
  const r = (size - stroke) / 2 - (bead ? 3 : 0);
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  const angle = p * 2 * Math.PI - Math.PI / 2;
  const cx = size / 2 + r * Math.cos(angle);
  const cy = size / 2 + r * Math.sin(angle);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {p > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={c * (1 - p)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
        {bead && p > 0 && p < 1 && <Circle cx={cx} cy={cy} r={stroke / 2 + 3} fill={bead} />}
      </Svg>
      {children}
    </View>
  );
}

// ─── Qibla dial ──────────────────────────────────────────────────────────────

export function QiblaDial({
  size,
  bearing,
  ring,
  text,
  accent,
  gold,
}: {
  size: number;
  bearing: number;
  ring: string;
  text: string;
  accent: string;
  gold: string;
}) {
  const c = size / 2;
  const r = c - 6;
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  return (
    <Svg width={size} height={size}>
      <Circle cx={c} cy={c} r={r} stroke={ring} strokeWidth={1} fill="none" />
      {ticks.map(t => {
        const a = ((t - 90) * Math.PI) / 180;
        const len = t % 90 === 0 ? 9 : t % 30 === 0 ? 6 : 3;
        return (
          <Line
            key={t}
            x1={c + (r - len) * Math.cos(a)}
            y1={c + (r - len) * Math.sin(a)}
            x2={c + r * Math.cos(a)}
            y2={c + r * Math.sin(a)}
            stroke={t === 0 ? accent : ring}
            strokeWidth={t % 90 === 0 ? 1.6 : 1}
          />
        );
      })}
      <G transform={`rotate(${bearing} ${c} ${c})`}>
        <Path d={`M${c} ${c - r + 14} L${c + 7} ${c} L${c} ${c - 6} L${c - 7} ${c} Z`} fill={gold} />
        <Line x1={c} y1={c} x2={c} y2={c + r * 0.45} stroke={text} strokeWidth={1.4} strokeOpacity={0.35} />
      </G>
      <Circle cx={c} cy={c} r={3.5} fill={text} />
    </Svg>
  );
}
