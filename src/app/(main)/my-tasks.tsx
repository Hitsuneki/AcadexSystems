import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, SectionList, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SectionHeader } from '@/components/SectionHeader';
import { useAuthStore } from '@/stores/auth.store';
import { useMyTasks } from '@/hooks/use-my-tasks';
import { BG, TEXT, ACCENT, BORDER } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import type { TaskStatus } from '@/types';

const FILTERS: { label: string; value: TaskStatus | 'all' }[] = [
  { label: 'ALL', value: 'all' },
  { label: 'BACKLOG', value: 'backlog' },
  { label: 'IN.PROGRESS', value: 'inProgress' },
  { label: 'REVIEW', value: 'review' },
  { label: 'DONE', value: 'done' },
];

export default function MyTasksScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { groups, loading, refetch, error } = useMyTasks(user?.uid);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const filteredGroups = groups.map((g) => ({
    ...g,
    tasks: filter === 'all' ? g.tasks : g.tasks.filter((t) => t.status === filter),
  })).filter((g) => g.tasks.length > 0);

  if (error) return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={{ padding: 20 }}>
        <Text style={{ color: 'red' }}>Error: {error.message}</Text>
      </View>
    </SafeAreaView>
  );

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SectionHeader title="TASK.QUEUE" style={{ marginBottom: 0 }} />

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable key={f.value} onPress={() => setFilter(f.value)} style={styles.filterBtn}>
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
            {filter === f.value && <View style={styles.filterIndicator} />}
          </Pressable>
        ))}
      </View>

      {filteredGroups.length === 0 ? (
        <EmptyState title="No tasks found" />
      ) : (
        <SectionList
          sections={filteredGroups.map((g) => ({ title: g.projectName, data: g.tasks }))}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View style={styles.groupHeader}>
              <Text style={styles.groupName}>// {section.title.toUpperCase()}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TaskCard compact task={item} onPress={() => router.push(`/project/${item.projectId}/task/${item.id}`)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.base },
  filterRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    backgroundColor: BG.base,
  },
  filterBtn: { 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    position: 'relative',
  },
  filterText: { 
    fontSize: FontSize.monoSm, 
    fontFamily: FontFamily.monoMedium, 
    color: TEXT.t3, 
    textTransform: 'uppercase' 
  },
  filterTextActive: { color: TEXT.t0 },
  filterIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: ACCENT.primary,
  },
  listContent: { padding: 16, paddingTop: 4 },
  groupHeader: { paddingVertical: 16, paddingHorizontal: 4 },
  groupName: { 
    fontSize: FontSize.monoSm, 
    fontFamily: FontFamily.monoMedium, 
    color: TEXT.t2, 
    textTransform: 'uppercase', 
    letterSpacing: 1.5 
  },
});
