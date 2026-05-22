import { Toast } from "@/components/AcadexToast";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

import { CoursePicker } from "@/components/CoursePicker";
import { FormInput } from "@/components/FormInput";
import { ACCENT, BG, BORDER, TEXT } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import {
  getUserProfile,
  saveUserProfile,
  signOutUser,
  uploadAvatar,
} from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import type { RoleLabel } from "@/types";
import { pickProfileImage } from "@/utils/pickImage";
import { validateRequired } from "@/utils/validation";

const ROLES: RoleLabel[] = ["Student", "Teacher", "Researcher", "Professional"];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { user, profile, setProfile, clearAuth } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarMime, setAvatarMime] = useState("image/jpeg");
  const [course, setCourse] = useState("");
  const [bio, setBio] = useState("");
  const [roleLabel, setRoleLabel] = useState<RoleLabel>("Student");
  const [loading, setLoading] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; course?: string }>({});

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? "");
      setCourse(profile.course ?? "");
      setBio(profile.bio ?? "");
      setRoleLabel(profile.roleLabel ?? "Student");
      if (profile.avatarUri) setAvatarUri(profile.avatarUri);
    } else if (user) {
      getUserProfile(user.uid)
        .then((doc) => {
          if (!doc) return;
          setFullName(doc.fullName ?? "");
          setCourse(doc.course ?? "");
          setBio(doc.bio ?? "");
          setRoleLabel(doc.roleLabel ?? "Student");
          if (doc.avatarUri) setAvatarUri(doc.avatarUri);
        })
        .catch(() => {});
    }
  }, [profile, user]);

  const pickAvatar = async () => {
    setPickingImage(true);
    try {
      const picked = await pickProfileImage();
      if (picked) {
        setAvatarUri(picked.uri);
        setAvatarMime(picked.mimeType);
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Could not open photos",
        text2: err?.message,
      });
    } finally {
      setPickingImage(false);
    }
  };

  const handleBack = async () => {
    try {
      await signOutUser();
      clearAuth();
      router.replace("/(auth)/login");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Could not sign out",
        text2: err?.message,
      });
    }
  };

  const handleContinue = async () => {
    const nameErr = validateRequired(fullName, "Full name");
    const courseErr = validateRequired(course, "Course / program");
    if (nameErr || courseErr) {
      setErrors({
        fullName: nameErr ?? undefined,
        course: courseErr ?? undefined,
      });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      if (!user) throw new Error("Not signed in");

      let avatarUrl: string | undefined;
      if (avatarUri && !avatarUri.startsWith("http")) {
        avatarUrl = await uploadAvatar(user.uid, avatarUri, avatarMime);
      } else if (avatarUri) {
        avatarUrl = avatarUri;
      }

      await saveUserProfile(user.uid, {
        fullName: fullName.trim(),
        course: course.trim(),
        roleLabel,
        bio: bio.trim() || undefined,
        avatarUrl,
        email: user.email,
      });

      const updated = await getUserProfile(user.uid);
      if (updated) setProfile(updated);
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
          <Pressable onPress={handleBack} hitSlop={8} style={styles.backRow}>
            <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.heading}>Set up your profile</Text>
            <Text style={styles.sub}>Tell us about yourself</Text>
          </View>

          <Pressable
            onPress={pickAvatar}
            disabled={pickingImage}
            style={styles.avatarWrap}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-outline" size={36} color={TEXT.muted} />
              </View>
            )}
            <View style={styles.cameraIcon}>
              {pickingImage ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              )}
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>Tap to add a profile photo (optional)</Text>

          <View style={styles.form}>
            <FormInput
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              error={errors.fullName}
            />

            <CoursePicker
              value={course}
              onChange={setCourse}
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
  container: { flexGrow: 1, padding: 24, gap: 20, alignItems: "stretch" },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  backText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interMedium,
    color: TEXT.secondary,
  },
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
  avatarHint: {
    alignSelf: "center",
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.muted,
    marginTop: -12,
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
