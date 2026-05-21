import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Toast } from '@/components/AcadexToast';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/Avatar';
import { PriorityBadge } from '@/components/PriorityBadge';
import { FileCard } from '@/components/FileCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BG, BORDER, TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
import { CardDefaults, InputDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatShortDate, isOverdue } from '@/utils/date';
import { useTasks } from '@/hooks/use-tasks';
import { useProjectMembers } from '@/hooks/use-project-members';
import { useProjectStore } from '@/stores/project.store';
import { useFiles } from '@/hooks/use-files';
import { completeTask, cancelTask, updateTask, toggleChecklistItem, addChecklistItem, attachFileToTask } from '@/services/task.service';
import { uploadFile } from '@/services/storage.service';
import { useAuthStore } from '@/stores/auth.store';
import type { Task, TaskChecklist } from '@/types';

export default function TaskDetailScreen() {
  const { id: projectId, taskId } = useLocalSearchParams<{ id: string; taskId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { tasks } = useTasks(projectId);
  const { currentProject } = useProjectStore();
  const { members } = useProjectMembers(currentProject?.memberIds);
  const { files } = useFiles(projectId);

  const task = tasks.find((t) => t.id === taskId);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [editingDesc, setEditingDesc] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [checklist, setChecklist] = useState<TaskChecklist[]>(task?.checklist ?? []);
  const [showCancel, setShowCancel] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setChecklist(task.checklist ?? []);
    }
  }, [task]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeTask(taskId);
      Toast.show({ type: 'success', text1: 'Task completed!' });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to complete task' });
    } finally {
      setCompleting(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelTask(taskId);
      setShowCancel(false);
      router.back();
    } finally {
      setCancelling(false);
    }
  };

  const handleToggleCheck = async (itemId: string) => {
    setChecklist((prev) => prev.map((i) => i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i));
    await toggleChecklistItem(taskId, itemId);
  };

  const handleAddCheck = async () => {
    if (!newCheckItem.trim()) return;
    const item = await addChecklistItem(taskId, newCheckItem.trim());
    setChecklist((prev) => [...prev, item]);
    setNewCheckItem('');
  };

  const handleBlurTitle = async () => {
    if (title.trim() && title !== task?.title) {
      await updateTask(taskId, { title: title.trim() });
    }
  };

  const handleBlurDesc = async () => {
    setEditingDesc(false);
    if (description !== task?.description) {
      await updateTask(taskId, { description: description.trim() });
    }
  };

  if (!task) return <LoadingSpinner fullscreen />;

  const assignees = members.filter((m) => task.assigneeIds.includes(m.id));
  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
          </Pressable>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            onBlur={handleBlurTitle}
            multiline
          />
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Status row */}
          <View style={styles.metaRow}>
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <Text style={[styles.dueDate, overdue && styles.overdue]}>
                {overdue ? '⚠ ' : ''}{formatShortDate(task.dueDate)}
              </Text>
            )}
          </View>

          {/* Actions */}
          <Pressable onPress={handleComplete} disabled={completing} style={[styles.completeBtn, completing && styles.btnDisabled]}>
            {completing ? <ActivityIndicator size="small" color="#FFF" /> : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                <Text style={styles.completeBtnText}>Complete task</Text>
              </>
            )}
          </Pressable>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            {editingDesc ? (
              <TextInput
                style={styles.descInput}
                value={description}
                onChangeText={setDescription}
                onBlur={handleBlurDesc}
                multiline
                autoFocus
                placeholderTextColor={InputDefaults.placeholderTextColor}
                placeholder="Add a description..."
              />
            ) : (
              <Pressable onPress={() => setEditingDesc(true)} style={styles.descDisplay}>
                <Text style={[styles.descText, !description && styles.descPlaceholder]}>
                  {description || 'Tap to add description...'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Assignees */}
          {assignees.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assignees</Text>
              <View style={styles.assigneesRow}>
                {assignees.map((m) => (
                  <View key={m.id} style={styles.assignee}>
                    <Avatar uri={m.avatarUri} name={m.fullName} size="sm" />
                    <Text style={styles.assigneeName}>{m.fullName.split(' ')[0]}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Checklist */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Checklist {checklist.length > 0 ? `(${checklist.filter((i) => i.isCompleted).length}/${checklist.length})` : ''}
            </Text>
            {checklist.map((item) => (
              <Pressable key={item.id} onPress={() => handleToggleCheck(item.id)} style={styles.checkItem}>
                <Ionicons name={item.isCompleted ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={item.isCompleted ? SEMANTIC.green : TEXT.muted} />
                <Text style={[styles.checkItemText, item.isCompleted && styles.checkItemDone]}>{item.text}</Text>
              </Pressable>
            ))}
            <View style={styles.addCheckRow}>
              <TextInput
                style={styles.addCheckInput}
                value={newCheckItem}
                onChangeText={setNewCheckItem}
                placeholder="Add item..."
                placeholderTextColor={InputDefaults.placeholderTextColor}
                onSubmitEditing={handleAddCheck}
              />
              <Pressable onPress={handleAddCheck} style={styles.addCheckBtn}>
                <Ionicons name="add" size={18} color={ACCENT.blue} />
              </Pressable>
            </View>
          </View>

          {/* Danger zone */}
          <Pressable onPress={() => setShowCancel(true)} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel task</Text>
          </Pressable>
        </ScrollView>

        <ConfirmDialog
          visible={showCancel}
          title="Cancel task"
          message="This will mark the task as cancelled."
          destructive
          confirmLabel="Cancel task"
          onConfirm={handleCancel}
          onCancel={() => setShowCancel(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 12, borderBottomWidth: 0.5, borderBottomColor: BORDER.default },
  titleInput: { flex: 1, fontSize: FontSize.xl, fontFamily: FontFamily.soraSemiBold, color: TEXT.primary, lineHeight: 26 },
  container: { padding: 16, gap: 20, paddingBottom: 40 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  dueDate: { fontSize: FontSize.sm, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  overdue: { color: SEMANTIC.red },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: SEMANTIC.green, borderRadius: 8, paddingVertical: 13, minHeight: 48,
  },
  btnDisabled: { opacity: 0.6 },
  completeBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: '#FFF' },
  section: { gap: 10 },
  sectionTitle: { fontSize: FontSize.sm, fontFamily: FontFamily.interSemiBold, color: TEXT.secondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  descInput: { backgroundColor: InputDefaults.backgroundColor, borderRadius: InputDefaults.borderRadius, borderWidth: InputDefaults.borderWidth, borderColor: InputDefaults.focusedBorderColor, color: TEXT.primary, padding: 12, fontSize: FontSize.md, fontFamily: FontFamily.interRegular, minHeight: 80 },
  descDisplay: { padding: 12, backgroundColor: BG.bg2, borderRadius: 8, minHeight: 60, justifyContent: 'center' },
  descText: { fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.secondary, lineHeight: 20 },
  descPlaceholder: { color: TEXT.muted },
  assigneesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  assignee: { alignItems: 'center', gap: 4 },
  assigneeName: { fontSize: FontSize.xs, fontFamily: FontFamily.interRegular, color: TEXT.secondary },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  checkItemText: { flex: 1, fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.primary },
  checkItemDone: { textDecorationLine: 'line-through', color: TEXT.muted },
  addCheckRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addCheckInput: { flex: 1, backgroundColor: InputDefaults.backgroundColor, borderRadius: InputDefaults.borderRadius, borderWidth: InputDefaults.borderWidth, borderColor: InputDefaults.borderColor, color: TEXT.primary, paddingHorizontal: 12, paddingVertical: 8, fontSize: FontSize.md, fontFamily: FontFamily.interRegular },
  addCheckBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: ACCENT.blueDim, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { backgroundColor: SEMANTIC.redDim, borderWidth: 1, borderColor: SEMANTIC.redBorder, borderRadius: 8, padding: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: SEMANTIC.red },
});
