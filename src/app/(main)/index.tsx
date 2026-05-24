import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BG, TEXT, ACCENT, BORDER } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { useAuthStore } from '@/stores/auth.store';
import { useProjectStore } from '@/stores/project.store';
import { useUserProjects } from '@/hooks/use-user-projects';
import { CreateProjectSheet } from '@/components/sheets/CreateProjectSheet';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DotGrid } from '@/components/DotGrid';

const ACCENT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

// Dashboard-specific CSS — extends landing page tokens
const dashboardCSS = `
/* ── DASHBOARD ENTER ANIMATIONS ────────────────────────── */
[data-class~="anim-dash-hdr-status"]  { animation: fade-in 300ms ease 200ms both; }
[data-class~="anim-dash-hdr-label"]   { animation: fade-in 300ms ease 220ms both; }
[data-class~="anim-dash-hdr-title"]   { animation: fade-slide-up 420ms var(--ease-out-expo) 280ms both; --slide-dist: 10px; }

[data-class~="anim-kpi-0"] { animation: fade-slide-up 400ms var(--ease-out-expo) 360ms both; --slide-dist: 12px; will-change: transform, opacity; }
[data-class~="anim-kpi-1"] { animation: fade-slide-up 400ms var(--ease-out-expo) 440ms both; --slide-dist: 12px; will-change: transform, opacity; }
[data-class~="anim-kpi-2"] { animation: fade-slide-up 400ms var(--ease-out-expo) 520ms both; --slide-dist: 12px; will-change: transform, opacity; }

[data-class~="anim-proj-hdr"]  { animation: fade-slide-up 350ms var(--ease-out-expo) 600ms both; --slide-dist: 8px; }
[data-class~="anim-proj-card-0"] { animation: fade-slide-up 380ms var(--ease-out-expo) 660ms both; --slide-dist: 14px; will-change: transform, opacity; }
[data-class~="anim-proj-card-1"] { animation: fade-slide-up 380ms var(--ease-out-expo) 740ms both; --slide-dist: 14px; will-change: transform, opacity; }
[data-class~="anim-proj-card-2"] { animation: fade-slide-up 380ms var(--ease-out-expo) 820ms both; --slide-dist: 14px; will-change: transform, opacity; }
[data-class~="anim-proj-card-3"] { animation: fade-slide-up 380ms var(--ease-out-expo) 900ms both; --slide-dist: 14px; will-change: transform, opacity; }
[data-class~="anim-proj-ghost"]   { animation: fade-slide-up 380ms var(--ease-out-expo) 980ms both; --slide-dist: 14px; will-change: transform, opacity; }

[data-class~="anim-activity"]  { animation: fade-slide-up 380ms var(--ease-out-expo) 780ms both; --slide-dist: 10px; }
[data-class~="anim-activity-row-0"] { animation: fade-in 200ms ease 840ms both; }
[data-class~="anim-activity-row-1"] { animation: fade-in 200ms ease 890ms both; }
[data-class~="anim-activity-row-2"] { animation: fade-in 200ms ease 940ms both; }
[data-class~="anim-activity-row-3"] { animation: fade-in 200ms ease 990ms both; }

[data-class~="anim-metric-0"] { animation: fade-slide-left 350ms var(--ease-out-expo) 820ms both; will-change: transform, opacity; }
[data-class~="anim-metric-1"] { animation: fade-slide-left 350ms var(--ease-out-expo) 900ms both; will-change: transform, opacity; }
[data-class~="anim-metric-2"] { animation: fade-slide-left 350ms var(--ease-out-expo) 980ms both; will-change: transform, opacity; }

/* ── ACCENT BAR GROW (project card top) ─────────────────── */
@keyframes accent-bar-grow {
  0%   { transform: scaleX(0); transform-origin: left; }
  100% { transform: scaleX(1); transform-origin: left; }
}
.proj-accent-bar { animation: accent-bar-grow 400ms var(--ease-out-expo) both; }
.anim-proj-card-0 .proj-accent-bar { animation-delay: 760ms; }
.anim-proj-card-1 .proj-accent-bar { animation-delay: 840ms; }
.anim-proj-card-2 .proj-accent-bar { animation-delay: 920ms; }
.anim-proj-card-3 .proj-accent-bar { animation-delay: 1000ms; }

/* ── STATUS PULSE (system operational) ──────────────────── */
.sys-op-pulse { position: relative; }
.sys-op-pulse::after {
  content: ""; position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 50%; background-color: inherit;
  animation: pulse-ring 2.4s infinite var(--ease-out-expo);
}

/* Metric dots */
.metric-dot-pulse { position: relative; }
.metric-dot-pulse::after {
  content: ""; position: absolute;
  top: -1px; left: -1px; right: -1px; bottom: -1px;
  border-radius: 50%; background-color: inherit;
  animation: pulse-ring 2s infinite var(--ease-out-expo);
}
.metric-dot-pulse:nth-child(2)::after { animation-delay: 300ms; }
.metric-dot-pulse:nth-child(3)::after { animation-delay: 600ms; }

/* ── PROJECT CARD HOVER ──────────────────────────────────── */
.project-card-hover { transition: transform 200ms ease, border-color 200ms ease; cursor: pointer; }
.project-card-hover:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.3) !important; }
.project-card-hover:hover .proj-accent-bar { filter: brightness(1.2); }

/* ── GHOST CARD HOVER ──────────────────────────────────────*/
.ghost-card-hover { transition: border-color 150ms ease, background-color 150ms ease; cursor: pointer; }
.ghost-card-hover:hover { border-color: rgba(0, 255, 136, 0.4) !important; background-color: rgba(0, 255, 136, 0.04); }

/* ── ACTIVITY ROW HOVER ──────────────────────────────────── */
.activity-row-hover { transition: transform 120ms ease, background-color 120ms ease; cursor: default; }
.activity-row-hover:hover { transform: translateX(3px); background-color: rgba(255,255,255,0.02); }

/* ── METRIC CARD HOVER (corner bracket expand) ───────────── */
.metric-card-wrap { transition: transform 150ms ease; cursor: default; }
.metric-card-wrap:hover .metric-val { transform: scale(1.04); transition: transform 150ms ease; }
.metric-card-wrap .corner-tl,
.metric-card-wrap .corner-br { transition: width 200ms ease, height 200ms ease; }
.metric-card-wrap:hover .corner-tl,
.metric-card-wrap:hover .corner-br { width: 16px; height: 16px; }

/* ── ALL ARROW LINK HOVER ────────────────────────────────── */
.arrow-link { transition: color 150ms ease; cursor: pointer; display: inline-flex; align-items: center; gap: 2px; }
.arrow-link:hover { color: #ffffff !important; }
.arrow-link:hover .arrow-char { transform: translate(3px, -3px); transition: transform 150ms ease; }
.arrow-char { display: inline-block; transition: transform 150ms ease; }

/* ── KPI DELTA BADGE ─────────────────────────────────────── */
[data-class~="anim-delta-0"] { animation: fade-in 200ms ease 1260ms both; }
[data-class~="anim-delta-1"] { animation: fade-in 200ms ease 1340ms both; }
[data-class~="anim-delta-2"] { animation: fade-in 200ms ease 1420ms both; }
`;

// Animated number counter via requestAnimationFrame
function AnimatedNumber({ to, duration = 900, delay = 0, decimals = 0 }: {
  to: number; duration?: number; delay?: number; decimals?: number;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web') { setVal(to); return; }
    const t = setTimeout(() => {
      const start = performance.now();
      const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setVal(to * easeOut(progress));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [to, duration, delay]);

  if (decimals > 0) return <>{val.toFixed(decimals)}</>;
  return <>{Math.round(val).toLocaleString()}</>;
}


export default function OverviewScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addProject, projects: storeProjects } = useProjectStore();
  const { projects: fetchedProjects, loading } = useUserProjects(user?.uid);
  const [activeSheet, setActiveSheet] = useState<'create' | null>(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const displayProjects = [
    ...storeProjects,
    ...fetchedProjects.filter((p) => !storeProjects.some((s) => s.id === p.id)),
  ];
  const activeProjects = displayProjects.slice(0, 7);

  if (loading) return <LoadingSpinner fullscreen />;

  const KPI_CARDS = [
    { key: 'COMPLETION_RATE', label: 'Project Completion', numValue: 84, suffix: '%', delta: '+12.5%', deltaDir: 'up', counterDelay: 760 },
    { key: 'TASKS_RESOLVED',  label: 'Tasks Done',         numValue: 342, suffix: '',  delta: '+5.2%',  deltaDir: 'up', counterDelay: 840 },
    { key: 'TEAM_ACTIVITY',   label: 'Active Contributors', numValue: 24, suffix: '',  delta: '-2.1%',  deltaDir: 'down', counterDelay: 920 },
  ];

  const METRICS = [
    { key: 'UPTIME',    numValue: 99.8, decimals: 1, unit: '%',  color: ACCENT.primary },
    { key: 'RESPONSE',  numValue: 142,  decimals: 0, unit: 'ms', color: '#f59e0b' },
    { key: 'STORAGE',   numValue: 68,   decimals: 0, unit: '%',  color: ACCENT.primary },
  ];

  return (
    <>
      {Platform.OS === 'web' && <style>{dashboardCSS}</style>}

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* ── HEADER ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <View
              data-class="anim-dash-hdr-status status-dot-pulse sys-op-pulse"
              style={styles.statusDot}
            />
            <Text data-class="anim-dash-hdr-label" style={styles.statusText}>SYSTEM OPERATIONAL</Text>
          </View>
          <Text data-class="anim-dash-hdr-title" style={styles.pageTitle}>Overview</Text>
        </View>

        {/* ── KPI STATS ───────────────────────────────────────── */}
        <View style={styles.kpiContainer}>
          <View style={[styles.kpiRow, isMobile && { flexDirection: 'column' }]}>
            {KPI_CARDS.map((stat, i) => (
              <View
                key={i}
                data-class={`anim-kpi-${i}`}
                style={[
                  styles.statCard,
                  isMobile
                    ? { borderBottomWidth: 1, borderColor: BORDER.dim }
                    : { borderRightWidth: i < 2 ? 1 : 0, borderColor: BORDER.dim },
                ]}
              >
                <Text style={styles.statKey}>{stat.key}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>

                <Text style={styles.statValue}>
                  <AnimatedNumber
                    to={stat.numValue}
                    delay={stat.counterDelay}
                    decimals={stat.key === 'COMPLETION_RATE' ? 0 : 0}
                  />
                  {stat.suffix}
                </Text>

                <View data-class={`anim-delta-${i}`} style={styles.deltaRow}>
                  <Text style={[styles.deltaText, { color: stat.deltaDir === 'up' ? ACCENT.primary : '#ef4444' }]}>
                    {stat.delta}
                  </Text>
                  <Text style={styles.deltaPeriod}> vs 30D</Text>
                </View>

                <View style={styles.sparklineWrap}>
                  <DotGrid rows={1} cols={16} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── ACTIVE PROJECTS ─────────────────────────────────── */}
        <View style={styles.section}>
          <View data-class="anim-proj-hdr" style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ACTIVE_PROJECTS</Text>
            <Pressable data-class="arrow-link">
              <Text style={[styles.sectionLink, { display: 'flex' }]}>
                ALL <Text className="arrow-char">↗</Text>
              </Text>
            </Pressable>
          </View>

          <View style={styles.projectsGrid}>
            {activeProjects.map((p, i) => {
              const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
              const cardIdx = Math.min(i, 3);
              return (
                <Pressable
                  key={p.id}
                  data-class={`anim-proj-card-${cardIdx} project-card-hover`}
                  style={[styles.projectCard, isMobile && { width: '100%' }]}
                  onPress={() => router.push(`/project/${p.id}`)}
                >
                  <View
                    className="proj-accent-bar"
                    style={[styles.projectAccent, { backgroundColor: color }]}
                  />
                  <Text style={styles.projectTitle} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.projectCategory}>{p.course || 'GENERAL'}</Text>

                  <View style={styles.projectStatsRow}>
                    <View style={styles.projectStat}>
                      <Text style={styles.projectStatLabel}>TEAM</Text>
                      <Text style={styles.projectStatValue}>+{p.members?.length || 1}</Text>
                    </View>
                    <View style={styles.projectStat}>
                      <Text style={styles.projectStatLabel}>RES</Text>
                      <Text style={styles.projectStatValue}>00</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}

            <Pressable
              data-class="anim-proj-ghost ghost-card-hover"
              style={[styles.ghostCard, isMobile && { width: '100%' }]}
              onPress={() => setActiveSheet('create')}
            >
              <Ionicons name="add" size={32} color={TEXT.muted} />
            </Pressable>
          </View>
        </View>

        {/* ── BOTTOM ROW ──────────────────────────────────────── */}
        <View style={[styles.bottomRow, isMobile && { flexDirection: 'column' }]}>

          {/* Recent Activity */}
          <View data-class="anim-activity" style={styles.activityFeed}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>RECENT_ACTIVITY</Text>
            <View style={styles.activityList}>
              {[
                { label: 'Tasks completed', value: '24/32', highlight: true },
                { label: 'New files uploaded', value: '12', highlight: false },
                { label: 'Meetings held', value: '4', highlight: false },
                { label: 'Active sessions', value: '8', highlight: false },
              ].map((act, i) => (
                <View
                  key={i}
                  data-class={`anim-activity-row-${i} activity-row-hover`}
                  style={styles.activityRow}
                >
                  <Text style={[styles.activityLabel, act.highlight && { color: ACCENT.primary }]}>
                    {act.label}
                  </Text>
                  <Text style={[styles.activityValue, act.highlight && { color: ACCENT.primary }]}>
                    {act.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* System Metrics */}
          <View style={styles.metricsPanel}>
            {METRICS.map((m, i) => (
              <View
                key={i}
                data-class={`anim-metric-${i} metric-card-wrap`}
                style={[styles.metricCard, isMobile && { width: '100%' }]}
              >
                {/* Animated corner brackets (CSS hover expands them) */}
                <View
                  className="corner-tl"
                  style={[styles.cornerBox, { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 }]}
                />
                <View
                  className="corner-br"
                  style={[styles.cornerBox, { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 }]}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
                  <View
                    data-class="metric-dot-pulse"
                    style={[styles.metricDot, { backgroundColor: m.color }]}
                  />
                  <Text style={styles.metricKey}>{m.key}</Text>
                </View>

                <Text className="metric-val" style={styles.metricValue}>
                  <AnimatedNumber
                    to={m.numValue}
                    decimals={m.decimals}
                    delay={820 + i * 80}
                    duration={800}
                  />
                  <Text style={styles.metricUnit}>{m.unit}</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {user && (
        <CreateProjectSheet
          visible={activeSheet === 'create'}
          onClose={() => setActiveSheet(null)}
          userId={user.uid}
          onCreated={(p) => { addProject(p); setActiveSheet(null); }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.base },
  content: { padding: 24, paddingBottom: 60 },

  // Header
  header: { marginBottom: 32 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT.primary },
  statusText: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.xs, color: ACCENT.primary, letterSpacing: 1 },
  pageTitle: { fontFamily: FontFamily.soraBold, fontSize: FontSize['3xl'], color: TEXT.primary, letterSpacing: -1 },

  // KPI Stats
  kpiContainer: { borderWidth: 1, borderColor: BORDER.dim, backgroundColor: BG.bg1, marginBottom: 40 },
  kpiRow: { flexDirection: 'row' },
  statCard: { flex: 1, padding: 20 },
  statKey: { fontFamily: FontFamily.monoMedium, fontSize: 10, color: TEXT.muted, letterSpacing: 1, marginBottom: 4 },
  statLabel: { fontFamily: FontFamily.interMedium, fontSize: FontSize.sm, color: TEXT.t0, marginBottom: 16 },
  statValue: { fontFamily: FontFamily.monoBold, fontSize: 32, color: TEXT.primary, marginBottom: 8 },
  deltaRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  deltaText: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.xs },
  deltaPeriod: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.xs, color: TEXT.muted },
  sparklineWrap: { marginTop: 4, opacity: 0.7 },

  // Active Projects
  section: { marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: BORDER.dim, paddingBottom: 12 },
  sectionTitle: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.xs, color: TEXT.muted, letterSpacing: 1 },
  sectionLink: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.xs, color: TEXT.primary },
  projectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  projectCard: { width: '23%', minWidth: 200, backgroundColor: BG.bg1, borderWidth: 1, borderColor: BORDER.dim, padding: 16, overflow: 'hidden' },
  projectAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  projectTitle: { fontFamily: FontFamily.soraBold, fontSize: FontSize.base, color: TEXT.primary, marginTop: 8, marginBottom: 4 },
  projectCategory: { fontFamily: FontFamily.monoMedium, fontSize: 10, color: TEXT.muted, marginBottom: 16 },
  projectStatsRow: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: BORDER.dim, paddingTop: 12 },
  projectStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  projectStatLabel: { fontFamily: FontFamily.monoMedium, fontSize: 10, color: TEXT.muted },
  projectStatValue: { fontFamily: FontFamily.monoMedium, fontSize: 11, color: TEXT.t0 },
  ghostCard: { width: '23%', minWidth: 200, borderWidth: 1, borderColor: BORDER.dim, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', minHeight: 140 },

  // Bottom Row
  bottomRow: { flexDirection: 'row', gap: 32 },
  activityFeed: { flex: 1 },
  activityList: { borderWidth: 1, borderColor: BORDER.dim, backgroundColor: BG.bg1, marginTop: 16 },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: BORDER.dim },
  activityLabel: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.xs, color: TEXT.t0 },
  activityValue: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.xs, color: TEXT.t0 },

  metricsPanel: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignContent: 'flex-start' },
  metricCard: { width: '46%', minWidth: 120, backgroundColor: BG.bg1, padding: 16, position: 'relative' },
  cornerBox: { position: 'absolute', width: 8, height: 8, borderColor: BORDER.primary, borderWidth: 1 },
  metricDot: { width: 6, height: 6 },
  metricKey: { fontFamily: FontFamily.monoMedium, fontSize: 10, color: TEXT.muted, letterSpacing: 1 },
  metricValue: { fontFamily: FontFamily.monoBold, fontSize: FontSize['2xl'], color: TEXT.primary },
  metricUnit: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.xs, color: TEXT.muted },
});
