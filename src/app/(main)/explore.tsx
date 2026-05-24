import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProjectCard } from '@/components/ProjectCard';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';
import { BG, TEXT, ACCENT, BORDER } from '@/constants/colors';
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

  useFocusEffect(
    useCallback(() => {
      void fetchProjects(search);
    }, [search, fetchProjects])
  );

  const handleJoin = async (projectId: string) => {
    if (!user) return;
    await requestJoin(user.uid, projectId);
    router.push(`/project/${projectId}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SectionHeader title="GLOBAL.REGISTRY" style={{ marginBottom: 0 }} />

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="SEARCH PUBLIC PROJECTS > _"
          placeholderTextColor={TEXT.t3}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={ACCENT.primary} />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard project={item} onPress={() => handleJoin(item.id)} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState title="No public projects" />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.base },
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: BG.base,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: BORDER.dim,
    paddingHorizontal: 12,
  },
  searchInput: {
    paddingVertical: 12,
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t0,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingTop: 4, flexGrow: 1 },
});
