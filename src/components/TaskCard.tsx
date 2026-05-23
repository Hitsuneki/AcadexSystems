import React from 'react';
import { Image, View, Text, Pressable, StyleSheet } from 'react-native';
import { BG, BORDER, TEXT, SEMANTIC } from '@/constants/colors';
import { CardDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatShortDate, isOverdue } from '@/utils/date';
import { Avatar } from './Avatar';
import { PriorityBadge } from './PriorityBadge';
import type { Task, UserProfile } from '@/types';

interface TaskCardProps {
  task: Task;
  members?: UserProfile[];
  onPress: () => void;
}

export function TaskCard({ task, members = [], onPress }: TaskCardProps) {
  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;
  const assignees = members.filter((m) => task.assigneeIds.includes(m.id));
  const visibleAssignees = assignees.slice(0, 3);
  const extra = assignees.length - visibleAssignees.length;
  const checklist = task.checklist ?? [];
  const completedItems = checklist.filter((i) => i.isCompleted).length;
  const imageUrl = task.attachmentUrls?.find((url) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
        <PriorityBadge priority={task.priority} />
      </View>

      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />}

      {task.dueDate && (
        <Text style={[styles.dueDate, overdue && styles.overdue]}>
          {overdue ? '⚠ ' : ''}{formatShortDate(task.dueDate)}
        </Text>
      )}

      {(assignees.length > 0 || checklist.length > 0) && (
        <View style={styles.footer}>
          <View style={styles.avatarRow}>
            {visibleAssignees.map((m, idx) => (
              <View key={m.id} style={[styles.avatarWrap, { marginLeft: idx > 0 ? -6 : 0 }]}>
                <Avatar uri={m.avatarUri} name={m.fullName} size="sm" />
              </View>
            ))}
            {extra > 0 && (
              <View style={styles.extraBadge}>
                <Text style={styles.extraText}>+{extra}</Text>
              </View>
            )}
          </View>
          {checklist.length > 0 && (
            <Text style={styles.checklist}>{completedItems}/{checklist.length}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CardDefaults.backgroundColor,
    borderRadius: CardDefaults.borderRadius,
    borderWidth: CardDefaults.borderWidth,
    borderColor: CardDefaults.borderColor,
    padding: CardDefaults.padding,
    marginBottom: 8,
    gap: 8,
  },
  pressed: { opacity: 0.75 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: FontFamily.interMedium,
    color: TEXT.primary,
    lineHeight: 19,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    backgroundColor: BG.bg2,
  },
  dueDate: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.secondary,
  },
  overdue: { color: SEMANTIC.red },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { zIndex: 1 },
  extraBadge: {
    marginLeft: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  extraText: { fontSize: FontSize.xs, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  checklist: { fontSize: FontSize.xs, fontFamily: FontFamily.interRegular, color: TEXT.muted },
});
