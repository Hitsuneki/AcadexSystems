import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BG, ACCENT } from '@/constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
}

export function ProgressBar({ progress, height = 6, color = ACCENT.blue }: ProgressBarProps) {
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
    backgroundColor: BG.bg4,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { borderRadius: 3 },
});
