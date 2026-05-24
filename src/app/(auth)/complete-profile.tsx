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
import { SectionHeader } from "@/components/SectionHeader";
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
      // @ts-ignore
      const url = profile.avatarUrl || profile.avatarUri;
      if (url) setAvatarUri(url);
    } else if (user) {
      getUserProfile(user.uid)
        .then((doc) => {
          if (!doc) return;
          setFullName(doc.fullName ?? "");
          setCourse(doc.course ?? "");
          setBio(doc.bio ?? "");
          setRoleLabel(doc.roleLabel ?? "Student");
          // @ts-ignore
          const url = doc.avatarUrl || doc.avatarUri;
          if (url) setAvatarUri(url);
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
      Toast.show({ type: "error", text1: "Could not open photos" });
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
      Toast.show({ type: "error", text1: "Could not sign out" });
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
      if (updated) {
        setProfile(updated);
        router.replace("/(main)");
      }
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Failed to save profile" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
          <Pressable onPress={handleBack} hitSlop={8} style={styles.backRow}>
            <Text style={styles.backText}>← LOGOUT</Text>
          </Pressable>

          <SectionHeader title="PROFILE.INIT" />

          <View style={styles.header}>
            <Text style={styles.heading}>OPERATOR PROFILE</Text>
          </View>

          <Pressable onPress={pickAvatar} disabled={pickingImage} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {fullName ? fullName.trim()[0]?.toUpperCase() : "?"}
                </Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              {pickingImage ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons name="cloud-upload" size={14} color="#000" />
              )}
            </View>
          </Pressable>

          <View style={styles.form}>
            <FormInput
              label="ID.FULLNAME"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              error={errors.fullName}
            />

            <CoursePicker
              label="COURSE.FIELD"
              value={course}
              onChange={setCourse}
              error={errors.course}
            />

            <View style={styles.section}>
              <Text style={styles.label}>ROLE.CLASS</Text>
              <View style={styles.roleRow}>
                {ROLES.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRoleLabel(r)}
                  >
                    <Text
                      style={[
                        styles.roleBtnText,
                        roleLabel === r && styles.roleBtnTextActive,
                      ]}
                    >
                      [{r.toUpperCase()}]
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <FormInput
              label="BIO.DESCRIPTION"
              value={bio}
              onChangeText={setBio}
              placeholder="A short bio..."
              multiline
              numberOfLines={3}
            />

            <Pressable onPress={handleContinue} disabled={loading} style={[styles.primaryBtn, loading && styles.btnDisabled]}>
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.primaryBtnText}>INIT PROFILE →</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.base },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, gap: 20 },
  backRow: { alignSelf: "flex-start", marginBottom: 16 },
  backText: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
  },
  header: { gap: 6, marginBottom: 16 },
  heading: {
    fontSize: FontSize.display,
    fontFamily: FontFamily.display,
    color: TEXT.t0,
  },
  avatarWrap: { alignSelf: "center", position: "relative", marginBottom: 24 },
  avatar: { width: 56, height: 56, borderRadius: 0, borderWidth: 1, borderColor: BORDER.mid },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 0,
    backgroundColor: BG.bg1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER.mid,
  },
  avatarInitials: {
    fontSize: FontSize.monoLg,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
  },
  cameraIcon: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 0,
    backgroundColor: ACCENT.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  form: { gap: 16 },
  section: { gap: 6, marginBottom: 14 },
  label: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
    textTransform: 'uppercase',
  },
  roleRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  roleBtnText: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
  },
  roleBtnTextActive: { color: ACCENT.primary },
  primaryBtn: {
    backgroundColor: ACCENT.primary,
    borderRadius: 0,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.interSemiBold,
    color: "#000",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
