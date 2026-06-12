import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface HeaderProps {
  title?: string;
  showActions?: boolean;
  /** When false, skips the top safe-area inset (the parent already provides it). */
  safeArea?: boolean;
}

export default function Header({
  title = "BENTHANH TOURIST",
  showActions = true,
  safeArea = true,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const Wrapper = safeArea ? SafeAreaView : View;

  return (
    <Wrapper
      className={isDark ? "bg-[#1E222B]" : "bg-[#E51F27]"}
      {...(safeArea ? { edges: ["top"] as const } : {})}
    >
      <View
        className={`flex-row items-center px-5 py-3.5 shadow-md ${
          showActions ? "justify-between" : "justify-center"
        } ${
          isDark ? "bg-[#1E222B] border-b border-slate-800" : "bg-[#E51F27]"
        }`}
      >
        {title === "BENTHANH TOURIST" ? (
          <Image
            source={
              isDark
                ? require("../assets/images/Logo_BTT-2018-02.png")
                : require("../assets/images/Logo_BTT-2018.png")
            }
            style={{ width: 190, height: 60 }}
            resizeMode="contain"
          />
        ) : (
          <Text className="text-white font-black text-lg tracking-wider uppercase">
            {title}
          </Text>
        )}

        {showActions && (
          /* Group Header Actions */
          <View className="flex-row items-center">
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

            <TouchableOpacity className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
              <Ionicons
                name="notifications-outline"
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
