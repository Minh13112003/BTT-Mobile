import {
  ScrollVisibilityProvider,
  useScrollVisibility,
} from "@/context/ScrollVisibility_Context";
import { useNotification } from "@/context/Notification_Context";
import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE = "#D0021B";

/** Per-route icon (filled when focused, outline otherwise) — matches the mockup. */
const ICONS: Record<
  string,
  { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap }
> = {
  index: { on: "home", off: "home-outline" },
  search: { on: "compass", off: "compass-outline" },
  history: { on: "time", off: "time-outline" },
  notifications: { on: "notifications", off: "notifications-outline" },
  profile: { on: "person", off: "person-outline" },
};

/**
 * Custom bottom nav styled after the redesign mockup: outline→filled icon on
 * focus, an active red dot under the label, and a silvery dim overlay while the
 * user scrolls (non-interactive so taps still reach the buttons).
 */
function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { hidden, setHidden } = useScrollVisibility();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotification();

  const contentOpacity = hidden.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.55],
  });
  const silverOpacity = hidden.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const inactive = isDark ? "#6B7280" : "#9CA3AF";

  return (
    <View onTouchStart={() => setHidden(false)}>
      <Animated.View
        style={{
          opacity: contentOpacity,
          flexDirection: "row",
          backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2D3748" : "#EEF0F5",
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 12),
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.title === "string" ? options.title : route.name;
          const focused = state.index === index;
          const icon =
            ICONS[route.name] ?? { on: "ellipse", off: "ellipse-outline" };
          const color = focused ? ACTIVE : inactive;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const isNotif = route.name === "notifications";
          const badge = isNotif && unreadCount > 0 ? (unreadCount > 99 ? "99+" : String(unreadCount)) : null;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={onPress}
              activeOpacity={0.7}
              style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              <View style={{ position: "relative" }}>
                <Ionicons
                  name={focused ? icon.on : icon.off}
                  size={23}
                  color={color}
                />
                {badge && (
                  <View
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -8,
                      backgroundColor: "#D0021B",
                      borderRadius: 99,
                      minWidth: 16,
                      height: 16,
                      paddingHorizontal: 3,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 10,
                        fontWeight: "900",
                        lineHeight: 14,
                      }}
                    >
                      {badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color,
                  marginTop: 3,
                }}
              >
                {label}
              </Text>
              {/* Active red dot indicator */}
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  marginTop: 3,
                  backgroundColor: focused ? ACTIVE : "transparent",
                }}
              />
            </TouchableOpacity>
          );
        })}
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
  return (
    <ScrollVisibilityProvider>
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ title: "Tổng quan" }} />
        <Tabs.Screen name="search" options={{ title: "Du lịch" }} />
        <Tabs.Screen name="history" options={{ title: "Lịch sử" }} />
        <Tabs.Screen name="notifications" options={{ title: "Thông báo" }} />
        <Tabs.Screen name="profile" options={{ title: "Tài khoản" }} />
      </Tabs>
    </ScrollVisibilityProvider>
  );
}
