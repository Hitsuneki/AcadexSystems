import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BG, BORDER, ACCENT, TEXT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { useAuthStore } from '@/stores/auth.store';
import { useProjectStore } from '@/stores/project.store';

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

@keyframes fade-slide-down {
  0% { opacity: 0; transform: translateY(-6px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes bell-waggle {
  0%,100% { transform: rotate(0deg); }
  20%     { transform: rotate(-18deg); }
  40%     { transform: rotate(14deg); }
  60%     { transform: rotate(-10deg); }
  80%     { transform: rotate(6deg); }
}

/* 1. ENTER ANIMATION — SIDEBAR */
[data-class~="anim-sb-shell"] { animation: fade-slide-left 380ms var(--ease-out-expo) both; --slide-dist: -100%; }
[data-class~="anim-sb-brand"] { animation: fade-in 300ms ease 80ms both; }
[data-class~="anim-sb-nav-0"] { animation: fade-slide-left 300ms var(--ease-out-expo) 160ms both; --slide-dist: -8px; }
[data-class~="anim-sb-nav-1"] { animation: fade-slide-left 300ms var(--ease-out-expo) 220ms both; --slide-dist: -8px; }
[data-class~="anim-sb-nav-2"] { animation: fade-slide-left 300ms var(--ease-out-expo) 280ms both; --slide-dist: -8px; }
[data-class~="anim-sb-nav-3"] { animation: fade-slide-left 300ms var(--ease-out-expo) 340ms both; --slide-dist: -8px; }
[data-class~="anim-sb-proj-hdr"] { animation: fade-in 280ms ease 400ms both; }
[data-class~="anim-sb-proj-item"] { animation: fade-slide-left 250ms var(--ease-out-expo) both; --slide-dist: -6px; }
[data-class~="anim-sb-user"] { animation: fade-slide-up 300ms var(--ease-out-expo) 600ms both; --slide-dist: 6px; }

/* 2. MAIN CONTENT TOP BAR */
[data-class~="anim-topbar"] { animation: fade-slide-down 350ms var(--ease-out-expo) 120ms both; }

/* Status Dot Pulse */
.status-dot-pulse { position: relative; }
.status-dot-pulse::after {
  content: ""; position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 50%; background-color: inherit;
  animation: pulse-ring 2s infinite var(--ease-out-expo);
}
.sys-op-pulse::after { animation-duration: 2.4s; }

/* Micro-interactions (Hovers) */
.sb-nav-item { transition: transform 150ms ease, background-color 150ms ease; cursor: pointer; position: relative; }
.sb-nav-item:hover { transform: translateX(3px); }
.sb-nav-item:hover .sb-icon, .sb-nav-item:hover .sb-label { color: #ffffff !important; transition: color 150ms ease; }

.sb-proj-item { transition: transform 130ms var(--ease-sharp), filter 130ms ease; cursor: pointer; }
.sb-proj-item:hover { transform: translateX(4px); filter: brightness(1.3); }
.sb-proj-item:active { background-color: rgba(0, 255, 136, 0.08); } /* background flash on click */

/* Nav Active Accent (Left border grow) */
.nav-accent-bar {
  position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
  background-color: ${ACCENT.primary};
  transform-origin: top; transform: scaleY(0); transition: transform 200ms var(--ease-sharp);
}
.sb-nav-item.active { background-color: rgba(255,255,255,0.04); }
.sb-nav-item.active .nav-accent-bar { transform: scaleY(1); }

/* Topbar Icons */
.topbar-icon { transition: transform 150ms ease, color 150ms ease; cursor: pointer; }
.topbar-icon:hover { transform: scale(1.12); color: #ffffff !important; }
.topbar-icon:active { transform: scale(0.92); transition-duration: 80ms; }
.topbar-bell:hover { animation: bell-waggle 300ms ease both; color: #ffffff !important; }

/* Page Transition (trigger animation on key change) */
.page-enter {
  animation: fade-slide-up 300ms var(--ease-out-expo) both;
  --slide-dist: 6px;
}
`;

export default function MainLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile } = useAuthStore();
  const { projects } = useProjectStore();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = width < 768;

  const NavItem = ({ icon, label, route, index }: { icon: any, label: string, route: string, index: number }) => {
    const isActive = pathname === route || (route === '/(main)' && pathname === '/');
    const navClass = 'anim-sb-nav-' + index + ' sb-nav-item' + (isActive ? ' active' : '');
    
    return (
      <Pressable 
        data-class={navClass}
        style={styles.navItem}
        onPress={() => {
          router.push(route as never);
          if (isMobile) setSidebarOpen(false);
        }}
      >
        <View className="nav-accent-bar" />
        <Ionicons name={icon} size={18} color={isActive ? ACCENT.primary : TEXT.muted} style={{ marginHorizontal: 10 }} className="sb-icon" />
        <Text style={[styles.navLabel, isActive && { color: TEXT.primary }]} data-class="sb-label">{label}</Text>
      </Pressable>
    );
  };

  const Sidebar = () => (
    <View data-class="anim-sb-shell" style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
      {/* Brand */}
      <View data-class="anim-sb-brand" style={[styles.brandRow, { paddingTop: Platform.OS === 'web' ? 24 : Math.max(insets.top, 24) }]}>
        <Text style={styles.brandText}>ACADEX</Text>
        {isMobile && (
          <Pressable onPress={() => setSidebarOpen(false)}>
            <Ionicons name="close" size={24} color={TEXT.primary} />
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.sidebarScroll} contentContainerStyle={{ padding: 16 }}>
        <NavItem index={0} icon="grid-outline" label="HOME" route="/(main)" />
        <NavItem index={1} icon="checkmark-done-outline" label="TASKS" route="/(main)/my-tasks" />
        <NavItem index={2} icon="compass-outline" label="EXPLORE" route="/(main)/explore" />
        <NavItem index={3} icon="person-outline" label="PROFILE" route="/(main)/profile" />

        <View style={styles.sidebarDivider} />
        <View data-class="anim-sb-proj-hdr" style={styles.projectsHeader}>
           <Text style={styles.projectsLabel}>PROJECTS</Text>
           <View style={styles.badge}><Text style={styles.badgeText}>{projects.length}</Text></View>
        </View>

        {projects.map((p, idx) => {
           const projDelay = (460 + idx * 50) + 'ms';
           return (
             <Pressable 
               key={p.id} 
               data-class="anim-sb-proj-item sb-proj-item" 
               style={[
                 styles.projectRow, 
                 Platform.OS === 'web' && { animationDelay: projDelay } as any
               ]}
               onPress={() => { router.push(('/project/' + p.id) as never); if (isMobile) setSidebarOpen(false); }}
             >
               <Text style={styles.projectText} numberOfLines={1}>{p.name}</Text>
             </Pressable>
           );
        })}
      </ScrollView>

      {/* User Row */}
      <View data-class="anim-sb-user" style={[styles.userRow, { paddingBottom: Platform.OS === 'web' ? 16 : Math.max(insets.bottom, 16) }]}>
        <View style={styles.avatarCircle}>
           <Text style={styles.avatarInitials}>{profile?.fullName?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
           <Text style={styles.userName} numberOfLines={1}>{profile?.fullName || user?.email || 'Operator'}</Text>
        </View>
        <View data-class="status-dot-pulse" style={[styles.statusDot, Platform.OS === 'web' && { animationDelay: '900ms' } as any]} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {Platform.OS === "web" && <style>{injectedCSS}</style>}
      
      {/* Sidebar Desktop */}
      {!isMobile && <Sidebar />}

      {/* Sidebar Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <View style={styles.overlay}>
           <Pressable style={StyleSheet.absoluteFill} onPress={() => setSidebarOpen(false)} />
           <Sidebar />
        </View>
      )}

      {/* Main Panel */}
      <View style={styles.mainPanel}>
        <View data-class="anim-topbar" style={[styles.topBar, { paddingTop: Platform.OS === 'web' ? 16 : Math.max(insets.top, 16) }]}>
          <View style={styles.topBarLeft}>
            {isMobile && (
              <Pressable onPress={() => setSidebarOpen(true)} style={{ marginRight: 16 }}>
                <Ionicons name="menu" size={24} color={TEXT.primary} />
              </Pressable>
            )}
            <Text style={styles.breadcrumb}>DASHBOARD</Text>
            <View style={styles.topDivider} />
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</Text>
          </View>
          <View style={styles.topBarRight}>
             <Ionicons name="search" size={20} color={TEXT.muted} data-class="topbar-icon" />
             <View style={{ marginLeft: 16 }}>
               <Ionicons name="notifications-outline" size={20} color={TEXT.muted} data-class="topbar-icon topbar-bell" />
               <View style={styles.notifDot} />
             </View>
          </View>
        </View>

        <View style={styles.slotContainer} data-class="page-enter" key={pathname}>
          <Slot />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: BG.base,
    overflow: 'hidden',
  },
  
  // Sidebar
  sidebar: {
    width: 240,
    backgroundColor: BG.bg1,
    borderRightWidth: 1,
    borderRightColor: BORDER.dim,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarMobile: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 90,
  },
  
  brandRow: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
  },
  brandText: {
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize.lg,
    color: TEXT.primary,
  },
  sidebarScroll: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 4,
  },
  navLabel: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.sm,
    color: TEXT.muted,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: BORDER.dim,
    marginVertical: 16,
  },
  projectsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  projectsLabel: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 11,
    color: TEXT.muted,
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: BG.bg2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 10,
    color: TEXT.muted,
  },
  projectRow: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  projectText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.sm,
    color: TEXT.t0,
    opacity: 0.7, // Hover boosts this to 1
  },

  // User Row
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER.dim,
    backgroundColor: BG.bg0,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BG.bg2,
    borderWidth: 1,
    borderColor: BORDER.dim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.xs,
    color: TEXT.primary,
  },
  userName: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.sm,
    color: TEXT.t0,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT.primary,
  },

  // Main Panel
  mainPanel: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
    backgroundColor: BG.base,
    zIndex: 10,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumb: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.xs,
    color: TEXT.primary,
  },
  topDivider: {
    width: 1,
    height: 12,
    backgroundColor: BORDER.dim,
    marginHorizontal: 12,
  },
  dateText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.xs,
    color: TEXT.muted,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT.primary,
  },
  slotContainer: {
    flex: 1,
  },
});
