import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from '@/components/AcadexToast';
import { FormInput } from '@/components/FormInput';
import { SectionHeader } from '@/components/SectionHeader';
import { BG, BORDER, TEXT, ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { validateEmail, validateRequired } from '@/utils/validation';
import { loginUser } from '@/services/auth.service';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'AUTH FAILED', text2: err?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topText}>ACADEX v1.0.0</Text>
        <Text style={styles.topText}>{time}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <SectionHeader title="AUTH.LOGIN" />
            
            <View style={styles.header}>
              <Text style={styles.heading}>AUTHENTICATE</Text>
              <Text style={styles.sub}>Access your workspace.</Text>
            </View>

            <View style={styles.form}>
              <FormInput
                label="ID.EMAIL"
                value={email}
                onChangeText={setEmail}
                placeholder="you@university.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
              />
              <View style={styles.passwordWrap}>
                <FormInput
                  label="CREDENTIAL.PASSWORD"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  style={{ paddingRight: 40 }}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} hitSlop={8}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={TEXT.t3} />
                </Pressable>
              </View>

              <Pressable onPress={handleLogin} disabled={loading} style={[styles.primaryBtn, loading && styles.btnDisabled]}>
                {loading ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.primaryBtnText}>AUTHENTICATE →</Text>}
              </Pressable>

              <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={8} style={styles.ghostBtn}>
                <Text style={styles.ghostText}>REGISTER.NEW</Text>
              </Pressable>
            </View>

            <Text style={styles.footer}>// SECURE · ENCRYPTED · v1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG.base },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
  },
  topText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.monoSm,
    color: TEXT.t2,
  },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  container: { width: '100%', maxWidth: 400 },
  header: { marginBottom: 32 },
  heading: { fontSize: FontSize.display, fontFamily: FontFamily.display, color: TEXT.t0 },
  sub: { fontSize: FontSize.body, fontFamily: FontFamily.monoMedium, color: TEXT.t3, marginTop: 8 },
  form: { gap: 16, marginBottom: 48 },
  passwordWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 36, // roughly middle of input
  },
  primaryBtn: { 
    backgroundColor: ACCENT.primary, 
    borderRadius: 0, 
    paddingVertical: 12, 
    alignItems: 'center', 
    marginTop: 16 
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { 
    fontSize: FontSize.body, 
    fontFamily: FontFamily.interSemiBold, 
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ghostBtn: { alignItems: 'center', marginTop: 16 },
  ghostText: { fontSize: FontSize.monoSm, fontFamily: FontFamily.monoMedium, color: TEXT.t3, textTransform: 'uppercase' },
  footer: { textAlign: 'center', fontSize: FontSize.monoSm, fontFamily: FontFamily.monoMedium, color: TEXT.t3 },
});
