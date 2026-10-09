import React from "react";

import { useTheme } from "@/context/ThemeContext";
import { BRAND, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

/**
 * Port từ components/ui/PrimaryButton.tsx bên app React Native — nút CTA chính
 * dạng viên thuốc: nền đỏ bóng (lớp highlight trắng mờ nửa trên), viền trắng
 * mờ, đổ bóng màu đỏ. Dark mode dùng nền slate phẳng giống bản RN.
 *
 * `as="span"`: dùng khi nút nằm BÊN TRONG 1 vùng bấm khác (vd TourCard là cả
 * 1 <button>) — HTML không cho lồng <button> trong <button>, nên render span
 * chỉ để hiển thị, click do phần tử cha xử lý.
 */
export default function PrimaryButton({
  label,
  onClick,
  loading = false,
  disabled = false,
  fullWidth = false,
  trailingIcon,
  as = "button",
}: {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  trailingIcon?: React.ReactNode;
  as?: "button" | "span";
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isDisabled = disabled || loading;

  const style: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    borderRadius: RADIUS.pill,
    minHeight: 44,
    padding: "12px 26px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: fullWidth ? "100%" : undefined,
    opacity: isDisabled ? 0.7 : 1,
    background: isDark ? "#374151" : BRAND.red,
    border: isDark ? "none" : "1px solid rgba(255,255,255,0.4)",
    boxShadow: isDark ? "none" : "0 5px 12px rgba(208,2,27,0.45)",
    flexShrink: 0,
  };

  const content = (
    <>
      {!isDark && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 1,
            left: 1,
            right: 1,
            height: "46%",
            borderRadius: RADIUS.pill,
            background: "rgba(255,255,255,0.28)",
            pointerEvents: "none",
          }}
        />
      )}
      {loading ? (
        <span className="btn-spinner" />
      ) : (
        <>
          <span
            className="font-extrabold uppercase"
            style={{ position: "relative", fontSize: FONT_SIZE.card, color: "#FFFFFF", letterSpacing: 0.4 }}
          >
            {label}
          </span>
          {trailingIcon}
        </>
      )}
    </>
  );

  if (as === "span") {
    return <span style={style}>{content}</span>;
  }

  return (
    <button type="button" onClick={onClick} disabled={isDisabled} style={style}>
      {content}
    </button>
  );
}
