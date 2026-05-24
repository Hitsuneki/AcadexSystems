import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    { key: 'board', title: 'BOARD', content: <BoardScreen projectId={id} /> },
    { key: 'files', title: 'FILES', content: <FilesScreen projectId={id} /> },
    { key: 'notes', title: 'NOTES', content: <NotesScreen projectId={id} /> },
    { key: 'updates', title: 'UPDATES', content: <UpdatesScreen projectId={id} /> },
    { key: 'more', title: 'MORE', content: <MoreScreen projectId={id} /> },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.titleText}>// WORKSPACE.MODE</Text>
        <Text style={styles.projectName} numberOfLines={1}>
          {currentProject?.name?.toUpperCase() ?? 'WORKSPACE'}
        </Text>
      </View>

      <WorkspaceTabs tabs={tabs} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    backgroundColor: BG.base,
    gap: 12,
  },
  backBtn: {
    paddingRight: 8,
  },
  backText: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t2,
  },
  titleText: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
  },
  projectName: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t1,
    flex: 1,
    textAlign: 'right',
  },
});
