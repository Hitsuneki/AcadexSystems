import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, BORDER, TEXT } from '@/constants/colors';
import { CardDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatDate, formatFileSize } from '@/utils/date';
import { FileTypeIcon } from './FileTypeIcon';
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
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <FileTypeIcon fileType={file.fileType} size={40} />
      <View style={styles.info}>
        <Text style={styles.fileName} numberOfLines={1}>{file.fileName}</Text>
        <Text style={styles.meta}>
          {formatFileSize(file.fileSize)} · {formatDate(file.uploadedAt)}
        </Text>
      </View>
      {onDelete ? (
        <Pressable onPress={onDelete} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="trash-outline" size={16} color={TEXT.muted} />
        </Pressable>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={TEXT.muted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CardDefaults.backgroundColor,
    borderRadius: CardDefaults.borderRadius,
    borderWidth: CardDefaults.borderWidth,
    borderColor: CardDefaults.borderColor,
    padding: CardDefaults.padding,
    gap: 12,
    marginBottom: 8,
  },
  pressed: { opacity: 0.75 },
  info: { flex: 1 },
  fileName: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interMedium,
    color: TEXT.primary,
    marginBottom: 2,
  },
  meta: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.secondary,
  },
});
