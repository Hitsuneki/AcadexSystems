import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT, ACCENT, SEMANTIC, BORDER, BG } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatMeetingDate } from '@/utils/date';
import { Tag } from './Tags';
import type { Meeting, UserProfile } from '@/types';

interface MeetingCardProps {
  meeting: Meeting;
  members?: UserProfile[];
  onPress: () => void;
  onDelete?: () => void;
}

export function MeetingCard({ meeting, members = [], onPress, onDelete }: MeetingCardProps) {
  const attendees = members.filter((m) => meeting.attendeeIds.includes(m.id));
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
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
           <Text style={styles.title} numberOfLines={1}>{meeting.title}</Text>
           <Text style={styles.date}>{formatMeetingDate(meeting.date)}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            // {attendees.length} ATTENDEES
          </Text>
          {actionCount > 0 && (
            <Text style={styles.actionText}>
               · {actionCount} ACTION ITEM{actionCount !== 1 ? 'S' : ''} PENDING
            </Text>
          )}
        </View>
      </View>

      {onDelete && (
        <Pressable onPress={handleDelete} hitSlop={8} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={SEMANTIC.red} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    backgroundColor: BG.base,
  },
  pressed: { backgroundColor: BG.bg2 },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: FontSize.body,
    fontFamily: FontFamily.monoMedium, // "SPRINT PLANNING"
    color: TEXT.t1,
    textTransform: 'uppercase',
  },
  date: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t2,
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
  },
  actionText: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: SEMANTIC.amber,
  },
  deleteBtn: { padding: 4, marginLeft: 12 },
});
