import { BRAND, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * Pill-shaped primary CTA — glossy red gradient (simulated with a layered
 * highlight View since LinearGradient needs its own import per screen),
 * white border ring, colored shadow. Use for the single main action on a
 * screen/bar ("Xem chi tiết", "Đặt tour ngay", "Xác nhận"...). Dark mode
 * falls back to a flat slate button to match the rest of the app's dark palette.
 */
export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  fullWidth = false,
  trailingIcon,
}: {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  trailingIcon?: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: RADIUS.pill,
        minHeight: 44,
        paddingHorizontal: 26,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
        width: fullWidth ? "100%" : undefined,
        opacity: isDisabled ? 0.7 : 1,
        backgroundColor: isDark ? "#374151" : BRAND.red,
        borderWidth: isDark ? 0 : 1,
        borderColor: "rgba(255,255,255,0.4)",
        ...(isDark
          ? {}
          : {
              shadowColor: BRAND.red,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.45,
              shadowRadius: 12,
              elevation: 6,
            }),
      }}
    >
      {!isDark && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 1,
            left: 1,
            right: 1,
            height: "46%",
            borderRadius: RADIUS.pill,
            backgroundColor: "rgba(255,255,255,0.28)",
          }}
        />
      )}
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <Text
            style={{ fontSize: FONT_SIZE.card }}
            className="text-white font-extrabold uppercase tracking-wide"
          >
            {label}
          </Text>
          {trailingIcon}
        </>
      )}
    </TouchableOpacity>
  );
}
