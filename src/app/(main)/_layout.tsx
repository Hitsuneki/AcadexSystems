import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { BG, BORDER, ACCENT, TEXT } from '@/constants/colors';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BG.bg1,
          borderTopColor: BORDER.default,
          borderTopWidth: 0.5,
          height: 58,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: ACCENT.blue,
        tabBarInactiveTintColor: TEXT.muted,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-tasks"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
      {/* Hidden tabs (pushed as stack screens) */}
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
    </Tabs>
  );
}
