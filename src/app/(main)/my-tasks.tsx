import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, SectionList, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/auth.store';
import { useMyTasks } from '@/hooks/use-my-tasks';
import { useCallback } from 'react';
import { BG, TEXT, ACCENT, BORDER } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import type { TaskStatus } from '@/types';

const FILTERS: { label: string; value: TaskStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Backlog', value: 'backlog' },
  { label: 'In Progress', value: 'inProgress' },
  { label: 'Review', value: 'review' },
  { label: 'Done', value: 'done' },
];

export default function MyTasksScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { groups, loading, refetch, error } = useMyTasks(user?.uid);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  // Re-fetch whenever this tab comes back into focus so unassigned tasks disappear immediately
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
      <View style={styles.header}>
        <Text style={styles.heading}>My tasks</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable key={f.value} onPress={() => setFilter(f.value)} style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}>
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {filteredGroups.length === 0 ? (
        <EmptyState icon="checkmark-circle-outline" title="No tasks assigned" subtitle="Tasks assigned to you will appear here" />
      ) : (
        <SectionList
          sections={filteredGroups.map((g) => ({ title: g.projectName, data: g.tasks }))}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View style={styles.groupHeader}>
              <Text style={styles.groupName}>{section.title}</Text>
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
  safe: { flex: 1, backgroundColor: BG.bg0 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  heading: { fontSize: FontSize['2xl'], fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: BORDER.default, backgroundColor: BG.bg2 },
  filterBtnActive: { borderColor: ACCENT.blue, backgroundColor: ACCENT.blueDim },
  filterText: { fontSize: FontSize.sm, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  filterTextActive: { color: ACCENT.blue },
  listContent: { padding: 16, paddingTop: 4 },
  groupHeader: { paddingVertical: 10 },
  groupName: { fontSize: FontSize.sm, fontFamily: FontFamily.interSemiBold, color: TEXT.secondary, textTransform: 'uppercase', letterSpacing: 0.8 },
});
