import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SectionHeader } from '@/components/SectionHeader';
import { useProjectStore } from '@/stores/project.store';
import { useProjectMembers } from '@/hooks/use-project-members';
import { useTasks } from '@/hooks/use-tasks';
import { useProject } from '@/hooks/use-project';
import { BG, TEXT, ACCENT, BORDER, SEMANTIC } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

export default function ProjectHomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  useProject(id);
  const { currentProject } = useProjectStore();
  const { members } = useProjectMembers(currentProject?.memberIds);
  const { tasks, completedCount, overdue } = useTasks(id);

  if (!currentProject) return <LoadingSpinner fullscreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.coverBar}>
        <SafeAreaView edges={['top']} style={styles.coverSafeArea}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
            <Text style={styles.backText}>← BACK</Text>
          </Pressable>
        </SafeAreaView>
        <View style={styles.coverContent}>
          <Text style={styles.projectName}>{currentProject.name}</Text>
          <Text style={styles.badgeText}>[{currentProject.subjectTag.toUpperCase()}]</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <SectionHeader title="MEMBERS.INDEX" />
        <View style={styles.membersList}>
          {members.map((m) => (
            <View key={m.id} style={styles.memberRow}>
               <Text style={styles.memberName}>{m.fullName}</Text>
               <Text style={styles.memberDots} numberOfLines={1}>........................................</Text>
               <Text style={styles.memberRole}>{m.roleLabel.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />

        <SectionHeader title="PROJECT.STATS" style={{ marginBottom: 0 }} />
        <View style={styles.readoutPanel}>
          <View style={styles.readoutHeader}>
            <Text style={styles.readoutHeaderText}>SYS.READOUT ● ● ●</Text>
          </View>
          <View style={styles.readoutRow}>
             <Text style={styles.readoutLabel}>TOTAL TASKS</Text>
             <Text style={styles.readoutDots} numberOfLines={1}>........................................</Text>
             <Text style={styles.readoutValue}>{tasks.length}</Text>
             <Text style={styles.readoutUnit}> total</Text>
          </View>
          <View style={styles.readoutRow}>
             <Text style={styles.readoutLabel}>COMPLETED</Text>
             <Text style={styles.readoutDots} numberOfLines={1}>........................................</Text>
             <Text style={[styles.readoutValue, { color: ACCENT.primary }]}>{completedCount}</Text>
             <Text style={styles.readoutUnit}> items</Text>
          </View>
          <View style={styles.readoutRow}>
             <Text style={styles.readoutLabel}>OVERDUE</Text>
             <Text style={styles.readoutDots} numberOfLines={1}>........................................</Text>
             <Text style={[styles.readoutValue, { color: overdue.length > 0 ? SEMANTIC.red : TEXT.t0 }]}>{overdue.length}</Text>
             <Text style={styles.readoutUnit}> items</Text>
          </View>
        </View>

        <View style={{ height: 48 }} />

        <Pressable
          onPress={() => router.push(`/project/${id}/workspace`)}
          style={({ pressed }) => [styles.workspaceBtn, pressed && { opacity: 0.8 }]}>
          <Text style={styles.workspaceBtnText}>ENTER.WORKSPACE →</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.base },
  coverBar: { 
    height: 140, 
    justifyContent: 'flex-end', 
    borderBottomWidth: 1, 
    borderBottomColor: BORDER.dim, 
    backgroundColor: BG.bg1 
  },
  coverSafeArea: { position: 'absolute', top: 0, left: 0, right: 0 },
  backBtn: { padding: 16 },
  backText: { fontSize: FontSize.monoSm, fontFamily: FontFamily.monoMedium, color: TEXT.t3 },
  coverContent: { padding: 20, gap: 8 },
  projectName: { fontSize: FontSize.display, fontFamily: FontFamily.display, color: TEXT.t0, textTransform: 'uppercase' },
  badgeText: { fontSize: FontSize.monoSm, fontFamily: FontFamily.monoMedium, color: ACCENT.primary },
  container: { padding: 16, paddingBottom: 40 },
  
  membersList: {
    backgroundColor: BG.bg1,
    borderWidth: 1,
    borderColor: BORDER.mid,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
  },
  memberName: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t0,
    textTransform: 'uppercase',
  },
  memberDots: {
    flex: 1,
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.caption,
    color: TEXT.t3,
    letterSpacing: 2,
    marginHorizontal: 8,
    opacity: 0.5,
    overflow: 'hidden',
  },
  memberRole: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
  },

  readoutPanel: {
    backgroundColor: BG.bg1,
    borderWidth: 1,
    borderColor: BORDER.mid,
    borderRadius: 0,
    marginTop: 8,
  },
  readoutHeader: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    padding: 10,
  },
  readoutHeaderText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.monoSm,
    color: TEXT.t3,
  },
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  readoutLabel: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.caption,
    color: TEXT.t3,
  },
  readoutDots: {
    flex: 1,
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.caption,
    color: TEXT.t3,
    letterSpacing: 2,
    marginHorizontal: 8,
    opacity: 0.5,
    overflow: 'hidden',
  },
  readoutValue: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.lg,
    color: TEXT.t0,
  },
  readoutUnit: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.label,
    color: TEXT.t3,
    width: 48,
  },

  workspaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT.primary,
    borderRadius: 0,
    paddingVertical: 16,
    minHeight: 52,
  },
  workspaceBtnText: { 
    fontSize: FontSize.body, 
    fontFamily: FontFamily.interSemiBold, 
    color: '#000', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
