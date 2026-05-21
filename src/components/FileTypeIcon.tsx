import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FILE_TYPE_COLORS } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import type { FileType } from '@/types';

const FILE_LABELS: Record<FileType, string> = {
  pdf: 'PDF',
  docx: 'DOC',
  pptx: 'PPT',
  jpg: 'IMG',
  png: 'IMG',
  txt: 'TXT',
};

interface FileTypeIconProps {
  fileType: FileType;
  size?: number;
}

export function FileTypeIcon({ fileType, size = 36 }: FileTypeIconProps) {
  const { text, bg } = FILE_TYPE_COLORS[fileType];
  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: bg, borderRadius: 6 }]}>
      <Text style={[styles.label, { color: text, fontSize: size < 30 ? FontSize.xs : FontSize.sm }]}>
        {FILE_LABELS[fileType]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: FontFamily.interBold, letterSpacing: 0.5 },
});
