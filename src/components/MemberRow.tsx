import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT, SEMANTIC } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import type { UserProfile } from '@/types';

interface MemberRowProps {
  user: UserProfile;
  showRemove?: boolean;
  onRemove?: (userId: string) => void;
}

const ROLE_COLORS = {
  Student: { color: '#38BDF8', bg: 'rgba(56,189,248,0.12)' },
  Teacher: { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  Researcher: { color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  Professional: { color: '#FB923C', bg: 'rgba(251,146,60,0.12)' },
};

export function MemberRow({ user, showRemove = false, onRemove }: MemberRowProps) {
  const roleColor = ROLE_COLORS[user.roleLabel] ?? ROLE_COLORS.Student;

  return (
    <View style={styles.container}>
      <Avatar uri={user.avatarUri} name={user.fullName} size="md" />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{user.fullName}</Text>
          <Badge label={user.roleLabel} color={roleColor.color} bg={roleColor.bg} />
        </View>
        <Text style={styles.course} numberOfLines={1}>{user.course}</Text>
      </View>
      {showRemove && onRemove && (
        <Pressable onPress={() => onRemove(user.id)} hitSlop={8} style={styles.removeBtn}>
          <Ionicons name="close-circle-outline" size={20} color={SEMANTIC.red} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  name: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interSemiBold,
    color: TEXT.primary,
    flex: 1,
  },
  course: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.secondary,
  },
  removeBtn: { padding: 4 },
});
