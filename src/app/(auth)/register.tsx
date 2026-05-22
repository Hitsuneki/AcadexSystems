import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from '@/components/AcadexToast';

import { FormInput } from '@/components/FormInput';
import { BG, TEXT, ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { validateEmail, validatePassword, validateConfirmPassword } from '@/utils/validation';
import { registerUser } from '@/services/auth.service';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const handleRegister = async () => {
    const emailErr = validateEmail(email);
    const pwErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirm);
    const errs = {
      email: emailErr ?? undefined,
      password: pwErr ?? undefined,
      confirm: confirmErr ?? undefined,
    };
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await registerUser({ email: email.trim(), password });
      // Firebase auth only — profile is created on complete-profile
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Registration failed', text2: err?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.heading}>Create account</Text>
            <Text style={styles.sub}>Join ACADEX and start collaborating</Text>
          </View>

          <View style={styles.form}>
            <FormInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@university.edu"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <FormInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              secureTextEntry
              error={errors.password}
            />
            <FormInput
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat password"
              secureTextEntry
              error={errors.confirm}
            />

            <Pressable onPress={handleRegister} disabled={loading} style={[styles.primaryBtn, loading && styles.btnDisabled]}>
              {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Create account</Text>}
            </Pressable>
          </View>

          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.linkWrap}>
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkAccent}>Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, gap: 28 },
  back: { fontSize: FontSize.md, fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  header: { gap: 6 },
  heading: { fontSize: FontSize['2xl'], fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  sub: { fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.secondary },
  form: { gap: 14 },
  primaryBtn: {
    backgroundColor: ACCENT.blue,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: '#FFFFFF' },
  linkWrap: { alignItems: 'center' },
  link: { fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.secondary },
  linkAccent: { color: ACCENT.blue, fontFamily: FontFamily.interSemiBold },
});
