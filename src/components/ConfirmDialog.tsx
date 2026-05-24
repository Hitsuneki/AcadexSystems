import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { BG, BORDER, TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  destructive = false,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        
        <View style={styles.sheet}>
          <View style={[styles.topLine, destructive && styles.topLineDestructive]} />
          
          <View style={styles.header}>
            <Text style={[styles.title, destructive && styles.titleDestructive]}>
              // {title.toUpperCase()}
            </Text>
            <Pressable hitSlop={12} onPress={onCancel}>
               <Text style={styles.closeBtn}>×</Text>
            </Pressable>
          </View>
          
          {message && <Text style={styles.message}>{message}</Text>}
          
          <View style={styles.buttons}>
            <Pressable onPress={onCancel} style={styles.ghostBtn}>
              <Text style={styles.ghostText}>[{cancelLabel.toUpperCase()}]</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.ghostBtn}>
              <Text style={[styles.ghostText, destructive && styles.destructiveText, !destructive && styles.confirmText]}>
                [{confirmLabel.toUpperCase()}]
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: BG.bg1,
    borderTopWidth: 1,
    borderTopColor: BORDER.dim,
    padding: 24,
    paddingBottom: 48, // Safe area
  },
  topLine: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: ACCENT.primary,
  },
  topLineDestructive: {
    backgroundColor: SEMANTIC.red,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t1,
  },
  titleDestructive: {
    color: SEMANTIC.red,
  },
  closeBtn: {
    fontSize: FontSize.heading,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t2,
    lineHeight: 20,
  },
  message: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.interRegular,
    color: TEXT.t2,
    lineHeight: 20,
    marginBottom: 32,
  },
  buttons: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end',
    gap: 16,
  },
  ghostBtn: {
    paddingVertical: 8,
  },
  ghostText: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t3,
  },
  confirmText: { color: ACCENT.primary },
  destructiveText: { color: SEMANTIC.red },
});
