import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type KeyValue = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "DEL" | "DONE";

const ROWS: KeyValue[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["DEL", "0", "DONE"],
];

/**
 * Bàn phím số tự vẽ (cùng phong cách phím với PINInput) — dùng cho ô số điện
 * thoại ở màn đăng nhập thay cho bàn phím hệ thống, có nút "Xong" riêng.
 *
 * Không phải Modal (khác PINInput): panel nằm đè đáy màn hình để người dùng vẫn
 * thấy ô đang nhập phía trên. Màn cha tự chừa khoảng trống cuối ScrollView bằng
 * `onHeightChange` để cuộn được nội dung lên trên bàn phím.
 *
 * - Bấm giữ ⌫: xoá hết.
 * - `visible=false` → trượt xuống ẩn, không nhận chạm.
 */
export function PhoneKeypad({
  visible,
  onKey,
  onDelete,
  onClear,
  onDone,
  onHeightChange,
}: {
  visible: boolean;
  onKey: (digit: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onDone: () => void;
  onHeightChange?: (height: number) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  // useState (không phải useRef(...).current) để không đọc ref trong lúc render.
  const [slide] = useState(() => new Animated.Value(visible ? 0 : 1));

  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, slide]);

  // Cùng bảng màu với PINInput để 2 bàn phím số trong app nhìn như một.
  const panelBg = isDark ? "#1E222B" : "#FFFFFF";
  const keyBg = isDark ? "#1E293B" : "#F8FAFC";
  const keyBorder = isDark ? "#334155" : "#E2E8F0";
  const textColor = isDark ? "#F1F5F9" : "#1E293B";
  const mutedColor = isDark ? "#64748B" : "#94A3B8";

  const handleLayout = (e: LayoutChangeEvent) => {
    onHeightChange?.(e.nativeEvent.layout.height);
  };

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      onLayout={handleLayout}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: panelBg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
        paddingHorizontal: 16,
        paddingBottom: Math.max(insets.bottom, 12) + 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: isDark ? 0.4 : 0.12,
        shadowRadius: 16,
        elevation: 16,
        transform: [
          {
            translateY: slide.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 420],
            }),
          },
        ],
      }}
    >
      {/* Handle bar — giống PINInput */}
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: mutedColor }} />
      </View>

      <View style={{ gap: 10 }}>
        {ROWS.map((row, ri) => (
          <View key={ri} style={{ flexDirection: "row", gap: 10 }}>
            {row.map((key) => {
              if (key === "DONE") {
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={onDone}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Xong"
                    style={{
                      flex: 1,
                      height: 58,
                      borderRadius: 16,
                      backgroundColor: isDark ? "#374151" : "#D0021B",
                      alignItems: "center",
                      justifyContent: "center",
                      ...(isDark
                        ? {}
                        : {
                            shadowColor: "#D0021B",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.35,
                            shadowRadius: 8,
                            elevation: 4,
                          }),
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontSize: FONT_SIZE.md, fontWeight: "900" }}>
                      Xong
                    </Text>
                  </TouchableOpacity>
                );
              }

              const isDel = key === "DEL";
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => (isDel ? onDelete() : onKey(key))}
                  onLongPress={isDel ? onClear : undefined}
                  delayLongPress={450}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={isDel ? "Xoá" : key}
                  style={{
                    flex: 1,
                    height: 58,
                    borderRadius: 16,
                    backgroundColor: keyBg,
                    borderWidth: 1,
                    borderColor: keyBorder,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isDel ? (
                    <Ionicons name="backspace-outline" size={24} color={textColor} />
                  ) : (
                    <Text style={{ fontSize: 24, fontWeight: "700", color: textColor }}>{key}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

/**
 * Con trỏ giả nhấp nháy cho ô nhập dùng PhoneKeypad (ô không phải TextInput nên
 * không có con trỏ thật). Màn cha tự đặt vị trí: ô trống → trước placeholder,
 * có số → sau chữ số cuối, giống ô nhập của hệ thống.
 */
export function KeypadCaret({ color = "#D0021B" }: { color?: string }) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // Nhịp ~1s giống con trỏ iOS: hiện 500ms, tắt 500ms.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(500),
        Animated.timing(opacity, { toValue: 1, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ width: 2, height: 20, borderRadius: 1, backgroundColor: color, opacity }}
    />
  );
}
