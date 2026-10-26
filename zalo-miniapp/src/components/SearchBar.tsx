import React from "react";

import Icon from "@/components/Icon";
import { useTheme } from "@/context/ThemeContext";
import { FONT_SIZE } from "@/constants/typography";

/** Ô tìm kiếm có nút xoá — port từ components/SearchBar.tsx (RN). */
export default function SearchBar({
  value,
  onChange,
  placeholder = "Tìm kiếm tour du lịch...",
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="flex items-center"
      style={{
        height: 52,
        padding: "0 16px",
        borderRadius: 16,
        background: isDark ? "#1E222B" : "#FFFFFF",
        border: `2px solid ${isDark ? "rgba(51,65,85,0.6)" : "#F1F5F9"}`,
      }}
    >
      <Icon name="search-outline" size={20} color={isDark ? "#6B7280" : "#94A3B8"} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        enterKeyHint="search"
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          marginLeft: 12,
          border: "none",
          outline: "none",
          background: "transparent",
          fontWeight: 600,
          fontSize: FONT_SIZE.xs,
          color: isDark ? "#F1F5F9" : "#1E293B",
        }}
      />
      {value.length > 0 && (
        <button onClick={() => onChange("")} aria-label="Xoá" style={{ padding: 4, minHeight: 0, display: "flex" }}>
          <Icon name="close-circle-outline" size={18} color={isDark ? "#6B7280" : "#94A3B8"} />
        </button>
      )}
    </div>
  );
}
