import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, useWindowDimensions, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { DotGrid } from "@/components/DotGrid";
import { BG, TEXT, ACCENT, BORDER } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { useAuth } from "@/hooks/use-auth";
import { isProfileComplete } from "@/utils/profile";
import { Ionicons } from "@expo/vector-icons";

// 1. Injected CSS for Animations (Web Only)
const injectedCSS = `
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-sharp: cubic-bezier(0.25, 0, 0, 1);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

@keyframes pulse-ring {
  0%   { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0; }
}

@keyframes text-flicker {
  0%   { opacity: 1; }
  5%   { opacity: 0.2; }
  10%  { opacity: 1; }
  15%  { opacity: 0.4; }
  20%  { opacity: 1; }
  100% { opacity: 1; }
}

@keyframes fade-slide-up {
  0% { opacity: 0; transform: translateY(var(--slide-dist, 16px)); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes fade-slide-left {
  0% { opacity: 0; transform: translateX(20px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes fade-slide-right {
  0% { opacity: 0; transform: translateX(-16px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

[data-class~="anim-nav"] { animation: fade-slide-up 400ms var(--ease-out-expo) both; --slide-dist: -8px; }
[data-class~="anim-hero-lbl"] { animation: fade-slide-up 350ms var(--ease-out-expo) 100ms both; --slide-dist: 12px; }
[data-class~="anim-hero-h1"] { animation: fade-slide-up 450ms var(--ease-out-expo) 180ms both; --slide-dist: 16px; }
[data-class~="anim-hero-h2"] { animation: fade-slide-up 450ms var(--ease-out-expo) 260ms both; --slide-dist: 16px; }
[data-class~="anim-hero-h3"] { animation: fade-slide-up 500ms var(--ease-out-expo) 340ms both; --slide-dist: 16px; }
[data-class~="anim-flicker"] { animation: text-flicker 600ms linear 840ms 1 normal both; }
[data-class~="anim-hero-desc"] { animation: fade-slide-up 400ms var(--ease-out-expo) 440ms both; --slide-dist: 8px; }
[data-class~="anim-hero-btns"] { animation: fade-slide-up 380ms var(--ease-out-expo) 540ms both; --slide-dist: 8px; }
[data-class~="anim-hero-dots"] { animation: fade-in 600ms var(--ease-out-expo) 640ms both; }

[data-class~="anim-sys-card"] { animation: fade-slide-left 500ms var(--ease-out-expo) 300ms both; }
[data-class~="anim-mod-card"] { animation: fade-slide-left 500ms var(--ease-out-expo) 420ms both; }

/* Dynamic delays for SYS.READOUT rows (1-4) */
[data-class~="anim-sys-row-1"] { animation: fade-in 200ms ease 360ms both; }
[data-class~="anim-sys-row-2"] { animation: fade-in 200ms ease 420ms both; }
[data-class~="anim-sys-row-3"] { animation: fade-in 200ms ease 480ms both; }
[data-class~="anim-sys-row-4"] { animation: fade-in 200ms ease 540ms both; }

[data-class~="anim-ready"] { opacity: 0; }
[data-class~="anim-in-hdr"] { animation: fade-slide-up 400ms var(--ease-out-expo) forwards; --slide-dist: 12px; }
[data-class~="anim-in-card"] { animation: fade-slide-up 450ms var(--ease-out-expo) forwards; --slide-dist: 16px; }
[data-class~="anim-in-boot-txt"] { animation: fade-slide-right 450ms var(--ease-out-expo) forwards; }
[data-class~="anim-in-boot-btn"] { animation: fade-slide-up 350ms var(--ease-out-expo) 120ms forwards; --slide-dist: 8px; }

.status-dot-pulse { position: relative; }
.status-dot-pulse::after {
  content: ""; position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 50%;
  background-color: inherit;
  animation: pulse-ring 2s infinite var(--ease-out-expo);
}
.mod-dot::after { animation-duration: 1.8s; }

.btn-primary { transition: filter 180ms ease, transform 180ms ease; }
.btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); }
.btn-primary:active { transform: translateY(0) scale(0.98); transition-duration: 80ms; }

.btn-secondary { transition: background-color 180ms ease, border-color 180ms ease; }
.btn-secondary:hover { background-color: rgba(255,255,255,0.1); border-color: #ffffff; }

.module-row { transition: transform 150ms ease; }
.module-row:hover { transform: translateX(4px); }

.feature-card { transition: border-color 200ms ease, transform 200ms ease; }
.feature-card:hover { border-color: rgba(255,255,255,0.3); transform: translateY(-3px); }
`;

// Helper: Custom hook for scroll-triggered anims on Web
const useScrollAnim = (threshold = 0.15) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || !ref.current) {
      setInView(true); // Auto-enable on mobile/native
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
};

// Helper: Animated Number Counter
const AnimatedNumber = ({ from, to, duration, decimals = 0, delay = 0 }: { from: number, to: number, duration: number, decimals?: number, delay?: number }) => {
  const [val, setVal] = useState(from);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setVal(from + (to - from) * easeOut(t));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [from, to, duration, delay]);

  return <Text>{decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString()}</Text>;
};


const formatUTC = (date: Date) => date.toISOString().replace("T", " ").substring(0, 19) + " UTC";

export default function LandingScreen() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const [time, setTime] = useState(new Date());
  const [scrollProgress, setScrollProgress] = useState(0);

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

  const onScroll = (e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const progress = Math.min(100, Math.max(0, (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100));
    setScrollProgress(progress);
  };

  // Scroll triggers
  const manifestAnim = useScrollAnim(0.2);
  const bootAnim = useScrollAnim(0.5);

  if (loading) {
    return <LoadingSpinner fullscreen />;
  }


  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {Platform.OS === "web" && <style>{injectedCSS}</style>}
      
      {/* Scroll Progress Indicator */}
      <View style={[styles.scrollIndicator, { width: `${scrollProgress}%` }]} />

      {/* NAVBAR */}
      <View data-class="anim-nav" style={[styles.navbar, { paddingTop: Platform.OS === "web" ? 16 : Math.max(insets.top, 16) }]}>
        <View style={styles.navLeft}>
          <Text style={styles.navBrand}>ACADEX</Text>
          <View style={styles.navVersion}><Text style={styles.navVersionText}>v1.0.0</Text></View>
          <View style={styles.navStatus}>
            <View style={[styles.statusDot]} data-class="status-dot-pulse" />
            <Text style={styles.navStatusText}>SYS:ONLINE</Text>
          </View>
        </View>
        
        <View style={styles.navRight}>
          {!isMobile && <Text style={styles.navTime}>{formatUTC(time)}</Text>}
          <Pressable data-class="btn-secondary" style={styles.navBtnOutline} onPress={handleCTA}>
            <Text style={styles.navBtnOutlineText}>LOGIN</Text>
          </Pressable>
          <Pressable data-class="btn-primary" style={styles.navBtnSolid} onPress={handleRegister}>
            <Text style={styles.navBtnSolidText}>REGISTER</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* HERO SECTION */}
        <View style={[styles.hero, isMobile && styles.heroMobile]}>
          <View style={[styles.heroLeft, isMobile && { width: "100%", paddingRight: 0 }]}>
            <Text data-class="anim-hero-lbl" style={styles.sectionLabel}>// ACADEMIC.WORKSPACE.SYSTEM</Text>
            <View style={styles.heroTitles}>
              <Text data-class="anim-hero-h1" style={styles.heroTitle}>ORCHESTRATE</Text>
              <Text data-class="anim-hero-h2" style={styles.heroTitle}>YOUR ACADEMIC</Text>
              <View data-class="anim-hero-h3">
                 <Text data-class="anim-flicker" style={[styles.heroTitle, { color: ACCENT.primary }]}>LIFECYCLE</Text>
              </View>
            </View>
            <Text data-class="anim-hero-desc" style={styles.heroDesc}>
              A unified terminal for task tracking, resource management, and collaborative execution. Built for raw efficiency. No distractions, just data.
            </Text>
            
            <View data-class="anim-hero-btns" style={styles.heroActions}>
              <Pressable data-class="btn-primary" style={styles.btnPrimary} onPress={handleRegister}>
                <Text style={styles.btnPrimaryText}>INIT WORKSPACE →</Text>
              </Pressable>
              <Pressable data-class="btn-secondary" style={styles.btnSecondary} onPress={handleCTA}>
                <Text style={styles.btnSecondaryText}>AUTHENTICATE</Text>
              </Pressable>
            </View>

            {!isMobile && (
              <View data-class="anim-hero-dots">
                <DotGrid rows={3} cols={20} />
              </View>
            )}
          </View>

          <View style={[styles.heroRight, isMobile && { width: "100%", marginTop: 32 }]}>
            {/* SYS.READOUT */}
            <View data-class="anim-sys-card" style={styles.widgetCard}>
              <Text style={styles.widgetHeader}>// SYS.READOUT</Text>
              <View style={styles.statsGrid}>
                {[
                  { label: "ACTIVE.USERS", value: 12491, delay: 360 },
                  { label: "PROJECTS.LOGGED", value: 8902, delay: 420 },
                  { label: "TASKS.RESOLVED", value: 45200, suffix: "+", delay: 480 },
                  { label: "SYS.UPTIME", value: 99.99, decimals: 2, suffix: "%", delay: 540 },
                ].map((stat, i) => (
                  <View key={i} data-class={`anim-sys-row-${i+1}`} style={styles.statRow}>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statValue}>
                      <AnimatedNumber from={0} to={stat.value} duration={800} decimals={stat.decimals} delay={stat.delay} />
                      {stat.suffix && <Text style={{ fontSize: 14 }}>{stat.suffix}</Text>}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* MODULE.INDEX */}
            <View data-class="anim-mod-card" style={styles.widgetCard}>
              <Text style={styles.widgetHeader}>// MODULE.INDEX</Text>
              <View style={styles.moduleList}>
                {["TASK_ENGINE", "PROJECT_HUB", "CLOUD_STORAGE", "SYNC_PROTOCOL"].map((mod, idx) => (
                  <View key={idx} data-class="module-row" style={styles.moduleRow}>
                    <Text style={styles.moduleNum}>0{idx + 1}.</Text>
                    <Text style={styles.moduleName}>{mod}</Text>
                    {/* Staggered pulse rings */}
                    <View data-class="status-dot-pulse mod-dot" style={[styles.moduleActive, Platform.OS === 'web' && { animationDelay: `${idx * 200}ms` } as any]} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* CAPABILITY MANIFEST */}
        <View ref={manifestAnim.ref} style={styles.manifestSection}>
          <View data-class={manifestAnim.inView ? "anim-in-hdr" : "anim-ready"} style={styles.manifestHeader}>
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
              <View 
                key={idx} 
                data-class={manifestAnim.inView ? "anim-in-card feature-card" : "anim-ready"}
                style={[
                  styles.featureCard, 
                  isMobile ? { width: "100%" } : { width: "48%" },
                  Platform.OS === 'web' && manifestAnim.inView && { animationDelay: `${idx * 80}ms` } as any
                ]}
              >
                <Ionicons name={feat.icon as any} size={24} color={ACCENT.primary} style={{ marginBottom: 12 }} />
                <Text style={styles.featureName}>{feat.id} {feat.name}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* BOOT SEQUENCE */}
        <View ref={bootAnim.ref} style={styles.bootSection}>
          <View style={[styles.bootContent, isMobile && { flexDirection: "column", alignItems: "flex-start", gap: 24 }]}>
            <View data-class={bootAnim.inView ? "anim-in-boot-txt" : "anim-ready"} style={styles.bootTextWrap}>
              <Text style={styles.sectionLabel}>// INIT.SEQUENCE</Text>
              <Text style={styles.bootTitle}>Ready to boot up?</Text>
              <Text style={styles.bootDesc}>Initialize your workspace and regain control over your academic workflow.</Text>
            </View>
            <View data-class={bootAnim.inView ? "anim-in-boot-btn" : "anim-ready"} style={[styles.bootActions, isMobile && { width: "100%", alignItems: "stretch" }]}>
              <Pressable data-class="btn-primary" style={styles.btnPrimary} onPress={handleRegister}>
                <Text style={styles.btnPrimaryText}>CREATE ACCOUNT →</Text>
              </Pressable>
              <Pressable data-class="btn-secondary" style={styles.btnGhost} onPress={handleCTA}>
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
  container: { flex: 1, backgroundColor: BG.base },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  scrollIndicator: {
    position: 'absolute',
    top: 0, left: 0, height: 1,
    backgroundColor: ACCENT.primary,
    zIndex: 100,
  },
  
  // NAVBAR
  navbar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1,
    borderBottomColor: BORDER.dim, backgroundColor: BG.base, zIndex: 10,
  },
  navLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  navBrand: { fontFamily: FontFamily.soraBold, fontSize: FontSize.lg, color: TEXT.primary },
  navVersion: { borderWidth: 1, borderColor: BORDER.dim, paddingHorizontal: 6, paddingVertical: 2 },
  navVersionText: { fontFamily: FontFamily.monoMedium, fontSize: 10, color: TEXT.muted },
  navStatus: { flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 8 },
  statusDot: { width: 8, height: 8, backgroundColor: ACCENT.primary, borderRadius: 4 },
  navStatusText: { fontFamily: FontFamily.monoMedium, fontSize: 10, color: ACCENT.primary },
  
  navRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  navTime: { fontFamily: FontFamily.monoMedium, fontSize: 12, color: TEXT.muted },
  navBtnOutline: { borderWidth: 1, borderColor: ACCENT.primary, paddingHorizontal: 12, paddingVertical: 6 },
  navBtnOutlineText: { fontFamily: FontFamily.monoMedium, fontSize: 11, color: ACCENT.primary },
  navBtnSolid: { backgroundColor: ACCENT.primary, paddingHorizontal: 12, paddingVertical: 6 },
  navBtnSolidText: { fontFamily: FontFamily.monoMedium, fontSize: 11, color: BG.base },

  // HERO
  hero: { flexDirection: "row", padding: 40, gap: 40, alignItems: "flex-start" },
  heroMobile: { flexDirection: "column", padding: 24 },
  heroLeft: { width: "55%", paddingRight: 40 },
  heroRight: { width: "45%", gap: 24 },
  sectionLabel: { fontFamily: FontFamily.monoMedium, fontSize: 12, color: TEXT.muted, letterSpacing: 1.5, marginBottom: 16 },
  heroTitles: { marginBottom: 24 },
  heroTitle: { fontFamily: FontFamily.soraBold, fontSize: FontSize["4xl"], color: TEXT.primary, letterSpacing: -1, lineHeight: 48 },
  heroDesc: { fontFamily: FontFamily.interRegular, fontSize: FontSize.md, color: TEXT.muted, lineHeight: 24, marginBottom: 32, maxWidth: "90%" },
  heroActions: { flexDirection: "row", gap: 16, marginBottom: 48, flexWrap: "wrap" },
  btnPrimary: { backgroundColor: ACCENT.primary, paddingHorizontal: 24, paddingVertical: 14 },
  btnPrimaryText: { fontFamily: FontFamily.monoBold, fontSize: FontSize.sm, color: BG.base },
  btnSecondary: { borderWidth: 1, borderColor: BORDER.primary, paddingHorizontal: 24, paddingVertical: 14 },
  btnSecondaryText: { fontFamily: FontFamily.monoBold, fontSize: FontSize.sm, color: TEXT.primary },

  dotGrid: { flexDirection: "row", flexWrap: "wrap", width: 200, gap: 8, opacity: 0.6 },
  dot: { width: 3, height: 3, backgroundColor: TEXT.muted },

  // WIDGETS
  widgetCard: { backgroundColor: BG.bg1, borderWidth: 1, borderColor: BORDER.dim, padding: 24 },
  widgetHeader: { fontFamily: FontFamily.monoMedium, fontSize: 11, color: TEXT.muted, marginBottom: 16 },
  statsGrid: { gap: 12 },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: BORDER.dim, paddingBottom: 8 },
  statLabel: { fontFamily: FontFamily.monoMedium, fontSize: 12, color: TEXT.t0 },
  statValue: { fontFamily: FontFamily.monoBold, fontSize: FontSize.lg, color: TEXT.primary },

  moduleList: { gap: 12 },
  moduleRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: BG.bg0, padding: 12, borderWidth: 1, borderColor: BORDER.dim },
  moduleNum: { fontFamily: FontFamily.monoMedium, fontSize: 12, color: TEXT.muted },
  moduleName: { fontFamily: FontFamily.monoMedium, fontSize: 13, color: TEXT.primary, flex: 1 },
  moduleActive: { width: 8, height: 8, backgroundColor: ACCENT.primary, borderRadius: 4 },

  // MANIFEST
  manifestSection: { padding: 40, paddingTop: 0 },
  manifestHeader: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: BORDER.dim, paddingBottom: 16, marginBottom: 24 },
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, justifyContent: "space-between" },
  featureCard: { backgroundColor: BG.bg1, borderWidth: 1, borderColor: BORDER.dim, padding: 24, marginBottom: 16 },
  featureName: { fontFamily: FontFamily.monoBold, fontSize: FontSize.base, color: TEXT.primary, marginBottom: 8 },
  featureDesc: { fontFamily: FontFamily.interRegular, fontSize: FontSize.sm, color: TEXT.muted, lineHeight: 20 },

  // BOOT SEQUENCE
  bootSection: { paddingHorizontal: 40, marginBottom: 40 },
  bootContent: { backgroundColor: BG.bg1, borderWidth: 1, borderColor: ACCENT.dim, padding: 32, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bootTextWrap: { flex: 1, paddingRight: 32 },
  bootTitle: { fontFamily: FontFamily.soraBold, fontSize: FontSize["2xl"], color: TEXT.primary, marginBottom: 8 },
  bootDesc: { fontFamily: FontFamily.interRegular, fontSize: FontSize.base, color: TEXT.muted },
  bootActions: { alignItems: "center", gap: 16 },
  btnGhost: { padding: 12, borderWidth: 1, borderColor: 'transparent' },
  btnGhostText: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.sm, color: TEXT.muted },

  // FOOTER
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 40, paddingVertical: 24, borderTopWidth: 1, borderTopColor: BORDER.dim },
  footerBrand: { fontFamily: FontFamily.soraBold, fontSize: FontSize.sm, color: TEXT.muted },
  footerText: { fontFamily: FontFamily.monoMedium, fontSize: 11, color: TEXT.muted },
  footerTime: { fontFamily: FontFamily.monoMedium, fontSize: 11, color: TEXT.muted },
});
