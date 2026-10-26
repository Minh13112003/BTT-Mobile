import React from "react";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@/context/ThemeContext";
import { useNotification } from "@/context/NotificationContext";
import { useGuideTarget } from "@/context/GuideContext";
import GuideHelpButton from "@/components/GuideHelpButton";
import { GuideTab } from "@/constants/guideSteps";
import { getPalette } from "@/constants/theme";
import { ArrowBackIcon } from "@/components/icons";
import Icon from "@/components/Icon";
import logoUrl from "@/static/Logo_BTT-trimmed.png";

interface HeaderProps {
  title?: string;
  showActions?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  /** Có thì hiện nút ? (xem lại hướng dẫn) cạnh chuông, và chuông được đăng ký làm bước hướng dẫn. */
  guideTab?: GuideTab;
}

/**
 * Port từ components/Header.tsx bên app React Native (bản mới): logo BenThanh Tourist (ảnh) + chuông
 * thông báo có số chưa đọc. Nút đổi giao diện sáng/tối và avatar/đăng xuất đã chuyển sang tab Tài khoản.
 */
export default function Header({
  title = "BENTHANH TOURIST",
  showActions = true,
  showBackButton = false,
  onBackPress,
  guideTab,
}: HeaderProps) {
  const bellRef = useGuideTarget(guideTab ? `${guideTab}.bell` : null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackPress) return onBackPress();
    navigate(-1);
  };

  return (
    <div style={{ backgroundColor: isDark ? palette.surface : palette.brand, paddingTop: "env(safe-area-inset-top)" }}>
      <div
        className={`flex items-center px-5 py-3.5 ${showActions ? "justify-between" : "justify-center"}`}
        style={{
          backgroundColor: isDark ? palette.surface : palette.brand,
          borderBottom: isDark ? `1px solid ${palette.border}` : "none",
        }}
      >
        <div className="flex items-center flex-1 mr-2 min-w-0">
          {showBackButton && (
            <button
              onClick={handleBack}
              aria-label="Quay lại"
              className="mr-3 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ width: 44, height: 44, background: "rgba(255,255,255,0.1)" }}
            >
              <ArrowBackIcon />
            </button>
          )}
          {title === "BENTHANH TOURIST" ? (
            <button onClick={() => navigate("/", { replace: true })} className="flex items-center" style={{ background: "none" }}>
              <img
                src={logoUrl}
                alt="BenThanh Tourist - journey to your heart"
                style={{ width: 157, height: 58, objectFit: "contain", filter: "drop-shadow(0 1px 2px rgba(40,0,6,0.55))" }}
              />
            </button>
          ) : (
            <div className="text-white font-black text-lg uppercase truncate" style={{ letterSpacing: 1 }}>
              {title}
            </div>
          )}
        </div>

        {showActions && guideTab ? <GuideHelpButton tab={guideTab} size={44} /> : null}
        {showActions && (
          <button
            ref={bellRef}
            onClick={() => navigate("/notifications")}
            aria-label="Thông báo"
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              position: "relative",
              width: 44,
              height: 44,
              marginLeft: 12,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <Icon name="notifications-outline" size={22} color="#FFFFFF" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 20,
                  height: 20,
                  padding: "0 4px",
                  borderRadius: 10,
                  background: "#FFFFFF",
                  color: "#D0021B",
                  fontSize: 12,
                  fontWeight: 900,
                  lineHeight: "20px",
                  textAlign: "center",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
