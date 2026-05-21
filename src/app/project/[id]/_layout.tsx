import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { BG } from '@/constants/colors';

export default function ProjectLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: BG.bg0 },
        animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right',
      }}
    />
  );
}
