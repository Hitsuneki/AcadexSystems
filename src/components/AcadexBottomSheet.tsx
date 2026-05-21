import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import BottomSheetLib, {
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
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
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" onPress={onClose} />
    ),
    [onClose],
  );

  const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <BottomSheetLib
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}>
      <ContentWrapper contentContainerStyle={scrollable ? styles.scrollContent : undefined}>
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>
        )}
        <View style={scrollable ? undefined : styles.content}>{children}</View>
      </ContentWrapper>
    </BottomSheetLib>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: BG.bg1,
    borderTopWidth: 0.5,
    borderTopColor: BORDER.default,
  },
  handle: { backgroundColor: 'rgba(255,255,255,0.2)', width: 36 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER.default,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.soraSemiBold,
    color: TEXT.primary,
  },
  closeBtn: {
    fontSize: FontSize.lg,
    color: TEXT.secondary,
  },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
});
