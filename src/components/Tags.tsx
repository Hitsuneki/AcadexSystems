import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { FontFamily, FontSize } from '@/constants/typography';
import { TEXT, SEMANTIC, ACCENT, PRIORITY_COLORS, FILE_TYPE_COLORS } from '@/constants/colors';
import type { Priority, FileType } from '@/types';

type TagType = 'priority' | 'status' | 'file' | 'generic';

interface TagsProps {
  type: TagType;
  value: string;
  style?: ViewStyle;
}

export function Tag({ type, value, style }: TagsProps) {
  let color = TEXT.t3;

  if (type === 'priority') {
    const p = value.toLowerCase() as Priority;
    color = PRIORITY_COLORS[p]?.text || TEXT.t3;
  } else if (type === 'file') {
    const f = value.toLowerCase() as FileType;
    color = FILE_TYPE_COLORS[f]?.text || TEXT.t3;
  } else if (type === 'status') {
    const v = value.toUpperCase();
    if (v === 'ACTIVE' || v === 'DONE') color = ACCENT.primary;
    else if (v === 'PENDING') color = SEMANTIC.amber;
    else if (v === 'CANCELLED') color = SEMANTIC.red;
  } else if (type === 'generic') {
    color = TEXT.t2;
  }

  return (
    <Text style={[styles.text, { color }, style]}>
      [{value.toUpperCase()}]
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.monoSm,
  },
});
