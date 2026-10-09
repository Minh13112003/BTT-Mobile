import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { logout as apiLogout } from "@/services/auth";
import { getPalette, BOTTOM_NAV_SPACE, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { UserIcon, CloseIcon } from "@/components/icons";

interface MenuRow {
  emoji: string;
  iconBg: string;
  iconBgDark: string;
  title: string;
  subtitle: string;
  path: string;
}

const MENU_ROWS: MenuRow[] = [
  { emoji: "🪪", iconBg: "#EFF6FF", iconBgDark: "#334155", title: "Thông tin cá nhân", subtitle: "Xem chi tiết hồ sơ tài khoản", path: "/selfprofile" },
  { emoji: "🎟️", iconBg: "#FEF2F2", iconBgDark: "#334155", title: "Kho voucher của bạn", subtitle: "Quản lý mã giảm giá, khuyến mãi", path: "/vouchers" },
  { emoji: "👥", iconBg: "#FAF5FF", iconBgDark: "#334155", title: "Giới thiệu bạn bè", subtitle: "Chia sẻ nhận điểm thưởng, quà tặng", path: "/referral" },
  { emoji: "💬", iconBg: "#FFFBEB", iconBgDark: "#334155", title: "Gửi góp ý phản hồi", subtitle: "Đóng góp ý kiến nâng cao dịch vụ", path: "/feedback" },
];

/** Port từ app/(root)/(tabs)/profile.tsx — bỏ mục PIN (chưa port, xem ghi chú cuối phiên) và màn đăng ký khách hàng (admin-only, ngoài phạm vi v1). */
export default function ProfilePage() {
  const { isLoggedIn, user, logout, refreshPoints } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const [avatarZoom, setAvatarZoom] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (isLoggedIn) refreshPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.log("Logout error, forcing client redirect:", error);
    } finally {
      await logout();
      navigate("/login", { replace: true });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "100vh", background: palette.screenBg }}>
        <Spinner />
      </div>
    );
  }

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: BOTTOM_NAV_SPACE }}>
      <Header />

      <div className="flex flex-col items-center" style={{ margin: "32px 24px" }}>
        <button
          onClick={() => user?.avatarUrl && setAvatarZoom(true)}
          className="relative flex items-center justify-center"
          style={{
            width: 200,
            height: 200,
            borderRadius: 100,
            marginBottom: 16,
            background: isDark ? "#334155" : palette.brand,
            border: `6px solid ${isDark ? "#475569" : "#FFFFFF"}`,
            boxShadow: isDark ? "none" : `0 10px 24px ${palette.brand}4D`,
          }}
        >
          <div style={{ width: "100%", height: "100%", borderRadius: 100, overflow: "hidden" }} className="flex items-center justify-center">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <UserIcon active color={isDark ? "#E5E7EB" : "#FFFFFF"} size={100} />
            )}
          </div>
          {user?.avatarUrl && (
            <div
              className="absolute flex items-center justify-center"
              style={{
                bottom: 4,
                right: 4,
                width: 32,
                height: 32,
                borderRadius: 16,
                background: palette.brand,
                border: "2px solid white",
                color: "#FFFFFF",
                fontSize: 14,
              }}
            >
              ⤢
            </div>
          )}
        </button>

        <div className="font-black text-center" style={{ fontSize: FONT_SIZE.xxl, color: palette.textPrimary }}>
          {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Người dùng"}
        </div>
        <div className="text-center" style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary, marginTop: 4 }}>
          {user?.email}
        </div>
      </div>

      <div
        style={{
          margin: "0 24px",
          padding: "0 16px",
          borderRadius: RADIUS.xl,
          border: `1px solid ${palette.border}`,
          background: palette.surface,
        }}
      >
        {MENU_ROWS.map((row, i) => (
          <button
            key={row.path}
            onClick={() => navigate(row.path)}
            className="flex items-center w-full text-left"
            style={{
              padding: "16px 0",
              borderBottom: i < MENU_ROWS.length - 1 ? `1px solid ${palette.border}` : "none",
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                borderRadius: RADIUS.sm,
                marginRight: 16,
                fontSize: 20,
                background: isDark ? "#334155" : row.iconBg,
              }}
            >
              {row.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary }}>
                {row.title}
              </div>
              <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textMuted, marginTop: 2 }}>
                {row.subtitle}
              </div>
            </div>
            <span style={{ color: palette.textMuted }}>›</span>
          </button>
        ))}
      </div>

      <div style={{ margin: "24px 24px 0" }}>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full text-white font-black"
          style={{
            borderRadius: RADIUS.lg,
            padding: "16px 24px",
            gap: 10,
            background: isDark
              ? "linear-gradient(90deg, #7F1D1D, #991B1B)"
              : "linear-gradient(90deg, #D0021B, #B30118)",
            boxShadow: isDark ? "none" : "0 4px 12px rgba(208,2,27,0.35)",
            letterSpacing: 0.5,
            fontSize: FONT_SIZE.sm,
          }}
        >
          <span
            className="flex items-center justify-center"
            style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.18)" }}
          >
            ⎋
          </span>
          Đăng xuất tài khoản
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <Footer />
      </div>

      {avatarZoom && user?.avatarUrl && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.93)", zIndex: 2000 }}
          onClick={() => setAvatarZoom(false)}
        >
          <button
            onClick={() => setAvatarZoom(false)}
            className="absolute flex items-center justify-center"
            style={{
              top: "calc(env(safe-area-inset-top) + 10px)",
              right: 20,
              width: 44,
              height: 44,
              borderRadius: 22,
              background: "rgba(255,255,255,0.2)",
            }}
          >
            <CloseIcon color="#FFFFFF" />
          </button>
          <img
            src={user.avatarUrl}
            alt=""
            style={{ width: "90%", height: "60%", borderRadius: 16, objectFit: "contain" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Page>
  );
}
