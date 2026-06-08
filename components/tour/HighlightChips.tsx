import { useTheme } from "@/context/Theme_Context";
import React from "react";
import { Text, View } from "react-native";

/** Green "selling point" pills (e.g. ✈️ Vé máy bay khứ hồi). */
export function HighlightChips({ items }: { items?: string[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  if (!items?.length) return null;

  return (
    <View className="flex-row flex-wrap gap-2 mt-3.5">
      {items.map((item, i) => (
        <View
          key={i}
          className={`px-2.5 py-1.5 rounded-full border ${
            isDark
              ? "bg-green-500/10 border-green-500/30"
              : "bg-green-50 border-green-200"
          }`}
        >
          <Text
            className={`text-[10.5px] font-bold ${
              isDark ? "text-[#7FE08A]" : "text-green-700"
            }`}
          >
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}
