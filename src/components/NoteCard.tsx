import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT } from '@/constants/colors';
import { CardDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatDate } from '@/utils/date';
import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
}

export function NoteCard({ note, onPress }: NoteCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatDate(note.updatedAt)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={TEXT.muted} />
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
  title: {
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
