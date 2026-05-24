import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BORDER } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface BadgeProps {
  label: string;
  color: string;
  bg: string;
}

export function Badge({ label, color, bg }: BadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: color === 'transparent' ? BORDER.default : color }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.mono,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
});
