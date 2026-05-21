import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BG, TEXT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

export default function SplashScreen() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && profile) {
      router.replace('/(main)/');
    } else if (user && !profile) {
      router.replace('/(auth)/complete-profile');
    }
    // else: stay here, user navigates to login
  }, [user, profile, loading]);

  if (loading) {
    return <LoadingSpinner fullscreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.center}>
        <Text style={styles.logo}>ACADEX</Text>
        <Text style={styles.tagline}>The student workspace.</Text>
      </View>

      {!user && (
        <View style={styles.actions}>
          <Text
            style={styles.signInLink}
            onPress={() => router.push('/(auth)/login')}>
            Sign in →
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG.bg0,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    fontSize: FontSize['3xl'],
    fontFamily: FontFamily.soraBold,
    color: TEXT.primary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interRegular,
    color: TEXT.muted,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  signInLink: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.interMedium,
    color: '#2563EB',
  },
});
