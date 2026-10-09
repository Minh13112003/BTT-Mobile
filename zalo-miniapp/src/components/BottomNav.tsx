import React from "react";
import { useLocation } from "react-router-dom";
import { BottomNavigation } from "zmp-ui";

import { useTheme } from "@/context/ThemeContext";
import { useNotification } from "@/context/NotificationContext";
import { getPalette } from "@/constants/theme";
import { HomeIcon, CompassIcon, ClockIcon, BellIcon, UserIcon } from "@/components/icons";

const TABS = [
  { key: "home", path: "/", label: "Trang chủ", Icon: HomeIcon },
  { key: "search", path: "/search", label: "Du lịch", Icon: CompassIcon },
  { key: "history", path: "/history", label: "Lịch sử", Icon: ClockIcon },
  { key: "notifications", path: "/notifications", label: "Thông báo", Icon: BellIcon },
  { key: "profile", path: "/profile", label: "Tài khoản", Icon: UserIcon },
];

/**
 * Thanh tab dưới cùng — tương đương _layout.tsx trong app/(root)/(tabs) bên
 * React Native (5 tab: Trang chủ/Du lịch/Lịch sử/Thông báo/Tài khoản). Chỉ
 * hiện trên đúng 5 path tab, ẩn ở mọi trang con (chi tiết tour, checkout,
 * login...) — giống cách (root) stack không có tab bar bên RN.
 */
export default function BottomNav() {
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const { unreadCount } = useNotification();

  const activeTab = TABS.find((t) => t.path === location.pathname);
  if (!activeTab) return null;

  return (
    <BottomNavigation
      activeKey={activeTab.key}
      fixed
      style={{
        backgroundColor: palette.surface,
        borderTop: `1px solid ${palette.border}`,
      }}
    >
      {TABS.map(({ key, path, label, Icon }) => {
        const active = key === activeTab.key;
        const color = active ? palette.brand : palette.iconMuted;
        const showBadge = key === "notifications" && unreadCount > 0;
        const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);

        return (
          <BottomNavigation.Item
            key={key}
            itemKey={key}
            linkTo={path}
            label={<span style={{ color, fontWeight: 700, fontSize: 14 }}>{label}</span>}
            icon={
              <div style={{ position: "relative" }}>
                <Icon active={active} color={color} />
                {showBadge && (
                  <span
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -8,
                      minWidth: 18,
                      height: 18,
                      padding: "0 3px",
                      borderRadius: 999,
                      background: palette.brand,
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 900,
                      lineHeight: "18px",
                      textAlign: "center",
                    }}
                  >
                    {badgeText}
                  </span>
                )}
              </div>
            }
          />
        );
      })}
    </BottomNavigation>
  );
}
