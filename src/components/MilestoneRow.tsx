import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatShortDate } from '@/utils/date';

interface MilestoneRowProps {
  milestone: {
    id: string;
    title: string;
    dueDate?: string;
    isCompleted: boolean;
  };
  onToggle: (id: string) => void;
}

export function MilestoneRow({ milestone, onToggle }: MilestoneRowProps) {
  return (
    <Pressable
      onPress={() => onToggle(milestone.id)}
      style={styles.container}
      hitSlop={4}>
      <Ionicons
        name={milestone.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
        size={20}
        color={milestone.isCompleted ? SEMANTIC.green : TEXT.muted}
      />
      <View style={styles.info}>
        <Text style={[styles.title, milestone.isCompleted && styles.titleDone]}>
          {milestone.title}
        </Text>
        {milestone.dueDate && (
          <Text style={styles.date}>{formatShortDate(milestone.dueDate)}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  info: { flex: 1 },
  title: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interMedium,
    color: TEXT.primary,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: TEXT.muted,
  },
  date: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.muted,
    marginTop: 1,
  },
});
