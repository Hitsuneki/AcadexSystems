import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
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
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = (index: number) => {
    pagerRef.current?.setPage(index);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const active = activeIndex === index;
          return (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => handleTabPress(index)}>
              <Text style={[styles.tabLabel, active ? styles.tabLabelActive : styles.tabLabelInactive]}>
                {tab.title}
              </Text>
              {active && <View style={styles.indicator} />}
            </Pressable>
          );
        })}
      </View>

      {/* Pager */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={initialIndex}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}>
        {tabs.map((tab) => (
          <View key={tab.key} style={styles.page}>
            {tab.content}
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.bg0 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: BG.bg1,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER.default,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
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
    backgroundColor: ACCENT.signal,
    borderRadius: 0,
  },
  pager: { flex: 1 },
  page: { flex: 1 },
});
