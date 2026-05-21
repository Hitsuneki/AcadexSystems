import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { FormInput } from '@/components/FormInput';
import { BG, TEXT, ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { validateEmail, validateRequired } from '@/utils/validation';
import { loginUser } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { setUser } = useAuthStore();

  const handleLogin = async () => {
    const emailErr = validateEmail(email);
    const pwErr = validateRequired(password, 'Password');
    if (emailErr || pwErr) {
      setErrors({ email: emailErr ?? undefined, password: pwErr ?? undefined });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await loginUser({ email: email.trim(), password });
      // Update auth store so root layout's guard triggers redirect
      setUser({ uid: 'stub-uid', email: email.trim() });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Sign in failed', text2: err?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.wordmark}>ACADEX</Text>
          <View style={styles.header}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.sub}>Sign in to your workspace</Text>
          </View>

          <View style={styles.form}>
            <FormInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@university.edu"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />
            <FormInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
            />
            <Pressable hitSlop={8} style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <Pressable onPress={handleLogin} disabled={loading} style={[styles.primaryBtn, loading && styles.btnDisabled]}>
              {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Sign in</Text>}
            </Pressable>
          </View>

          <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={8} style={styles.linkWrap}>
            <Text style={styles.link}>Don't have an account? <Text style={styles.linkAccent}>Create one</Text></Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.bg0 },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', gap: 32 },
  wordmark: { fontSize: FontSize.lg, fontFamily: FontFamily.soraBold, color: TEXT.primary, letterSpacing: 1.5 },
  header: { gap: 6 },
  heading: { fontSize: FontSize['2xl'], fontFamily: FontFamily.soraSemiBold, color: TEXT.primary },
  sub: { fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.secondary },
  form: { gap: 14 },
  forgotWrap: { alignSelf: 'flex-end' },
  forgotText: { fontSize: FontSize.sm, fontFamily: FontFamily.interMedium, color: ACCENT.blue },
  primaryBtn: { backgroundColor: ACCENT.blue, borderRadius: 8, paddingVertical: 14, alignItems: 'center', minHeight: 48, marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: '#FFFFFF' },
  linkWrap: { alignItems: 'center' },
  link: { fontSize: FontSize.md, fontFamily: FontFamily.interRegular, color: TEXT.secondary },
  linkAccent: { color: ACCENT.blue, fontFamily: FontFamily.interSemiBold },
});
