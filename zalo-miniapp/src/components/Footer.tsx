import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { FONT_SIZE } from "@/constants/typography";

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const textColor = isDark ? "#4B5563" : "#926E6A";
  const subTextColor = isDark ? "#374151" : "#B09490";

  return (
    <div
      style={{
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        paddingTop: 16,
        paddingLeft: 24,
        paddingRight: 24,
        background: isDark ? "#111318" : "#F9F9FF",
        borderTop: `1px solid ${isDark ? "#2D3748" : "#E5E8F3"}`,
      }}
    >
      <div
        style={{
          fontSize: FONT_SIZE.card,
          fontWeight: 700,
          letterSpacing: 0.5,
          color: textColor,
          textTransform: "uppercase",
          lineHeight: "22px",
        }}
      >
        © 2026 BenThanh Tourist Service Corporation
      </div>
      <div style={{ fontSize: FONT_SIZE.card, color: subTextColor, marginTop: 4 }}>
        HOTLINE: <span style={{ fontWeight: 700 }}>1900 6668</span>
      </div>
      <div style={{ fontSize: FONT_SIZE.card, color: subTextColor, marginTop: 4 }}>
        Email: <span style={{ fontWeight: 700 }}>benthanh@benthanhtourist.com</span>
      </div>
    </div>
  );
}
