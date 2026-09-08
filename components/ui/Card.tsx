import { getShadow, RADIUS } from "@/constants/theme";
import { useTheme } from "@/context/Theme_Context";
import React from "react";
import { View } from "react-native";

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
      className={`p-4 border ${
        isDark ? "bg-[#1A1F2B] border-[#272D3C]" : "bg-white border-slate-100"
      } ${className}`}
      style={{ borderRadius: RADIUS.xl, ...getShadow(isDark, "sm") }}
    >
      {children}
    </View>
  );
}
