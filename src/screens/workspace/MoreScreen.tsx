import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BG, BORDER, TEXT, ACCENT } from '@/constants/colors';
import { CardDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';

interface MoreScreenProps {
  projectId: string;
}

const MORE_ITEMS = [
  { key: 'progress', label: 'Progress', icon: 'bar-chart-outline' as const, route: 'progress' },
  { key: 'meetings', label: 'Meetings', icon: 'people-outline' as const, route: 'meetings' },
  { key: 'members', label: 'Members', icon: 'person-add-outline' as const, route: 'members' },
  { key: 'settings', label: 'Project settings', icon: 'settings-outline' as const, route: 'settings' },
] as const;

export default function MoreScreen({ projectId }: MoreScreenProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {MORE_ITEMS.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => router.push(`/project/${projectId}/${item.route}`)}
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon} size={20} color={ACCENT.blue} />
          </View>
          <Text style={styles.label}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={16} color={TEXT.muted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.bg0, padding: 16, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: CardDefaults.backgroundColor,
    borderRadius: CardDefaults.borderRadius,
    borderWidth: CardDefaults.borderWidth,
    borderColor: CardDefaults.borderColor,
    padding: 16,
  },
  itemPressed: { opacity: 0.75 },
  iconWrap: { width: 36, height: 36, borderRadius: 8, backgroundColor: ACCENT.blueDim, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: FontSize.md, fontFamily: FontFamily.interMedium, color: TEXT.primary },
});
