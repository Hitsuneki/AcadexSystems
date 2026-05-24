import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from '@/components/AcadexToast';

import { ProjectCard } from '@/components/ProjectCard';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/auth.store';
import { useProjectStore } from '@/stores/project.store';
import { useUserProjects } from '@/hooks/use-user-projects';
import { signOutUser, deleteUserAccount } from '@/services/auth.service';
import { BG, TEXT, ACCENT, BORDER, SEMANTIC } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { EmptyState } from '@/components/EmptyState';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuthStore();
  const clearActiveProject = useProjectStore((state) => state.clearActiveProject);
  const { projects } = useUserProjects(user?.uid);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!profile) return <LoadingSpinner fullscreen />;

  const performSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutUser();
      clearActiveProject();
      signOut();
      router.replace('/(auth)/login');
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to sign out' });
    } finally {
      setSigningOut(false);
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (globalThis.confirm('Are you sure you want to sign out?')) {
        void performSignOut();
      }
      return;
    }
    Alert.alert('LOGOUT', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void performSignOut() },
    ]);
  };

  const performDeleteAccount = async () => {
    if (!user?.uid) return;
    setDeleting(true);
    try {
      await deleteUserAccount(user.uid);
      clearActiveProject();
      signOut();
      router.replace('/(auth)/login');
    } catch (error: any) {
      const msg = error.message.includes('requires-recent-login') 
        ? 'Please sign out and sign back in to delete your account.' 
        : error.message;
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      if (globalThis.confirm('Are you sure you want to completely delete your account? This cannot be undone.')) {
        void performDeleteAccount();
      }
      return;
    }
    Alert.alert('TERMINATE ACCOUNT', 'Are you sure you want to completely delete your account? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void performDeleteAccount() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <SectionHeader title="IDENTITY.MODULE" />

        <View style={styles.profileSection}>
          <View style={styles.avatarPlaceholder}>
             <Text style={styles.avatarInitials}>
               {profile.fullName ? profile.fullName.trim()[0]?.toUpperCase() : "?"}
             </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile.fullName}</Text>
            <Text style={styles.course}>{profile.course}</Text>
            <Text style={styles.roleTag}>[{profile.roleLabel.toUpperCase()}]</Text>
          </View>
          <Pressable onPress={() => router.push('/(main)/edit-profile')} style={styles.editBtn} hitSlop={8}>
            <Text style={styles.editBtnText}>EDIT</Text>
          </Pressable>
        </View>

        <View style={styles.readoutPanel}>
          <View style={styles.readoutHeader}>
            <Text style={styles.readoutHeaderText}>SYS.READOUT ● ● ●</Text>
          </View>
          <View style={styles.readoutRow}>
             <Text style={styles.readoutLabel}>ACTIVE PROJECTS</Text>
             <Text style={styles.readoutDots} numberOfLines={1}>........................................</Text>
             <Text style={styles.readoutValue}>{projects.length}</Text>
             <Text style={styles.readoutUnit}> total</Text>
          </View>
          <View style={styles.readoutRow}>
             <Text style={styles.readoutLabel}>TASKS DONE</Text>
             <Text style={styles.readoutDots} numberOfLines={1}>........................................</Text>
             <Text style={styles.readoutValue}>{profile.completedTasksCount}</Text>
             <Text style={styles.readoutUnit}> items</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />

        <SectionHeader title="ACTIVE.PROJECTS" />
        {projects.length > 0 ? projects.map((p) => (
          <ProjectCard key={p.id} project={p} onPress={() => router.push(`/project/${p.id}`)} />
        )) : <EmptyState title="No projects" />}

        <View style={{ height: 48 }} />

        <SectionHeader title="SYSTEM.TERMINATION" />
        <View style={styles.dangerZone}>
          <Pressable onPress={handleSignOut} disabled={signingOut || deleting} style={styles.ghostBtn}>
            <Text style={styles.ghostText}>{signingOut ? 'LOGGING OUT...' : 'LOGOUT.SESSION →'}</Text>
          </Pressable>

          <Pressable onPress={handleDeleteAccount} disabled={signingOut || deleting} style={styles.ghostBtn}>
            <Text style={styles.dangerText}>{deleting ? 'DESTROYING...' : 'DESTROY.ACCOUNT →'}</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.base },
  container: { padding: 16, gap: 16 },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    backgroundColor: BG.bg1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER.mid,
  },
  avatarInitials: {
    fontSize: FontSize.monoLg,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
  },
  profileInfo: { flex: 1, gap: 4 },
  name: { fontSize: FontSize.lg, fontFamily: FontFamily.interMedium, color: TEXT.t0 },
  course: { fontSize: FontSize.monoSm, fontFamily: FontFamily.monoMedium, color: TEXT.t2 },
  roleTag: { fontSize: FontSize.monoSm, fontFamily: FontFamily.monoMedium, color: ACCENT.primary },
  editBtn: {
    padding: 8,
  },
  editBtnText: {
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
  dangerZone: {
    gap: 16,
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  ghostBtn: {
    paddingVertical: 8,
  },
  ghostText: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t2,
  },
  dangerText: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: SEMANTIC.red,
  },
});
