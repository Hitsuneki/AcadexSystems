import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Switch } from 'react-native';
import { Toast } from '@/components/AcadexToast';
import { AcadexBottomSheet } from '../AcadexBottomSheet';
import { FormInput } from '../FormInput';
import { BG, TEXT, ACCENT, BORDER, COVER_COLORS } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { validateRequired } from '@/utils/validation';
import { createProject } from '@/services/project.service';
import type { Project, ProjectVisibility } from '@/types';

interface CreateProjectSheetProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  onCreated: (project: Project) => void;
}

export function CreateProjectSheet({ visible, onClose, userId, onCreated }: CreateProjectSheetProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subjectTag, setSubjectTag] = useState('');
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; subjectTag?: string }>({});

  const handleCreate = async () => {
    const nameErr = validateRequired(name, 'Project name');
    const tagErr = validateRequired(subjectTag, 'Subject tag');
    if (nameErr || tagErr) {
      setErrors({ name: nameErr ?? undefined, subjectTag: tagErr ?? undefined });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const project = await createProject(userId, {
        name: name.trim(),
        description: description.trim() || undefined,
        subjectTag: subjectTag.trim(),
        coverColor,
        visibility: isPublic ? 'public' : 'private',
      });
      onCreated(project);
      onClose();
      setName(''); setDescription(''); setSubjectTag('');
      Toast.show({
        type: 'success',
        text1: 'Project created!',
        text2: `Share code: ${project.inviteCode}`,
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to create project' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AcadexBottomSheet visible={visible} onClose={onClose} title="New project" snapPoints={['80%']} scrollable>
      <View style={styles.form}>
        <FormInput label="Project name" value={name} onChangeText={setName} placeholder="MOBILE APP RESEARCH" error={errors.name} />
        <FormInput label="Description (optional)" value={description} onChangeText={setDescription} placeholder="PROJECT BRIEF" multiline numberOfLines={3} />
        <FormInput label="Subject tag" value={subjectTag} onChangeText={setSubjectTag} placeholder="CS101 / DESIGN / RESEARCH" error={errors.subjectTag} />

        <View style={styles.section}>
          <Text style={styles.label}>Signal slot</Text>
          <View style={styles.colorRow}>
            {COVER_COLORS.map((c) => (
              <Pressable key={c} onPress={() => setCoverColor(c)} style={[styles.colorCircle, { backgroundColor: c }, coverColor === c && styles.colorCircleSelected]} />
            ))}
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Make project public</Text>
          <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: ACCENT.signal, false: BG.bg4 }} thumbColor={TEXT.primary} />
        </View>

        <Pressable onPress={handleCreate} disabled={loading} style={[styles.createBtn, loading && styles.createBtnDisabled]}>
          {loading ? (
            <ActivityIndicator size="small" color={TEXT.inverse} />
          ) : (
            <Text style={styles.createBtnText}>CREATE PROJECT</Text>
          )}
        </Pressable>
      </View>
    </AcadexBottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16, paddingTop: 16 },
  section: { gap: 8 },
  label: { fontSize: FontSize.xs, fontFamily: FontFamily.mono, color: TEXT.secondary, textTransform: 'uppercase' },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorCircle: { width: 32, height: 32, borderRadius: 0 },
  colorCircleSelected: { borderWidth: 2, borderColor: TEXT.primary, transform: [{ scale: 1.08 }] },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.mono, color: TEXT.primary, textTransform: 'uppercase' },
  createBtn: { backgroundColor: ACCENT.signal, borderRadius: 0, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: 8 },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { fontSize: FontSize.sm, fontFamily: FontFamily.mono, color: TEXT.inverse },
});
