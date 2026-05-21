import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { ProjectCard } from '@/components/ProjectCard';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/auth.store';
import { useUserProjects } from '@/hooks/use-user-projects';
import { signOutUser } from '@/services/auth.service';
import { BG, TEXT, ACCENT, BORDER, SEMANTIC } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

const ROLE_COLORS = {
  Student: { color: '#38BDF8', bg: 'rgba(56,189,248,0.12)' },
  Teacher: { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  Researcher: { color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  Professional: { color: '#FB923C', bg: 'rgba(251,146,60,0.12)' },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuthStore();
  const { projects } = useUserProjects(user?.uid);

  if (!profile) return <LoadingSpinner fullscreen />;

  const roleColor = ROLE_COLORS[profile.roleLabel] ?? ROLE_COLORS.Student;

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOutUser();
          signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.profileSection}>
          <Avatar uri={profile.avatarUri} name={profile.fullName} size="xl" />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile.fullName}</Text>
            <Text style={styles.course}>{profile.course}</Text>
            <Badge label={profile.roleLabel} color={roleColor.color} bg={roleColor.bg} />
          </View>
          <Pressable onPress={() => router.push('/(main)/edit-profile')} style={styles.editBtn} hitSlop={8}>
            <Ionicons name="pencil-outline" size={16} color={TEXT.secondary} />
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{projects.length}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.completedTasksCount}</Text>
            <Text style={styles.statLabel}>Tasks done</Text>
          </View>
        </View>

        {/* Projects */}
        <SectionHeader title="Projects" />
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} onPress={() => router.push(`/project/${p.id}`)} />
        ))}

        {/* Sign out */}
        <Pressable onPress={handleSignOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={18} color={SEMANTIC.red} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  container: { padding: 20, gap: 16 },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 8,
  },
  profileInfo: { flex: 1, gap: 4 },
  name: { fontSize: FontSize.xl, fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  course: { fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.secondary },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: BG.bg2,
    borderWidth: 0.5,
    borderColor: BORDER.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: BG.bg1,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: BORDER.default,
    padding: 16,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: FontSize['2xl'], fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  statLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.interRegular, color: TEXT.secondary },
  statDivider: { width: 0.5, backgroundColor: BORDER.default },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: SEMANTIC.redDim,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: SEMANTIC.redBorder,
    padding: 14,
    marginTop: 8,
    justifyContent: 'center',
  },
  signOutText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: SEMANTIC.red },
});
