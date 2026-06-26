import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();

  const textColor = isDark ? "#4B5563" : "#926E6A";
  const subTextColor = isDark ? "#374151" : "#B09490";

  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 16),
        paddingTop: 16,
        paddingHorizontal: 24,
        backgroundColor: isDark ? "#111318" : "#F9F9FF",
        borderTopWidth: 1,
        borderTopColor: isDark ? "#2D3748" : "#E5E8F3",
      }}
    >
      {/* Khối thông tin canh trái */}
      <View style={{ alignItems: "flex-start" }}>
        <Text
          style={{
            fontSize: FONT_SIZE.card,
            fontWeight: "700",
            letterSpacing: 0.5,
            color: textColor,
            textTransform: "uppercase",
            textAlign: "left",
            lineHeight: 22,
          }}
        >
          © 2026 BenThanh Tourist Service Corporation
        </Text>
        <Text
          style={{
            fontSize: FONT_SIZE.card,
            color: subTextColor,
            textAlign: "left",
            marginTop: 4,
            fontWeight: "normal", // Đảm bảo chữ "HOTLINE:" ở trạng thái không in đậm
          }}
        >
          HOTLINE: <Text style={{ fontWeight: "bold" }}>1900 6668</Text>
        </Text>
        <Text
          style={{
            fontSize: FONT_SIZE.card,
            color: subTextColor,
            textAlign: "left",
            marginTop: 4,
            fontWeight: "normal", // Đảm bảo chữ "HOTLINE:" ở trạng thái không in đậm
          }}
        >
          Email:{" "}
          <Text style={{ fontWeight: "bold" }}>
            benthanh@benthanhtourist.com
          </Text>
        </Text>
      </View>

      {/* Signature thiết kế ở cuối, canh giữa */}
      <Text
        style={{
          fontSize: FONT_SIZE.card - 3,
          fontWeight: "700",
          letterSpacing: 1.5,
          color: isDark ? "#4B5563" : "#A68D89",
          textTransform: "uppercase",
          textAlign: "center",
          marginTop: 16,
        }}
      >
        Thiết kế bởi: SOLA
      </Text>
    </View>
  );
}
