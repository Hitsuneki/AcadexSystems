import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { MeetingCard } from '@/components/MeetingCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useProjectMembers } from '@/hooks/use-project-members';
import { useProjectStore } from '@/stores/project.store';
import { useMeetings } from '@/hooks/use-meetings';
import { BG, BORDER, TEXT, ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

export default function MeetingsScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentProject } = useProjectStore();
  const { meetings, loading } = useMeetings(projectId);
  const { members } = useProjectMembers(currentProject?.memberIds);

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
        </Pressable>
        <Text style={styles.title}>Meetings</Text>
        <Pressable onPress={() => router.push(`/project/${projectId}/meeting/new`)} hitSlop={8}>
          <Ionicons name="add" size={24} color={ACCENT.blue} />
        </Pressable>
      </View>

      <FlatList
        data={meetings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MeetingCard
            meeting={item}
            members={members}
            onPress={() => router.push(`/project/${projectId}/meeting/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No meetings scheduled"
            subtitle="Schedule your first meeting to coordinate with your team"
            action="New meeting"
            onAction={() => router.push(`/project/${projectId}/meeting/new`)}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: BORDER.default },
  title: { fontSize: FontSize.lg, fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  listContent: { padding: 16, flexGrow: 1 },
});
