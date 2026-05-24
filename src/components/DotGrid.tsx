import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const DOT_SIZE = 3;
const DOT_RADIUS = 1.5;
const DOT_MARGIN = 3;

const COLOR_LIT = '#00FF88';
const COLOR_DIM = '#1E1E1E';

interface DotGridProps {
  rows?: number;
  cols?: number;
}

type DotConfig = {
  isLit: boolean;
  durationMin: number;
  durationMax: number;
  startDelay: number;
};

function AnimatedDot({ config }: { config: DotConfig }) {
  const opacity = useRef(new Animated.Value(config.isLit ? 1 : 0.08)).current;

  useEffect(() => {
    const duration = config.durationMin + Math.random() * (config.durationMax - config.durationMin);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: config.isLit ? 0.15 : 0.04,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: config.isLit ? 1 : 0.12,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    );

    const timeout = setTimeout(() => {
      pulse.start();
    }, config.startDelay);

    return () => {
      clearTimeout(timeout);
      pulse.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: config.isLit ? COLOR_LIT : COLOR_DIM,
          opacity,
        },
      ]}
    />
  );
}

// Pre-compute all dot configs once (stable across renders)
function buildConfigs(rows: number, cols: number): DotConfig[] {
  const total = rows * cols;
  return Array.from({ length: total }, () => ({
    isLit: Math.random() > 0.65, // ~35% lit dots
    durationMin: 1800,
    durationMax: 3200,
    startDelay: Math.random() * 2000,
  }));
}

export function DotGrid({ rows = 6, cols = 28 }: DotGridProps) {
  const configs = useRef<DotConfig[]>(buildConfigs(rows, cols));

  return (
    <View style={[styles.grid, { opacity: 0.4 }]} pointerEvents="none">
      {Array.from({ length: rows }, (_, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {Array.from({ length: cols }, (_, colIdx) => {
            const dotIndex = rowIdx * cols + colIdx;
            return (
              <AnimatedDot
                key={colIdx}
                config={configs.current[dotIndex]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_RADIUS,
    margin: DOT_MARGIN,
  },
});
