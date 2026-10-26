import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import ChatTourCard from "@/components/chatbot/ChatTourCard";
import { FONT_SIZE } from "@/constants/typography";
import type { ChatMessage } from "@/context/Chatbot_Context";
import type { ChatAction, ChatBooking, ChatChoice, ChatTour } from "@/services/chatbot";

interface Props {
  message: ChatMessage;
  isDark: boolean;
  onTourPress: (tour: ChatTour) => void;
  onRetry: (messageId: string) => void;
  /** Tin lỗi chỉ cho "Thử lại" khi nó là tin cuối cùng. */
  canRetry: boolean;
  /** Bấm nút trong luồng đặt tour. */
  onAction: (action: ChatAction, label: string, messageId: string) => void;
  /** Mở trang booking khi chatbot đã dẫn tới. */
  onOpenBooking: (booking: ChatBooking) => void;
  /** Chỉ tin cuối (và không đang chờ trả lời) mới bấm được nút. */
  canAct: boolean;
}

export default function ChatMessageBubble({ message, isDark, onTourPress, onRetry, canRetry, onAction, onOpenBooking, canAct }: Props) {
  const text = isDark ? "#E8EAF0" : "#1A1A2E";

  if (message.role === "system") {
    return (
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: isDark ? "#2A2E38" : "#E8EAF0",
          }}
        >
          <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: "600", color: isDark ? "#C8CDD9" : "#4B4F5C" }}>
            {message.text}
          </Text>
        </View>
      </View>
    );
  }

  if (message.role === "user") {
    return (
      <LinearGradient
        colors={isDark ? ["#C21E2E", "#8F0F1B"] : ["#E8212F", "#C00119"]}
        style={{
          alignSelf: "flex-end",
          maxWidth: "80%",
          paddingHorizontal: 14,
          paddingVertical: 11,
          borderRadius: 18,
          borderBottomRightRadius: 6,
        }}
      >
        <Text style={{ fontSize: FONT_SIZE.xxs, lineHeight: 24, color: "#FFFFFF" }}>{message.text}</Text>
      </LinearGradient>
    );
  }

  const isLimit = message.kind === "limit";
  const isError = message.kind === "error";
  const bg = isLimit
    ? isDark
      ? "#3A2E12"
      : "#FFF7E6"
    : isError
      ? isDark
        ? "#3A1D22"
        : "#FFF7F8"
      : isDark
        ? "#1E222B"
        : "#FFFFFF";
  const border = isLimit
    ? isDark
      ? "#6B5518"
      : "#F5DDA4"
    : isError
      ? isDark
        ? "#6B2A33"
        : "#F3C4CA"
      : isDark
        ? "#2D3342"
        : "#ECEEF3";
  const textColor = isLimit ? (isDark ? "#F5DDA4" : "#5C3A00") : text;
  const tours = message.tours ?? [];

  return (
    <View
      style={{
        alignSelf: "flex-start",
        maxWidth: tours.length > 0 || message.handoff ? "94%" : "86%",
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 18,
        borderBottomLeftRadius: 6,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
      }}
    >
      {message.text ? (
        <Text style={{ fontSize: FONT_SIZE.xxs, lineHeight: 24, color: textColor }}>{message.text}</Text>
      ) : null}

      {isError && message.retryText && canRetry ? (
        <TouchableOpacity
          onPress={() => onRetry(message.id)}
          activeOpacity={0.8}
          style={{
            alignSelf: "flex-start",
            marginTop: 10,
            height: 38,
            paddingHorizontal: 16,
            borderRadius: 999,
            borderWidth: 1.5,
            borderColor: isDark ? "#6B2A33" : "#F3C4CA",
            backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: "700", color: isDark ? "#FF8A93" : "#B30118" }}>
            Thử lại
          </Text>
        </TouchableOpacity>
      ) : null}

      {message.handoff ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => Linking.openURL(message.handoff!.zalo_url).catch(() => {})}
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 14,
            backgroundColor: isDark ? "#14281C" : "#E8F5EA",
            borderWidth: 1,
            borderColor: isDark ? "#245C36" : "#B7E0BE",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={isDark ? "#4CC27E" : "#0B5F2F"} />
            <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: "700", color: isDark ? "#4CC27E" : "#0B5F2F" }}>
              Nhắn Zalo nhân viên CSKH
            </Text>
          </View>
          {message.handoff.tom_tat ? (
            <Text
              style={{ marginTop: 6, fontSize: FONT_SIZE.xxs, lineHeight: 22, color: isDark ? "#9FD3AE" : "#3D6B47" }}
            >
              Nhân viên đã có tóm tắt: “{message.handoff.tom_tat}”
            </Text>
          ) : null}
        </TouchableOpacity>
      ) : null}

      {message.choices?.length ? (
        <ChatChoices
          message={message}
          isDark={isDark}
          disabled={!canAct || !!message.answered}
          onAction={onAction}
        />
      ) : null}

      {message.booking ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onOpenBooking(message.booking!)}
          style={{
            marginTop: 10,
            minHeight: 44,
            paddingHorizontal: 16,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#D0021B",
          }}
        >
          <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: "800", color: "#FFFFFF" }}>Xem trạng thái đơn</Text>
        </TouchableOpacity>
      ) : null}

      {tours.length > 0 ? (
        <View style={{ gap: 8, marginTop: 10 }}>
          {tours.map((tour) => (
            <ChatTourCard key={`${tour.id}-${tour.tour_key}`} tour={tour} isDark={isDark} onPress={onTourPress} />
          ))}
          <Text style={{ marginTop: 1, fontSize: FONT_SIZE.xxs, lineHeight: 22, color: isDark ? "#8A92A6" : "#8A8E9A" }}>
            Giá và chỗ còn lại có thể thay đổi, xem chi tiết trong tour.
          </Text>
        </View>
      ) : null}
    </View>
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
    <View style={{ gap: 8, marginTop: 10, opacity: disabled ? 0.55 : 1 }}>
      {choices.map((c) => {
        const pickable = isPickable(c);
        const on = pickable && picked.includes(c.id.replace("nguoi:", ""));
        const primary = c.id === "xn:dong_y";
        return (
          <TouchableOpacity
            key={c.id}
            disabled={disabled}
            activeOpacity={0.8}
            accessibilityRole={pickable ? "checkbox" : "button"}
            accessibilityState={pickable ? { checked: on, disabled } : { disabled }}
            onPress={() => (pickable ? toggle(c) : onAction({ id: c.id }, c.label, message.id))}
            style={{
              minHeight: 44,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 14,
              borderWidth: 1.5,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              borderColor: on || primary ? "#D0021B" : border,
              backgroundColor: primary ? "#D0021B" : on ? (isDark ? "#3A1B20" : "#FDECEE") : isDark ? "#1E222B" : "#FFFFFF",
            }}
          >
            {pickable ? (
              <Ionicons name={on ? "checkbox" : "square-outline"} size={22} color={on ? "#D0021B" : isDark ? "#64748B" : "#A3A8B5"} />
            ) : null}
            <Text
              style={{
                flex: 1,
                fontSize: FONT_SIZE.xxs,
                fontWeight: "700",
                color: primary ? "#FFFFFF" : c.id === "huy" ? (isDark ? "#8A92A6" : "#6B6F7B") : brand,
              }}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      {multi ? (
        <TouchableOpacity
          disabled={disabled || picked.length === 0}
          activeOpacity={0.85}
          onPress={() =>
            onAction({ id: "nguoi:ok", values: picked }, names.length ? `Đi cùng: ${names.join(", ")}` : "Xác nhận", message.id)
          }
          style={{
            minHeight: 44,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: picked.length === 0 ? (isDark ? "#2A2E38" : "#E4E6EC") : "#D0021B",
          }}
        >
          <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: "800", color: picked.length === 0 ? (isDark ? "#6B7280" : "#8A8E9A") : "#FFFFFF" }}>
            {picked.length === 0 ? `Chọn tối đa ${toiDa} người` : `Xác nhận (${picked.length}/${toiDa})`}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
