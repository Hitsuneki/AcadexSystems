import { Toast } from "@/components/AcadexToast";
import { db } from "@/config/firebase";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AnnouncementCard } from "@/components/AnnouncementCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ACCENT, BG, BORDER, TEXT } from "@/constants/colors";
import { InputDefaults } from "@/constants/theme";
import { FontFamily, FontSize } from "@/constants/typography";
import { useAnnouncements } from "@/hooks/use-announcements";
import { useProjectMembers } from "@/hooks/use-project-members";
import {
  deleteAnnouncement,
  postAnnouncement,
  toggleReaction,
} from "@/services/announcement.service";
import { uploadFile } from "@/services/file.service";
import { useAuthStore } from "@/stores/auth.store";
import { useProjectStore } from "@/stores/project.store";

interface UpdatesScreenProps {
  projectId: string;
}

export default function UpdatesScreen({ projectId }: UpdatesScreenProps) {
  const { user } = useAuthStore();
  const { currentProject } = useProjectStore();
  const { announcements, loading, toggleReactionLocal } =
    useAnnouncements(projectId);
  const { members } = useProjectMembers(currentProject?.memberIds);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentAsset, setAttachmentAsset] = useState<any>(null);

  const handlePickAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.[0]) {
        setAttachmentAsset(result.assets[0]);
      }
    } catch {
      Toast.show({ type: "error", text1: "Failed to pick file" });
    }
  };

  const handlePost = async () => {
    if (!body.trim() || !user) return;
    setSending(true);
    try {
      let attachmentUrl: string | null = null;
      if (attachmentAsset) {
        setUploadingAttachment(true);
        const fileId = await uploadFile(
          projectId,
          user.uid,
          attachmentAsset.uri,
          attachmentAsset.name,
          attachmentAsset.mimeType ?? "application/octet-stream",
          attachmentAsset.size ?? 0
        );
        const snapshot = await getDoc(doc(db, "files", fileId));
        attachmentUrl = (snapshot.data()?.storageUrl as string) ?? null;
        setUploadingAttachment(false);
      }

      await postAnnouncement(projectId, user.uid, body.trim(), attachmentUrl);
      setBody("");
      setAttachmentAsset(null);
    } catch {
      Toast.show({ type: "error", text1: "Failed to post" });
    } finally {
      setSending(false);
      setUploadingAttachment(false);
    }
  };

  const handleReact = async (id: string) => {
    if (!user) return;
    toggleReactionLocal(id, user.uid);
    await toggleReaction(id, user.uid);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteAnnouncement(deleteId);
    setDeleteId(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Post bar */}
      <View style={styles.postContainer}>
        {attachmentAsset && (
          <View style={styles.attachmentPreview}>
            <Ionicons name="document-attach" size={16} color={ACCENT.signal} />
            <Text style={styles.attachmentName} numberOfLines={1}>
              {attachmentAsset.name}
            </Text>
            <Pressable onPress={() => setAttachmentAsset(null)} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={TEXT.muted} />
            </Pressable>
          </View>
        )}
        <View style={styles.postBar}>
          <Pressable onPress={handlePickAttachment} disabled={sending || uploadingAttachment} style={styles.attachBtn}>
            <Ionicons name="attach" size={24} color={TEXT.secondary} />
          </Pressable>
          <TextInput
            style={styles.postInput}
            value={body}
            onChangeText={setBody}
            placeholder="Share an update..."
            placeholderTextColor={InputDefaults.placeholderTextColor}
            multiline
          />
          <Pressable
            onPress={handlePost}
            disabled={sending || uploadingAttachment || !body.trim()}
            style={[
              styles.sendBtn,
              (!body.trim() || sending || uploadingAttachment) && styles.sendBtnDisabled,
            ]}
          >
            {sending || uploadingAttachment ? (
              <ActivityIndicator size="small" color={TEXT.inverse} />
            ) : (
              <Ionicons name="send" size={18} color={TEXT.inverse} />
            )}
          </Pressable>
        </View>
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnnouncementCard
            announcement={item}
            author={members.find((m) => m.id === item.authorId)}
            currentUserId={user?.uid}
            onReact={handleReact}
            onDelete={(id) => setDeleteId(id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="megaphone-outline"
            title="No announcements"
            subtitle="Be the first to post an update"
          />
        }
        showsVerticalScrollIndicator={false}
        inverted={announcements.length > 0}
      />

      <ConfirmDialog
        visible={!!deleteId}
        title="Delete announcement"
        message="This action cannot be undone."
        destructive
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.bg0 },
  postContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER.default,
    backgroundColor: BG.bg0,
  },
  attachmentPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: BG.bg1,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER.default,
  },
  attachmentName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interMedium,
    color: TEXT.primary,
  },
  postBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
  },
  attachBtn: {
    padding: 8,
    marginBottom: 2,
  },
  postInput: {
    flex: 1,
    backgroundColor: InputDefaults.backgroundColor,
    borderRadius: InputDefaults.borderRadius,
    borderWidth: InputDefaults.borderWidth,
    borderColor: InputDefaults.borderColor,
    color: TEXT.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: InputDefaults.fontSize,
    fontFamily: FontFamily.interRegular,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: ACCENT.signal,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.5 },
  listContent: { padding: 12, flexGrow: 1 },
});
