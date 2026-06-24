import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Tỉ lệ gốc của logo (cao / rộng) để co giãn mà không méo. */
const LOGO_ASPECT = 60 / 190;
/** Bề rộng tối đa của logo (để trên tablet không bị phóng quá to). */
const LOGO_MAX_WIDTH = 190;

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
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { width: screenWidth } = useWindowDimensions();

  // Logo co giãn theo bề ngang màn hình (≈48%), chặn trên ở LOGO_MAX_WIDTH,
  // giữ nguyên tỉ lệ -> không tràn trên máy nhỏ, không quá to trên tablet.
  const logoWidth = Math.min(LOGO_MAX_WIDTH, Math.round(screenWidth * 0.48));
  const logoHeight = Math.round(logoWidth * LOGO_ASPECT);

  const Wrapper = safeArea ? SafeAreaView : View;

  return (
    <Wrapper
      className={isDark ? "bg-[#1E222B]" : "bg-[#D0021B]"}
      {...(safeArea ? { edges: ["top"] as const } : {})}
    >
      <View
        className={`flex-row items-center px-5 py-3.5 ${
          showActions ? "justify-between" : "justify-center"
        } ${
          isDark ? "bg-[#1E222B] border-b border-slate-800" : "bg-[#D0021B]"
        }`}
      >
        <View className="flex-row items-center flex-1 mr-2">
          {showBackButton && (
            <TouchableOpacity
              onPress={onBackPress}
              activeOpacity={0.7}
              className="mr-3 p-1 rounded-full bg-white/10"
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {title === "BENTHANH TOURIST" ? (
            <Image
              source={
                isDark
                  ? require("../assets/images/Logo_BTT-2018-02.png")
                  : require("../assets/images/Logo_BTT-2018.png")
              }
              style={{ width: logoWidth, height: logoHeight, flexShrink: 1 }}
              resizeMode="contain"
            />
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
          /* Group Header Actions */
          <View className="flex-row items-center flex-shrink-0 pl-3">
            {/* Nút chuyển đổi Giao diện */}
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.7}
              className="w-8 h-8 rounded-full bg-white/10 items-center justify-center mr-2.5"
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>

          </View>
        )}
      </View>
    </Wrapper>
  );
}
