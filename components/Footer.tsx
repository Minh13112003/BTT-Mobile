import { useTheme } from "@/context/Theme_Context";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 12),
        paddingTop: 12,
        alignItems: "center",
        backgroundColor: isDark ? "#111318" : "#F9F9FF",
        borderTopWidth: 1,
        borderTopColor: isDark ? "#2D3748" : "#E5E8F3",
      }}
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 1.5,
          color: isDark ? "#4B5563" : "#926E6A",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        © 2026 BenThanh Tourist Service Corporation
      </Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 1,
          color: isDark ? "#374151" : "#B09490",
          textTransform: "uppercase",
          textAlign: "center",
          marginTop: 2,
        }}
      >
        Thiết kế bởi : Sola
      </Text>
    </View>
  );
}
