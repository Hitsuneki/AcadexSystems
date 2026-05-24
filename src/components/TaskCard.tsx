import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BG, BORDER, TEXT, SEMANTIC, PRIORITY_COLORS } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatShortDate, isOverdue } from '@/utils/date';
import { Tag } from './Tags';
import { Avatar } from './Avatar';
import type { Task, UserProfile } from '@/types';
import { Ionicons } from '@expo/vector-icons';

interface TaskCardProps {
  task: Task;
  members?: UserProfile[];
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  /** 'list' for My Tasks view, 'board' for Kanban */
  variant?: 'list' | 'board';
  projectName?: string;
  isCompleted?: boolean;
}

export function TaskCard({ 
  task, 
  members = [], 
  onPress, 
  onLongPress, 
  disabled = false, 
  variant = 'board',
  projectName,
  isCompleted = false
}: TaskCardProps) {
  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;
  const assignees = members.filter((m) => task.assigneeIds.includes(m.id));
  const checklist = task.checklist ?? [];
  const completedItems = checklist.filter((i) => i.isCompleted).length;
  
  const pColor = PRIORITY_COLORS[task.priority]?.text || TEXT.t3;

  if (variant === 'list') {
    return (
      <Pressable onPress={onPress} onLongPress={onLongPress} disabled={disabled} style={({pressed}) => [styles.listRow, pressed && styles.pressed]}>
        <View style={styles.listTop}>
          <View style={[styles.checkbox, isCompleted && styles.checkboxActive]}>
             {isCompleted && <Ionicons name="checkmark" size={10} color="#000" />}
          </View>
          <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
          <Tag type="priority" value={task.priority} />
          {task.dueDate && (
            <Text style={[styles.dateText, overdue && styles.overdue]}>
              {formatShortDate(task.dueDate)}
            </Text>
          )}
        </View>
        <View style={styles.listBottom}>
           <Text style={styles.subText}>// {projectName || task.projectId}</Text>
           {checklist.length > 0 && <Text style={styles.subText}>{completedItems}/{checklist.length}</Text>}
        </View>
      </Pressable>
    );
  }

  // Board Variant
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} disabled={disabled} style={({pressed}) => [styles.boardRow, pressed && styles.pressed]}>
      <View style={[styles.priorityBar, { backgroundColor: pColor }]} />
      <View style={styles.boardContent}>
        <View style={styles.boardTop}>
          <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
          <Tag type="priority" value={task.priority} />
        </View>
        <View style={styles.boardBottom}>
           <View style={styles.avatarRow}>
              {assignees.slice(0, 3).map((m, idx) => (
                <View key={m.id} style={[styles.avatarWrap, { marginLeft: idx > 0 ? -4 : 0 }]}>
                  <Avatar name={m.fullName} size="sm" />
                </View>
              ))}
           </View>
           {task.dueDate && (
              <Text style={[styles.dateText, overdue && styles.overdue]}>
                {formatShortDate(task.dueDate)}
              </Text>
           )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { backgroundColor: BG.bg2 },
  
  // List Variant
  listRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    backgroundColor: BG.base,
  },
  listTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: BORDER.mid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#00FF85',
    borderColor: '#00FF85',
  },
  listBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 24, // aligns under title
  },
  subText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.monoSm,
    color: TEXT.t3,
  },

  // Board Variant
  boardRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: BORDER.dim,
    backgroundColor: BG.bg1,
  },
  priorityBar: {
    width: 2,
  },
  boardContent: {
    flex: 1,
    padding: 12,
  },
  boardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  boardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Shared text
  title: {
    flex: 1,
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: TEXT.t1,
  },
  dateText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.monoSm,
    color: TEXT.t3,
  },
  overdue: { color: SEMANTIC.red },

  avatarRow: { flexDirection: 'row' },
  avatarWrap: {
    backgroundColor: BG.bg1,
    borderWidth: 1,
    borderColor: BG.bg1,
  },
});
