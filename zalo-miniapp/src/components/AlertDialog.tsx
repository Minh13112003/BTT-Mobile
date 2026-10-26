import React from "react";

import { useTheme } from "@/context/ThemeContext";
import { FONT_SIZE } from "@/constants/typography";

export type AlertType = "success" | "error" | "warning" | "confirm";

interface AlertDialogProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message?: string;
  onClose: () => void;
  /** Có thì hiện 2 nút (huỷ/đồng ý) — dùng với type="confirm". */
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const TYPE_STYLE: Record<AlertType, { icon: string; color: string; bg: string }> = {
  success: { icon: "✓", color: "#16A34A", bg: "#DCFCE7" },
  error: { icon: "✕", color: "#DC2626", bg: "#FEE2E2" },
  warning: { icon: "!", color: "#D97706", bg: "#FEF3C7" },
  confirm: { icon: "?", color: "#D0021B", bg: "#FDECEE" },
};

/**
 * Hộp thoại thông báo/xác nhận dùng chung — tương đương components/CustomAlert.tsx bên app RN
 * (cùng 4 loại success/error/warning/confirm). Dùng thay cho `alert()`/`confirm()` của trình duyệt.
 */
export default function AlertDialog({
  visible,
  type = "success",
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Đồng ý",
  cancelText = "Huỷ",
}: AlertDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  if (!visible) return null;
  const st = TYPE_STYLE[type];
  const isConfirm = type === "confirm" && !!onConfirm;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 3000, padding: 24 }}
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 340,
          borderRadius: 24,
          padding: "24px 20px 20px",
          textAlign: "center",
          background: isDark ? "#1E222B" : "#FFFFFF",
          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
        }}
      >
        <div
          className="flex items-center justify-center mx-auto font-black"
          style={{ width: 56, height: 56, borderRadius: 28, background: isDark ? `${st.color}33` : st.bg, color: st.color, fontSize: 28 }}
        >
          {st.icon}
        </div>
        <div className="font-black" style={{ marginTop: 14, fontSize: FONT_SIZE.md, color: isDark ? "#F1F5F9" : "#1A1A2E" }}>
          {title}
        </div>
        {message ? (
          <div style={{ marginTop: 8, fontSize: FONT_SIZE.xxs, lineHeight: "24px", color: isDark ? "#94A3B8" : "#6B7280", whiteSpace: "pre-line" }}>
            {message}
          </div>
        ) : null}
        <div className="flex" style={{ marginTop: 20, gap: 10 }}>
          {isConfirm && (
            <button
              onClick={onClose}
              className="flex-1 font-bold"
              style={{ height: 48, borderRadius: 14, background: isDark ? "#334155" : "#F1F5F9", color: isDark ? "#E2E8F0" : "#475569", fontSize: FONT_SIZE.xxs }}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              onClose();
              if (isConfirm) onConfirm?.();
            }}
            className="flex-1 font-bold text-white"
            style={{ height: 48, borderRadius: 14, background: isConfirm || type === "error" ? "#D0021B" : st.color, fontSize: FONT_SIZE.xxs }}
          >
            {isConfirm ? confirmText : "Đóng"}
          </button>
        </div>
      </div>
    </div>
  );
}
