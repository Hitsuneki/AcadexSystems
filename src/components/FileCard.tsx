import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BG, BORDER, TEXT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatShortDate, formatFileSize } from '@/utils/date';
import { Tag } from './Tags';
import type { ProjectFile } from '@/types';

interface FileCardProps {
  file: ProjectFile;
  onPress: () => void;
  onDelete?: () => void;
}

export function FileCard({ file, onPress, onDelete }: FileCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      
      <View style={styles.left}>
        <Tag type="file" value={file.fileType} style={{ width: 44 }} />
        <Text style={styles.fileName} numberOfLines={1}>{file.fileName}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.metaText}>{formatFileSize(file.fileSize)}</Text>
        <Text style={styles.metaText}>{formatShortDate(file.uploadedAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: BG.base,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
  },
  pressed: { backgroundColor: BG.bg2 },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    flex: 1,
    fontSize: FontSize.body,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginLeft: 16,
  },
  metaText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t2,
    width: 50, // rough width for size
    textAlign: 'right',
  },
});
