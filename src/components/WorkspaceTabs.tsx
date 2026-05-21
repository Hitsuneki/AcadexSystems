/**
 * WorkspaceTabs — web-safe fallback.
 * Uses state-driven rendering (no react-native-pager-view).
 */
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { BG, BORDER, TEXT, ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

export interface WorkspaceTab {
  key: string;
  title: string;
  content: React.ReactNode;
}

interface WorkspaceTabsProps {
  tabs: WorkspaceTab[];
  initialIndex?: number;
}

export function WorkspaceTabs({ tabs, initialIndex = 0 }: WorkspaceTabsProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {tabs.map((tab, index) => {
          const active = activeIndex === index;
          return (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => setActiveIndex(index)}>
              <Text style={[styles.tabLabel, active ? styles.tabLabelActive : styles.tabLabelInactive]}>
                {tab.title}
              </Text>
              {active && <View style={styles.indicator} />}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content — only render active page */}
      <View style={styles.page}>
        {tabs[activeIndex]?.content}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.bg0 },
  tabBar: {
    flexGrow: 0,
    backgroundColor: BG.bg1,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER.default,
  },
  tabBarContent: { flexDirection: 'row' },
  tab: {
    minWidth: 72,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  tabLabel: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.interMedium,
  },
  tabLabelActive: { color: TEXT.primary },
  tabLabelInactive: { color: TEXT.muted },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: ACCENT.blue,
    borderRadius: 1,
  },
  page: { flex: 1 },
});
