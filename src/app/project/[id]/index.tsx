import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useProjectStore } from '@/stores/project.store';
import { useProjectMembers } from '@/hooks/use-project-members';
import { useTasks } from '@/hooks/use-tasks';
import { useProject } from '@/hooks/use-project';
import { BG, TEXT, ACCENT, BORDER, SEMANTIC } from '@/constants/colors';
import { CardDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';

export default function ProjectHomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  useProject(id);
  const { currentProject } = useProjectStore();
  const { members } = useProjectMembers(currentProject?.memberIds);
  const { tasks, completedCount, overdue } = useTasks(id);

  if (!currentProject) return <LoadingSpinner fullscreen />;

  const visibleMembers = members.slice(0, 5);
  const extraMembers = members.length - visibleMembers.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Cover bar */}
      <View style={[styles.coverBar, { backgroundColor: currentProject.coverColor }]}>
        <SafeAreaView edges={['top']} style={styles.coverSafeArea}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
        </SafeAreaView>
        <View style={styles.coverContent}>
          <Text style={styles.projectName}>{currentProject.name}</Text>
          <Badge
            label={currentProject.subjectTag}
            color="rgba(255,255,255,0.9)"
            bg="rgba(255,255,255,0.15)"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Members */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MEMBERS</Text>
          <View style={styles.membersRow}>
            {visibleMembers.map((m, idx) => (
              <View key={m.id} style={{ marginLeft: idx > 0 ? -8 : 0, zIndex: visibleMembers.length - idx }}>
                <Avatar uri={m.avatarUri} name={m.fullName} size="sm" />
              </View>
            ))}
            {extraMembers > 0 && (
              <View style={styles.extraBadge}>
                <Text style={styles.extraText}>+{extraMembers}</Text>
              </View>
            )}
            <Text style={styles.memberCount}>{members.length} member{members.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: SEMANTIC.green }]}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: overdue.length > 0 ? SEMANTIC.red : TEXT.primary }]}>{overdue.length}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>

        {/* Enter workspace button */}
        <Pressable
          onPress={() => router.push(`/project/${id}/workspace`)}
          style={({ pressed }) => [styles.workspaceBtn, pressed && { opacity: 0.8 }]}>
          <Text style={styles.workspaceBtnText}>Enter workspace</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  coverBar: { height: 120, justifyContent: 'flex-end' },
  coverSafeArea: { position: 'absolute', top: 0, left: 0, right: 0 },
  backBtn: { padding: 16 },
  coverContent: { padding: 20, gap: 8 },
  projectName: { fontSize: FontSize['2xl'], fontFamily: FontFamily.soraBold, color: '#FFFFFF' },
  container: { padding: 20, gap: 20 },
  section: { gap: 8 },
  sectionLabel: { fontSize: FontSize.xs, fontFamily: FontFamily.interSemiBold, color: TEXT.muted, textTransform: 'uppercase', letterSpacing: 1 },
  membersRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  extraBadge: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2 },
  extraText: { fontSize: FontSize.xs, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  memberCount: { fontSize: FontSize.sm, fontFamily: FontFamily.interRegular, color: TEXT.secondary, marginLeft: 4 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: CardDefaults.backgroundColor,
    borderRadius: CardDefaults.borderRadius,
    borderWidth: CardDefaults.borderWidth,
    borderColor: CardDefaults.borderColor,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: FontSize['2xl'], fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  statLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.interRegular, color: TEXT.secondary },
  workspaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT.blue,
    borderRadius: 10,
    paddingVertical: 16,
    minHeight: 52,
  },
  workspaceBtnText: { fontSize: FontSize.lg, fontFamily: FontFamily.interSemiBold, color: '#FFFFFF' },
});
