import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Toast } from '@/components/AcadexToast';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/Avatar';
import { PriorityBadge } from '@/components/PriorityBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BG, BORDER, TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
import { InputDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatShortDate, isOverdue } from '@/utils/date';
import { useTasks } from '@/hooks/use-tasks';
import { useProjectMembers } from '@/hooks/use-project-members';
import { useProjectStore } from '@/stores/project.store';
import { useFiles } from '@/hooks/use-files';
import {
  completeTask,
  cancelTask,
  updateTask,
  toggleChecklistItem,
  addChecklistItem,
  attachFileToTask,
  removeFileFromTask,
  assignMembers,
  moveTask,
} from '@/services/task.service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { uploadFile } from '@/services/file.service';
import { useAuthStore } from '@/stores/auth.store';
import { pickTaskImage } from '@/utils/pickImage';
import type { TaskStatus } from '@/types';

const COLUMN_OPTIONS: { key: TaskStatus; label: string }[] = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'inProgress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
];

function fileNameFromUrl(url: string): string {
  try {
    const segment = decodeURIComponent(url.split('/').pop() ?? 'Attachment');
    const parts = segment.split('-');
    return parts.length > 2 ? parts.slice(2).join('-') : segment;
  } catch {
    return 'Attachment';
  }
}

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
}

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
  const [addingCheck, setAddingCheck] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [movingColumn, setMovingColumn] = useState(false);
  const [savingAssignees, setSavingAssignees] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>(task?.assigneeIds ?? []);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setSelectedAssigneeIds(task.assigneeIds);
    }
  }, [task?.id, task?.title, task?.description, task?.assigneeIds]);

  const checklist = task?.checklist ?? [];

  const taskFiles = useMemo(() => {
    const urls = task?.attachmentUrls ?? [];
    return urls.map((url) => {
      const matched = files.find((f) => f.storageUrl === url);
      return {
        url,
        name: matched?.fileName ?? fileNameFromUrl(url),
        fileType: matched?.fileType ?? 'txt',
      };
    });
  }, [task?.attachmentUrls, files]);

  const imageFiles = taskFiles.filter((file) => isImageUrl(file.url));

  const handleComplete = async () => {
    if (!user?.uid || !projectId) return;
    setCompleting(true);
    try {
      await completeTask(taskId, user.uid, projectId);
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
      await cancelTask(taskId, user?.uid, projectId);
      setShowCancel(false);
      router.back();
    } finally {
      setCancelling(false);
    }
  };

  const handleToggleCheck = async (itemId: string) => {
    await toggleChecklistItem(taskId, itemId);
  };

  const handleAddCheck = async () => {
    const label = newCheckItem.trim();
    if (!label || addingCheck) return;
    setAddingCheck(true);
    try {
      await addChecklistItem(taskId, label);
      setNewCheckItem('');
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to add checklist item' });
    } finally {
      setAddingCheck(false);
    }
  };

  const handleSaveTask = async () => {
    if (!title.trim()) return;
    setSavingTask(true);
    try {
      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim(),
      });
      Toast.show({ type: 'success', text1: 'Changes saved' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save changes' });
    } finally {
      setSavingTask(false);
    }
  };

  const handleMoveColumn = async (column: TaskStatus) => {
    if (!task || task.status === column || !user?.uid) return;
    setMovingColumn(true);
    try {
      await moveTask(taskId, task.column ?? task.status, column, user.uid, projectId);
      Toast.show({ type: 'success', text1: `Moved to ${COLUMN_OPTIONS.find((c) => c.key === column)?.label}` });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to move task' });
    } finally {
      setMovingColumn(false);
    }
  };

  const toggleAssignee = async (memberId: string) => {
    const next = selectedAssigneeIds.includes(memberId)
      ? selectedAssigneeIds.filter((id) => id !== memberId)
      : [...selectedAssigneeIds, memberId];
    setSelectedAssigneeIds(next);
    setSavingAssignees(true);
    try {
      await assignMembers(taskId, next);
    } catch {
      setSelectedAssigneeIds(task?.assigneeIds ?? []);
      Toast.show({ type: 'error', text1: 'Failed to update assignees' });
    } finally {
      setSavingAssignees(false);
    }
  };

  const handleUploadFile = async () => {
    if (!user?.uid || !projectId) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setUploadingFile(true);
      const fileId = await uploadFile(
        projectId,
        user.uid,
        asset.uri,
        asset.name,
        asset.mimeType ?? 'application/octet-stream',
        asset.size ?? 0,
      );
      const snapshot = await getDoc(doc(db, 'files', fileId));
      const url = snapshot.data()?.storageUrl as string | undefined;
      if (url) {
        await attachFileToTask(taskId, url);
      }
      Toast.show({ type: 'success', text1: 'File attached' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to upload file' });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUploadImage = async () => {
    if (!user?.uid || !projectId) return;
    try {
      const image = await pickTaskImage();
      if (!image) return;

      setUploadingFile(true);
      const fileId = await uploadFile(
        projectId,
        user.uid,
        image.uri,
        image.fileName,
        image.mimeType,
        image.fileSize,
      );
      const snapshot = await getDoc(doc(db, 'files', fileId));
      const url = snapshot.data()?.storageUrl as string | undefined;
      if (url) {
        await attachFileToTask(taskId, url);
      }
      Toast.show({ type: 'success', text1: 'Image attached' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to upload image' });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveAttachment = async (url: string) => {
    try {
      await removeFileFromTask(taskId, url);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to remove attachment' });
    }
  };

  if (!task) return <LoadingSpinner fullscreen />;

  const assignees = members.filter((m) => selectedAssigneeIds.includes(m.id));
  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
          </Pressable>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            multiline
          />
          <Pressable onPress={handleSaveTask} disabled={savingTask} style={styles.saveBtn}>
            {savingTask ? <ActivityIndicator size="small" color={ACCENT.primary} /> : <Text style={styles.saveBtnText}>Save</Text>}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.metaRow}>
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <Text style={[styles.dueDate, overdue && styles.overdue]}>
                {overdue ? '⚠ ' : ''}{formatShortDate(task.dueDate)}
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.columnRow}>
              {COLUMN_OPTIONS.map((col) => {
                const active = task.status === col.key;
                return (
                  <Pressable
                    key={col.key}
                    disabled={movingColumn}
                    onPress={() => handleMoveColumn(col.key)}
                    style={[styles.columnChip, active && styles.columnChipActive]}
                  >
                    <Text style={[styles.columnChipText, active && styles.columnChipTextActive]}>{col.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable onPress={handleComplete} disabled={completing || task.status === 'done'} style={[styles.completeBtn, (completing || task.status === 'done') && styles.btnDisabled]}>
            {completing ? <ActivityIndicator size="small" color={TEXT.inverse} /> : (
              <>
                <Ionicons name="checkmark-circle" size={18} color={TEXT.inverse} />
                <Text style={styles.completeBtnText}>{task.status === 'done' ? 'Completed' : 'Mark complete'}</Text>
              </>
            )}
          </Pressable>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            {editingDesc ? (
                <TextInput
                  style={styles.descInput}
                  value={description}
                  onChangeText={setDescription}
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

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Assignees</Text>
              {savingAssignees && <ActivityIndicator size="small" color={ACCENT.primary} />}
            </View>
            {members.length === 0 ? (
              <Text style={styles.hint}>No project members loaded</Text>
            ) : (
              <View style={styles.memberPickRow}>
                {members.map((m) => {
                  const selected = selectedAssigneeIds.includes(m.id);
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => toggleAssignee(m.id)}
                      style={[styles.memberChip, selected && styles.memberChipSelected]}
                    >
                      <Avatar uri={m.avatarUri} name={m.fullName} size="sm" />
                      <Text style={[styles.memberChipText, selected && styles.memberChipTextSelected]} numberOfLines={1}>
                        {m.id === user?.uid ? 'You' : m.fullName.split(' ')[0]}
                      </Text>
                      {selected && <Ionicons name="checkmark" size={14} color={ACCENT.primary} />}
                    </Pressable>
                  );
                })}
              </View>
            )}
            {assignees.length > 0 && (
              <Text style={styles.hint}>{assignees.length} assigned — visible on My Tasks</Text>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Attachments</Text>
              {uploadingFile && <ActivityIndicator size="small" color={ACCENT.primary} />}
            </View>
            <View style={styles.attachmentActions}>
              <Pressable onPress={handleUploadImage} disabled={uploadingFile} style={styles.attachBtn}>
                <Ionicons name="image-outline" size={16} color={ACCENT.primary} />
                <Text style={styles.attachBtnText}>Image</Text>
              </Pressable>
              <Pressable onPress={handleUploadFile} disabled={uploadingFile} style={styles.attachBtn}>
                <Ionicons name="cloud-upload-outline" size={16} color={ACCENT.primary} />
                <Text style={styles.attachBtnText}>File</Text>
              </Pressable>
            </View>
            {taskFiles.length === 0 ? (
              <Text style={styles.hint}>No files attached yet</Text>
            ) : (
              <>
                {imageFiles.length > 0 && (
                  <View style={styles.imageGrid}>
                    {imageFiles.map((file) => (
                      <View key={file.url} style={styles.imageTile}>
                        <Pressable onPress={() => Linking.openURL(file.url)} style={{ flex: 1 }}>
                          <Image source={{ uri: file.url }} style={styles.imagePreview} resizeMode="cover" />
                        </Pressable>
                        <Pressable onPress={() => handleRemoveAttachment(file.url)} style={styles.removeImageBtn} hitSlop={8}>
                          <Ionicons name="close-circle" size={22} color={SEMANTIC.red} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
                {taskFiles.filter(f => !isImageUrl(f.url)).map((file) => (
                  <View key={file.url} style={styles.fileRow}>
                    <Pressable onPress={() => Linking.openURL(file.url)} style={styles.fileLink}>
                      <Ionicons name="document-outline" size={20} color={ACCENT.primary} />
                      <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                      <Ionicons name="open-outline" size={16} color={TEXT.muted} />
                    </Pressable>
                    <Pressable onPress={() => handleRemoveAttachment(file.url)} hitSlop={8} style={{ padding: 4 }}>
                      <Ionicons name="trash-outline" size={18} color={SEMANTIC.red} />
                    </Pressable>
                  </View>
                ))}
              </>
            )}
          </View>

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
                editable={!addingCheck}
              />
              <Pressable onPress={handleAddCheck} disabled={addingCheck} style={styles.addCheckBtn}>
                {addingCheck ? <ActivityIndicator size="small" color={ACCENT.primary} /> : <Ionicons name="add" size={18} color={ACCENT.primary} />}
              </Pressable>
            </View>
          </View>

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
  saveBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  saveBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: ACCENT.primary },
  container: { padding: 16, gap: 20, paddingBottom: 40 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  dueDate: { fontSize: FontSize.sm, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  overdue: { color: SEMANTIC.red },
  section: { gap: 10 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: FontSize.sm, fontFamily: FontFamily.interSemiBold, color: TEXT.secondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  columnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  columnChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: BORDER.default,
    backgroundColor: BG.bg2,
  },
  columnChipActive: { borderColor: ACCENT.primary, backgroundColor: ACCENT.primaryDim },
  columnChipText: { fontSize: FontSize.xs, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  columnChipTextActive: { color: ACCENT.primary },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: SEMANTIC.green, borderRadius: 0, paddingVertical: 13, minHeight: 48,
  },
  btnDisabled: { opacity: 0.6 },
  completeBtnText: { fontSize: FontSize.sm, fontFamily: FontFamily.mono, color: TEXT.inverse, textTransform: 'uppercase' },
  descInput: { backgroundColor: InputDefaults.backgroundColor, borderRadius: InputDefaults.borderRadius, borderWidth: InputDefaults.borderWidth, borderColor: InputDefaults.focusedBorderColor, color: TEXT.primary, padding: 12, fontSize: FontSize.md, fontFamily: FontFamily.interRegular, minHeight: 80 },
  descDisplay: { padding: 12, backgroundColor: BG.bg2, borderRadius: 0, minHeight: 60, justifyContent: 'center' },
  descText: { fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.secondary, lineHeight: 20 },
  descPlaceholder: { color: TEXT.muted },
  hint: { fontSize: FontSize.sm, fontFamily: FontFamily.interRegular, color: TEXT.muted },
  memberPickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: BORDER.default,
    backgroundColor: BG.bg2,
    maxWidth: '48%',
  },
  memberChipSelected: { borderColor: ACCENT.primary, backgroundColor: ACCENT.primaryDim },
  memberChipText: { fontSize: FontSize.sm, fontFamily: FontFamily.interMedium, color: TEXT.secondary, flexShrink: 1 },
  memberChipTextSelected: { color: ACCENT.primary },
  attachmentActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 0,
    backgroundColor: ACCENT.primaryDim,
  },
  attachBtnText: { fontSize: FontSize.sm, fontFamily: FontFamily.interSemiBold, color: ACCENT.primary },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageTile: {
    width: '31.5%',
    minWidth: 96,
    aspectRatio: 1,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: BG.bg2,
    borderWidth: 0.5,
    borderColor: BORDER.default,
  },
  imagePreview: { width: '100%', height: '100%' },
  removeImageBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: BG.bg0, borderRadius: 0 },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: BG.bg2,
    borderRadius: 0,
    borderWidth: 0.5,
    borderColor: BORDER.default,
  },
  fileLink: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fileName: { flex: 1, fontSize: FontSize.md, fontFamily: FontFamily.interMedium, color: TEXT.primary },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  checkItemText: { flex: 1, fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.primary },
  checkItemDone: { textDecorationLine: 'line-through', color: TEXT.muted },
  addCheckRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addCheckInput: { flex: 1, backgroundColor: InputDefaults.backgroundColor, borderRadius: InputDefaults.borderRadius, borderWidth: InputDefaults.borderWidth, borderColor: InputDefaults.borderColor, color: TEXT.primary, paddingHorizontal: 12, paddingVertical: 8, fontSize: FontSize.md, fontFamily: FontFamily.interRegular },
  addCheckBtn: { width: 36, height: 36, borderRadius: 0, backgroundColor: ACCENT.primaryDim, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { backgroundColor: SEMANTIC.redDim, borderWidth: 1, borderColor: SEMANTIC.redBorder, borderRadius: 0, padding: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: SEMANTIC.red },
});
