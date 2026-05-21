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
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.buttons}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.btn, styles.cancelBtn, pressed && styles.pressed]}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                destructive ? styles.destructiveBtn : styles.confirmBtn,
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.confirmText, destructive && styles.destructiveText]}>
                {confirmLabel}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: BG.bg2,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: BORDER.default,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.soraSemiBold,
    color: TEXT.primary,
  },
  message: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interRegular,
    color: TEXT.secondary,
    lineHeight: 20,
  },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  pressed: { opacity: 0.75 },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cancelText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interSemiBold,
    color: TEXT.secondary,
  },
  confirmBtn: { backgroundColor: ACCENT.blue },
  confirmText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interSemiBold,
    color: '#FFFFFF',
  },
  destructiveBtn: {
    backgroundColor: SEMANTIC.redDim,
    borderWidth: 1,
    borderColor: SEMANTIC.redBorder,
  },
  destructiveText: { color: SEMANTIC.red },
});
