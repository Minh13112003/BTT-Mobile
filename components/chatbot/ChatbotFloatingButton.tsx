import React from "react";
import { TouchableOpacity, View } from "react-native";
import ChatbotLogo from "@/components/chatbot/ChatbotLogo";
import { useAuth } from "@/context/Auth_Context";
import { useChatbot } from "@/context/Chatbot_Context";
import { useGuideTarget } from "@/context/Guide_Context";

export const CHATBOT_BUTTON_SIZE = 50;
export const CHATBOT_BUTTON_GAP = 12;
/** Nút Zalo phải được đẩy lên bằng chừng này khi nút bttAI hiện bên dưới. */
export const CHATBOT_LIFT = CHATBOT_BUTTON_SIZE + CHATBOT_BUTTON_GAP;

/**
 * Độ nâng cần cộng cho mọi nút nổi nằm phía trên (Zalo, "lên đầu trang"). Cố định theo trạng thái
 * đăng nhập — không đổi khi khung chat mở/thu nhỏ — để các nút không nhảy vị trí.
 */
export function useChatbotLift(): number {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? CHATBOT_LIFT : 0;
}

/** Nút nổi bttAI — đặt ngay dưới nút Zalo. Vị trí do `ZaloFloatingButton` quyết định. */
export default function ChatbotFloatingButton({ bottom, guideKey }: { bottom: number; guideKey?: string }) {
  const { open } = useChatbot();
  const guideRef = useGuideTarget(guideKey ?? null);

  return (
    <View ref={guideRef} collapsable={false} style={{ position: "absolute", bottom, right: 20, zIndex: 98 }}>
      <TouchableOpacity
        onPress={open}
        activeOpacity={0.85}
        accessibilityLabel="Mở trợ lý bttAI"
        style={{
          width: CHATBOT_BUTTON_SIZE,
          height: CHATBOT_BUTTON_SIZE,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 6,
          borderRadius: 15,
          backgroundColor: "#E5162C",
        }}
      >
        <ChatbotLogo size={CHATBOT_BUTTON_SIZE} />
      </TouchableOpacity>
    </View>
  );
}
