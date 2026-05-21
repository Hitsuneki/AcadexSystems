import React, { useState } from 'react';
import { View, FlatList, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystemAPI from 'expo-file-system';
import { Toast } from '@/components/AcadexToast';
import { Ionicons } from '@expo/vector-icons';

import { FileCard } from '@/components/FileCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuthStore } from '@/stores/auth.store';
import { useFiles } from '@/hooks/use-files';
import { uploadFile } from '@/services/storage.service';
import { ACCENT, BG } from '@/constants/colors';
import type { ProjectFile } from '@/types';

interface FilesScreenProps {
  projectId: string;
}

export default function FilesScreen({ projectId }: FilesScreenProps) {
  const { user } = useAuthStore();
  const { files, loading, addOptimistic } = useFiles(projectId);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (!user) return;

    setUploading(true);
    // Optimistic update
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
      const file = await uploadFile(projectId, user.uid, asset.uri, asset.name, asset.size ?? 0);
      Toast.show({ type: 'success', text1: 'File uploaded!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleFilePress = (file: ProjectFile) => {
    const viewableTypes = ['jpg', 'png'];
    if (viewableTypes.includes(file.fileType)) {
      // Navigate to viewer — could be a modal or stack screen
    } else {
      Linking.openURL(file.storageUrl);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FileCard file={item} onPress={() => handleFilePress(item)} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="document-outline" title="No files uploaded" subtitle="Upload your first file using the button below" />}
        showsVerticalScrollIndicator={false}
      />

      {/* Upload FAB */}
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
