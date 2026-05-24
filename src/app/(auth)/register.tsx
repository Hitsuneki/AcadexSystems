import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from '@/components/AcadexToast';
import { FormInput } from '@/components/FormInput';
import { SectionHeader } from '@/components/SectionHeader';
import { BG, BORDER, TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
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
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'INIT FAILED', text2: err?.message });
    } finally {
      setLoading(false);
    }
  };

  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length > 0) score = 1;
    if (pw.length >= 8) score = 2;
    if (pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) score = 3;
    if (pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score = 4;
    return score;
  };

  const strength = getStrength(password);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.topText}>ACADEX v1.0.0</Text>
        <Text style={styles.topText}>{time}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <SectionHeader title="AUTH.REGISTER" />
            
            <View style={styles.header}>
              <Text style={styles.heading}>INIT ACCOUNT</Text>
              <Text style={styles.sub}>Create your operator profile.</Text>
            </View>

            <View style={styles.form}>
              <FormInput
                label="ID.EMAIL"
                value={email}
                onChangeText={setEmail}
                placeholder="you@university.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
              
              <View>
                <FormInput
                  label="CREDENTIAL.PASSWORD"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  secureTextEntry
                  error={errors.password}
                />
                <View style={styles.strengthMeter}>
                  {[1, 2, 3, 4].map(level => {
                    let color = BG.bg2; // inactive
                    if (strength >= level) {
                      if (level === 1) color = SEMANTIC.red;
                      else if (level === 2 || level === 3) color = SEMANTIC.amber;
                      else if (level === 4) color = ACCENT.primary;
                    }
                    return <View key={level} style={[styles.strengthSeg, { backgroundColor: color }]} />;
                  })}
                </View>
              </View>

              <FormInput
                label="CREDENTIAL.CONFIRM"
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Repeat password"
                secureTextEntry
                error={errors.confirm}
              />

              <Pressable onPress={handleRegister} disabled={loading} style={[styles.primaryBtn, loading && styles.btnDisabled]}>
                {loading ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.primaryBtnText}>CREATE ACCOUNT →</Text>}
              </Pressable>

              <Pressable onPress={() => router.back()} hitSlop={8} style={styles.ghostBtn}>
                <Text style={styles.ghostText}>AUTHENTICATE.EXISTING ↗</Text>
              </Pressable>
            </View>
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
  strengthMeter: {
    flexDirection: 'row',
    gap: 2,
    marginTop: -8,
    marginBottom: 8,
  },
  strengthSeg: {
    flex: 1,
    height: 2,
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
});
