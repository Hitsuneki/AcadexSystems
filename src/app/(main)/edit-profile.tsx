import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Toast } from '@/components/AcadexToast';
import { Ionicons } from '@expo/vector-icons';

import { FormInput } from '@/components/FormInput';
import { BG, TEXT, ACCENT, BORDER } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { validateRequired } from '@/utils/validation';
import { updateUserProfile, uploadAvatar } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { RoleLabel } from '@/types';

const ROLES: RoleLabel[] = ['Student', 'Teacher', 'Researcher', 'Professional'];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, profile, setProfile } = useAuthStore();
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatarUri ?? null);
  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [course, setCourse] = useState(profile?.course ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [roleLabel, setRoleLabel] = useState<RoleLabel>(profile?.roleLabel ?? 'Student');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; course?: string }>({});

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    const nameErr = validateRequired(fullName, 'Full name');
    const courseErr = validateRequired(course, 'Course');
    if (nameErr || courseErr) { setErrors({ fullName: nameErr ?? undefined, course: courseErr ?? undefined }); return; }
    setErrors({});
    setLoading(true);
    try {
      let finalUri = avatarUri ?? undefined;
      if (avatarUri && avatarUri !== profile?.avatarUri && user) {
        finalUri = await uploadAvatar(user.uid, avatarUri);
      }
      if (user) {
        await updateUserProfile(user.uid, { fullName: fullName.trim(), course: course.trim(), bio: bio.trim() || undefined, roleLabel, avatarUri: finalUri });
      }
      Toast.show({ type: 'success', text1: 'Profile updated!' });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save changes' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="arrow-back" size={22} color={TEXT.secondary} />
            </Pressable>
            <Text style={styles.title}>Edit profile</Text>
            <View style={{ width: 22 }} />
          </View>

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
            <FormInput label="Full name" value={fullName} onChangeText={setFullName} error={errors.fullName} />
            <FormInput label="Course / Program" value={course} onChangeText={setCourse} error={errors.course} />
            <View style={styles.section}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleRow}>
                {ROLES.map((r) => (
                  <Pressable key={r} onPress={() => setRoleLabel(r)} style={[styles.roleBtn, roleLabel === r && styles.roleBtnActive]}>
                    <Text style={[styles.roleBtnText, roleLabel === r && styles.roleBtnTextActive]}>{r}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <FormInput label="Bio (optional)" value={bio} onChangeText={setBio} multiline numberOfLines={3} />
            <Pressable onPress={handleSave} disabled={loading} style={[styles.primaryBtn, loading && styles.btnDisabled]}>
              {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Save changes</Text>}
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
  container: { flexGrow: 1, padding: 20, gap: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: FontSize.lg, fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  avatarWrap: { alignSelf: 'center', position: 'relative' },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, backgroundColor: BG.bg3, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER.default },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: ACCENT.blue, alignItems: 'center', justifyContent: 'center' },
  form: { gap: 16 },
  section: { gap: 8 },
  label: { fontSize: FontSize.sm, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: BORDER.default, backgroundColor: BG.bg2 },
  roleBtnActive: { borderColor: ACCENT.blue, backgroundColor: ACCENT.blueDim },
  roleBtnText: { fontSize: FontSize.sm, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  roleBtnTextActive: { color: ACCENT.blue },
  primaryBtn: { backgroundColor: ACCENT.blue, borderRadius: 8, paddingVertical: 14, alignItems: 'center', minHeight: 48 },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: '#FFFFFF' },
});
