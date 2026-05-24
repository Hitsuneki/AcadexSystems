import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, BORDER, TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
import { CardDefaults } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatTimeAgo } from '@/utils/date';
import { Avatar } from './Avatar';
import type { Announcement, UserProfile } from '@/types';

interface AnnouncementCardProps {
  announcement: Announcement;
  author?: UserProfile;
  currentUserId?: string;
  onReact: (id: string) => void;
  onDelete: (id: string) => void;
}

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
}

export function AnnouncementCard({ announcement, author, currentUserId, onReact, onDelete }: AnnouncementCardProps) {
  const hasReacted = announcement.reactions.some((r) => r.userId === currentUserId);
  const reactionCount = announcement.reactions.length;
  const isOwner = announcement.authorId === currentUserId;

  return (
    <View style={styles.card}>
      {/* Author row */}
      <View style={styles.authorRow}>
        <Avatar uri={author?.avatarUri} name={author?.fullName ?? '?'} size="md" />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{author?.fullName ?? 'Unknown'}</Text>
          <Text style={styles.timestamp}>{formatTimeAgo(announcement.createdAt)}</Text>
        </View>
        {isOwner && (
          <Pressable onPress={() => onDelete(announcement.id)} hitSlop={8} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={SEMANTIC.red} />
          </Pressable>
        )}
      </View>

      {/* Body */}
      <Text style={styles.body}>{announcement.body}</Text>

      {/* Attachment */}
      {announcement.attachmentUrl && (
        <View style={styles.attachmentWrapper}>
          {isImageUrl(announcement.attachmentUrl) ? (
            <Pressable onPress={() => Linking.openURL(announcement.attachmentUrl!)}>
              <Image source={{ uri: announcement.attachmentUrl }} style={styles.attachmentImage} resizeMode="cover" />
            </Pressable>
          ) : (
            <Pressable onPress={() => Linking.openURL(announcement.attachmentUrl!)} style={styles.fileRow}>
              <Ionicons name="document-outline" size={20} color={ACCENT.signal} />
              <Text style={styles.fileName} numberOfLines={1}>Attached File</Text>
              <Ionicons name="open-outline" size={16} color={TEXT.muted} />
            </Pressable>
          )}
        </View>
      )}

      {/* Reactions */}
      <Pressable
        onPress={() => onReact(announcement.id)}
        style={[styles.reactionBtn, hasReacted && styles.reactionBtnActive]}>
        <Ionicons
          name={hasReacted ? 'thumbs-up' : 'thumbs-up-outline'}
          size={14}
          color={hasReacted ? ACCENT.signal : TEXT.secondary}
        />
        {reactionCount > 0 && (
          <Text style={[styles.reactionCount, hasReacted && styles.reactionCountActive]}>
            {reactionCount}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CardDefaults.backgroundColor,
    borderRadius: CardDefaults.borderRadius,
    borderWidth: CardDefaults.borderWidth,
    borderColor: CardDefaults.borderColor,
    padding: CardDefaults.padding,
    marginBottom: 10,
    gap: 10,
    borderLeftWidth: 2,
    borderLeftColor: TEXT.faint,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorInfo: { flex: 1 },
  authorName: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interSemiBold,
    color: TEXT.primary,
  },
  timestamp: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.mono,
    color: TEXT.muted,
    marginTop: 1,
  },
  deleteBtn: { padding: 4 },
  body: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interRegular,
    color: TEXT.secondary,
    lineHeight: 20,
  },
  attachmentWrapper: { marginTop: 4 },
  attachmentImage: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    aspectRatio: 16 / 9,
    borderRadius: 0,
    backgroundColor: BG.bg2,
    borderWidth: 1,
    borderColor: BORDER.default,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: BG.bg2,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: BORDER.default,
  },
  fileName: { flex: 1, fontSize: FontSize.md, fontFamily: FontFamily.interMedium, color: TEXT.primary },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: BORDER.default,
    backgroundColor: BG.bg0,
    alignSelf: 'flex-start',
  },
  reactionBtnActive: { backgroundColor: ACCENT.signalDim, borderColor: ACCENT.signalBorder },
  reactionCount: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.mono,
    color: TEXT.secondary,
  },
  reactionCountActive: { color: ACCENT.signal },
});
