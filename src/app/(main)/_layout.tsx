import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BG, BORDER, ACCENT, TEXT } from '@/constants/colors';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BG.bg1,
          borderTopColor: BORDER.dim,
          borderTopWidth: 1,
          height: 56,
          // No paddingBottom so icons center well, iOS safe area handles the bottom automatically in Tabs unless overriden
        },
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <Ionicons name="grid" size={20} color={focused ? ACCENT.primary : TEXT.t3} />
              {focused && <View style={{ width: 2, height: 2, backgroundColor: ACCENT.primary, marginTop: 4 }} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="my-tasks"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <Ionicons name="checkmark-done" size={20} color={focused ? ACCENT.primary : TEXT.t3} />
              {focused && <View style={{ width: 2, height: 2, backgroundColor: ACCENT.primary, marginTop: 4 }} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <Ionicons name="search" size={20} color={focused ? ACCENT.primary : TEXT.t3} />
              {focused && <View style={{ width: 2, height: 2, backgroundColor: ACCENT.primary, marginTop: 4 }} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <Ionicons name="person" size={20} color={focused ? ACCENT.primary : TEXT.t3} />
              {focused && <View style={{ width: 2, height: 2, backgroundColor: ACCENT.primary, marginTop: 4 }} />}
            </View>
          ),
        }}
      />
      {/* Hidden tabs */}
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
    </Tabs>
  );
}
