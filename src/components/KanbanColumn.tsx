import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { BG, TEXT, BORDER } from '@/constants/colors';
import { COLUMN_COLORS } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import type { Task, UserProfile, ColumnKey } from '@/types';

interface KanbanColumnProps {
  columnKey: ColumnKey;
  title: string;
  tasks: Task[];
  members?: UserProfile[];
  width: number;
  onTaskPress: (task: Task) => void;
  onDragEnd: (tasks: Task[]) => void;
  onAddTask: () => void;
}

const COLUMN_TITLES: Record<ColumnKey, string> = {
  backlog: 'Backlog',
  inProgress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export function KanbanColumn({ columnKey, title, tasks, members = [], width, onTaskPress, onDragEnd, onAddTask }: KanbanColumnProps) {
  const color = COLUMN_COLORS[columnKey];

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <ScaleDecorator>
      <Pressable onLongPress={drag} disabled={isActive} onPress={() => onTaskPress(item)}>
        <TaskCard task={item} members={members} onPress={() => onTaskPress(item)} />
      </Pressable>
    </ScaleDecorator>
  );

  return (
    <View style={[styles.column, { width }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.title}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.count}>{tasks.length}</Text>
          </View>
        </View>
        <Pressable onPress={onAddTask} style={styles.addBtn} hitSlop={8}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      {/* Task list */}
      {tasks.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No tasks</Text>
        </View>
      ) : (
        <DraggableFlatList
          data={tasks}
          onDragEnd={({ data }) => onDragEnd(data)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          containerStyle={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    backgroundColor: BG.bg1,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: BORDER.default,
    padding: 12,
    marginRight: 12,
    maxHeight: '100%',
    minHeight: 180,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interSemiBold,
    color: TEXT.primary,
    flexShrink: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  count: { fontSize: FontSize.xs, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 18, color: TEXT.secondary, lineHeight: 22 },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.muted,
  },
  listContainer: { flex: 1 },
  listContent: { paddingBottom: 8 },
});
