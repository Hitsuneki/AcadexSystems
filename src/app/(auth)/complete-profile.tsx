import { Toast } from "@/components/AcadexToast";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormInput } from "@/components/FormInput";
import { ACCENT, BG, BORDER, TEXT } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { updateUserProfile, uploadAvatar } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import type { RoleLabel } from "@/types";
import { validateRequired } from "@/utils/validation";

const ROLES: RoleLabel[] = ["Student", "Teacher", "Researcher", "Professional"];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { user, setProfile } = useAuthStore();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [course, setCourse] = useState("");
  const [bio, setBio] = useState("");
  const [roleLabel, setRoleLabel] = useState<RoleLabel>("Student");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ course?: string }>({});

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    const courseErr = validateRequired(course, "Course");
    if (courseErr) {
      setErrors({ course: courseErr });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      let finalAvatarUri: string | undefined;
      if (avatarUri && user) {
        finalAvatarUri = await uploadAvatar(user.uid, avatarUri);
      }
      if (user) {
        await updateUserProfile(user.uid, {
          course: course.trim(),
          roleLabel,
          bio: bio.trim() || undefined,
          avatarUri: finalAvatarUri,
        });
        // Update auth store so root layout guard fires and redirects to (main)
        setProfile({
          id: user.uid,
          fullName: "",
          email: user.email,
          course: course.trim(),
          roleLabel,
          bio: bio.trim() || undefined,
          avatarUri: finalAvatarUri,
          projectIds: [],
          completedTasksCount: 0,
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to save profile",
        text2: err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.heading}>Set up your profile</Text>
            <Text style={styles.sub}>Tell us about yourself</Text>
          </View>

          {/* Avatar upload */}
          <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-outline" size={36} color={TEXT.muted} />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </Pressable>

          <View style={styles.form}>
            <FormInput
              label="Course / Program"
              value={course}
              onChangeText={setCourse}
              placeholder="e.g. BS Computer Science"
              error={errors.course}
            />

            <View style={styles.section}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleRow}>
                {ROLES.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRoleLabel(r)}
                    style={[
                      styles.roleBtn,
                      roleLabel === r && styles.roleBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleBtnText,
                        roleLabel === r && styles.roleBtnTextActive,
                      ]}
                    >
                      {r}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <FormInput
              label="Bio (optional)"
              value={bio}
              onChangeText={setBio}
              placeholder="A short bio..."
              multiline
              numberOfLines={3}
            />

            <Pressable
              onPress={handleContinue}
              disabled={loading}
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Continue</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, gap: 28, alignItems: "stretch" },
  header: { gap: 6 },
  heading: {
    fontSize: FontSize["2xl"],
    fontFamily: FontFamily.soraSemiBold,
    color: TEXT.primary,
  },
  sub: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interRegular,
    color: TEXT.secondary,
  },
  avatarWrap: { alignSelf: "center", position: "relative" },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: BG.bg3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER.default,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: ACCENT.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  form: { gap: 16 },
  section: { gap: 8 },
  label: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interMedium,
    color: TEXT.secondary,
  },
  roleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  roleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER.default,
    backgroundColor: BG.bg2,
  },
  roleBtnActive: { borderColor: ACCENT.blue, backgroundColor: ACCENT.blueDim },
  roleBtnText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interMedium,
    color: TEXT.secondary,
  },
  roleBtnTextActive: { color: ACCENT.blue },
  primaryBtn: {
    backgroundColor: ACCENT.blue,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 48,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interSemiBold,
    color: "#FFFFFF",
  },
});
