import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import { WorkspaceTabs } from '@/components/WorkspaceTabs';
import BoardScreen from '@/screens/workspace/BoardScreen';
import FilesScreen from '@/screens/workspace/FilesScreen';
import NotesScreen from '@/screens/workspace/NotesScreen';
import UpdatesScreen from '@/screens/workspace/UpdatesScreen';
import MoreScreen from '@/screens/workspace/MoreScreen';
import { BG, BORDER, TEXT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { useProjectStore } from '@/stores/project.store';

export default function WorkspaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentProject } = useProjectStore();

  const tabs = [
    { key: 'board', title: 'Board', content: <BoardScreen projectId={id} /> },
    { key: 'files', title: 'Files', content: <FilesScreen projectId={id} /> },
    { key: 'notes', title: 'Notes', content: <NotesScreen projectId={id} /> },
    { key: 'updates', title: 'Updates', content: <UpdatesScreen projectId={id} /> },
    { key: 'more', title: 'More', content: <MoreScreen projectId={id} /> },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Mini header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
        </Pressable>
        <Text style={styles.projectName} numberOfLines={1}>
          {currentProject?.name ?? 'Workspace'}
        </Text>
        <View style={{ width: 20 }} />
      </View>

      <WorkspaceTabs tabs={tabs} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER.default,
    backgroundColor: BG.bg0,
  },
  projectName: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.soraSemiBold,
    color: TEXT.primary,
    flex: 1,
    textAlign: 'center',
  },
});
