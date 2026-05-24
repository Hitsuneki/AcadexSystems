import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BG, ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface LoadingSpinnerProps {
  fullscreen?: boolean;
  size?: 'small' | 'large';
}

export function LoadingSpinner({ fullscreen = false }: LoadingSpinnerProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true })
      ])
    ).start();
  }, [opacity]);

  const Content = () => (
    <View style={styles.content}>
      <Text style={styles.text}>LOADING</Text>
      <Animated.Text style={[styles.cursor, { opacity }]}>_</Animated.Text>
    </View>
  );

  if (fullscreen) {
    return (
      <View style={styles.fullscreen}>
        <Content />
      </View>
    );
  }
  
  return (
    <View style={styles.inline}>
      <Content />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: BG.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.monoSm,
    color: ACCENT.primary,
    letterSpacing: 2,
  },
  cursor: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.monoSm,
    color: ACCENT.primary,
  },
});
