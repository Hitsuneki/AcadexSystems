import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/hooks/use-auth';
import { isProfileComplete } from '@/utils/profile';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BG, TEXT, ACCENT, BORDER } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ROWS = 4;
const LIT  = ACCENT.primary;
const DIM  = '#1A1A1A';

// On web, useNativeDriver is not supported — fall back to JS-based animation
const ND = Platform.OS !== 'web';

const STATS = [
  { label: 'ACTIVE USERS',      value: '1,284', unit: 'accounts' },
  { label: 'PROJECTS CREATED',  value: '8,712',  unit: 'total'    },
  { label: 'TASKS RESOLVED',    value: '34.2k', unit: 'lifetime'  },
  { label: 'UPTIME',            value: '99.9',  unit: '%'        },
];

const MODULES = [
  { id: '01', label: 'PROJECTS' },
  { id: '02', label: 'TASKS'    },
  { id: '03', label: 'FILES'    },
  { id: '04', label: 'NOTES'    },
  { id: '05', label: 'UPDATES'  },
  { id: '06', label: 'TEAM'     },
];

const FEATURES = [
  {
    id: 'F01',
    icon: 'grid-outline' as const,
    title: 'PROJECT WORKSPACE',
    desc: 'Kanban board, file system, notes, and task updates — all under one project context.',
  },
  {
    id: 'F02',
    icon: 'checkmark-circle-outline' as const,
    title: 'TASK TRACKING',
    desc: 'Assign, prioritize, and track tasks with status pipelines and deadline signals.',
  },
  {
    id: 'F03',
    icon: 'terminal-outline' as const,
    title: 'TECHNICAL INTERFACE',
    desc: 'Designed for focus. No noise. No bloat. Every element earns its place on screen.',
  },
  {
    id: 'F04',
    icon: 'time-outline' as const,
    title: 'TIMELINE VISIBILITY',
    desc: 'Activity feeds and update logs give you full visibility into project progress.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DotGrid (pattern-shifting)
// ─────────────────────────────────────────────────────────────────────────────

function randomPattern(rows: number, cols: number): Set<string> {
  const s = new Set<string>();
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (Math.random() < 0.1) s.add(r + ',' + c);
  return s;
}

function LandingDotGrid({ cols }: { cols: number }) {
  const anims = useRef<Animated.Value[][]>(
    Array.from({ length: ROWS }, () =>
      Array.from({ length: cols }, () => new Animated.Value(0))
    )
  ).current;

  function applyPattern(pattern: Set<string>) {
    const animations: Animated.CompositeAnimation[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < cols; c++) {
        animations.push(
          Animated.timing(anims[r][c], {
            toValue: pattern.has(r + ',' + c) ? 1 : 0,
            duration: 500 + Math.random() * 500,
            delay: Math.random() * 400,
            useNativeDriver: false,
          })
        );
      }
    }
    Animated.parallel(animations).start();
  }

  useEffect(() => {
    applyPattern(randomPattern(ROWS, cols));
    const id = setInterval(() => applyPattern(randomPattern(ROWS, cols)), 3000);
    return () => clearInterval(id);
  }, [cols]);

  return (
    <View style={s.dotGrid}>
      {Array.from({ length: ROWS }, (_, r) => (
        <View key={r} style={s.dotRow}>
          {Array.from({ length: cols }, (_, c) => {
            const bg = anims[r][c].interpolate({
              inputRange: [0, 1],
              outputRange: [DIM, LIT],
            });
            return <Animated.View key={c} style={[s.dot, { backgroundColor: bg as any }]} />;
          })}
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BlinkingCursor
// ─────────────────────────────────────────────────────────────────────────────

function BlinkingCursor() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: ND }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: ND }),
      ])
    ).start();
  }, []);
  return <Animated.Text style={[s.cursorText, { opacity }]}>_</Animated.Text>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SystemClock
// ─────────────────────────────────────────────────────────────────────────────

function SystemClock({ style }: { style?: any }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const d = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setTime(d);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <Text style={[s.sysBarTime, style]}>{time}</Text>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingScreen() {
  const router   = useRouter();
  const { user, profile, loading } = useAuth();
  const insets   = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const cols = isDesktop ? 38 : Math.floor(width / 11);

  // Entry animations
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroY       = useRef(new Animated.Value(20)).current;
  const gridOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 500, delay: 0, useNativeDriver: ND }),
        Animated.timing(heroY,       { toValue: 0, duration: 500, delay: 0, useNativeDriver: ND }),
      ]),
      Animated.timing(gridOpacity, { toValue: 0.6, duration: 700, delay: 0, useNativeDriver: ND }),
    ]).start();
  }, []);

  const goLogin    = () => router.push('/(auth)/login');
  const goRegister = () => {
    if (user) {
      if (isProfileComplete(profile)) router.push('/(main)');
      else router.push('/(auth)/complete-profile');
    } else {
      router.push('/(auth)/register');
    }
  };

  if (loading) return <LoadingSpinner fullscreen />;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── NAVBAR ─────────────────────────────────────── */}
      <View style={s.navbar}>
        <View style={s.navLeft}>
          <Text style={s.navBrand}>ACADEX</Text>
          <Text style={s.navMeta}>v1.0.0</Text>
          <View style={s.onlineDot} />
          <Text style={s.navMeta}>SYS.ONLINE</Text>
        </View>
        <View style={s.navRight}>
          {isDesktop && <SystemClock />}
          <TouchableOpacity style={s.navLoginBtn} onPress={goLogin} activeOpacity={0.8}>
            <Text style={s.navLoginText}>LOGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navRegisterBtn} onPress={goRegister} activeOpacity={0.8}>
            <Text style={s.navRegisterText}>REGISTER</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        {/* ── HERO ───────────────────────────────────────── */}
        <View style={[s.heroSection, isDesktop && s.heroSectionDesktop]}>

          {/* Hero Left */}
          <Animated.View
            style={[
              s.heroLeft,
              isDesktop && s.heroLeftDesktop,
              { opacity: heroOpacity, transform: [{ translateY: heroY }] },
            ]}
          >
            <Text style={s.heroLabel}>// ACADEMIC WORKSPACE SYSTEM</Text>

            <View style={s.headlineBlock}>
              {['ORGANIZE.', 'TRACK.'].map((word, i) => (
                <Text key={i} style={s.headlineWhite}>{word}</Text>
              ))}
              <View style={s.headlineRow}>
                <Text style={s.headlineGreen}>SHIP.</Text>
                <BlinkingCursor />
              </View>
            </View>

            <Text style={s.subtitle}>
              A technical workspace for students who treat their academics
              like a production system. Projects, tasks, files, and team
              updates — all in one disciplined interface.
            </Text>

            <View style={s.ctaRow}>
              <TouchableOpacity style={s.ctaPrimary} onPress={goRegister} activeOpacity={0.85}>
                <Text style={s.ctaPrimaryText}>INIT WORKSPACE  →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.ctaGhost} onPress={goLogin} activeOpacity={0.8}>
                <Text style={s.ctaGhostText}>AUTHENTICATE</Text>
              </TouchableOpacity>
            </View>

            {/* DotGrid */}
            <Animated.View style={[s.gridWrap, { opacity: gridOpacity }]}>
              <LandingDotGrid cols={cols} />
            </Animated.View>
          </Animated.View>

          {/* Hero Right — Stats Panel (desktop only) */}
          {isDesktop && (
            <View style={s.statsPanel}>
              {/* SYS.READOUT header */}
              <View style={s.statsPanelHeader}>
                <Text style={s.statsPanelTitle}>SYS.READOUT</Text>
                <View style={s.onlineDot} />
              </View>

              {/* Stats rows */}
              {STATS.map((stat, i) => (
                <View key={i} style={s.statRow}>
                  <Text style={s.statLabel}>{stat.label}</Text>
                  <View style={s.statValueWrap}>
                    <Text style={s.statValue}>{stat.value}</Text>
                    <Text style={s.statUnit}>{stat.unit}</Text>
                  </View>
                </View>
              ))}

              {/* MODULE INDEX */}
              <View style={[s.statsPanelHeader, { marginTop: 20 }]}>
                <Text style={s.statsPanelTitle}>MODULE INDEX</Text>
              </View>
              {MODULES.map((mod) => (
                <View key={mod.id} style={s.moduleRow}>
                  <Text style={s.moduleId}>{mod.id}</Text>
                  <Text style={s.moduleLabel}>{mod.label}</Text>
                  <View style={s.moduleDot} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Mobile stats strip */}
        {!isDesktop && (
          <View style={s.mobileStatsStrip}>
            {STATS.map((stat, i) => (
              <View key={i} style={[s.mobileStatItem, i < STATS.length - 1 && s.mobileStatBorder]}>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.mobileStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── CAPABILITY MANIFEST ────────────────────────── */}
        <View style={s.manifestSection}>
          <View style={s.manifestHeader}>
            <Text style={s.manifestLabel}>// CAPABILITY.MANIFEST</Text>
            <Text style={s.manifestCount}>04 MODULES</Text>
          </View>
          <View style={s.featuresGrid}>
            {isDesktop ? (
              // Desktop: explicit 2-column row pairs
              [[0, 1], [2, 3]].map((pair, rowIdx) => (
                <View key={rowIdx} style={s.featureRow2Col}>
                  {pair.map(idx => {
                    const f = FEATURES[idx];
                    return (
                      <View key={f.id} style={s.featureCard2Col}>
                        <View style={s.featureTop}>
                          <Text style={s.featureId}>{f.id}</Text>
                          <Ionicons name={f.icon} size={16} color={ACCENT.primary} />
                        </View>
                        <Text style={s.featureTitle}>{f.title}</Text>
                        <Text style={s.featureDesc}>{f.desc}</Text>
                      </View>
                    );
                  })}
                </View>
              ))
            ) : (
              FEATURES.map((f) => (
                <View key={f.id} style={s.featureCard}>
                  <View style={s.featureTop}>
                    <Text style={s.featureId}>{f.id}</Text>
                    <Ionicons name={f.icon} size={16} color={ACCENT.primary} />
                  </View>
                  <Text style={s.featureTitle}>{f.title}</Text>
                  <Text style={s.featureDesc}>{f.desc}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* ── FOOTER CTA ─────────────────────────────────── */}
        <View style={[s.footerCTA, isDesktop && s.footerCTADesktop]}>
          <View style={s.footerCTALeft}>
            <Text style={s.footerCTALabel}>// INIT SEQUENCE</Text>
            <Text style={s.footerCTAHeading}>Ready to boot up?</Text>
            <Text style={s.footerCTASub}>
              Free to use. No credit card required. Set up your first{'\n'}
              project workspace in under 60 seconds.
            </Text>
          </View>
          <View style={[s.footerCTAButtons, isDesktop && s.footerCTAButtonsDesktop]}>
            <TouchableOpacity style={s.ctaPrimary} onPress={goRegister} activeOpacity={0.85}>
              <Text style={s.ctaPrimaryText}>CREATE ACCOUNT  →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ctaGhost} onPress={goLogin} activeOpacity={0.8}>
              <Text style={s.ctaGhostText}>SIGN IN INSTEAD</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── FOOTER ─────────────────────────────────────── */}
        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Text style={s.footerBrand}>ACADEX</Text>
          <Text style={s.footerCopy}>© {new Date().getFullYear()}</Text>
          <Text style={s.footerCopy}>BUILD.1.0.0.STABLE</Text>
          <SystemClock style={s.footerCopy} />
        </View>

      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG.base },

  // ── Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  navLeft:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBrand: {
    fontFamily: FontFamily.monoBold,
    fontSize: 12,
    color: TEXT.t0,
    letterSpacing: 3,
  },
  navMeta: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 10,
    color: TEXT.t2,
    letterSpacing: 1,
  },
  onlineDot: { width: 5, height: 5, backgroundColor: ACCENT.primary },
  navLoginBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  navLoginText: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 10,
    color: TEXT.t2,
    letterSpacing: 1,
  },
  navRegisterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: ACCENT.primary,
  },
  navRegisterText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 10,
    color: '#000000',
    letterSpacing: 1,
  },
  sysBarTime: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 10,
    color: TEXT.t2,
    letterSpacing: 1,
  },

  // ── Hero
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  heroSectionDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 32,
  },
  heroLeft: { flex: 1 },
  heroLeftDesktop: { maxWidth: 480 },

  heroLabel: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 10,
    color: TEXT.t2,
    letterSpacing: 2,
    marginBottom: 24,
  },
  headlineBlock: { marginBottom: 24 },
  headlineRow: { flexDirection: 'row', alignItems: 'flex-end' },
  headlineWhite: {
    fontFamily: FontFamily.monoBold,
    fontSize: 56,
    lineHeight: 64,
    color: TEXT.t0,
  },
  headlineGreen: {
    fontFamily: FontFamily.monoBold,
    fontSize: 56,
    lineHeight: 64,
    color: ACCENT.primary,
  },
  cursorText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 56,
    lineHeight: 64,
    color: ACCENT.primary,
  },
  subtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: 13,
    color: TEXT.t2,
    lineHeight: 21,
    marginBottom: 28,
    maxWidth: 420,
  },
  ctaRow: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  ctaPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ACCENT.primary,
  },
  ctaPrimaryText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 11,
    color: '#000000',
    letterSpacing: 1,
  },
  ctaGhost: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  ctaGhostText: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 11,
    color: TEXT.t2,
    letterSpacing: 1,
  },
  gridWrap: { marginTop: 8 },

  // ── Stats Panel (desktop right side)
  statsPanel: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    padding: 16,
    maxWidth: 320,
    alignSelf: 'flex-start',
  },
  statsPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  statsPanelTitle: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 9,
    color: TEXT.t3,
    letterSpacing: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  statLabel: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 9,
    color: TEXT.t2,
    letterSpacing: 1,
  },
  statValueWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  statValue: {
    fontFamily: FontFamily.monoBold,
    fontSize: 18,
    color: TEXT.t0,
  },
  statUnit: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 8,
    color: TEXT.t3,
    letterSpacing: 1,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    gap: 10,
  },
  moduleId: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 8,
    color: TEXT.t3,
    letterSpacing: 1,
    width: 18,
  },
  moduleLabel: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 10,
    color: TEXT.t1,
    letterSpacing: 1,
    flex: 1,
  },
  moduleDot: { width: 4, height: 4, backgroundColor: ACCENT.primary },

  // ── Mobile stats strip
  mobileStatsStrip: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  mobileStatItem: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  mobileStatBorder: { borderRightWidth: 1, borderRightColor: '#1A1A1A' },
  mobileStatLabel: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 7,
    color: TEXT.t3,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 4,
  },

  // ── Capability Manifest
  manifestSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  manifestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  manifestLabel: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 10,
    color: TEXT.t2,
    letterSpacing: 2,
  },
  manifestCount: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 9,
    color: TEXT.t3,
    letterSpacing: 1,
  },
  featuresGrid: { gap: 1 },
  // 2-col desktop row
  featureRow2Col: {
    flexDirection: 'row',
    gap: 1,
    marginBottom: 1,
  },
  featureCard2Col: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    padding: 20,
  },
  featureCard: {
    borderWidth: 1,
    borderColor: '#1A1A1A',
    padding: 20,
    marginBottom: 1,
  },
  featureTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureId: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 9,
    color: TEXT.t3,
    letterSpacing: 1,
  },
  featureTitle: {
    fontFamily: FontFamily.monoBold,
    fontSize: 11,
    color: TEXT.t0,
    letterSpacing: 1,
    marginBottom: 8,
  },
  featureDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: 12,
    color: TEXT.t2,
    lineHeight: 19,
  },

  // ── Footer CTA
  footerCTA: {
    paddingHorizontal: 24,
    paddingVertical: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    gap: 32,
  },
  footerCTADesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerCTALeft: { flex: 1 },
  footerCTALabel: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 9,
    color: TEXT.t3,
    letterSpacing: 2,
    marginBottom: 12,
  },
  footerCTAHeading: {
    fontFamily: FontFamily.interRegular,
    fontSize: 36,
    color: TEXT.t0,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  footerCTASub: {
    fontFamily: FontFamily.interRegular,
    fontSize: 13,
    color: TEXT.t2,
    lineHeight: 21,
  },
  footerCTAButtons: { gap: 10 },
  footerCTAButtonsDesktop: { minWidth: 240 },

  // ── Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  footerBrand: {
    fontFamily: FontFamily.monoBold,
    fontSize: 11,
    color: TEXT.t3,
    letterSpacing: 3,
  },
  footerCopy: {
    fontFamily: FontFamily.monoRegular,
    fontSize: 9,
    color: TEXT.t3,
    letterSpacing: 1,
  },

  // ── DotGrid
  dotGrid: {},
  dotRow: { flexDirection: 'row', gap: 5, marginBottom: 5 },
  dot: { width: 3, height: 3 },
});
