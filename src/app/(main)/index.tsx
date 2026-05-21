import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CreateProjectSheet } from '@/components/sheets/CreateProjectSheet';
import { JoinProjectSheet } from '@/components/sheets/JoinProjectSheet';
import { useAuthStore } from '@/stores/auth.store';
import { useUserProjects } from '@/hooks/use-user-projects';
import { BG, TEXT, ACCENT, BORDER } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import type { Project } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const { projects, loading } = useUserProjects(user?.uid);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const displayProjects = allProjects.length > 0 ? allProjects : projects;

  const handleProjectCreated = (p: Project) => setAllProjects((prev) => [p, ...prev, ...projects]);
  const handleProjectJoined = (p: Project) => setAllProjects((prev) => [p, ...prev, ...projects]);

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.wordmark}>ACADEX</Text>
        <Pressable hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={TEXT.secondary} />
        </Pressable>
      </View>

      {/* Projects list */}
      <FlatList
        data={displayProjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard project={item} onPress={() => router.push(`/project/${item.id}`)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="layers-outline"
            title="No projects yet"
            subtitle="Create or join a project to get started"
            action="Create project"
            onAction={() => setShowCreate(true)}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <View style={styles.fabArea}>
        <Pressable onPress={() => setShowJoin(true)} style={styles.joinLink}>
          <Text style={styles.joinLinkText}>Join a project</Text>
        </Pressable>
        <Pressable onPress={() => setShowCreate(true)} style={styles.fab}>
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </Pressable>
      </View>

      {user && (
        <>
          <CreateProjectSheet
            visible={showCreate}
            onClose={() => setShowCreate(false)}
            userId={user.uid}
            onCreated={handleProjectCreated}
          />
          <JoinProjectSheet
            visible={showJoin}
            onClose={() => setShowJoin(false)}
            userId={user.uid}
            onJoined={handleProjectJoined}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER.default,
  },
  wordmark: { fontSize: FontSize.lg, fontFamily: FontFamily.soraBold, color: TEXT.primary, letterSpacing: 1.5 },
  listContent: { padding: 16, flexGrow: 1 },
  fabArea: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    alignItems: 'center',
    gap: 10,
  },
  joinLink: { backgroundColor: BG.bg2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 0.5, borderColor: BORDER.default },
  joinLinkText: { fontSize: FontSize.sm, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ACCENT.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
