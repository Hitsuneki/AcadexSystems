import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TEXT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatTimeAgo } from '@/utils/date';
import { Avatar } from './Avatar';
import type { Activity, UserProfile } from '@/types';

interface ActivityItemProps {
  activity: Activity;
  members?: UserProfile[];
}

export function ActivityItem({ activity, members = [] }: ActivityItemProps) {
  const user = members.find((m) => m.id === activity.userId);

  return (
    <View style={styles.container}>
      <Avatar uri={user?.avatarUri} name={user?.fullName ?? '?'} size="sm" />
      <View style={styles.text}>
        <Text style={styles.line} numberOfLines={2}>
          <Text style={styles.name}>{user?.fullName ?? 'Someone'}</Text>
          <Text style={styles.action}> {activity.actionType} </Text>
          <Text style={styles.entity}>{activity.entityType}</Text>
        </Text>
        <Text style={styles.time}>{formatTimeAgo(activity.timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
  },
  text: { flex: 1 },
  line: { fontSize: FontSize.md, lineHeight: 19 },
  name: { fontFamily: FontFamily.interSemiBold, color: TEXT.primary },
  action: { fontFamily: FontFamily.interRegular, color: TEXT.secondary },
  entity: { fontFamily: FontFamily.interMedium, color: TEXT.secondary },
  time: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.muted,
    marginTop: 2,
  },
});
