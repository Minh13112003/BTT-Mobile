import { useTheme } from "@/context/Theme_Context";
import React from "react";
import { View } from "react-native";

const lightShadow = {
  shadowColor: "#94A3B8",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 3,
};

/** Themed rounded container used across the tour detail screen. */
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <View
      className={`rounded-3xl p-4 border ${
        isDark ? "bg-[#1A1F2B] border-[#272D3C]" : "bg-white border-slate-100"
      } ${className}`}
      style={isDark ? undefined : lightShadow}
    >
      {children}
    </View>
  );
}
