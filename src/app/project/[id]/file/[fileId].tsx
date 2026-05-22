import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { FileTypeIcon } from '@/components/FileTypeIcon';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useFiles } from '@/hooks/use-files';
import { BG, BORDER, TEXT, ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

function formatFileSize(bytes: number) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileViewerScreen() {
  const { id: projectId, fileId } = useLocalSearchParams<{ id: string; fileId: string }>();
  const router = useRouter();
  const { files, loading } = useFiles(projectId);
  const file = files.find((item) => item.id === fileId);

  if (loading) return <LoadingSpinner fullscreen />;

  if (!file) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
          </Pressable>
          <Text style={styles.title}>File</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>File unavailable</Text>
          <Text style={styles.emptyText}>This file could not be found in the current project.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isImage = file.fileType === 'jpg' || file.fileType === 'png';
  const uploadedDate = format(new Date(file.uploadedAt), 'MMM d, yyyy');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>File viewer</Text>
        <Pressable onPress={() => Linking.openURL(file.storageUrl)} hitSlop={8}>
          <Ionicons name="open-outline" size={20} color={ACCENT.blue} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.metaCard}>
          <FileTypeIcon fileType={file.fileType} size={44} />
          <View style={styles.metaText}>
            <Text style={styles.fileName} numberOfLines={2}>{file.fileName}</Text>
            <Text style={styles.fileMeta}>{formatFileSize(file.fileSize)} - Uploaded {uploadedDate}</Text>
          </View>
        </View>

        {isImage ? (
          <View style={styles.imageFrame}>
            <Image source={{ uri: file.storageUrl }} style={styles.image} contentFit="contain" />
          </View>
        ) : (
          <View style={styles.downloadPanel}>
            <FileTypeIcon fileType={file.fileType} size={64} />
            <Text style={styles.downloadTitle}>Download to view</Text>
            <Text style={styles.downloadText}>This file type opens in an external viewer.</Text>
            <Pressable onPress={() => Linking.openURL(file.storageUrl)} style={styles.downloadBtn}>
              <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              <Text style={styles.downloadBtnText}>Open file</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER.default,
    backgroundColor: BG.bg0,
  },
  headerSpacer: { width: 20 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.lg,
    fontFamily: FontFamily.soraSemiBold,
    color: TEXT.primary,
  },
  container: { padding: 16, gap: 16, paddingBottom: 32 },
  metaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: BORDER.default,
    backgroundColor: BG.bg1,
    padding: 12,
  },
  metaText: { flex: 1, gap: 4 },
  fileName: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.soraSemiBold,
    color: TEXT.primary,
  },
  fileMeta: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.muted,
  },
  imageFrame: {
    minHeight: 420,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: BORDER.default,
    backgroundColor: BG.bg1,
    overflow: 'hidden',
  },
  image: { width: '100%', minHeight: 420 },
  downloadPanel: {
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: BORDER.default,
    backgroundColor: BG.bg1,
    padding: 24,
  },
  downloadTitle: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.soraSemiBold,
    color: TEXT.primary,
  },
  downloadText: {
    textAlign: 'center',
    fontSize: FontSize.md,
    fontFamily: FontFamily.interRegular,
    color: TEXT.secondary,
  },
  downloadBtn: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: ACCENT.blue,
  },
  downloadBtnText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interSemiBold,
    color: '#FFFFFF',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.soraSemiBold,
    color: TEXT.primary,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: FontSize.md,
    fontFamily: FontFamily.interRegular,
    color: TEXT.secondary,
  },
});
