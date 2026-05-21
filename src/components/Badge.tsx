import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontFamily, FontSize } from '@/constants/typography';

interface BadgeProps {
  label: string;
  color: string;
  bg: string;
}

export function Badge({ label, color, bg }: BadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interSemiBold,
    letterSpacing: 0.2,
  },
});
