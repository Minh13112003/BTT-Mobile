import React, { useState } from "react";

import ChatTourCard from "@/components/chatbot/ChatTourCard";
import Icon from "@/components/Icon";
import { FONT_SIZE } from "@/constants/typography";
import type { ChatMessage } from "@/context/ChatbotContext";
import type { ChatAction, ChatBooking, ChatChoice, ChatTour } from "@/services/chatbot";
import { openLink } from "@/utils/links";

interface Props {
  message: ChatMessage;
  isDark: boolean;
  onTourPress: (tour: ChatTour) => void;
  onRetry: (messageId: string) => void;
  /** Tin lỗi chỉ cho "Thử lại" khi nó là tin cuối cùng. */
  canRetry: boolean;
  /** Bấm nút trong luồng đặt tour. */
  onAction: (action: ChatAction, label: string, messageId: string) => void;
  /** Xem trạng thái đơn khi chatbot đã dẫn tới. */
  onOpenBooking: (booking: ChatBooking) => void;
  /** Chỉ tin cuối (và không đang chờ trả lời) mới bấm được nút. */
  canAct: boolean;
}

export default function ChatMessageBubble({ message, isDark, onTourPress, onRetry, canRetry, onAction, onOpenBooking, canAct }: Props) {
  const text = isDark ? "#E8EAF0" : "#1A1A2E";

  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <span
          className="font-semibold"
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: FONT_SIZE.xxs,
            background: isDark ? "#2A2E38" : "#E8EAF0",
            color: isDark ? "#C8CDD9" : "#4B4F5C",
          }}
        >
          {message.text}
        </span>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div
        style={{
          alignSelf: "flex-end",
          maxWidth: "80%",
          padding: "11px 14px",
          borderRadius: 18,
          borderBottomRightRadius: 6,
          lineHeight: "24px",
          fontSize: FONT_SIZE.xxs,
          color: "#FFFFFF",
          overflowWrap: "anywhere",
          whiteSpace: "pre-wrap",
          background: isDark ? "linear-gradient(180deg, #C21E2E, #8F0F1B)" : "linear-gradient(180deg, #E8212F, #C00119)",
        }}
      >
        {message.text}
      </div>
    );
  }

  const isLimit = message.kind === "limit";
  const isError = message.kind === "error";
  const bg = isLimit ? (isDark ? "#3A2E12" : "#FFF7E6") : isError ? (isDark ? "#3A1D22" : "#FFF7F8") : isDark ? "#1E222B" : "#FFFFFF";
  const border = isLimit ? (isDark ? "#6B5518" : "#F5DDA4") : isError ? (isDark ? "#6B2A33" : "#F3C4CA") : isDark ? "#2D3342" : "#ECEEF3";
  const textColor = isLimit ? (isDark ? "#F5DDA4" : "#5C3A00") : text;
  const tours = message.tours ?? [];

  return (
    <div
      style={{
        alignSelf: "flex-start",
        maxWidth: tours.length > 0 || message.handoff ? "94%" : "86%",
        padding: "11px 14px",
        borderRadius: 18,
        borderBottomLeftRadius: 6,
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      {message.text ? (
        <div style={{ lineHeight: "24px", fontSize: FONT_SIZE.xxs, color: textColor, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
          {message.text}
        </div>
      ) : null}

      {isError && message.retryText && canRetry ? (
        <button
          onClick={() => onRetry(message.id)}
          className="font-bold"
          style={{
            marginTop: 10,
            height: 44,
            padding: "0 16px",
            borderRadius: 999,
            fontSize: FONT_SIZE.xxs,
            border: `1.5px solid ${isDark ? "#6B2A33" : "#F3C4CA"}`,
            background: isDark ? "#1E222B" : "#FFFFFF",
            color: isDark ? "#FF8A93" : "#B30118",
          }}
        >
          Thử lại
        </button>
      ) : null}

      {message.handoff ? (
        <button
          onClick={() => openLink(message.handoff!.zalo_url)}
          className="block w-full text-left"
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 14,
            background: isDark ? "#14281C" : "#E8F5EA",
            border: `1px solid ${isDark ? "#245C36" : "#B7E0BE"}`,
          }}
        >
          <span className="flex items-center font-bold" style={{ gap: 8, fontSize: FONT_SIZE.xxs, color: isDark ? "#4CC27E" : "#0B5F2F" }}>
            <Icon name="chatbox-ellipses-outline" size={18} color={isDark ? "#4CC27E" : "#0B5F2F"} />
            Nhắn Zalo nhân viên CSKH
          </span>
          {message.handoff.tom_tat ? (
            <span style={{ display: "block", marginTop: 6, lineHeight: "22px", fontSize: FONT_SIZE.xxs, color: isDark ? "#9FD3AE" : "#3D6B47" }}>
              Nhân viên đã có tóm tắt: “{message.handoff.tom_tat}”
            </span>
          ) : null}
        </button>
      ) : null}

      {message.choices?.length ? (
        <ChatChoices message={message} isDark={isDark} disabled={!canAct || !!message.answered} onAction={onAction} />
      ) : null}

      {message.booking ? (
        <button
          onClick={() => onOpenBooking(message.booking!)}
          className="font-extrabold w-full"
          style={{
            marginTop: 10,
            minHeight: 44,
            padding: "0 16px",
            borderRadius: 999,
            fontSize: FONT_SIZE.xxs,
            color: "#FFFFFF",
            background: "#D0021B",
          }}
        >
          Xem trạng thái đơn
        </button>
      ) : null}

      {tours.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {tours.map((tour) => (
            <ChatTourCard key={`${tour.id}-${tour.tour_key}`} tour={tour} isDark={isDark} onPress={onTourPress} />
          ))}
          <div style={{ marginTop: 1, lineHeight: "22px", fontSize: FONT_SIZE.xxs, color: isDark ? "#8A92A6" : "#8A8E9A" }}>
            Giá và chỗ còn lại có thể thay đổi, xem chi tiết trong tour.
          </div>
        </div>
      ) : null}
    </div>
  );
}


/** Nút bấm của luồng đặt tour: chọn 1 (bấm là gửi) hoặc chọn nhiều (bật/tắt rồi bấm "Xác nhận"). */
function ChatChoices({
  message,
  isDark,
  disabled,
  onAction,
}: {
  message: ChatMessage;
  isDark: boolean;
  disabled: boolean;
  onAction: (action: ChatAction, label: string, messageId: string) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const choices = message.choices ?? [];
  const multi = !!message.multi;
  const toiDa = message.toiDa ?? 99;
  // Trong chế độ chọn nhiều, "nguoi:skip" và "huy" là nút hành động riêng, không phải ô tick.
  const isPickable = (c: ChatChoice) => multi && c.id.startsWith("nguoi:") && c.id !== "nguoi:skip";
  const brand = isDark ? "#FF8A93" : "#B30118";
  const border = isDark ? "#4A2A30" : "#F3C4CA";

  const toggle = (c: ChatChoice) => {
    const id = c.id.replace("nguoi:", "");
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= toiDa ? prev : [...prev, id]));
  };

  const names = choices.filter((c) => picked.includes(c.id.replace("nguoi:", ""))).map((c) => c.label.split(" · ")[0]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10, opacity: disabled ? 0.55 : 1 }}>
      {choices.map((c) => {
        const pickable = isPickable(c);
        const on = pickable && picked.includes(c.id.replace("nguoi:", ""));
        const primary = c.id === "xn:dong_y";
        return (
          <button
            key={c.id}
            disabled={disabled}
            role={pickable ? "checkbox" : "button"}
            aria-checked={pickable ? on : undefined}
            onClick={() => (pickable ? toggle(c) : onAction({ id: c.id }, c.label, message.id))}
            className="flex items-center text-left font-bold"
            style={{
              minHeight: 44,
              padding: "8px 14px",
              borderRadius: 14,
              gap: 10,
              fontSize: FONT_SIZE.xxs,
              border: `1.5px solid ${on || primary ? "#D0021B" : border}`,
              background: primary ? "#D0021B" : on ? (isDark ? "#3A1B20" : "#FDECEE") : isDark ? "#1E222B" : "#FFFFFF",
              color: primary ? "#FFFFFF" : c.id === "huy" ? (isDark ? "#8A92A6" : "#6B6F7B") : brand,
            }}
          >
            {pickable ? (
              <span
                aria-hidden
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: `2px solid ${on ? "#D0021B" : isDark ? "#64748B" : "#A3A8B5"}`,
                  background: on ? "#D0021B" : "transparent",
                }}
              >
                {on ? <Icon name="checkmark" size={14} color="#FFFFFF" strokeWidth={3} /> : null}
              </span>
            ) : null}
            <span style={{ flex: 1, minWidth: 0 }}>{c.label}</span>
          </button>
        );
      })}
      {multi ? (
        <button
          disabled={disabled || picked.length === 0}
          onClick={() =>
            onAction({ id: "nguoi:ok", values: picked }, names.length ? `Đi cùng: ${names.join(", ")}` : "Xác nhận", message.id)
          }
          className="font-extrabold"
          style={{
            minHeight: 44,
            borderRadius: 999,
            fontSize: FONT_SIZE.xxs,
            color: picked.length === 0 ? (isDark ? "#6B7280" : "#8A8E9A") : "#FFFFFF",
            background: picked.length === 0 ? (isDark ? "#2A2E38" : "#E4E6EC") : "#D0021B",
          }}
        >
          {picked.length === 0 ? `Chọn tối đa ${toiDa} người` : `Xác nhận (${picked.length}/${toiDa})`}
        </button>
      ) : null}
    </div>
  );
}
