import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function JantariWidget({ city, currentSalah, nextSalah, nextTime, countdown }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1a0f2e',
        borderRadius: 16,
        padding: 14,
      }}
    >
      {/* Left — Current Salah */}
      <FlexWidget
        style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}
      >
        <TextWidget
          text={city.toUpperCase()}
          style={{ fontSize: 9, color: '#6b7280', fontFamily: 'sans-serif-medium', letterSpacing: 1 }}
        />
        <TextWidget
          text={currentSalah || '—'}
          style={{ fontSize: 22, color: '#a78bfa', fontFamily: 'sans-serif-medium' }}
        />
      </FlexWidget>

      {/* Divider */}
      <FlexWidget
        style={{
          width: 1, height: 'match_parent',
          backgroundColor: '#3b1f6e',
          marginHorizontal: 10,
        }}
      />

      {/* Right — Countdown only */}
      <FlexWidget
        style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}
      >
        <TextWidget
          text="NEXT"
          style={{ fontSize: 9, color: '#6b7280', fontFamily: 'sans-serif-medium', letterSpacing: 2 }}
        />
        <TextWidget
          text={countdown}
          style={{ fontSize: 16, color: '#34d399', fontFamily: 'sans-serif-medium' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}