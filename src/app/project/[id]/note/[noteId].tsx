import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { Toast } from '@/components/AcadexToast';
import { Ionicons } from '@expo/vector-icons';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/auth.store';
import { useNotes } from '@/hooks/use-notes';
import { updateNote } from '@/services/note.service';
import { BG, BORDER, TEXT, ACCENT } from '@/constants/colors';
import { InputDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatDate } from '@/utils/date';

export default function NoteDetailScreen() {
  const { id: projectId, noteId } = useLocalSearchParams<{ id: string; noteId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { notes } = useNotes(projectId);
  const note = notes.find((n) => n.id === noteId);

  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [editing, setEditing] = useState(!note?.body);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) { setTitle(note.title); setBody(note.body); }
  }, [note]);

  const handleSave = async () => {
    if (!user || !note) return;
    setSaving(true);
    try {
      await updateNote(noteId, { title: title.trim(), body, lastEditedBy: user.uid });
      Toast.show({ type: 'success', text1: 'Note saved' });
      setEditing(false);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  if (!note) return <LoadingSpinner fullscreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
          </Pressable>
          <View style={styles.headerCenter}>
            {editing ? (
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Note title"
                placeholderTextColor={InputDefaults.placeholderTextColor}
              />
            ) : (
              <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
            )}
            <Text style={styles.editedBy}>Last edited {formatDate(note.updatedAt)}</Text>
          </View>
          {editing ? (
            <Pressable onPress={handleSave} disabled={saving} style={styles.saveBtn}>
              {saving ? <ActivityIndicator size="small" color={ACCENT.blue} /> : <Text style={styles.saveBtnText}>Save</Text>}
            </Pressable>
          ) : (
            <Pressable onPress={() => setEditing(true)} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>
          )}
        </View>

        {editing ? (
          <TextInput
            style={styles.bodyInput}
            value={body}
            onChangeText={setBody}
            multiline
            placeholder="Write in Markdown..."
            placeholderTextColor={InputDefaults.placeholderTextColor}
            textAlignVertical="top"
          />
        ) : (
          <ScrollView contentContainerStyle={styles.markdownContainer}>
            <Markdown style={markdownStyles}>{body || '_No content yet. Tap Edit to write._'}</Markdown>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const markdownStyles = {
  body: { color: TEXT.secondary, fontFamily: FontFamily.interRegular, fontSize: FontSize.md, lineHeight: 22 },
  heading1: { color: TEXT.primary, fontFamily: FontFamily.soraBold, fontSize: FontSize['2xl'], marginBottom: 8 },
  heading2: { color: TEXT.primary, fontFamily: FontFamily.soraSemiBold, fontSize: FontSize.xl, marginBottom: 6 },
  heading3: { color: TEXT.primary, fontFamily: FontFamily.interSemiBold, fontSize: FontSize.lg, marginBottom: 4 },
  code_inline: { backgroundColor: BG.bg3, color: ACCENT.blue, fontFamily: FontFamily.interMedium, fontSize: FontSize.sm, paddingHorizontal: 4, borderRadius: 3 },
  fence: { backgroundColor: BG.bg2, borderRadius: 8, padding: 12 },
  blockquote: { backgroundColor: BG.bg2, borderLeftWidth: 3, borderLeftColor: ACCENT.blue, paddingLeft: 12 },
  bullet_list: { color: TEXT.secondary },
  ordered_list: { color: TEXT.secondary },
  strong: { color: TEXT.primary, fontFamily: FontFamily.interSemiBold },
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 0.5, borderBottomColor: BORDER.default },
  headerCenter: { flex: 1, gap: 2 },
  titleInput: { fontSize: FontSize.lg, fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  titleText: { fontSize: FontSize.lg, fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  editedBy: { fontSize: FontSize.sm, fontFamily: FontFamily.interRegular, color: TEXT.muted },
  saveBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  saveBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: ACCENT.blue },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  editBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interMedium, color: ACCENT.blue },
  bodyInput: { flex: 1, padding: 16, fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.primary, backgroundColor: BG.bg0, lineHeight: 22 },
  markdownContainer: { padding: 16, paddingBottom: 40 },
});
