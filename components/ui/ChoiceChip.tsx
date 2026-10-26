import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import React from "react";
import { Text, TouchableOpacity, ViewStyle } from "react-native";

/**
 * Nút chọn 1 trong nhiều (tab "Ngày 1", "Ngày 2"... / mục điều khoản) ở trang chi
 * tiết tour. `variant="solid"`: đang chọn = nền đỏ chữ trắng (lịch trình);
 * `variant="outline"`: đang chọn = viền đỏ nền hồng nhạt (điều khoản).
 */
export function ChoiceChip({
  label,
  selected,
  onPress,
  variant = "solid",
  align = "center",
  style,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  variant?: "solid" | "outline";
  align?: "center" | "left";
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const box = selected
    ? variant === "solid"
      ? isDark
        ? "bg-[#B30118] border border-[#B30118]"
        : "bg-[#D0021B] border border-[#D0021B]"
      : isDark
        ? "bg-[#3A1D22] border-2 border-[#F87171]"
        : "bg-[#FFF6F7] border-2 border-[#D0021B]"
    : isDark
      ? "bg-slate-800 border border-slate-700"
      : "bg-slate-50 border border-slate-200";

  const text = selected
    ? variant === "solid"
      ? "text-white font-black"
      : isDark
        ? "text-[#FCA5A5] font-bold"
        : "text-[#B30118] font-bold"
    : isDark
      ? "text-slate-300 font-semibold"
      : "text-slate-700 font-semibold";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`rounded-2xl px-2.5 justify-center ${align === "center" ? "items-center" : "items-start"} ${box}`}
      style={[
        { minHeight: 44 },
        selected && variant === "solid" && !isDark
          ? {
              shadowColor: "#D0021B",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }
          : null,
        style,
      ]}
    >
      <Text style={{ fontSize: FONT_SIZE.card, textAlign: align }} className={text}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
