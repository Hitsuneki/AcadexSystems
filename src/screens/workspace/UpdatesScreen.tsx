import { Toast } from "@/components/AcadexToast";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AnnouncementCard } from "@/components/AnnouncementCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ACCENT, BG, BORDER, TEXT } from "@/constants/colors";
import { InputDefaults } from "@/constants/theme";
import { FontFamily } from "@/constants/typography";
import { useAnnouncements } from "@/hooks/use-announcements";
import { useProjectMembers } from "@/hooks/use-project-members";
import {
  deleteAnnouncement,
  postAnnouncement,
  toggleReaction,
} from "@/services/announcement.service";
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

  const handlePost = async () => {
    if (!body.trim() || !user) return;
    setSending(true);
    try {
      await postAnnouncement(projectId, user.uid, body.trim());
      setBody("");
    } catch {
      Toast.show({ type: "error", text1: "Failed to post" });
    } finally {
      setSending(false);
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
      <View style={styles.postBar}>
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
          disabled={sending || !body.trim()}
          style={[
            styles.sendBtn,
            (!body.trim() || sending) && styles.sendBtnDisabled,
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="send" size={18} color="#FFF" />
          )}
        </Pressable>
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
  postBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER.default,
    backgroundColor: BG.bg0,
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
    borderRadius: 22,
    backgroundColor: ACCENT.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.5 },
  listContent: { padding: 12, flexGrow: 1 },
});
