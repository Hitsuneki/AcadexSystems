import React from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/Avatar';
import { TaskCard } from '@/components/TaskCard';
import { ActivityItem } from '@/components/ActivityItem';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useProjectMembers } from '@/hooks/use-project-members';
import { useProjectStore } from '@/stores/project.store';
import { useTasks } from '@/hooks/use-tasks';
import { useActivity } from '@/hooks/use-activity';
import { BG, BORDER, TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
import { CardDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';

export default function ProgressScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentProject } = useProjectStore();
  const { tasks, overdue, completedCount, loading: tasksLoading } = useTasks(projectId);
  const { members } = useProjectMembers(currentProject?.memberIds);
  const { activities } = useActivity(projectId, 15);

  if (tasksLoading) return <LoadingSpinner fullscreen />;

  const completionRate = tasks.length > 0 ? completedCount / tasks.length : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
        </Pressable>
        <Text style={styles.title}>Progress</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Completion rate */}
        <View style={styles.completionCard}>
          <Text style={styles.completionPercent}>{Math.round(completionRate * 100)}%</Text>
          <Text style={styles.completionLabel}>completion rate</Text>
          <ProgressBar progress={completionRate} height={8} />
          <Text style={styles.completionSub}>{completedCount} of {tasks.length} tasks completed</Text>
        </View>

        {/* Tasks by member */}
        <SectionHeader title="Tasks by member" />
        {members.map((m) => {
          const assigned = tasks.filter((t) => t.assigneeIds.includes(m.id));
          const done = assigned.filter((t) => t.status === 'done').length;
          return (
            <View key={m.id} style={styles.memberStatRow}>
              <Avatar uri={m.avatarUri} name={m.fullName} size="sm" />
              <Text style={styles.memberStatName}>{m.fullName}</Text>
              <Text style={styles.memberStatCount}>{done}/{assigned.length}</Text>
            </View>
          );
        })}

        {/* Overdue tasks */}
        {overdue.length > 0 && (
          <>
            <SectionHeader title="Overdue tasks" />
            {overdue.slice(0, 5).map((t) => (
              <TaskCard key={t.id} task={t} members={members} onPress={() => router.push(`/project/${projectId}/task/${t.id}`)} />
            ))}
          </>
        )}

        {/* Activity */}
        <SectionHeader title="Recent activity" />
        {activities.length === 0 ? (
          <EmptyState icon="pulse-outline" title="No activity yet" />
        ) : (
          activities.map((a) => <ActivityItem key={a.id} activity={a} members={members} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: BORDER.default },
  title: { fontSize: FontSize.lg, fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  container: { padding: 16, gap: 16, paddingBottom: 40 },
  completionCard: { backgroundColor: BG.bg1, borderRadius: 12, borderWidth: 0.5, borderColor: BORDER.default, padding: 20, gap: 8, alignItems: 'center' },
  completionPercent: { fontSize: 52, fontFamily: FontFamily.soraBold, color: TEXT.primary, lineHeight: 58 },
  completionLabel: { fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.secondary },
  completionSub: { fontSize: FontSize.sm, fontFamily: FontFamily.interRegular, color: TEXT.muted, marginTop: 4 },
  memberStatRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  memberStatName: { flex: 1, fontSize: FontSize.md, fontFamily: FontFamily.interMedium, color: TEXT.primary },
  memberStatCount: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: TEXT.secondary },
});
