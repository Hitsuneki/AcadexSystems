import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { AcadexBottomSheet } from '../AcadexBottomSheet';
import { FormInput } from '../FormInput';
import { Avatar } from '../Avatar';
import { PriorityBadge } from '../PriorityBadge';
import { BG, TEXT, ACCENT, BORDER, PRIORITY_COLORS } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { validateRequired } from '@/utils/validation';
import { createTask } from '@/services/task.service';
import type { Priority, TaskStatus, UserProfile, Task } from '@/types';

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

interface CreateTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  userId: string;
  initialColumn?: TaskStatus;
  members?: UserProfile[];
  onCreated: (task: Task) => void;
}

export function CreateTaskSheet({ visible, onClose, projectId, userId, initialColumn = 'backlog', members = [], onCreated }: CreateTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  const toggleMember = (id: string) =>
    setSelectedMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);

  const handleCreate = async () => {
    const err = validateRequired(title, 'Title');
    if (err) { setTitleError(err); return; }
    setTitleError(null);
    setLoading(true);
    try {
      const task = await createTask(projectId, userId, {
        title: title.trim(),
        description: description.trim() || undefined,
        status: initialColumn,
        priority,
        dueDate: dueDate?.toISOString(),
        assigneeIds: selectedMembers,
      });
      onCreated(task);
      onClose();
      setTitle(''); setDescription(''); setPriority('medium'); setDueDate(null); setSelectedMembers([]);
      Toast.show({ type: 'success', text1: 'Task created!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to create task' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AcadexBottomSheet visible={visible} onClose={onClose} title="New task" snapPoints={['85%']} scrollable>
      <View style={styles.form}>
        <FormInput label="Title" value={title} onChangeText={setTitle} placeholder="What needs to be done?" error={titleError} />
        <FormInput label="Description (optional)" value={description} onChangeText={setDescription} placeholder="Add more context..." multiline numberOfLines={3} />

        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => (
              <Pressable key={p} onPress={() => setPriority(p)} style={[styles.priorityBtn, priority === p && { backgroundColor: PRIORITY_COLORS[p].bg, borderColor: PRIORITY_COLORS[p].text }]}>
                <PriorityBadge priority={p} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Due date (optional)</Text>
          <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateBtn}>
            <Text style={styles.dateBtnText}>{dueDate ? dueDate.toLocaleDateString() : 'Select date'}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate ?? new Date()}
              mode="date"
              onChange={(_, date) => { setShowDatePicker(false); if (date) setDueDate(date); }}
            />
          )}
        </View>

        {members.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Assign members</Text>
            {members.map((m) => {
              const selected = selectedMembers.includes(m.id);
              return (
                <Pressable key={m.id} onPress={() => toggleMember(m.id)} style={[styles.memberRow, selected && styles.memberRowSelected]}>
                  <Avatar uri={m.avatarUri} name={m.fullName} size="sm" />
                  <Text style={styles.memberName}>{m.fullName}</Text>
                  {selected && <Text style={styles.check}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable onPress={handleCreate} disabled={loading} style={[styles.createBtn, loading && styles.createBtnDisabled]}>
          {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.createBtnText}>Create task</Text>}
        </Pressable>
      </View>
    </AcadexBottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16, paddingTop: 16 },
  section: { gap: 8 },
  label: { fontSize: FontSize.sm, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  priorityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priorityBtn: { paddingHorizontal: 4, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'transparent' },
  dateBtn: { backgroundColor: BG.bg3, borderRadius: 7, borderWidth: 1, borderColor: BORDER.default, padding: 12 },
  dateBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.primary },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  memberRowSelected: { borderColor: ACCENT.blueBorder, backgroundColor: ACCENT.blueDim },
  memberName: { flex: 1, fontSize: FontSize.md, fontFamily: FontFamily.interMedium, color: TEXT.primary },
  check: { color: ACCENT.blue, fontSize: FontSize.lg, fontFamily: FontFamily.interBold },
  createBtn: { backgroundColor: ACCENT.blue, borderRadius: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: 8 },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: '#FFFFFF' },
});
