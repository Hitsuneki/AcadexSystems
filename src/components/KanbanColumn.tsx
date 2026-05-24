import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
      <TaskCard
        task={item}
        members={members}
        onPress={() => onTaskPress(item)}
        onLongPress={drag}
        disabled={isActive}
      />
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
    borderRadius: 0,
    borderWidth: 1,
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
  dot: { width: 10, height: 2 },
  title: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.mono,
    color: TEXT.primary,
    flexShrink: 1,
    textTransform: 'uppercase',
  },
  countBadge: {
    backgroundColor: BG.bg0,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: BORDER.default,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  count: { fontSize: FontSize.xs, fontFamily: FontFamily.mono, color: TEXT.secondary },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: BORDER.default,
    backgroundColor: BG.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 18, color: TEXT.secondary, lineHeight: 22, fontFamily: FontFamily.mono },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.mono,
    color: TEXT.muted,
    textTransform: 'uppercase',
  },
  listContainer: { flex: 1 },
  listContent: { paddingBottom: 8 },
});
