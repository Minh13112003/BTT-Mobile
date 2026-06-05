import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface HeaderProps {
  title?: string;
  showActions?: boolean;
}

export default function Header({
  title = "BENTHANH TOURIST",
  showActions = true,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <SafeAreaView
      className={isDark ? "bg-[#1E222B]" : "bg-[#E51F27]"}
      edges={["top"]}
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
                : require("../assets/images/Logo_BTT-2018.jpg")
            }
            style={{ width: 140, height: 35 }}
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
    </SafeAreaView>
  );
}
