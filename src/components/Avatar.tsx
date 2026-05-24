import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { BG, BORDER, TEXT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: AvatarSize;
}

const SIZE_MAP: Record<AvatarSize, number> = { sm: 20, md: 28, lg: 36, xl: 44 };
const FONT_MAP: Record<AvatarSize, number> = { sm: 10, md: 12, lg: 16, xl: 20 };

export function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const dim = SIZE_MAP[size];
  const fs = FONT_MAP[size];
  // 1 character mono initials
  const initials = name
    ? name.trim()[0].toUpperCase()
    : '?';

  const containerStyle = { width: dim, height: dim, borderRadius: 0 };

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
  image: { resizeMode: 'cover', borderWidth: 1, borderColor: BORDER.dim },
  fallback: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: BORDER.dim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: TEXT.t2,
    fontFamily: FontFamily.monoMedium,
    lineHeight: undefined,
  },
});
