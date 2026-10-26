import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useTheme } from "@/context/ThemeContext";
import { useGuideTarget } from "@/context/GuideContext";
import { useNotification } from "@/context/NotificationContext";
import { HomeIcon, BriefcaseIcon, ClockIcon, BellIcon, UserIcon } from "@/components/icons";

const TABS = [
  { key: "home", path: "/", label: "Tổng quan", Icon: HomeIcon },
  { key: "search", path: "/search", label: "Du lịch", Icon: BriefcaseIcon },
  { key: "history", path: "/history", label: "Lịch sử", Icon: ClockIcon },
  { key: "notifications", path: "/notifications", label: "Thông báo", Icon: BellIcon },
  { key: "profile", path: "/profile", label: "Tài khoản", Icon: UserIcon },
];

const ACTIVE_RATIO = 2.1; // tab đang chọn rộng gấp 2.1 lần tab thường (khớp app RN)

/**
 * Thanh tab nổi dạng viên thuốc — port từ app/(root)/(tabs)/_layout.tsx (RN): tab đang chọn là viên
 * đỏ bóng có nhãn, các tab còn lại chỉ có icon; bề rộng trượt mượt khi đổi tab. Khi cuộn xuống
 * thanh mờ đi (60%) và hiện đầy đủ lại khi chạm hoặc cuộn lên. Chỉ hiện trên đúng 5 path tab, ẩn
 * ở mọi trang con (chi tiết tour, checkout, login...).
 */
export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { unreadCount } = useNotification();
  const [faded, setFaded] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current + 4 && y > 60) setFaded(true);
      else if (y < lastY.current - 4) setFaded(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Đổi trang → thanh luôn hiện lại đầy đủ.
  useEffect(() => {
    setFaded(false);
    lastY.current = window.scrollY;
  }, [location.pathname]);

  const navRef = useGuideTarget("nav");
  const activeIndex = TABS.findIndex((t) => t.path === location.pathname);
  if (activeIndex < 0) return null;

  const inactive = isDark ? "#9CA3AF" : "#6B6F7B";
  const pageBg = isDark ? "#111318" : "#F5F6FA";

  return (
    <div
      onTouchStart={() => setFaded(false)}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 90,
        background: pageBg,
        padding: "8px 16px max(env(safe-area-inset-bottom), 12px)",
      }}
    >
      <div
        ref={navRef}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          height: 72,
          padding: 9,
          borderRadius: 28,
          opacity: faded ? 0.6 : 1,
          transition: "opacity 0.25s",
          background: isDark ? "rgba(30,34,43,0.97)" : "rgba(255,255,255,0.97)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(26,26,46,0.06)"}`,
          boxShadow: isDark ? "0 8px 18px rgba(26,26,46,0.4)" : "0 8px 18px rgba(26,26,46,0.16)",
        }}
      >
        {TABS.map(({ key, path, label, Icon }, index) => {
          const focused = index === activeIndex;
          const showBadge = key === "notifications" && unreadCount > 0;
          const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);
          return (
            <button
              key={key}
              aria-label={label}
              aria-current={focused ? "page" : undefined}
              onClick={() => !focused && navigate(path, { replace: true })}
              style={{
                position: "relative",
                flex: focused ? ACTIVE_RATIO : 1,
                transition: "flex-grow 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
                height: 54,
                minHeight: 54,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "visible",
                border: focused ? "1px solid rgba(255,255,255,0.5)" : "1px solid transparent",
                background: focused
                  ? isDark
                    ? "linear-gradient(180deg, #C21E2E, #9B0F1C 55%, #7A0A16)"
                    : "linear-gradient(180deg, #F0323F, #D0021B 55%, #B8001A)"
                  : "transparent",
                boxShadow: focused ? "0 5px 8px rgba(208,2,27,0.35)" : "none",
              }}
            >
              <span style={{ position: "relative", display: "flex" }}>
                <Icon active={focused} color={focused ? "#FFFFFF" : inactive} size={23} />
                {showBadge && (
                  <span
                    style={{
                      position: "absolute",
                      top: -7,
                      right: -9,
                      minWidth: 18,
                      height: 18,
                      padding: "0 4px",
                      borderRadius: 9,
                      background: focused ? "#FFFFFF" : "#D0021B",
                      border: `1.5px solid ${isDark ? "#1E222B" : "#FFFFFF"}`,
                      color: focused ? "#D0021B" : "#FFFFFF",
                      fontSize: 11,
                      fontWeight: 800,
                      lineHeight: "15px",
                      textAlign: "center",
                    }}
                  >
                    {badgeText}
                  </span>
                )}
              </span>
              {focused && (
                <span
                  style={{
                    marginLeft: 7,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
