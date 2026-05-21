import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { BG, ACCENT } from '@/constants/colors';

interface LoadingSpinnerProps {
  fullscreen?: boolean;
  size?: 'small' | 'large';
}

export function LoadingSpinner({ fullscreen = false, size = 'large' }: LoadingSpinnerProps) {
  if (fullscreen) {
    return (
      <View style={styles.fullscreen}>
        <ActivityIndicator size={size} color={ACCENT.blue} />
      </View>
    );
  }
  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={ACCENT.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: BG.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
