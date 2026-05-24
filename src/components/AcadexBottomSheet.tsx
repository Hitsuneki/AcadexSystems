import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import BottomSheetLib, {
  BottomSheetView,
  BottomSheetScrollView,
  useBottomSheet,
} from '@gorhom/bottom-sheet';
import type {
  BottomSheetBackdropProps,
  BottomSheetBackgroundProps,
} from '@gorhom/bottom-sheet';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { BG, BORDER, TEXT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface AcadexBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  scrollable?: boolean;
}

type AcadexBackdropProps = BottomSheetBackdropProps & {
  disappearsOnIndex?: number;
  appearsOnIndex?: number;
  opacity?: number;
  pressBehavior?: 'none' | 'close';
  onPress?: () => void;
};

/** Web-safe backdrop: pointerEvents lives in style, not on the View prop. */
function AcadexBackdrop({
  animatedIndex,
  style,
  disappearsOnIndex = -1,
  appearsOnIndex = 0,
  opacity = 0.5,
  pressBehavior = 'close',
  onPress,
}: AcadexBackdropProps) {
  const { close } = useBottomSheet();
  const [pointerEvents, setPointerEvents] = useState<'none' | 'auto'>('none');

  const handleOnPress = useCallback(() => {
    onPress?.();
    if (pressBehavior === 'close') {
      close();
    }
  }, [close, onPress, pressBehavior]);

  const handleContainerTouchability = useCallback((disabled: boolean) => {
    setPointerEvents(disabled ? 'none' : 'auto');
  }, []);

  useAnimatedReaction(
    () => animatedIndex.value <= disappearsOnIndex,
    (disabled, prev) => {
      if (disabled === prev) return;
      runOnJS(handleContainerTouchability)(disabled);
    },
    [disappearsOnIndex],
  );

  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(
        animatedIndex.value,
        [-1, disappearsOnIndex, appearsOnIndex],
        [0, 0, opacity],
        Extrapolation.CLAMP,
      ),
    }),
    [animatedIndex, appearsOnIndex, disappearsOnIndex, opacity],
  );

  const containerStyle = useMemo(
    () => [
      StyleSheet.absoluteFill,
      styles.backdrop,
      style,
      { pointerEvents },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle, pointerEvents],
  );

  const tapHandler = useMemo(
    () => Gesture.Tap().onEnd(() => runOnJS(handleOnPress)()),
    [handleOnPress],
  );

  const content = <Animated.View style={containerStyle} />;

  return pressBehavior !== 'none' ? (
    <GestureDetector gesture={tapHandler}>{content}</GestureDetector>
  ) : (
    content
  );
}

function AcadexSheetBackground({ style }: BottomSheetBackgroundProps) {
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Bottom Sheet"
      style={[styles.sheetBackground, style]}
    />
  );
}

export function AcadexBottomSheet({
  visible,
  onClose,
  title,
  children,
  snapPoints = ['60%'],
  scrollable = false,
}: AcadexBottomSheetProps) {
  const sheetRef = useRef<BottomSheetLib>(null);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <AcadexBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        onPress={onClose}
      />
    ),
    [onClose],
  );

  const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

  // Custom handle to remove the default pill
  const renderHandle = () => <View style={{ height: 12 }} />;

  return (
    <BottomSheetLib
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundComponent={AcadexSheetBackground}
      backgroundStyle={styles.background}
      handleComponent={renderHandle}>
      <ContentWrapper contentContainerStyle={scrollable ? styles.scrollContent : undefined}>
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>// {title.toUpperCase()}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.closeBtn}>×</Text>
            </Pressable>
          </View>
        )}
        <View style={scrollable ? undefined : styles.content}>{children}</View>
      </ContentWrapper>
    </BottomSheetLib>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.65)' },
  sheetBackground: { backgroundColor: BG.bg1 },
  background: {
    backgroundColor: BG.bg1,
    borderTopWidth: 2,
    borderTopColor: '#00FF85',
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  title: {
    fontSize: FontSize.monoSm,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t1,
    letterSpacing: 1.5,
  },
  closeBtn: {
    fontSize: FontSize.heading,
    fontFamily: FontFamily.monoMedium,
    color: TEXT.t2,
    lineHeight: 20,
  },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
});

