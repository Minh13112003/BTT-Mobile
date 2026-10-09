import { useNotification } from "@/context/Notification_Context";
import {
  ScrollVisibilityProvider,
  useScrollVisibility,
} from "@/context/ScrollVisibility_Context";
import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Icon theo route — cùng bộ với bản thiết kế thanh tab nổi. */
const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  search: "briefcase-outline",
  history: "time-outline",
  notifications: "notifications-outline",
  profile: "person-outline",
};

const ACTIVE_RATIO = 2.1; // tab đang chọn rộng gấp 2.1 lần tab thường
const GAP = 4;
const PAD = 9;

type TabBarProps = NonNullable<
  React.ComponentProps<typeof Tabs>["tabBar"]
> extends (props: infer P) => React.ReactNode
  ? P
  : never;

/**
 * Thanh tab nổi dạng viên thuốc: tab đang chọn là viên đỏ bóng có nhãn, trượt
 * mượt sang tab mới (animate bề rộng + độ mờ). Khi người dùng cuộn, thanh mờ đi
 * nhẹ (ScrollVisibility) nhưng vẫn bấm được.
 */
function AnimatedTabBar({ state, descriptors, navigation }: TabBarProps) {
  const { hidden, setHidden } = useScrollVisibility();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotification();

  const count = state.routes.length;
  const [innerW, setInnerW] = useState(0);
  const progress = useRef(
    state.routes.map((_, i) => new Animated.Value(i === state.index ? 1 : 0))
  ).current;

  useEffect(() => {
    Animated.parallel(
      progress.map((v, i) =>
        Animated.timing(v, {
          toValue: i === state.index ? 1 : 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      )
    ).start();
  }, [state.index, progress]);

  // innerW = chiều rộng khả dụng; chia theo (count - 1) + ACTIVE_RATIO đơn vị.
  const unit = innerW > 0 ? (innerW - GAP * (count - 1)) / (count - 1 + ACTIVE_RATIO) : 0;

  const contentOpacity = hidden.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  const inactive = isDark ? "#9CA3AF" : "#6B6F7B";
  const pageBg = isDark ? "#111318" : "#F5F6FA";

  return (
    <View
      onTouchStart={() => setHidden(false)}
      style={{
        backgroundColor: pageBg,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 12),
        zIndex: 10,
      }}
    >
      <Animated.View
        onLayout={(e) => setInnerW(e.nativeEvent.layout.width - PAD * 2 - 2)}
        style={{
          opacity: contentOpacity,
          height: 72,
          padding: PAD,
          borderRadius: 28,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isDark ? "rgba(30,34,43,0.97)" : "rgba(255,255,255,0.97)",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(26,26,46,0.06)",
          shadowColor: "#1A1A2E",
          shadowOpacity: isDark ? 0.4 : 0.16,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = typeof options.title === "string" ? options.title : route.name;
          const focused = state.index === index;
          const p = progress[index];

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

          const badge =
            route.name === "notifications" && unreadCount > 0
              ? unreadCount > 99
                ? "99+"
                : String(unreadCount)
              : null;

          const width = unit
            ? p.interpolate({ inputRange: [0, 1], outputRange: [unit, unit * ACTIVE_RATIO] })
            : undefined;

          return (
            <Animated.View
              key={route.key}
              style={{
                width,
                flex: unit ? undefined : 1,
                marginLeft: index === 0 ? 0 : GAP,
                height: 54,
              }}
            >
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={focused ? { selected: true } : {}}
                onPress={onPress}
                activeOpacity={0.8}
                style={{ flex: 1, borderRadius: 20 }}
              >
                <Animated.View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    opacity: p,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.5)",
                    shadowColor: "#D0021B",
                    shadowOpacity: 0.35,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 5 },
                    elevation: 4,
                    backgroundColor: "#D0021B",
                  }}
                >
                  <LinearGradient
                    colors={
                      isDark
                        ? ["#C21E2E", "#9B0F1C", "#7A0A16"]
                        : ["#F0323F", "#D0021B", "#B8001A"]
                    }
                    style={{ flex: 1, borderRadius: 19 }}
                  />
                </Animated.View>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View style={{ position: "relative" }}>
                    <Ionicons
                      name={ICONS[route.name] ?? "ellipse-outline"}
                      size={23}
                      color={focused ? "#FFFFFF" : inactive}
                    />
                    {badge && (
                      <View
                        style={{
                          position: "absolute",
                          top: -7,
                          right: -9,
                          minWidth: 18,
                          height: 18,
                          paddingHorizontal: 4,
                          borderRadius: 9,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: focused ? "#FFFFFF" : "#D0021B",
                          borderWidth: 1.5,
                          borderColor: isDark ? "#1E222B" : "#FFFFFF",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "800",
                            lineHeight: 14,
                            color: focused ? "#D0021B" : "#FFFFFF",
                          }}
                        >
                          {badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  {focused && (
                    <Animated.Text
                      numberOfLines={1}
                      style={{
                        marginLeft: 7,
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#FFFFFF",
                        opacity: p,
                      }}
                    >
                      {label}
                    </Animated.Text>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <ScrollVisibilityProvider>
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{ headerShown: false, animation: "fade" }}
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
