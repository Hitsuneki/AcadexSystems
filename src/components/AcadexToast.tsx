import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BG, BORDER, TEXT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

type ToastType = 'success' | 'error' | 'info';

export interface ToastShowParams {
  type?: ToastType;
  text1?: string;
  text2?: string;
  visibilityTime?: number;
}

interface ToastState extends ToastShowParams {
  visible: boolean;
}

const BORDER_COLORS: Record<ToastType, string> = {
  success: '#10B981',
  error: '#EF4444',
  info: '#2563EB',
};

const DEFAULT_VISIBILITY = 4000;

let toastApi: { show: (p: ToastShowParams) => void; hide: () => void } | null = null;

/** Drop-in replacement for `react-native-toast-message` Toast.show(). */
export const Toast = {
  show(params: ToastShowParams) {
    toastApi?.show(params);
  },
  hide() {
    toastApi?.hide();
  },
};

function ToastContent({
  type = 'success',
  text1,
  text2,
  onPress,
}: ToastShowParams & { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.toast, { borderLeftColor: BORDER_COLORS[type] }]}>
      <View style={styles.content}>
        {text1 ? (
          <Text style={styles.text1} numberOfLines={2}>
            {text1}
          </Text>
        ) : null}
        {text2 ? (
          <Text style={styles.text2} numberOfLines={3}>
            {text2}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/** Mount once in the root layout (replaces react-native-toast-message). */
export function AcadexToastHost() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState>({ visible: false });
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(
      ({ finished }) => {
        if (finished) setToast((t) => ({ ...t, visible: false }));
      },
    );
  }, [opacity]);

  const show = useCallback(
    (params: ToastShowParams) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ ...params, type: params.type ?? 'success', visible: true });
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timerRef.current = setTimeout(hide, params.visibilityTime ?? DEFAULT_VISIBILITY);
    },
    [hide, opacity],
  );

  useEffect(() => {
    toastApi = { show, hide };
    return () => {
      toastApi = null;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, hide]);

  return (
    <View style={[styles.host, { paddingTop: insets.top + 12 }]}>
      {toast.visible ? (
        <Animated.View style={[styles.animatedWrap, { opacity }]}>
          <ToastContent
            type={toast.type}
            text1={toast.text1}
            text2={toast.text2}
            onPress={hide}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999,
    pointerEvents: 'box-none',
  },
  animatedWrap: {
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    minHeight: 56,
    width: 340,
    maxWidth: '92%',
    borderRadius: 8,
    borderLeftWidth: 4,
    backgroundColor: BG.bg2,
    borderWidth: 0.5,
    borderColor: BORDER.default,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)' }
      : Platform.OS === 'android'
        ? { elevation: 4 }
        : {}),
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  text1: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.interMedium,
    color: TEXT.primary,
    marginBottom: 2,
  },
  text2: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.interRegular,
    color: TEXT.secondary,
  },
});
