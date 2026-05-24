import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BG, BORDER, TEXT, ACCENT, SEMANTIC } from '@/constants/colors';
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

const DEFAULT_VISIBILITY = 4000;

let toastApi: { show: (p: ToastShowParams) => void; hide: () => void } | null = null;

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
  
  const isError = type === 'error';
  const prefix = isError ? 'ERR:' : type === 'info' ? 'SYS:' : 'OK:';
  const color = isError ? SEMANTIC.red : type === 'info' ? TEXT.t1 : ACCENT.primary;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.toast, { borderColor: isError ? SEMANTIC.red : BORDER.dim }]}>
      <Text style={[styles.text, { color }]}>
        {prefix} {text1}
      </Text>
      {text2 && <Text style={[styles.text, { color, marginTop: 4 }]}>{text2}</Text>}
    </Pressable>
  );
}

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
    minHeight: 40,
    width: 340,
    maxWidth: '92%',
    borderRadius: 0,
    backgroundColor: BG.bg1,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  text: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
  },
});
