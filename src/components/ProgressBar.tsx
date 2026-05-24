import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BG, ACCENT, BORDER } from '@/constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
}

export function ProgressBar({ progress, height = 8, color = ACCENT.signal }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: BG.bg0,
    borderWidth: 1,
    borderColor: BORDER.default,
    borderRadius: 0,
    overflow: 'hidden',
  },
  fill: { borderRadius: 0 },
});
