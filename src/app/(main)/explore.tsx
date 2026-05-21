import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState } from '@/components/EmptyState';
import { BG, TEXT, ACCENT, BORDER } from '@/constants/colors';
import { InputDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import { getPublicProjects, requestJoin } from '@/services/project.service';
import { useAuthStore } from '@/stores/auth.store';
import type { Project } from '@/types';

export default function ExploreScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const results = await getPublicProjects(q);
      setProjects(results);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(search); }, [search]);

  const handleJoin = async (projectId: string) => {
    if (!user) return;
    await requestJoin(user.uid, projectId);
    router.push(`/project/${projectId}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Explore</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={TEXT.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search public projects..."
          placeholderTextColor={InputDefaults.placeholderTextColor}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={ACCENT.blue} />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard project={item} onPress={() => handleJoin(item.id)} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="compass-outline"
              title="No public projects"
              subtitle={search ? 'No projects match your search' : 'Public projects will appear here'}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  heading: { fontSize: FontSize['2xl'], fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: InputDefaults.backgroundColor,
    borderRadius: InputDefaults.borderRadius,
    borderWidth: InputDefaults.borderWidth,
    borderColor: InputDefaults.borderColor,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: InputDefaults.fontSize,
    fontFamily: FontFamily.interRegular,
    color: TEXT.primary,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingTop: 4, flexGrow: 1 },
});
