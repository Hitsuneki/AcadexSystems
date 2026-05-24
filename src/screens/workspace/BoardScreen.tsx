import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { KanbanColumn } from '@/components/KanbanColumn';
import { CreateTaskSheet } from '@/components/sheets/CreateTaskSheet';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Toast } from '@/components/AcadexToast';
import { useAuthStore } from '@/stores/auth.store';
import { useProjectMembers } from '@/hooks/use-project-members';
import { useTasks } from '@/hooks/use-tasks';
import { useProjectStore } from '@/stores/project.store';
import { moveTask } from '@/services/task.service';
import { BG, TEXT, ACCENT, BORDER } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import type { Task, ColumnKey, TaskStatus } from '@/types';

interface BoardScreenProps {
  projectId: string;
}

const COLUMN_KEYS: ColumnKey[] = ['backlog', 'inProgress', 'review', 'done'];
const COLUMN_TITLES: Record<ColumnKey, string> = {
  backlog: 'Backlog',
  inProgress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export default function BoardScreen({ projectId }: BoardScreenProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuthStore();
  const { currentProject } = useProjectStore();
  const { columns, loading } = useTasks(projectId);
  const { members } = useProjectMembers(currentProject?.memberIds);
  const [showCreate, setShowCreate] = useState(false);
  const [createColumn, setCreateColumn] = useState<TaskStatus>('backlog');
  const [localColumns, setLocalColumns] = useState<typeof columns | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnKey>('backlog');

  const displayColumns = localColumns ?? columns;
  const boardPadding = 24;
  const columnGap = 12;
  const isMobile = width < 768;
  const isWideBoard = width >= 1100;
  
  const columnWidth = isMobile 
    ? width - boardPadding
    : isWideBoard
      ? Math.floor((width - boardPadding - columnGap * (COLUMN_KEYS.length - 1)) / COLUMN_KEYS.length)
      : Math.min(Math.max(width - boardPadding - 8, 280), 340);

  const handleDragEnd = async (col: ColumnKey, newTasks: Task[]) => {
    const previousColumns = localColumns ?? columns;
    const previousTasks = previousColumns[col];
    const movedTask = newTasks.find((task, index) => previousTasks[index]?.id !== task.id);
    setLocalColumns((prev) => ({ ...(prev ?? columns), [col]: newTasks }));

    if (!movedTask) return;

    try {
      await moveTask(movedTask.id, col, col);
    } catch {
      setLocalColumns(previousColumns);
      Toast.show({ type: 'error', text1: 'Could not move task' });
    }
  };

  const handleOpenCreate = (col: ColumnKey) => {
    setCreateColumn(col);
    setShowCreate(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {isMobile && (
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {COLUMN_KEYS.map((col) => {
              const isActive = activeColumn === col;
              return (
                <Pressable
                  key={col}
                  onPress={() => setActiveColumn(col)}
                  style={[styles.tab, isActive && styles.tabActive]}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {COLUMN_TITLES[col]} ({displayColumns[col].length})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView horizontal={!isMobile} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.board}>
        {(isMobile ? [activeColumn] : COLUMN_KEYS).map((col) => (
          <KanbanColumn
            key={col}
            columnKey={col}
            title={COLUMN_TITLES[col]}
            tasks={displayColumns[col]}
            members={members}
            width={columnWidth}
            onTaskPress={(task) => router.push(`/project/${projectId}/task/${task.id}`)}
            onDragEnd={(tasks) => handleDragEnd(col, tasks)}
            onAddTask={() => handleOpenCreate(col)}
          />
        ))}
      </ScrollView>

      {user && (
        <CreateTaskSheet
          visible={showCreate}
          onClose={() => setShowCreate(false)}
          projectId={projectId}
          userId={user.uid}
          initialColumn={createColumn}
          members={members}
          onCreated={(task) => {
            const col = task.status as ColumnKey;
            setLocalColumns((prev) => {
              const base = prev ?? columns;
              return { ...base, [col]: [task, ...base[col]] };
            });
            setShowCreate(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.bg0 },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER.default,
    backgroundColor: BG.bg0,
  },
  tabsScroll: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 0,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 0,
    backgroundColor: BG.bg0,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: BORDER.default,
  },
  tabActive: {
    backgroundColor: ACCENT.signal,
    borderColor: ACCENT.signal,
  },
  tabText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.mono,
    color: TEXT.secondary,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: TEXT.inverse,
    fontFamily: FontFamily.mono,
  },
  board: { paddingHorizontal: 12, paddingVertical: 16, alignItems: 'flex-start' },
});
