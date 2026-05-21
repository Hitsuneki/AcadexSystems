import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ACCENT, TEXT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: AvatarSize;
}

const SIZE_MAP: Record<AvatarSize, number> = { sm: 24, md: 32, lg: 40, xl: 56 };
const FONT_MAP: Record<AvatarSize, number> = { sm: 9, md: 11, lg: 14, xl: 18 };

export function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const dim = SIZE_MAP[size];
  const fs = FONT_MAP[size];
  const initials = name
    ? name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const containerStyle = { width: dim, height: dim, borderRadius: dim / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, containerStyle]} />;
  }

  return (
    <View style={[styles.fallback, containerStyle]}>
      <Text style={[styles.initials, { fontSize: fs }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { resizeMode: 'cover' },
  fallback: {
    backgroundColor: ACCENT.blueDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: ACCENT.blue,
    fontFamily: FontFamily.interSemiBold,
    lineHeight: undefined,
  },
});
