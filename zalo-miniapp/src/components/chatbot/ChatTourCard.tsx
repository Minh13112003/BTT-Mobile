import React from "react";

import Icon from "@/components/Icon";
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

/** Thẻ tour trong khung chat: ảnh vuông 64px, tên, "X ngày Y đêm · Khởi hành dd/mm/yyyy", giá, nhãn số chỗ. */
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
    <button
      onClick={() => onPress(tour)}
      className="flex items-center w-full text-left"
      style={{
        position: "relative",
        gap: 12,
        padding: 10,
        borderRadius: 16,
        overflow: "hidden",
        background: isDark ? "#14161C" : "#FFFFFF",
        border: `1px solid ${isDark ? "#2D3342" : "#ECEEF3"}`,
      }}
    >
      {isDark && (
        <svg
          viewBox="0 0 340 90"
          preserveAspectRatio="none"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          aria-hidden="true"
        >
          <path
            d="M0,90 L0,50 C 28,38 56,38 85,50 C 113,62 141,62 170,50 C 198,38 226,38 255,50 C 283,62 311,62 340,50 L340,90 Z"
            fill="#64748B"
            fillOpacity={0.2}
          />
        </svg>
      )}
      <div
        style={{
          position: "relative",
          width: 64,
          height: 64,
          borderRadius: 12,
          overflow: "hidden",
          flexShrink: 0,
          background: isDark ? "#2A2E38" : "#E8EAF0",
        }}
      >
        {tour.anh ? <img src={tour.anh} alt="" loading="lazy" style={{ width: 64, height: 64, objectFit: "cover" }} /> : null}
      </div>
      <div className="flex-1 min-w-0" style={{ position: "relative", display: "flex", flexDirection: "column", gap: 3 }}>
        <span
          className="font-bold"
          style={{
            fontSize: FONT_SIZE.xxs,
            color: isDark ? "#F1F3F8" : "#1A1A2E",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {tour.ten}
        </span>
        {meta ? (
          <span style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#9AA1B2" : "#6B6F7B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {meta}
          </span>
        ) : null}
        <span className="flex items-center flex-wrap" style={{ gap: 8 }}>
          <span className="font-black" style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#FF8A93" : "#C00119" }}>
            {formatPrice(tour.gia)}
          </span>
          <span
            className="font-bold"
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: FONT_SIZE.xxs,
              background: lowSeats ? (isDark ? "rgba(255,90,102,0.16)" : "#FDECEC") : isDark ? "rgba(76,194,126,0.16)" : "#EAF6EC",
              color: lowSeats ? (isDark ? "#FF8A93" : "#B30118") : isDark ? "#4CC27E" : "#2F7D4F",
            }}
          >
            {seatText}
          </span>
        </span>
      </div>
      <span style={{ position: "relative", flexShrink: 0, display: "flex" }}>
        <Icon name="chevron-forward" size={18} color={isDark ? "#6B7285" : "#A3A8B5"} />
      </span>
    </button>
  );
}
