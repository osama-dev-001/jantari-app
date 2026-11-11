import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { PrayerStatus } from '../core/prayer/types';
import { WIDGET_COLORS as W } from '../theme/palette';
import type { WidgetModel, WidgetRow } from './model';

// RemoteViews layout rules (learned the hard way on real devices):
//  1. Inner rows need width: 'match_parent' or space-between has no room.
//  2. alignItems: 'flex-start' on an inner FlexWidget needs width: 'match_parent' too.
//  3. space-between truncates TextWidget siblings unless both texts are short.
//  4. flex: 1 around a single large TextWidget clips its top ("Δ" artefact).
//  5. The outer container must be a column with match_parent width/height.
//  6. Clickable FlexWidgets need an explicit width/height or collapse to 0×0.
//  7. No fontFamily on TextWidgets — garbles text on some devices.

const WIDE_MIN = 180; // ≈ 2+ cells wide: countdown and hint fit on one row
const TALL_MIN = 150; // ≈ 2+ rows tall
const LIST_WIDTH_MIN = 120; // below ≈ 1 cell, name + time can't share a row

const statusColor = (s: PrayerStatus) =>
  (({ past: W.past, current: W.current, next: W.next, upcoming: W.future }) as const)[s];

function windowAround(rows: WidgetRow[], pivot: number, count: number): WidgetRow[] {
  if (count >= rows.length) return rows;
  let start = Math.max(0, pivot - 1);
  if (start + count > rows.length) start = rows.length - count;
  return rows.slice(start, start + count);
}

const outer = (justifyContent: 'flex-start' | 'space-between') =>
  ({
    height: 'match_parent',
    width: 'match_parent',
    flexDirection: 'column',
    justifyContent,
    backgroundGradient: { from: W.bgFrom, to: W.bgTo, orientation: 'TL_BR' },
    borderRadius: 20,
    paddingLeft: 14,
    paddingRight: 8,
    paddingTop: 8,
    paddingBottom: 12,
  }) as const;

function Header({ label }: { label: string }) {
  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <TextWidget text={label} style={{ fontSize: 10, color: W.label }} />
      <FlexWidget clickAction="REFRESH" style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
        <TextWidget text="↻" style={{ fontSize: 17, color: W.refresh }} />
      </FlexWidget>
    </FlexWidget>
  );
}

function Countdown({ text, size }: { text: string; size: number }) {
  return <TextWidget text={text} style={{ fontSize: size, color: W.countdown }} />;
}

function Hint({ hint }: { hint: string }) {
  if (!hint) return null;
  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'flex-start' }}>
      <TextWidget text={hint} style={{ fontSize: 9, color: W.hint }} />
    </FlexWidget>
  );
}

export function PrayerWidget({ width = 200, height = 80, label, hint, countdown, rows, pivot }: WidgetModel & { width?: number; height?: number }) {
  const isWide = width >= WIDE_MIN;
  const isTall = height >= TALL_MIN;
  const countdownSize = height >= 240 ? 28 : height >= 180 ? 22 : 18;
  const listFont = width >= 160 ? 12 : 10;

  // Rounds down so the last row never clips past the bottom edge.
  const reserve = 48 + countdownSize;
  const maxRows = Math.floor((height - reserve) / (listFont + 11));
  const showList = width >= LIST_WIDTH_MIN && rows.length > 0 && maxRows >= 3;

  if (showList) {
    const visible = windowAround(rows, pivot, Math.min(maxRows, rows.length));
    return (
      <FlexWidget clickAction="OPEN_APP" style={outer('flex-start')}>
        <Header label={label} />
        <FlexWidget
          style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 4, paddingBottom: 6 }}
        >
          <Countdown text={countdown} size={countdownSize} />
          {isWide && hint ? <TextWidget text={hint} style={{ fontSize: 11, color: W.hint }} /> : null}
        </FlexWidget>
        {visible.map(r => (
          <FlexWidget key={r.name} style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center', paddingTop: 2, paddingBottom: 2 }}>
            {/* flex:1 on the name pushes the time right without space-between (rule 3). */}
            <FlexWidget style={{ flex: 1 }}>
              <TextWidget text={r.name} style={{ fontSize: listFont, color: statusColor(r.status) }} />
            </FlexWidget>
            <TextWidget text={r.time} style={{ fontSize: listFont, color: statusColor(r.status) }} />
          </FlexWidget>
        ))}
      </FlexWidget>
    );
  }

  if (isTall) {
    return (
      <FlexWidget clickAction="OPEN_APP" style={outer('space-between')}>
        <Header label={label} />
        <Countdown text={countdown} size={20} />
        <Hint hint={hint} />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget clickAction="OPEN_APP" style={outer('space-between')}>
      <Header label={label} />
      {isWide ? (
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Countdown text={countdown} size={18} />
          {hint ? <TextWidget text={hint} style={{ fontSize: 9, color: W.hint }} /> : null}
        </FlexWidget>
      ) : (
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'column' }}>
          <Countdown text={countdown} size={18} />
          <Hint hint={hint} />
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
