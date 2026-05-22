import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated';
import { AcadexToastHost } from '@/components/AcadexToast';
import { useAuth } from '@/hooks/use-auth';
import { useAcadexFonts } from '@/utils/fonts';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BG } from '@/constants/colors';
import { isProfileComplete } from '@/utils/profile';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAcadexFonts();
  const { user, profile, loading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (authLoading || !fontsLoaded) return;

    const segs = segments as string[];
    const inAuth = segs[0] === '(auth)';

    if (!user) {
      if (!inAuth) router.replace('/(auth)' as never);
    } else if (!isProfileComplete(profile)) {
      if (!(inAuth && segs[1] === 'complete-profile')) {
        router.replace('/(auth)/complete-profile');
      }
    } else {
      if (inAuth) router.replace('/(main)' as never);
    }
  }, [user, profile, authLoading, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return <LoadingSpinner fullscreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: BG.bg0 }}>
      <ReducedMotionConfig mode={ReduceMotion.Never} />
      <BottomSheetModalProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BG.bg0 } }} />
        <AcadexToastHost />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
