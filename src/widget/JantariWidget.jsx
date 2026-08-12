import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

// ── palette ──
// Translucent dark fill so the wallpaper shows through (no real backdrop blur is
// possible in an Android RemoteViews widget — this is the closest approximation).
const BG = '#1a0f2e8C'; // ~55% opaque dark purple
const LABEL = '#a78bfa';
const COUNTDOWN = '#34d399';
const HINT = '#4b5563';
const REFRESH = '#6b7280';
const PAST = '#6b7280';
const FUTURE = '#9ca3af';

// ── size buckets (dp) ──
const WIDE_MIN = 180;   // ≈ ≥ 2 cells wide — inline countdown+hint
const TALL_MIN = 150;   // ≈ ≥ 2 rows tall
const LIST_WIDTH_MIN = 120; // below this (≈ 1 cell) name+time can't fit even shrunk

function statusColor(status) {
  if (status === 'current') return LABEL;
  if (status === 'next') return COUNTDOWN;
  if (status === 'past') return PAST;
  return FUTURE;
}

// Window `count` items around the pivot, always including one previous when possible.
function visibleWindow(schedule, pivotIndex, count) {
  if (count >= schedule.length) return schedule;
  let start = Math.max(0, pivotIndex - 1);
  if (start + count > schedule.length) start = schedule.length - count;
  return schedule.slice(Math.max(0, start), Math.max(0, start) + count);
}

const outerStyle = (justify) => ({
  height: 'match_parent',
  width: 'match_parent',
  flexDirection: 'column',
  justifyContent: justify,
  backgroundColor: BG,
  borderRadius: 16,
  paddingLeft: 14,
  paddingRight: 8,
  paddingTop: 8,
  paddingBottom: 12,
});

// Top row: LABEL + ↻. Both short, so space-between is safe (rule #3).
function Header({ label }) {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <TextWidget text={label} style={{ fontSize: 10, color: LABEL }} />
      <FlexWidget
        clickAction="WIDGET_CLICK"
        style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
      >
        <TextWidget text="↻" style={{ fontSize: 18, color: REFRESH }} />
      </FlexWidget>
    </FlexWidget>
  );
}

function CountdownText({ countdown, fontSize }) {
  return <TextWidget text={countdown} style={{ fontSize, color: COUNTDOWN }} />;
}

function HintRow({ hint, fontSize }) {
  if (!hint) return null;
  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'flex-start' }}>
      <TextWidget text={hint} style={{ fontSize, color: HINT }} />
    </FlexWidget>
  );
}

export function JantariWidget({
  width = 200,
  height = 80,
  label,
  hint,
  countdown,
  schedule = [],
  pivotIndex = 0,
}) {
  const isWide = width >= WIDE_MIN;
  const isTall = height >= TALL_MIN;

  const countdownFont = height >= 240 ? 28 : height >= 180 ? 22 : 18;
  const listFont = width >= 160 ? 12 : 10; // shrink on narrow (e.g. 5-col 2-cell) tiles

  // Reserve = outer padding + header + countdown line; row height tracks the list font.
  // Kept conservative (rounds down) so the last row never clips past the bottom edge.
  const listWidthOK = width >= LIST_WIDTH_MIN;
  const reserve = 48 + countdownFont;
  const rowH = listFont + 11;
  const maxRows = Math.floor((height - reserve) / rowH);
  const showList = listWidthOK && schedule.length > 0 && maxRows >= 3;

  // ── Expanded: header + big countdown + a height-driven window of the schedule ──
  if (showList) {
    const rows = visibleWindow(schedule, pivotIndex, Math.min(maxRows, schedule.length));
    return (
      <FlexWidget clickAction="OPEN_APP" style={outerStyle('flex-start')}>
        <Header label={label} />

        <FlexWidget
          style={{
            width: 'match_parent',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: 4,
            paddingBottom: 6,
          }}
        >
          <CountdownText countdown={countdown} fontSize={countdownFont} />
          {isWide && hint ? <TextWidget text={hint} style={{ fontSize: 11, color: HINT }} /> : null}
        </FlexWidget>

        {rows.map((p) => (
          <FlexWidget
            key={p.name}
            style={{
              width: 'match_parent',
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 2,
              paddingBottom: 2,
            }}
          >
            {/* flex:1 name pushes time to the right without space-between (rule #3-safe) */}
            <FlexWidget style={{ flex: 1 }}>
              <TextWidget text={p.name} style={{ fontSize: listFont, color: statusColor(p.status) }} />
            </FlexWidget>
            <TextWidget text={p.timeStr} style={{ fontSize: listFont, color: statusColor(p.status) }} />
          </FlexWidget>
        ))}
      </FlexWidget>
    );
  }

  // ── Tall + narrow (e.g. 1×4) → stacked compact, no name/time list ──
  if (isTall) {
    return (
      <FlexWidget clickAction="OPEN_APP" style={outerStyle('space-between')}>
        <Header label={label} />
        <CountdownText countdown={countdown} fontSize={20} />
        <HintRow hint={hint} fontSize={9} />
      </FlexWidget>
    );
  }

  // ── Compact (single-row height) ──
  return (
    <FlexWidget clickAction="OPEN_APP" style={outerStyle('space-between')}>
      <Header label={label} />

      {isWide ? (
        // Wide 2-cell: countdown + hint inline (proven 4×n design)
        <FlexWidget
          style={{
            width: 'match_parent',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <CountdownText countdown={countdown} fontSize={18} />
          {hint ? <TextWidget text={hint} style={{ fontSize: 9, color: HINT }} /> : null}
        </FlexWidget>
      ) : (
        // Narrow (e.g. 5×n): stack so the hint never truncates (rule #3)
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'column' }}>
          <CountdownText countdown={countdown} fontSize={18} />
          <HintRow hint={hint} fontSize={9} />
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
