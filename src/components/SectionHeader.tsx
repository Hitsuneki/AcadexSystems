import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TEXT, ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  title: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interSemiBold,
    color: TEXT.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  action: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interMedium,
    color: ACCENT.blue,
  },
});
