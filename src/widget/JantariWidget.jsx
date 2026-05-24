import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function JantariWidget({ city, currentSalah, nextSalah, nextTime, countdown }) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: '#0f1923',
        borderRadius: 16,
        padding: 12,
      }}
    >
      <TextWidget
        text={city.toUpperCase()}
        style={{ fontSize: 10, color: '#6b7280', fontFamily: 'sans-serif-medium', letterSpacing: 1 }}
      />

      <TextWidget
        text={nextSalah}
        style={{ fontSize: 18, color: '#ffffff', fontFamily: 'sans-serif-medium' }}
      />

      <TextWidget
        text={nextTime}
        style={{ fontSize: 13, color: '#a78bfa', fontFamily: 'sans-serif' }}
      />

      <TextWidget
        text={countdown}
        style={{ fontSize: 12, color: '#34d399', fontFamily: 'sans-serif-medium' }}
      />
    </FlexWidget>
  );
}