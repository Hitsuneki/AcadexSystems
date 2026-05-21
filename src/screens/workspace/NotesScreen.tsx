import React, { useState } from 'react';
import { View, FlatList, Pressable, StyleSheet, Alert, TextInput, Modal, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import { NoteCard } from '@/components/NoteCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/auth.store';
import { useNotes } from '@/hooks/use-notes';
import { createNote } from '@/services/note.service';
import { ACCENT, BG, BG as bg, BORDER, TEXT } from '@/constants/colors';
import { InputDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';

interface NotesScreenProps {
  projectId: string;
}

export default function NotesScreen({ projectId }: NotesScreenProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { notes, loading, addNote } = useNotes(projectId);
  const [showPrompt, setShowPrompt] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!noteTitle.trim() || !user) return;
    setCreating(true);
    try {
      const note = await createNote(projectId, user.uid, noteTitle.trim());
      addNote(note);
      setShowPrompt(false);
      setNoteTitle('');
      router.push(`/project/${projectId}/note/${note.id}`);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to create note' });
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard note={item} onPress={() => router.push(`/project/${projectId}/note/${item.id}`)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="document-text-outline" title="No notes yet" subtitle="Create your first note to capture ideas" action="New note" onAction={() => setShowPrompt(true)} />}
        showsVerticalScrollIndicator={false}
      />

      <Pressable onPress={() => setShowPrompt(true)} style={styles.fab}>
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>

      {/* Title prompt modal */}
      <Modal visible={showPrompt} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.prompt}>
            <Text style={styles.promptTitle}>New note</Text>
            <TextInput
              style={styles.promptInput}
              value={noteTitle}
              onChangeText={setNoteTitle}
              placeholder="Note title..."
              placeholderTextColor={InputDefaults.placeholderTextColor}
              autoFocus
              onSubmitEditing={handleCreate}
            />
            <View style={styles.promptButtons}>
              <Pressable onPress={() => { setShowPrompt(false); setNoteTitle(''); }} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleCreate} disabled={creating || !noteTitle.trim()} style={[styles.createBtn, (!noteTitle.trim() || creating) && styles.btnDisabled]}>
                {creating ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.createBtnText}>Create</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.bg0 },
  listContent: { padding: 16, flexGrow: 1 },
  fab: {
    position: 'absolute', bottom: 24, right: 20, width: 52, height: 52, borderRadius: 26,
    backgroundColor: ACCENT.blue, alignItems: 'center', justifyContent: 'center',
    shadowColor: ACCENT.blue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  prompt: { backgroundColor: BG.bg2, borderRadius: 12, borderWidth: 0.5, borderColor: BORDER.default, padding: 20, width: '100%', maxWidth: 320, gap: 14 },
  promptTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  promptInput: { backgroundColor: InputDefaults.backgroundColor, borderRadius: InputDefaults.borderRadius, borderWidth: InputDefaults.borderWidth, borderColor: InputDefaults.borderColor, color: TEXT.primary, padding: 12, fontSize: InputDefaults.fontSize, fontFamily: FontFamily.interRegular },
  promptButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: BORDER.default, alignItems: 'center' },
  cancelBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: TEXT.secondary },
  createBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: ACCENT.blue, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  createBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: '#FFF' },
});
