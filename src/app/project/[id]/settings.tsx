import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Switch, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from '@/components/AcadexToast';
import { Ionicons } from '@expo/vector-icons';

import { FormInput } from '@/components/FormInput';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useProjectStore } from '@/stores/project.store';
import { updateProject, leaveProject, archiveProject } from '@/services/project.service';
import { useAuthStore } from '@/stores/auth.store';
import { BG, BORDER, TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
import { CardDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import { validateRequired } from '@/utils/validation';

export default function ProjectSettingsScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentProject } = useProjectStore();

  const [name, setName] = useState(currentProject?.name ?? '');
  const [description, setDescription] = useState(currentProject?.description ?? '');
  const [subjectTag, setSubjectTag] = useState(currentProject?.subjectTag ?? '');
  const [isPublic, setIsPublic] = useState(currentProject?.visibility === 'public');
  const [saving, setSaving] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleSave = async () => {
    const nameErr = validateRequired(name, 'Project name');
    if (nameErr) { setErrors({ name: nameErr }); return; }
    setErrors({});
    setSaving(true);
    try {
      await updateProject(projectId, { name: name.trim(), description: description.trim(), subjectTag: subjectTag.trim(), visibility: isPublic ? 'public' : 'private' });
      Toast.show({ type: 'success', text1: 'Settings saved' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    await leaveProject(user.uid, projectId);
    setShowLeave(false);
    router.replace('/(main)' as never);
  };

  const handleArchive = async () => {
    await archiveProject(projectId);
    setShowArchive(false);
    router.replace('/(main)' as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
          </Pressable>
          <Text style={styles.title}>Project settings</Text>
          <View style={{ width: 20 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <FormInput label="Project name" value={name} onChangeText={setName} error={errors.name} />
            <FormInput label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
            <FormInput label="Subject tag" value={subjectTag} onChangeText={setSubjectTag} />
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Public project</Text>
              <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: ACCENT.primary, false: BG.bg4 }} thumbColor={TEXT.primary} />
            </View>
          </View>

          <Pressable onPress={handleSave} disabled={saving} style={[styles.saveBtn, saving && styles.btnDisabled]}>
            {saving ? <ActivityIndicator size="small" color={TEXT.inverse} /> : <Text style={styles.saveBtnText}>SAVE CHANGES</Text>}
          </Pressable>

          {/* Danger zone */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger zone</Text>
            <Pressable onPress={() => setShowLeave(true)} style={styles.dangerBtn}>
              <Ionicons name="exit-outline" size={18} color={SEMANTIC.red} />
              <Text style={styles.dangerBtnText}>Leave project</Text>
            </Pressable>
            <Pressable onPress={() => setShowArchive(true)} style={styles.dangerBtn}>
              <Ionicons name="archive-outline" size={18} color={SEMANTIC.amber} />
              <Text style={[styles.dangerBtnText, { color: SEMANTIC.amber }]}>Archive project</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog visible={showLeave} title="Leave project" message="You'll lose access to this project." destructive confirmLabel="Leave" onConfirm={handleLeave} onCancel={() => setShowLeave(false)} />
      <ConfirmDialog visible={showArchive} title="Archive project" message="The project will be archived and hidden." destructive confirmLabel="Archive" onConfirm={handleArchive} onCancel={() => setShowArchive(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.base },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: BORDER.dim },
  title: { fontSize: FontSize.lg, fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  container: { padding: 16, gap: 24, paddingBottom: 40 },
  form: { gap: 16 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  toggleLabel: { fontSize: FontSize.md, fontFamily: FontFamily.interMedium, color: TEXT.primary },
  saveBtn: { backgroundColor: ACCENT.primary, borderRadius: 0, paddingVertical: 14, alignItems: 'center', minHeight: 48 },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: FontSize.sm, fontFamily: FontFamily.mono, color: TEXT.inverse, textTransform: 'uppercase' },
  dangerZone: { gap: 12 },
  dangerTitle: { fontSize: FontSize.sm, fontFamily: FontFamily.interSemiBold, color: SEMANTIC.red, textTransform: 'uppercase', letterSpacing: 0.8 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: SEMANTIC.redDim, borderRadius: 0, borderWidth: 0.5, borderColor: SEMANTIC.redBorder, padding: 14 },
  dangerBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: SEMANTIC.red },
});
