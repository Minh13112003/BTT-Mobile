import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { FONT_SIZE } from "@/constants/typography";

/** Port từ components/tour/HighlightChips.tsx — dùng chung ở Tour Detail và Booking Detail. */
export default function HighlightChips({ items }: { items?: string[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  if (!items?.length) return null;

  return (
    <div className="flex flex-wrap" style={{ gap: 8, marginTop: 14 }}>
      {items.map((item, i) => (
        <span
          key={i}
          className="font-bold"
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: `1px solid ${isDark ? "rgba(34,197,94,0.3)" : "#BBF7D0"}`,
            background: isDark ? "rgba(34,197,94,0.1)" : "#F0FDF4",
            color: isDark ? "#7FE08A" : "#15803D",
            fontSize: FONT_SIZE.xxs,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
