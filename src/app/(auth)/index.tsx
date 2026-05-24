import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, useWindowDimensions, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { BG, TEXT, ACCENT, BORDER } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { useAuth } from "@/hooks/use-auth";
import { isProfileComplete } from "@/utils/profile";
import { Ionicons } from "@expo/vector-icons";

const formatUTC = (date: Date) => {
  return date.toISOString().replace("T", " ").substring(0, 19) + " UTC";
};

export default function LandingScreen() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isMobile = width < 768;

  const handleCTA = () => {
    if (user) {
      if (isProfileComplete(profile)) router.push("/(main)");
      else router.push("/(auth)/complete-profile");
    } else {
      router.push("/(auth)/login");
    }
  };

  const handleRegister = () => {
    if (user) handleCTA();
    else router.push("/(auth)/register");
  };

  if (loading) {
    return <LoadingSpinner fullscreen />;
  }

  const DotGrid = () => (
    <View style={styles.dotGrid} aria-hidden={true}>
      {[...Array(60)].map((_, i) => (
        <View key={i} style={styles.dot} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* NAVBAR */}
      <View style={[styles.navbar, { paddingTop: Platform.OS === "web" ? 16 : Math.max(insets.top, 16) }]}>
        <View style={styles.navLeft}>
          <Text style={styles.navBrand}>ACADEX</Text>
          <View style={styles.navVersion}><Text style={styles.navVersionText}>v1.0.0</Text></View>
          <View style={styles.navStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.navStatusText}>SYS:ONLINE</Text>
          </View>
        </View>
        
        <View style={styles.navRight}>
          {!isMobile && <Text style={styles.navTime}>{formatUTC(time)}</Text>}
          <Pressable style={styles.navBtnOutline} onPress={handleCTA}>
            <Text style={styles.navBtnOutlineText}>LOGIN</Text>
          </Pressable>
          <Pressable style={styles.navBtnSolid} onPress={handleRegister}>
            <Text style={styles.navBtnSolidText}>REGISTER</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HERO SECTION */}
        <View style={[styles.hero, isMobile && styles.heroMobile]}>
          <View style={[styles.heroLeft, isMobile && { width: "100%", paddingRight: 0 }]}>
            <Text style={styles.sectionLabel}>// ACADEMIC.WORKSPACE.SYSTEM</Text>
            <View style={styles.heroTitles}>
              <Text style={styles.heroTitle}>ORCHESTRATE</Text>
              <Text style={styles.heroTitle}>YOUR ACADEMIC</Text>
              <Text style={[styles.heroTitle, { color: ACCENT.primary }]}>LIFECYCLE</Text>
            </View>
            <Text style={styles.heroDesc}>
              A unified terminal for task tracking, resource management, and collaborative execution. Built for raw efficiency. No distractions, just data.
            </Text>
            
            <View style={styles.heroActions}>
              <Pressable style={styles.btnPrimary} onPress={handleRegister}>
                <Text style={styles.btnPrimaryText}>INIT WORKSPACE →</Text>
              </Pressable>
              <Pressable style={styles.btnSecondary} onPress={handleCTA}>
                <Text style={styles.btnSecondaryText}>AUTHENTICATE</Text>
              </Pressable>
            </View>

            {!isMobile && <DotGrid />}
          </View>

          <View style={[styles.heroRight, isMobile && { width: "100%", marginTop: 32 }]}>
            {/* SYS.READOUT */}
            <View style={styles.widgetCard}>
              <Text style={styles.widgetHeader}>// SYS.READOUT</Text>
              <View style={styles.statsGrid}>
                {[
                  { label: "ACTIVE.USERS", value: "12,491" },
                  { label: "PROJECTS.LOGGED", value: "8,902" },
                  { label: "TASKS.RESOLVED", value: "45.2K" },
                  { label: "SYS.UPTIME", value: "99.99%" },
                ].map((stat, i) => (
                  <View key={i} style={styles.statRow}>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* MODULE.INDEX */}
            <View style={styles.widgetCard}>
              <Text style={styles.widgetHeader}>// MODULE.INDEX</Text>
              <View style={styles.moduleList}>
                {["TASK_ENGINE", "PROJECT_HUB", "CLOUD_STORAGE", "SYNC_PROTOCOL"].map((mod, idx) => (
                  <View key={idx} style={styles.moduleRow}>
                    <Text style={styles.moduleNum}>0{idx + 1}.</Text>
                    <Text style={styles.moduleName}>{mod}</Text>
                    <View style={styles.moduleActive} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* CAPABILITY MANIFEST */}
        <View style={styles.manifestSection}>
          <View style={styles.manifestHeader}>
            <Text style={styles.sectionLabel}>// CAPABILITY.MANIFEST</Text>
            <Text style={styles.sectionLabel}>[04 MODULES]</Text>
          </View>
          
          <View style={[styles.featuresGrid, isMobile && { flexDirection: "column" }]}>
            {[
              { id: "F01", name: "TASK TRACKING", desc: "Minimalist task boards to track assignments, deadlines, and milestones.", icon: "list" },
              { id: "F02", name: "CLOUD STORAGE", desc: "Unified file system for your research, docs, and reference materials.", icon: "cloud" },
              { id: "F03", name: "TEAM SYNC", desc: "Real-time collaboration modules with built-in role assignments.", icon: "people" },
              { id: "F04", name: "TERMINAL UX", desc: "Keyboard-first efficiency with zero visual clutter.", icon: "terminal" },
            ].map((feat, idx) => (
              <View key={idx} style={[styles.featureCard, isMobile ? { width: "100%" } : { width: "48%" }]}>
                <Ionicons name={feat.icon as any} size={24} color={ACCENT.primary} style={{ marginBottom: 12 }} />
                <Text style={styles.featureName}>{feat.id} {feat.name}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* BOOT SEQUENCE */}
        <View style={styles.bootSection}>
          <View style={[styles.bootContent, isMobile && { flexDirection: "column", alignItems: "flex-start", gap: 24 }]}>
            <View style={styles.bootTextWrap}>
              <Text style={styles.sectionLabel}>// INIT.SEQUENCE</Text>
              <Text style={styles.bootTitle}>Ready to boot up?</Text>
              <Text style={styles.bootDesc}>Initialize your workspace and regain control over your academic workflow.</Text>
            </View>
            <View style={[styles.bootActions, isMobile && { width: "100%", alignItems: "stretch" }]}>
              <Pressable style={styles.btnPrimary} onPress={handleRegister}>
                <Text style={styles.btnPrimaryText}>CREATE ACCOUNT →</Text>
              </Pressable>
              <Pressable style={styles.btnGhost} onPress={handleCTA}>
                <Text style={styles.btnGhostText}>SIGN IN INSTEAD</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>ACADEX</Text>
          <Text style={styles.footerText}>© 2026 / BUILD 1.0.0</Text>
          {!isMobile && <Text style={styles.footerTime}>{formatUTC(time)}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG.base,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  
  // NAVBAR
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    backgroundColor: BG.base,
    zIndex: 10,
  },
  navLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  navBrand: { fontFamily: FontFamily.soraBold, fontSize: FontSize.lg, color: TEXT.primary },
  navVersion: { borderWidth: 1, borderColor: BORDER.dim, paddingHorizontal: 6, paddingVertical: 2 },
  navVersionText: { fontFamily: FontFamily.monoMedium, fontSize: 10, color: TEXT.muted },
  navStatus: { flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 8 },
  statusDot: { width: 8, height: 8, backgroundColor: ACCENT.primary },
  navStatusText: { fontFamily: FontFamily.monoMedium, fontSize: 10, color: ACCENT.primary },
  
  navRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  navTime: { fontFamily: FontFamily.monoMedium, fontSize: 12, color: TEXT.muted },
  navBtnOutline: { borderWidth: 1, borderColor: ACCENT.primary, paddingHorizontal: 12, paddingVertical: 6 },
  navBtnOutlineText: { fontFamily: FontFamily.monoMedium, fontSize: 11, color: ACCENT.primary },
  navBtnSolid: { backgroundColor: ACCENT.primary, paddingHorizontal: 12, paddingVertical: 6 },
  navBtnSolidText: { fontFamily: FontFamily.monoMedium, fontSize: 11, color: BG.base },

  // HERO
  hero: {
    flexDirection: "row",
    padding: 40,
    gap: 40,
    alignItems: "flex-start",
  },
  heroMobile: {
    flexDirection: "column",
    padding: 24,
  },
  heroLeft: {
    width: "55%",
    paddingRight: 40,
  },
  heroRight: {
    width: "45%",
    gap: 24,
  },
  sectionLabel: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 12,
    color: TEXT.muted,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  heroTitles: { marginBottom: 24 },
  heroTitle: {
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize["4xl"],
    color: TEXT.primary,
    letterSpacing: -1,
    lineHeight: 48,
  },
  heroDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.md,
    color: TEXT.muted,
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: "90%",
  },
  heroActions: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 48,
    flexWrap: "wrap",
  },
  btnPrimary: {
    backgroundColor: ACCENT.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  btnPrimaryText: {
    fontFamily: FontFamily.monoBold,
    fontSize: FontSize.sm,
    color: BG.base,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: BORDER.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  btnSecondaryText: {
    fontFamily: FontFamily.monoBold,
    fontSize: FontSize.sm,
    color: TEXT.primary,
  },

  dotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 200,
    gap: 8,
    opacity: 0.2,
  },
  dot: {
    width: 3,
    height: 3,
    backgroundColor: TEXT.muted,
  },

  // WIDGETS
  widgetCard: {
    backgroundColor: BG.bg1,
    borderWidth: 1,
    borderColor: BORDER.dim,
    padding: 24,
  },
  widgetHeader: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 11,
    color: TEXT.muted,
    marginBottom: 16,
  },
  statsGrid: { gap: 12 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    paddingBottom: 8,
  },
  statLabel: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 12,
    color: TEXT.t0,
  },
  statValue: {
    fontFamily: FontFamily.monoBold,
    fontSize: FontSize.lg,
    color: TEXT.primary,
  },

  moduleList: { gap: 12 },
  moduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BG.bg0,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER.dim,
  },
  moduleNum: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 12,
    color: TEXT.muted,
  },
  moduleName: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 13,
    color: TEXT.primary,
    flex: 1,
  },
  moduleActive: {
    width: 8,
    height: 8,
    backgroundColor: ACCENT.primary,
  },

  // MANIFEST
  manifestSection: {
    padding: 40,
    paddingTop: 0,
  },
  manifestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    paddingBottom: 16,
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  featureCard: {
    backgroundColor: BG.bg1,
    borderWidth: 1,
    borderColor: BORDER.dim,
    padding: 24,
    marginBottom: 16,
  },
  featureName: {
    fontFamily: FontFamily.monoBold,
    fontSize: FontSize.base,
    color: TEXT.primary,
    marginBottom: 8,
  },
  featureDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    color: TEXT.muted,
    lineHeight: 20,
  },

  // BOOT SEQUENCE
  bootSection: {
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  bootContent: {
    backgroundColor: BG.bg1,
    borderWidth: 1,
    borderColor: ACCENT.dim,
    padding: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bootTextWrap: { flex: 1, paddingRight: 32 },
  bootTitle: {
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize["2xl"],
    color: TEXT.primary,
    marginBottom: 8,
  },
  bootDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.base,
    color: TEXT.muted,
  },
  bootActions: { alignItems: "center", gap: 16 },
  btnGhost: { padding: 12 },
  btnGhostText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.sm,
    color: TEXT.muted,
  },

  // FOOTER
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: BORDER.dim,
  },
  footerBrand: { fontFamily: FontFamily.soraBold, fontSize: FontSize.sm, color: TEXT.muted },
  footerText: { fontFamily: FontFamily.monoMedium, fontSize: 11, color: TEXT.muted },
  footerTime: { fontFamily: FontFamily.monoMedium, fontSize: 11, color: TEXT.muted },
});
