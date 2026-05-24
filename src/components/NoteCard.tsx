import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT, SEMANTIC, BORDER, BG } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatDate } from '@/utils/date';
import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onDelete?: () => void;
}

export function NoteCard({ note, onPress, onDelete }: NoteCardProps) {
  const handleDelete = () => {
    if (!onDelete) return;
    if (Platform.OS === 'web') {
      if (globalThis.confirm('Delete this note? This cannot be undone.')) onDelete();
      return;
    }
    Alert.alert('Delete note', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.meta} numberOfLines={1}>
          EDITED · {formatDate(note.updatedAt)}
        </Text>
        {onDelete ? (
          <Pressable onPress={handleDelete} hitSlop={8} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={SEMANTIC.red} />
          </Pressable>
        ) : (
          <Ionicons name="arrow-forward" size={14} color={TEXT.t3} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    backgroundColor: BG.base,
  },
  pressed: { backgroundColor: BG.bg2 },
  left: { flex: 1 },
  title: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.interMedium,
    color: TEXT.t1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  meta: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
    textTransform: 'uppercase',
  },
  deleteBtn: { padding: 4 },
});
