import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Toast } from '@/components/AcadexToast';
import { Ionicons } from '@expo/vector-icons';

import { MemberRow } from '@/components/MemberRow';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useAuthStore } from '@/stores/auth.store';
import { useProjectStore } from '@/stores/project.store';
import { useProjectMembers } from '@/hooks/use-project-members';
import { leaveProject } from '@/services/project.service';
import { BG, BORDER, TEXT, ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

export default function MembersScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentProject } = useProjectStore();
  const { members, loading } = useProjectMembers(currentProject?.memberIds);

  const isOwner = currentProject?.createdBy === user?.uid || currentProject?.ownerId === user?.uid;

  const copyInviteCode = async () => {
    if (!currentProject?.inviteCode) return;
    await Clipboard.setStringAsync(currentProject.inviteCode);
    Toast.show({ type: 'success', text1: 'Invite code copied' });
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentProject) return;
    try {
      await leaveProject(currentProject.id, memberId);
      Toast.show({ type: 'success', text1: 'Member removed' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to remove member' });
    }
  };

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
        </Pressable>
        <Text style={styles.title}>Members</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Invite code */}
      {currentProject?.inviteCode && (
        <View style={styles.inviteSection}>
          <Text style={styles.inviteLabel}>Invite code</Text>
          <Pressable onPress={copyInviteCode} style={styles.inviteRow}>
            <Text style={styles.inviteCode}>{currentProject.inviteCode}</Text>
            <Ionicons name="copy-outline" size={18} color={ACCENT.signal} />
          </Pressable>
          <Text style={styles.inviteHint}>Share this code to invite people</Text>
        </View>
      )}

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.memberWrap}>
            <MemberRow 
              user={item} 
              showRemove={isOwner && item.id !== user?.uid}
              onRemove={handleRemoveMember}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No members found" />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.base },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: BORDER.dim },
  title: { fontSize: FontSize.lg, fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  inviteSection: { margin: 16, backgroundColor: BG.bg1, borderRadius: 0, borderWidth: 0.5, borderColor: BORDER.default, padding: 16, gap: 6 },
  inviteLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.interSemiBold, color: TEXT.secondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  inviteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inviteCode: { fontSize: 24, fontFamily: FontFamily.monoBold, color: TEXT.primary, letterSpacing: 0 },
  inviteHint: { fontSize: FontSize.sm, fontFamily: FontFamily.interRegular, color: TEXT.muted },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  memberWrap: { paddingHorizontal: 0 },
  separator: { height: 0.5, backgroundColor: BORDER.dim },
});
