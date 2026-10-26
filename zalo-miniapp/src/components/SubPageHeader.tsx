import React from "react";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@/context/ThemeContext";
import { FONT_SIZE } from "@/constants/typography";

/**
 * Thanh tiêu đề của các trang con trong Tài khoản (Mật khẩu & PIN, Câu hỏi thường gặp, Về BenThanh,
 * Điều khoản): nút quay lại tròn + tiêu đề, nền theo màn hình. Tương đương khối
 * `flex-row items-center px-4 py-2` đầu các màn (profile)/* bên app RN.
 */
export default function SubPageHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="flex items-center"
      style={{ padding: "calc(env(safe-area-inset-top) + 8px) 16px 8px" }}
    >
      <button
        onClick={() => (onBack ? onBack() : navigate(-1))}
        aria-label="Quay lại"
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          background: isDark ? "#1E293B" : "rgba(255,255,255,0.6)",
        }}
      >
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={isDark ? "#93C5FD" : "#D0021B"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <div
        className="font-black"
        style={{ marginLeft: 16, fontSize: FONT_SIZE.xl, color: isDark ? "#F1F5F9" : "#1E293B" }}
      >
        {title}
      </div>
    </div>
  );
}
