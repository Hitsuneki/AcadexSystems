import { Stack } from 'expo-router';
import { BG } from '@/constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: BG.bg0 },
        animation: 'slide_from_right',
      }}
    />
  );
}
