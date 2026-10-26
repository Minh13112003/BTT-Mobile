import React from "react";

import ChatbotLogo from "@/components/chatbot/ChatbotLogo";
import { useFloatingPositions } from "@/components/floating";
import { useChatbot } from "@/context/ChatbotContext";
import { useGuideTarget } from "@/context/GuideContext";

/**
 * Nút nổi bttAI — ngay DƯỚI nút Zalo (cách 12px). Chỉ hiện khi đã đăng nhập và khi khung chat chưa mở/
 * thu nhỏ (lúc đó thanh thu nhỏ thay chỗ nút này). Chỗ của nút luôn được chừa để Zalo không nhảy vị trí.
 */
export default function ChatbotFloatingButton() {
  const { slot, isLoggedIn } = useFloatingPositions();
  const { isOpen, open } = useChatbot();
  const guideRef = useGuideTarget("home.bot");

  if (!isLoggedIn || isOpen) return null;

  return (
    <button
      ref={guideRef}
      onClick={open}
      aria-label="Mở trợ lý bttAI"
      style={{
        position: "fixed",
        bottom: slot,
        right: 20,
        zIndex: 98,
        width: 50,
        height: 50,
        minHeight: 50,
        borderRadius: 15,
        background: "#E5162C",
        boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
      }}
    >
      <ChatbotLogo size={50} />
    </button>
  );
}
