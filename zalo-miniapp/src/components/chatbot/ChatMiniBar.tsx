import React from "react";

import ChatbotLogo from "@/components/chatbot/ChatbotLogo";
import { useFloatingPositions } from "@/components/floating";
import Icon from "@/components/Icon";
import { FONT_SIZE } from "@/constants/typography";
import { useChatbot } from "@/context/ChatbotContext";
import { useTheme } from "@/context/ThemeContext";

/**
 * Thanh bttAI thu nhỏ — cuộc trò chuyện vẫn mở, bấm để quay lại khung chat. Rộng bằng màn hình (lề 16),
 * nằm ở hàng của nút bttAI (ngay dưới nút Zalo) — cùng `slot` với nút bttAI nên không đè Zalo/"lên đầu trang".
 */
export default function ChatMiniBar() {
  const { isOpen, isMinimized, open, close } = useChatbot();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { slot } = useFloatingPositions();

  if (!isOpen || !isMinimized) return null;

  const roundBtn: React.CSSProperties = {
    width: 44,
    height: 44,
    minHeight: 44,
    borderRadius: 22,
    background: isDark ? "#2A2E38" : "#F1F2F6",
  };

  return (
    <div
      className="flex items-center"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: slot,
        height: 58,
        zIndex: 999,
        gap: 10,
        padding: "0 7px 0 12px",
        borderRadius: 29,
        background: isDark ? "#1E222B" : "#FFFFFF",
        border: `1px solid ${isDark ? "#2D3342" : "rgba(26,26,46,0.06)"}`,
        boxShadow: isDark ? "none" : "0 10px 26px rgba(26,26,46,0.22)",
      }}
    >
      <button
        onClick={open}
        aria-label="Mở lại cuộc trò chuyện bttAI"
        className="flex items-center flex-1 min-w-0 text-left"
        style={{ gap: 10, minHeight: 44 }}
      >
        <ChatbotLogo size={38} />
        <span className="flex-1 min-w-0" style={{ display: "block" }}>
          <span className="font-black" style={{ display: "block", fontSize: FONT_SIZE.xxs, color: isDark ? "#F5F6FA" : "#1A1A2E" }}>
            bttAI
          </span>
          <span style={{ display: "block", fontSize: FONT_SIZE.xxs, color: isDark ? "#9AA1B2" : "#6B6F7B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Cuộc trò chuyện đang mở · bấm để tiếp tục
          </span>
        </span>
      </button>
      <button onClick={open} aria-label="Mở rộng" className="flex items-center justify-center flex-shrink-0" style={roundBtn}>
        <Icon name="chevron-up" size={18} color={isDark ? "#C8CDD9" : "#4B4F5C"} />
      </button>
      <button onClick={close} aria-label="Đóng" className="flex items-center justify-center flex-shrink-0" style={roundBtn}>
        <Icon name="close" size={18} color={isDark ? "#C8CDD9" : "#4B4F5C"} />
      </button>
    </div>
  );
}
