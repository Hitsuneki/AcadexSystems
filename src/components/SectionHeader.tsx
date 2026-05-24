import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { TEXT, ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({ title, actionText, onAction, style }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>// {title}</Text>
      {actionText && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.label,
    color: TEXT.t3,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  action: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.monoSm,
    color: ACCENT.primary,
  },
});
