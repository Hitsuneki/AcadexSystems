import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
import { CardDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatMeetingDate } from '@/utils/date';
import { Avatar } from './Avatar';
import type { Meeting, UserProfile } from '@/types';

interface MeetingCardProps {
  meeting: Meeting;
  members?: UserProfile[];
  onPress: () => void;
  onDelete?: () => void;
}

export function MeetingCard({ meeting, members = [], onPress, onDelete }: MeetingCardProps) {
  const attendees = members.filter((m) => meeting.attendeeIds.includes(m.id));
  const visible = attendees.slice(0, 4);
  const extra = attendees.length - visible.length;
  const actionCount = meeting.actionItems.length;

  const handleDelete = () => {
    if (!onDelete) return;
    if (Platform.OS === 'web') {
      if (globalThis.confirm('Delete this meeting? This cannot be undone.')) onDelete();
      return;
    }
    Alert.alert('Delete meeting', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.topRow}>
        <Text style={styles.date}>{formatMeetingDate(meeting.date)}</Text>
        {onDelete && (
          <Pressable onPress={handleDelete} hitSlop={8} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={SEMANTIC.red} />
          </Pressable>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>{meeting.title}</Text>

      <View style={styles.footer}>
        <View style={styles.avatarRow}>
          {visible.map((m, idx) => (
            <View key={m.id} style={{ marginLeft: idx > 0 ? -6 : 0 }}>
              <Avatar uri={m.avatarUri} name={m.fullName} size="sm" />
            </View>
          ))}
          {extra > 0 && (
            <View style={styles.extra}>
              <Text style={styles.extraText}>+{extra}</Text>
            </View>
          )}
        </View>
        {actionCount > 0 && (
          <View style={styles.actionBadge}>
            <Ionicons name="checkmark-circle-outline" size={12} color={ACCENT.blue} />
            <Text style={styles.actionText}>{actionCount} action{actionCount !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CardDefaults.backgroundColor,
    borderRadius: CardDefaults.borderRadius,
    borderWidth: CardDefaults.borderWidth,
    borderColor: CardDefaults.borderColor,
    padding: CardDefaults.padding,
    gap: 6,
    marginBottom: 10,
  },
  pressed: { opacity: 0.75 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interMedium,
    color: ACCENT.blue,
  },
  deleteBtn: { padding: 4 },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.interSemiBold,
    color: TEXT.primary,
  },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  extra: {
    marginLeft: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  extraText: { fontSize: FontSize.xs, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  actionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: FontSize.sm, fontFamily: FontFamily.interMedium, color: ACCENT.blue },
});
