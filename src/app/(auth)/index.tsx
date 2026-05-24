import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { BG, TEXT } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { useAuth } from "@/hooks/use-auth";
import { isProfileComplete } from "@/utils/profile";

export default function SplashScreen() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    // Removed auto-redirects here so users always see the landing page first.
    // The Enter Workspace button will handle navigation if they are logged in.
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

      <View style={styles.actions}>
        {user ? (
          <Text
            style={styles.signInLink}
            onPress={() => isProfileComplete(profile) ? router.push("/(main)") : router.push("/(auth)/complete-profile")}
          >
            Enter Workspace →
          </Text>
        ) : (
          <Text
            style={styles.signInLink}
            onPress={() => router.push("/(auth)/login")}
          >
            Sign in →
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG.bg0,
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  logo: {
    fontSize: FontSize["3xl"],
    fontFamily: FontFamily.soraBold,
    color: TEXT.primary,
    letterSpacing: 0,
  },
  tagline: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interRegular,
    color: TEXT.muted,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  signInLink: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.interMedium,
    color: TEXT.primary,
  },
});
