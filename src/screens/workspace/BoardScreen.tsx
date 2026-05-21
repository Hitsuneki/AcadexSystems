import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { KanbanColumn } from '@/components/KanbanColumn';
import { CreateTaskSheet } from '@/components/sheets/CreateTaskSheet';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/auth.store';
import { useProjectMembers } from '@/hooks/use-project-members';
import { useTasks } from '@/hooks/use-tasks';
import { useProjectStore } from '@/stores/project.store';
import { moveTask } from '@/services/task.service';
import { BG } from '@/constants/colors';
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
  const { user } = useAuthStore();
  const { currentProject } = useProjectStore();
  const { columns, loading } = useTasks(projectId);
  const { members } = useProjectMembers(currentProject?.memberIds);
  const [showCreate, setShowCreate] = useState(false);
  const [createColumn, setCreateColumn] = useState<TaskStatus>('backlog');
  const [localColumns, setLocalColumns] = useState<typeof columns | null>(null);

  const displayColumns = localColumns ?? columns;

  const handleDragEnd = async (col: ColumnKey, newTasks: Task[]) => {
    setLocalColumns((prev) => ({ ...(prev ?? columns), [col]: newTasks }));
  };

  const handleOpenCreate = (col: ColumnKey) => {
    setCreateColumn(col);
    setShowCreate(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.board}>
        {COLUMN_KEYS.map((col) => (
          <KanbanColumn
            key={col}
            columnKey={col}
            title={COLUMN_TITLES[col]}
            tasks={displayColumns[col]}
            members={members}
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
          onCreated={() => setShowCreate(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.bg0 },
  board: { paddingHorizontal: 12, paddingVertical: 16, alignItems: 'flex-start' },
});
