import React, { useEffect, useRef, useState } from "react";

import ChatbotLogo from "@/components/chatbot/ChatbotLogo";
import ChatMessageBubble from "@/components/chatbot/ChatMessageBubble";
import Icon from "@/components/Icon";
import { FONT_SIZE } from "@/constants/typography";
import { CHAT_STARTER_CHIPS, useChatbot } from "@/context/ChatbotContext";
import { useTheme } from "@/context/ThemeContext";
import type { ChatBooking, ChatTour } from "@/services/chatbot";

const SHEET_TOP = 92;
const MAX_INPUT_HEIGHT = 4 * 24 + 22;

function TypingRow({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="flex items-center"
      style={{
        alignSelf: "flex-start",
        gap: 10,
        padding: "11px 14px",
        borderRadius: 18,
        borderBottomLeftRadius: 6,
        background: isDark ? "#1E222B" : "#FFFFFF",
        border: `1px solid ${isDark ? "#2D3342" : "#ECEEF3"}`,
      }}
    >
      <span style={{ fontSize: FONT_SIZE.xxs, fontStyle: "italic", color: isDark ? "#9AA1B2" : "#6B6F7B" }}>bttAI đang soạn câu trả lời</span>
      <span className="flex" style={{ gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="bttai-dot" style={{ width: 7, height: 7, borderRadius: 4, background: "#8A8E9A", animationDelay: `${i * 0.16}s` }} />
        ))}
      </span>
    </div>
  );
}

function HeaderButton({ icon, label, onClick, isDark }: { icon: string; label: string; onClick: () => void; isDark: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-center flex-shrink-0"
      style={{ width: 44, height: 44, borderRadius: 22, background: isDark ? "#2A2E38" : "#F1F2F6" }}
    >
      <Icon name={icon} size={20} color={isDark ? "#C8CDD9" : "#4B4F5C"} />
    </button>
  );
}

/** Phần bàn phím ảo che bên dưới (px) — để ô nhập không bị bàn phím che trong webview. */
function useKeyboardInset(active: boolean): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) {
      setInset(0);
      return;
    }
    const update = () => setInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);
  return inset;
}

interface Props {
  onTourPress: (tour: ChatTour) => void;
  onOpenBooking: (booking: ChatBooking) => void;
}

/**
 * Khung chat bttAI — trượt từ dưới lên (cao từ top 92px xuống đáy), bo góc trên 28, nền mờ phía sau.
 * Header: icon + "bttAI" + dòng xanh, 2 nút tròn thu nhỏ/đóng. Có chip gợi ý, ô nhập nhiều dòng (tối đa
 * 4 dòng), dòng nhắc "/clear". Port từ components/chatbot/ChatSheet.tsx (RN).
 */
export default function ChatSheet({ onTourPress, onOpenBooking }: Props) {
  const { messages, sheetVisible, isSending, send, sendAction, retry, minimize, close } = useChatbot();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [rendered, setRendered] = useState(false);
  const [entered, setEntered] = useState(false);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const keyboardInset = useKeyboardInset(sheetVisible);

  // Mở / thu nhỏ / đóng: trượt lên-xuống (CSS transition), chỉ gỡ khỏi cây khi trượt xong.
  useEffect(() => {
    if (sheetVisible) {
      setRendered(true);
      const t = setTimeout(() => setEntered(true), 16);
      return () => clearTimeout(t);
    }
    setEntered(false);
    (document.activeElement as HTMLElement | null)?.blur?.();
    const t = setTimeout(() => setRendered(false), 260);
    return () => clearTimeout(t);
  }, [sheetVisible]);

  // Tự cuộn xuống tin mới.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isSending, rendered, keyboardInset]);

  // Ô nhập tự co giãn theo số dòng (tối đa 4 dòng).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  }, [draft, rendered]);

  if (!rendered) return null;

  const lastMessage = messages[messages.length - 1];
  const hasUserMessage = messages.some((m) => m.role === "user");
  const chips: string[] = !hasUserMessage
    ? CHAT_STARTER_CHIPS
    : !isSending && lastMessage?.role === "bot" && lastMessage.goiY?.length
      ? lastMessage.goiY
      : [];

  const canSend = draft.trim().length > 0 && !isSending;
  const handleSend = (value?: string) => {
    const text = (value ?? draft).trim();
    if (!text || isSending) return;
    setDraft("");
    send(text);
  };

  const sheetBg = isDark ? "#111318" : "#F5F6FA";
  const headerBg = isDark ? "#1A1D25" : "#FFFFFF";
  const line = isDark ? "#2D3342" : "#E8EAF0";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000 }}>
      <div
        onClick={minimize}
        aria-label="Thu nhỏ khung chat"
        style={{
          position: "absolute",
          inset: 0,
          background: isDark ? "rgba(0,0,0,0.55)" : "rgba(26,26,46,0.5)",
          opacity: entered ? 1 : 0,
          transition: "opacity 0.26s",
        }}
      />

      <div
        role="dialog"
        aria-label="Trợ lý bttAI"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: SHEET_TOP,
          bottom: keyboardInset,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          background: sheetBg,
          transform: entered ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
          paddingBottom: keyboardInset > 0 ? 0 : "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex justify-center" style={{ padding: "8px 0 2px", background: headerBg }}>
          <span style={{ width: 40, height: 4, borderRadius: 2, background: isDark ? "#3A4050" : "#D3D6DF" }} />
        </div>

        <div
          className="flex items-center"
          style={{ gap: 10, padding: "8px 16px 12px", borderBottom: `1px solid ${line}`, background: headerBg }}
        >
          <ChatbotLogo size={40} />
          <div className="flex-1 min-w-0">
            <div className="font-black" style={{ fontSize: FONT_SIZE.md, color: isDark ? "#F5F6FA" : "#1A1A2E" }}>
              bttAI
            </div>
            <div className="font-semibold" style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#4CC27E" : "#1C8A4C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Trợ lý tour BenThanh Tourist
            </div>
          </div>
          <HeaderButton icon="chevron-down" label="Thu nhỏ" onClick={minimize} isDark={isDark} />
          <HeaderButton icon="close" label="Đóng" onClick={close} isDark={isDark} />
        </div>

        <div
          ref={listRef}
          style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 14px 6px", display: "flex", flexDirection: "column", gap: 10 }}
        >
          {messages.map((m, index) => (
            <ChatMessageBubble
              key={m.id}
              message={m}
              isDark={isDark}
              onTourPress={onTourPress}
              onRetry={retry}
              canRetry={index === messages.length - 1 && !isSending}
              onAction={sendAction}
              onOpenBooking={onOpenBooking}
              canAct={index === messages.length - 1 && !isSending}
            />
          ))}
          {isSending ? <TypingRow isDark={isDark} /> : null}
        </div>

        {chips.length > 0 && (
          <div className="flex overflow-x-auto" style={{ gap: 8, padding: "6px 14px 10px", flexShrink: 0 }}>
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="font-semibold flex-shrink-0"
                style={{
                  height: 44,
                  padding: "0 14px",
                  borderRadius: 999,
                  fontSize: FONT_SIZE.xxs,
                  whiteSpace: "nowrap",
                  border: `1px solid ${isDark ? "#4A2A30" : "#F0C4C9"}`,
                  background: isDark ? "#1E222B" : "#FFFFFF",
                  color: isDark ? "#FF8A93" : "#B30118",
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: "10px 14px 6px", background: headerBg, borderTop: `1px solid ${line}`, flexShrink: 0 }}>
          <div className="flex items-end" style={{ gap: 10 }}>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Nhập câu hỏi về tour…"
              rows={1}
              disabled={isSending}
              style={{
                flex: 1,
                minHeight: 46,
                maxHeight: MAX_INPUT_HEIGHT,
                resize: "none",
                outline: "none",
                border: "none",
                padding: "11px 16px",
                borderRadius: 23,
                fontSize: FONT_SIZE.xxs,
                lineHeight: "24px",
                fontFamily: "inherit",
                color: isDark ? "#E8EAF0" : "#1A1A2E",
                background: isDark ? "#2A2E38" : "#F1F2F6",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!canSend}
              aria-label="Gửi"
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                opacity: canSend ? 1 : 0.45,
                background: isDark ? "linear-gradient(180deg, #C21E2E, #7A0A16)" : "linear-gradient(180deg, #F0323F, #B8001A)",
              }}
            >
              <Icon name="send" size={20} color="#FFFFFF" />
            </button>
          </div>
          <div className="text-center" style={{ padding: "8px 0 6px", fontSize: FONT_SIZE.xxs, color: isDark ? "#8A92A6" : "#8A8E9A" }}>
            Gõ <b style={{ color: isDark ? "#C8CDD9" : "#6B6F7B" }}>/clear</b> để làm mới cuộc trò chuyện
          </div>
        </div>
      </div>
    </div>
  );
}
