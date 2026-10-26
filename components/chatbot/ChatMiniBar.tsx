import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatbotLogo from "@/components/chatbot/ChatbotLogo";
import { FONT_SIZE } from "@/constants/typography";
import { useChatbot } from "@/context/Chatbot_Context";
import { useTheme } from "@/context/Theme_Context";

const TAB_PATHS = ["/", "/search", "/history", "/notifications", "/profile"];

/** Chiều cao thanh tab (khớp `AnimatedTabBar`: paddingTop 8 + pill 72 + paddingBottom max(inset, 12)). */
function tabBarHeight(insetBottom: number): number {
  return 8 + 72 + Math.max(insetBottom, 12);
}

/**
 * Thanh rộng bằng màn hình (lề 16) và **thay chỗ nút bttAI** — cùng `bottom` với nút đó, ngay dưới
 * nút Zalo (cột nút nổi bắt đầu từ bottom + 62). Phải khớp `baseBottom` của `ZaloFloatingButton` ở
 * từng màn: tab = 10 so với mép trên thanh tab, trang tour/checkout = 130, còn lại = 30.
 */
function miniBarBottom(pathname: string, insetBottom: number): number {
  if (pathname.startsWith("/tour/") || pathname.startsWith("/checkout")) return 130;
  if (TAB_PATHS.includes(pathname)) return tabBarHeight(insetBottom) + 10;
  return 30;
}

/** Thanh bttAI thu nhỏ — cuộc trò chuyện vẫn mở, bấm để quay lại khung chat. */
export default function ChatMiniBar() {
  const { isOpen, isMinimized, open, close } = useChatbot();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (!isOpen || !isMinimized) return null;

  return (
    <View
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: miniBarBottom(pathname, insets.bottom),
        height: 58,
        zIndex: 999,
        borderRadius: 29,
        paddingLeft: 12,
        paddingRight: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
        borderWidth: 1,
        borderColor: isDark ? "#2D3342" : "rgba(26,26,46,0.06)",
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDark ? 0 : 0.22,
        shadowRadius: 26,
        elevation: isDark ? 0 : 10,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={open}
        accessibilityLabel="Mở lại cuộc trò chuyện bttAI"
        style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 }}
      >
        <ChatbotLogo size={38} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: "800", color: isDark ? "#F5F6FA" : "#1A1A2E" }}>
            bttAI
          </Text>
          <Text numberOfLines={1} style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#9AA1B2" : "#6B6F7B" }}>
            Cuộc trò chuyện đang mở · bấm để tiếp tục
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={open}
        accessibilityLabel="Mở rộng"
        activeOpacity={0.7}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark ? "#2A2E38" : "#F1F2F6",
        }}
      >
        <Ionicons name="chevron-up" size={18} color={isDark ? "#C8CDD9" : "#4B4F5C"} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={close}
        accessibilityLabel="Đóng"
        activeOpacity={0.7}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark ? "#2A2E38" : "#F1F2F6",
        }}
      >
        <Ionicons name="close" size={18} color={isDark ? "#C8CDD9" : "#4B4F5C"} />
      </TouchableOpacity>
    </View>
  );
}
