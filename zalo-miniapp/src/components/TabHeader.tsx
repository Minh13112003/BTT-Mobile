import React from "react";

import { useTheme } from "@/context/ThemeContext";
import { FONT_SIZE } from "@/constants/typography";
import GuideHelpButton from "@/components/GuideHelpButton";
import { GuideTab } from "@/constants/guideSteps";
import logoWatermark from "@/static/Logo_BTT-2018-02.png";

interface TabHeaderProps {
  title: string;
  subtitle?: string;
  /** Nút/hành động đặt bên phải tiêu đề (vd "Đọc tất cả"). */
  right?: React.ReactNode;
  /** Nội dung thêm bên dưới tiêu đề (vd ô tìm kiếm). */
  children?: React.ReactNode;
  /** Hiện nút quay lại bên trái tiêu đề. */
  onBack?: () => void;
  /** Hiện nút ? (xem lại hướng dẫn của tab) trước `right`. */
  guideTab?: GuideTab;
}

/**
 * Port từ components/TabHeader.tsx (RN): header đỏ dùng chung cho các tab Du lịch / Lịch sử /
 * Thông báo — tiêu đề + phụ đề, vòng tròn trang trí và logo in chìm góc phải, bo tròn đáy.
 */
export default function TabHeader({ title, subtitle, right, children, onBack, guideTab }: TabHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        paddingTop: "calc(env(safe-area-inset-top) + 18px)",
        paddingBottom: 22,
        paddingLeft: 20,
        paddingRight: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        background: isDark
          ? "linear-gradient(165deg, #2A2E38 0%, #1E222B 50%, #14161C 100%)"
          : "linear-gradient(165deg, #B30014 0%, #8A0010 50%, #5C000B 100%)",
      }}
    >
      <svg
        width={390}
        height={160}
        style={{ position: "absolute", top: 0, right: 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        <circle cx={360} cy={10} r={120} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
      </svg>
      <img
        src={logoWatermark}
        alt=""
        style={{
          position: "absolute",
          right: -40,
          bottom: -14,
          width: 200,
          height: 100,
          opacity: 0.12,
          objectFit: "contain",
          pointerEvents: "none",
        }}
      />
      <div className="flex items-center justify-between" style={{ position: "relative" }}>
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Quay lại"
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              marginRight: 12,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.15)",
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        ) : null}
        <div className="flex-1 min-w-0" style={{ paddingRight: 12 }}>
          <div className="text-white font-black" style={{ fontSize: FONT_SIZE.xl, lineHeight: "30px" }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ marginTop: 2, color: "rgba(255,255,255,0.75)", fontSize: FONT_SIZE.xxs }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        {guideTab ? (
          <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
            <GuideHelpButton tab={guideTab} />
            {right}
          </div>
        ) : (
          right
        )}
      </div>
      {children}
    </div>
  );
}
