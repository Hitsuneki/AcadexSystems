import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BG, BORDER, TEXT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import type { Project } from '@/types';
import { Avatar } from './Avatar';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const color = project.colorIndex ? project.colorIndex : TEXT.t2;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      
      <View style={styles.left}>
        <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
        <Text style={styles.tag} numberOfLines={1}>// {project.subjectTag}</Text>
      </View>

      <View style={styles.right}>
        <View style={styles.members}>
          {project.memberIds.slice(0, 3).map((id, index) => (
            <View key={id} style={[styles.avatarWrap, { marginLeft: index > 0 ? -4 : 0 }]}>
              <Avatar name={`M${index}`} size="sm" />
            </View>
          ))}
          {project.memberIds.length > 3 && (
            <Text style={styles.moreCount}>+{project.memberIds.length - 3}</Text>
          )}
        </View>
        <Text style={styles.taskCount}>{project.memberIds.length * 2} TASKS</Text>
      </View>

    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
    backgroundColor: BG.base,
    borderBottomWidth: 1,
    borderBottomColor: BORDER.dim,
  },
  pressed: { backgroundColor: BG.bg2 },
  colorBar: {
    width: 2,
    height: '100%',
    marginRight: 12,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.interSemiBold,
    color: TEXT.t1,
  },
  tag: {
    fontSize: FontSize.label,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
    textTransform: 'uppercase',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  members: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    backgroundColor: BG.base,
    borderWidth: 1,
    borderColor: BG.base, // overlapping separator
  },
  moreCount: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
    marginLeft: 4,
  },
  taskCount: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t2,
    width: 60,
    textAlign: 'right',
  },
});
