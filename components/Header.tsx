import { useNotification } from "@/context/Notification_Context";
import { useTheme } from "@/context/Theme_Context";
import { getPalette } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface HeaderProps {
  title?: string;
  showActions?: boolean;
  /** When false, skips the top safe-area inset (the parent already provides it). */
  safeArea?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function Header({
  title = "BENTHANH TOURIST",
  showActions = true,
  safeArea = true,
  showBackButton = false,
  onBackPress,
}: HeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const { unreadCount } = useNotification();
  const router = useRouter();

  const Wrapper = safeArea ? SafeAreaView : View;

  return (
    <Wrapper
      style={{ backgroundColor: isDark ? palette.surface : palette.brand }}
      {...(safeArea ? { edges: ["top"] as const } : {})}
    >
      <View
        className={`flex-row items-center px-5 py-3.5 ${
          showActions ? "justify-between" : "justify-center"
        } ${isDark ? "border-b border-slate-800" : ""}`}
        style={{ backgroundColor: isDark ? palette.surface : palette.brand }}
      >
        <View className="flex-row items-center flex-1 mr-2">
          {showBackButton && (
            <TouchableOpacity
              onPress={onBackPress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="mr-3 rounded-full bg-white/10 items-center justify-center"
              style={{ width: 44, height: 44 }}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {title === "BENTHANH TOURIST" ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.replace("/(root)/(tabs)" as any)}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Image
                source={require("../assets/images/Logo_BTT-trimmed.png")}
                style={{
                  width: 157,
                  height: 58,
                  shadowColor: "#280006",
                  shadowOpacity: 0.55,
                  shadowRadius: 2,
                  shadowOffset: { width: 0, height: 1 },
                }}
                resizeMode="contain"
                accessibilityLabel="BenThanh Tourist - journey to your heart"
              />
            </TouchableOpacity>
          ) : (
            <Text
              numberOfLines={1}
              className="text-white font-black text-lg tracking-wider uppercase"
            >
              {title}
            </Text>
          )}
        </View>

        {showActions && (
          <TouchableOpacity
            onPress={() => router.push("/(root)/(tabs)/notifications" as any)}
            activeOpacity={0.8}
            accessibilityLabel="Thông báo"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            className="rounded-full bg-white/15 items-center justify-center border border-white/25"
            style={{ width: 44, height: 44, marginLeft: 12 }}
          >
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 20,
                  height: 20,
                  paddingHorizontal: 4,
                  borderRadius: 10,
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "900", lineHeight: 15, color: "#D0021B" }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Wrapper>
  );
}
