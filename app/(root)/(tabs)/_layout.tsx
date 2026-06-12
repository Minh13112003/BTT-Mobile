import {
  ScrollVisibilityProvider,
  useScrollVisibility,
} from "@/context/ScrollVisibility_Context";
import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomTabBar,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";

/**
 * Default tab bar that dims to a silvery overlay while the user scrolls and
 * snaps back to normal the moment it's touched. The overlay is non-interactive
 * so the touch still reaches the underlying tab buttons.
 */
function AnimatedTabBar(props: BottomTabBarProps) {
  const { hidden, setHidden } = useScrollVisibility();
  const contentOpacity = hidden.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.55],
  });
  const silverOpacity = hidden.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View onTouchStart={() => setHidden(false)}>
      <Animated.View style={{ opacity: contentOpacity }}>
        <BottomTabBar {...props} />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#C0C0C0", opacity: silverOpacity },
        ]}
      />
    </View>
  );
}

export default function TabLayout() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ScrollVisibilityProvider>
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: isDark ? "#F3F4F6" : "#E51F27",
          tabBarInactiveTintColor: isDark ? "#6B7280" : "#64748B",
          tabBarStyle: {
            backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#2D3748" : "#E2E8F0",
            height: 75,
            paddingBottom: 20,
            paddingTop: 8,
          },

          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: "bold",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Tổng quan",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Tìm kiếm",
            tabBarIcon: ({ color }) => (
              <Ionicons name="search" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "Lịch sử",
            tabBarIcon: ({ color }) => (
              <Ionicons name="time" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Tài khoản",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={20} color={color} />
            ),
          }}
        />
      </Tabs>
    </ScrollVisibilityProvider>
  );
}
