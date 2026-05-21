import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BG, BORDER, TEXT } from '@/constants/colors';
import { CardDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.colorBar, { backgroundColor: project.coverColor }]} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
        <Text style={styles.tag} numberOfLines={1}>{project.subjectTag}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{project.memberIds.length} member{project.memberIds.length !== 1 ? 's' : ''}</Text>
          <View style={styles.dot} />
          <Text style={styles.metaText}>{project.visibility === 'public' ? 'Public' : 'Private'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CardDefaults.backgroundColor,
    borderRadius: CardDefaults.borderRadius,
    borderWidth: CardDefaults.borderWidth,
    borderColor: CardDefaults.borderColor,
    overflow: 'hidden',
    marginBottom: 10,
  },
  pressed: { opacity: 0.75 },
  colorBar: { height: 4, width: '100%' },
  content: { padding: CardDefaults.padding },
  name: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.soraSemiBold,
    color: TEXT.primary,
    marginBottom: 2,
  },
  tag: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.muted,
    marginBottom: 8,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.secondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: TEXT.muted,
  },
});
