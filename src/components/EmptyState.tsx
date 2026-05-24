import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BG, TEXT, ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface EmptyStateProps {
  icon?: string; // unused but kept for prop compat
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyState({ title, action, onAction }: EmptyStateProps) {
  // Use the requested technical format
  return (
    <View style={styles.container}>
      <Text style={styles.label}>// NO.DATA.FOUND</Text>
      <Text style={styles.display}>[ EMPTY ]</Text>
      {action && onAction && (
        <Pressable onPress={onAction} style={styles.button}>
          <Text style={styles.buttonText}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    gap: 16,
    // Add dot matrix background pattern here if image asset exists, 
    // for now we stick to dark background
  },
  label: {
    fontSize: FontSize.label,
    fontFamily: FontFamily.interMedium,
    color: TEXT.t3,
    letterSpacing: 1.5,
  },
  display: {
    fontSize: FontSize.monoLg,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t2,
    marginBottom: 8,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: ACCENT.primary,
  },
});
