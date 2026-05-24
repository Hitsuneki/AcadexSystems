import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CreateProjectSheet } from '@/components/sheets/CreateProjectSheet';
import { JoinProjectSheet } from '@/components/sheets/JoinProjectSheet';
import { useAuthStore } from '@/stores/auth.store';
import { useProjectStore } from '@/stores/project.store';
import { useUserProjects } from '@/hooks/use-user-projects';
import { BG, TEXT, ACCENT, BORDER } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import type { Project } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addProject, projects: storeProjects } = useProjectStore();
  const { projects: fetchedProjects, loading } = useUserProjects(user?.uid);
  const [activeSheet, setActiveSheet] = useState<'create' | 'join' | null>(null);

  const displayProjects = [
    ...storeProjects,
    ...fetchedProjects.filter((p) => !storeProjects.some((s) => s.id === p.id)),
  ];

  const handleProjectCreated = (p: Project) => { addProject(p); setActiveSheet(null); };
  const handleProjectJoined = (p: Project) => { addProject(p); setActiveSheet(null); };

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.topText}>ACADEX v1.0.0</Text>
        <View style={styles.topRight}>
          <Ionicons name="search" size={16} color={TEXT.t2} />
          <Ionicons name="notifications" size={16} color={TEXT.t2} />
          <View style={styles.statusDot} />
          <Text style={styles.topText}>SYS:ACTIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <SectionHeader title="SYS.OVERVIEW" style={{ marginBottom: 0 }} />
        <View style={styles.readoutPanel}>
          <View style={styles.readoutHeader}>
            <Text style={styles.readoutHeaderText}>SYS.READOUT ● ● ●</Text>
          </View>
          <View style={styles.readoutRow}>
             <Text style={styles.readoutLabel}>ACTIVE PROJECTS</Text>
             <Text style={styles.readoutDots} numberOfLines={1}>........................................</Text>
             <Text style={styles.readoutValue}>{displayProjects.length}</Text>
             <Text style={styles.readoutUnit}> total</Text>
          </View>
          <View style={styles.readoutRow}>
             <Text style={styles.readoutLabel}>TASKS ASSIGNED</Text>
             <Text style={styles.readoutDots} numberOfLines={1}>........................................</Text>
             <Text style={styles.readoutValue}>0</Text>
             <Text style={styles.readoutUnit}> pending</Text>
          </View>
          <View style={styles.readoutRow}>
             <Text style={styles.readoutLabel}>COMPLETED TODAY</Text>
             <Text style={styles.readoutDots} numberOfLines={1}>........................................</Text>
             <Text style={styles.readoutValue}>0</Text>
             <Text style={styles.readoutUnit}> items</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />

        <SectionHeader title="PROJECT.INDEX" actionText="VIEW ALL →" onAction={() => {}} />
        <View style={styles.projectList}>
          {displayProjects.length > 0 ? (
            displayProjects.map(item => (
              <ProjectCard key={item.id} project={item} onPress={() => router.push(`/project/${item.id}`)} />
            ))
          ) : (
            <EmptyState title="No projects found" action="JOIN PROJECT" onAction={() => setActiveSheet('join')} />
          )}

          <Pressable onPress={() => setActiveSheet('create')} style={styles.newProjectRow}>
             <Text style={styles.newProjectText}>// INIT.PROJECT</Text>
          </Pressable>
        </View>

        <View style={{ height: 32 }} />

        <SectionHeader title="ACTIVITY.LOG" />
        <View style={styles.activityFeed}>
           <Text style={styles.activityText}>
             <Text style={{ color: TEXT.t3 }}>14:23:01 · </Text>
             <Text style={{ color: TEXT.t2 }}>SYSTEM </Text>
             <Text style={{ color: TEXT.t2 }}>initialized session</Text>
           </Text>
           <Text style={styles.activityText}>
             <Text style={{ color: TEXT.t3 }}>14:23:05 · </Text>
             <Text style={{ color: ACCENT.primary }}>YOU </Text>
             <Text style={{ color: TEXT.t2 }}>logged in</Text>
           </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {user && (
        <>
          <CreateProjectSheet
            visible={activeSheet === 'create'}
            onClose={() => setActiveSheet(null)}
            userId={user.uid}
            onCreated={handleProjectCreated}
          />
          <JoinProjectSheet
            visible={activeSheet === 'join'}
            onClose={() => setActiveSheet(null)}
            userId={user.uid}
            onJoined={handleProjectJoined}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.base },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
  },
  topText: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.monoSm, color: TEXT.t0 },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 4,
    height: 4,
    backgroundColor: ACCENT.primary,
    marginLeft: 4,
  },
  content: {
    padding: 16,
  },
  readoutPanel: { backgroundColor: BG.bg1, borderWidth: 1, borderColor: BORDER.dim, borderRadius: 0, marginTop: 8 },
  readoutHeader: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    padding: 10,
  },
  readoutHeaderText: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.monoSm, color: TEXT.t3 },
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  readoutLabel: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.caption, color: TEXT.t3 },
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
  readoutValue: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.lg, color: TEXT.t0 },
  readoutUnit: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.label, color: TEXT.t3, width: 48 },
  projectList: {
  },
  newProjectRow: {
    paddingVertical: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: BORDER.dim,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  newProjectText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.monoSm,
    color: TEXT.t3,
  },
  activityFeed: {
    gap: 8,
  },
  activityText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.monoSm,
  },
});
