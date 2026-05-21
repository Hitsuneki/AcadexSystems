import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/auth.store';
import { useProjectMembers } from '@/hooks/use-project-members';
import { useProjectStore } from '@/stores/project.store';
import { useMeetings } from '@/hooks/use-meetings';
import { createMeeting, updateMeeting } from '@/services/meeting.service';
import { pushActionItemToBoard } from '@/services/task.service';
import { BG, BORDER, TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
import { CardDefaults, InputDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatMeetingDate } from '@/utils/date';
import type { ActionItemStatus } from '@/types';

const ACTION_STATUS: Record<ActionItemStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: SEMANTIC.amber, bg: SEMANTIC.amberDim },
  done: { label: 'Done', color: SEMANTIC.green, bg: SEMANTIC.greenDim },
  pushed: { label: 'On board', color: ACCENT.blue, bg: ACCENT.blueDim },
};

export default function MeetingDetailScreen() {
  const { id: projectId, meetingId } = useLocalSearchParams<{ id: string; meetingId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentProject } = useProjectStore();
  const { meetings, addMeeting } = useMeetings(projectId);
  const { members } = useProjectMembers(currentProject?.memberIds);

  const isCreate = meetingId === 'new';
  const meeting = isCreate ? null : meetings.find((m) => m.id === meetingId);

  const [title, setTitle] = useState(meeting?.title ?? '');
  const [date, setDate] = useState(meeting ? new Date(meeting.date) : new Date());
  const [showDate, setShowDate] = useState(false);
  const [notes, setNotes] = useState(meeting?.notes ?? '');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>(meeting?.attendeeIds ?? []);
  const [actionItems, setActionItems] = useState(meeting?.actionItems ?? []);
  const [newActionItem, setNewActionItem] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleAttendee = (id: string) =>
    setSelectedAttendees((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);

  const handleSave = async () => {
    if (!title.trim()) { Toast.show({ type: 'error', text1: 'Title required' }); return; }
    setSaving(true);
    try {
      if (isCreate) {
        const m = await createMeeting(projectId, {
          title: title.trim(),
          date: date.toISOString(),
          attendeeIds: selectedAttendees,
          notes: notes.trim() || undefined,
          actionItems: actionItems.map(({ id, ...rest }) => rest),
        });
        addMeeting(m);
        Toast.show({ type: 'success', text1: 'Meeting created!' });
      } else if (meeting) {
        await updateMeeting(meeting.id, { title: title.trim(), date: date.toISOString(), notes: notes.trim(), attendeeIds: selectedAttendees });
        Toast.show({ type: 'success', text1: 'Meeting saved' });
      }
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handlePushToBoard = async (actionId: string) => {
    try {
      await pushActionItemToBoard(meetingId, actionId, projectId);
      setActionItems((prev) => prev.map((ai) => ai.id === actionId ? { ...ai, status: 'pushed' as ActionItemStatus } : ai));
      Toast.show({ type: 'success', text1: 'Task created on board' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to push to board' });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
        </Pressable>
        <Text style={styles.headerTitle}>{isCreate ? 'New meeting' : 'Meeting'}</Text>
        <Pressable onPress={handleSave} disabled={saving} style={styles.saveBtn}>
          {saving ? <ActivityIndicator size="small" color={ACCENT.blue} /> : <Text style={styles.saveBtnText}>Save</Text>}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <TextInput style={styles.titleInput} value={title} onChangeText={setTitle} placeholder="Meeting title" placeholderTextColor={InputDefaults.placeholderTextColor} />

        {/* Date */}
        <Pressable onPress={() => setShowDate(true)} style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color={ACCENT.blue} />
          <Text style={styles.dateText}>{formatMeetingDate(date.toISOString())}</Text>
        </Pressable>
        {showDate && (
          <DateTimePicker
            value={date}
            mode="datetime"
            onChange={(_, d) => { setShowDate(false); if (d) setDate(d); }}
          />
        )}

        {/* Attendees */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendees</Text>
          <View style={styles.attendeesRow}>
            {members.map((m) => {
              const selected = selectedAttendees.includes(m.id);
              return (
                <Pressable key={m.id} onPress={() => toggleAttendee(m.id)} style={[styles.attendeeChip, selected && styles.attendeeChipActive]}>
                  <Avatar uri={m.avatarUri} name={m.fullName} size="sm" />
                  <Text style={[styles.attendeeName, selected && styles.attendeeNameActive]}>{m.fullName.split(' ')[0]}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput style={styles.notesInput} value={notes} onChangeText={setNotes} multiline numberOfLines={4} placeholder="Meeting notes..." placeholderTextColor={InputDefaults.placeholderTextColor} textAlignVertical="top" />
        </View>

        {/* Action items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Action items</Text>
          {actionItems.map((ai) => {
            const statusCfg = ACTION_STATUS[ai.status];
            return (
              <View key={ai.id} style={styles.actionItem}>
                <Text style={styles.actionBody}>{ai.body}</Text>
                <View style={styles.actionFooter}>
                  <Badge label={statusCfg.label} color={statusCfg.color} bg={statusCfg.bg} />
                  {ai.status === 'pending' && (
                    <Pressable onPress={() => handlePushToBoard(ai.id)} style={styles.pushBtn}>
                      <Text style={styles.pushBtnText}>Push to board</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
          <View style={styles.addActionRow}>
            <TextInput
              style={styles.addActionInput}
              value={newActionItem}
              onChangeText={setNewActionItem}
              placeholder="Add action item..."
              placeholderTextColor={InputDefaults.placeholderTextColor}
              onSubmitEditing={() => {
                if (newActionItem.trim()) {
                  setActionItems((prev) => [...prev, { id: `ai-${Date.now()}`, body: newActionItem.trim(), status: 'pending' }]);
                  setNewActionItem('');
                }
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: BORDER.default },
  headerTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  saveBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  saveBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: ACCENT.blue },
  container: { padding: 16, gap: 20, paddingBottom: 40 },
  titleInput: { fontSize: FontSize.xl, fontFamily: FontFamily.soraSemiBold, color: TEXT.primary, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: BORDER.default },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: ACCENT.blueDim, borderRadius: 8 },
  dateText: { fontSize: FontSize.md, fontFamily: FontFamily.interMedium, color: ACCENT.blue },
  section: { gap: 10 },
  sectionTitle: { fontSize: FontSize.sm, fontFamily: FontFamily.interSemiBold, color: TEXT.secondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  attendeesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  attendeeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: BORDER.default, backgroundColor: BG.bg2 },
  attendeeChipActive: { borderColor: ACCENT.blue, backgroundColor: ACCENT.blueDim },
  attendeeName: { fontSize: FontSize.sm, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  attendeeNameActive: { color: ACCENT.blue },
  notesInput: { backgroundColor: InputDefaults.backgroundColor, borderRadius: InputDefaults.borderRadius, borderWidth: InputDefaults.borderWidth, borderColor: InputDefaults.borderColor, color: TEXT.primary, padding: 12, fontSize: FontSize.md, fontFamily: FontFamily.interRegular, minHeight: 100 },
  actionItem: { backgroundColor: CardDefaults.backgroundColor, borderRadius: CardDefaults.borderRadius, borderWidth: CardDefaults.borderWidth, borderColor: CardDefaults.borderColor, padding: 12, gap: 8 },
  actionBody: { fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.secondary, lineHeight: 20 },
  actionFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pushBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: ACCENT.blueDim, borderRadius: 6 },
  pushBtnText: { fontSize: FontSize.sm, fontFamily: FontFamily.interSemiBold, color: ACCENT.blue },
  addActionRow: {},
  addActionInput: { backgroundColor: InputDefaults.backgroundColor, borderRadius: InputDefaults.borderRadius, borderWidth: InputDefaults.borderWidth, borderColor: InputDefaults.borderColor, color: TEXT.primary, padding: 12, fontSize: FontSize.md, fontFamily: FontFamily.interRegular },
});
