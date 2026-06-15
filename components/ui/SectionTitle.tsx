import { useTheme } from "@/context/Theme_Context";
import React from "react";
import { Text, View } from "react-native";

/** Uppercase section heading with the brand red accent bar. */
export function SectionTitle({ title }: { title: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <View className="flex-row items-center mb-3">
      <View className="w-1 h-3.5 rounded-sm bg-[#D0021B] mr-2" />
      <Text
        className={`text-base font-black uppercase tracking-wider ${
          isDark ? "text-slate-100" : "text-slate-800"
        }`}
      >
        {title}
      </Text>
    </View>
  );
}
