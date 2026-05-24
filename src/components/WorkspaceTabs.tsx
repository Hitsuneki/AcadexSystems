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

      <View style={styles.page}>
        {tabs[activeIndex]?.content}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.base },
  tabBar: {
    flexGrow: 0,
    backgroundColor: BG.base,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
  },
  tabBarContent: { flexDirection: 'row', width: '100%' },
  tab: {
    flex: 1, // Full width spread
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabLabel: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabLabelActive: { color: TEXT.t0 },
  tabLabelInactive: { color: TEXT.t3 },
  indicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: ACCENT.primary,
  },
  page: { flex: 1 },
});
