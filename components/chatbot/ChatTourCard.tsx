import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { TourImage } from "@/components/tour/TourImage";
import { FONT_SIZE } from "@/constants/typography";
import { formatPrice } from "@/helper/format";
import type { ChatTour } from "@/services/chatbot";

/** Ngày khởi hành đầu tiên (dạng `YYYY-MM-DD`) hoặc "" nếu dữ liệu không hợp lệ. */
export function firstDepartureDate(raw: string): string {
  const first = (raw ?? "").split(",")[0].trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(first) ? first : "";
}

function toDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function formatChatDuration(days: number): string {
  if (!days || days <= 0) return "";
  return `${days} ngày ${Math.max(days - 1, 0)} đêm`;
}

export default function ChatTourCard({
  tour,
  isDark,
  onPress,
}: {
  tour: ChatTour;
  isDark: boolean;
  onPress: (tour: ChatTour) => void;
}) {
  const date = firstDepartureDate(tour.ngay_khoi_hanh);
  const duration = formatChatDuration(tour.so_ngay);
  const meta = [duration, date ? `Khởi hành ${toDisplayDate(date)}` : ""].filter(Boolean).join(" · ");
  const seats = tour.so_cho_con;
  const lowSeats = seats <= 5;
  const seatText = seats <= 0 ? "Hết chỗ" : `Còn ${seats} chỗ`;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(tour)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 10,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: isDark ? "#14161C" : "#FFFFFF",
        borderWidth: 1,
        borderColor: isDark ? "#2D3342" : "#ECEEF3",
      }}
    >
      {isDark && (
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 340 90"
          preserveAspectRatio="none"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Path
            d="M0,90 L0,50 C 28,38 56,38 85,50 C 113,62 141,62 170,50 C 198,38 226,38 255,50 C 283,62 311,62 340,50 L340,90 Z"
            fill="#64748B"
            fillOpacity={0.2}
          />
        </Svg>
      )}
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: isDark ? "#2A2E38" : "#E8EAF0",
        }}
      >
        {tour.anh ? <TourImage uri={tour.anh} style={{ width: 64, height: 64 }} /> : null}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <Text
          numberOfLines={2}
          style={{ fontSize: FONT_SIZE.xxs, fontWeight: "700", color: isDark ? "#F1F3F8" : "#1A1A2E" }}
        >
          {tour.ten}
        </Text>
        {meta ? (
          <Text numberOfLines={1} style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#9AA1B2" : "#6B6F7B" }}>
            {meta}
          </Text>
        ) : null}
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: "800", color: isDark ? "#FF8A93" : "#C00119" }}>
            {formatPrice(tour.gia)}
          </Text>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: lowSeats
                ? isDark
                  ? "rgba(255,90,102,0.16)"
                  : "#FDECEC"
                : isDark
                  ? "rgba(76,194,126,0.16)"
                  : "#EAF6EC",
            }}
          >
            <Text
              style={{
                fontSize: FONT_SIZE.xxs,
                fontWeight: "700",
                color: lowSeats ? (isDark ? "#FF8A93" : "#B30118") : isDark ? "#4CC27E" : "#2F7D4F",
              }}
            >
              {seatText}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={isDark ? "#6B7285" : "#A3A8B5"} />
    </TouchableOpacity>
  );
}
