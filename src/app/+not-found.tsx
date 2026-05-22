import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BG, TEXT, ACCENT } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.message}>Page not found</Text>
      <Pressable onPress={() => router.replace('/(main)' as never)} style={styles.btn}>
        <Text style={styles.btnText}>Go home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG.bg0, alignItems: 'center', justifyContent: 'center', gap: 12 },
  code: { fontSize: FontSize['3xl'], fontFamily: FontFamily.soraBold, color: TEXT.muted },
  message: { fontSize: FontSize.lg, fontFamily: FontFamily.interRegular, color: TEXT.secondary },
  btn: { backgroundColor: ACCENT.blue, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  btnText: { fontSize: FontSize.md, fontFamily: FontFamily.interSemiBold, color: '#FFFFFF' },
});
