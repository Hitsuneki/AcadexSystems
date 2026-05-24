import React, { useState } from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Toast } from '@/components/AcadexToast';
import { Ionicons } from '@expo/vector-icons';

import { FileCard } from '@/components/FileCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/stores/auth.store';
import { useFiles } from '@/hooks/use-files';
import { uploadFile } from '@/services/storage.service';
import { deleteFile } from '@/services/file.service';
import { ACCENT, BG } from '@/constants/colors';
import type { ProjectFile } from '@/types';

interface FilesScreenProps {
  projectId: string;
}

export default function FilesScreen({ projectId }: FilesScreenProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { files, loading, addOptimistic } = useFiles(projectId);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (!user) return;

    setUploading(true);
    const optimistic: ProjectFile = {
      id: `uploading-${Date.now()}`,
      projectId,
      fileName: asset.name,
      fileType: 'txt',
      fileSize: asset.size ?? 0,
      storageUrl: asset.uri,
      uploadedBy: user.uid,
      uploadedAt: new Date().toISOString(),
    };
    addOptimistic(optimistic);

    try {
      await uploadFile(projectId, user.uid, asset.uri, asset.name, asset.size ?? 0);
      Toast.show({ type: 'success', text1: 'File uploaded!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleFilePress = (file: ProjectFile) => {
    router.push(`/project/${projectId}/file/${file.id}` as never);
  };

  const handleDelete = async (file: ProjectFile) => {
    if (!user || !file.storagePath) return;
    try {
      await deleteFile(file.id, file.storagePath, user.uid, projectId);
      Toast.show({ type: 'success', text1: 'File deleted' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to delete file' });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FileCard file={item} onPress={() => handleFilePress(item)} onDelete={() => handleDelete(item)} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="document-outline" title="No files uploaded" subtitle="Upload your first file using the button below" />}
        showsVerticalScrollIndicator={false}
      />

      <Pressable onPress={handleUpload} disabled={uploading} style={[styles.fab, uploading && styles.fabDisabled]}>
        <Ionicons name={uploading ? 'hourglass-outline' : 'cloud-upload-outline'} size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.bg0 },
  listContent: { padding: 16, flexGrow: 1 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ACCENT.blue,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(37, 99, 235, 0.4)',
  },
  fabDisabled: { opacity: 0.6 },
});
