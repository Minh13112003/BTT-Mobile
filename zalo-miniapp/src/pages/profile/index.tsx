import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";

import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import GuideHelpButton from "@/components/GuideHelpButton";
import { useGuideTarget, useTabGuide } from "@/context/GuideContext";
import AvatarViewer from "@/components/AvatarViewer";
import TierAvatar from "@/components/TierAvatar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { logout as apiLogout } from "@/services/auth";
import { getTransactionHistory } from "@/services/booking";
import { getMyFavorites } from "@/services/favorite";
import { getVouchers } from "@/services/voucher";
import { getTier } from "@/constants/membership";
import { getPalette, BOTTOM_NAV_SPACE } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { getItem, setItem } from "@/utils/storage";
import { formatDepartureDate } from "@/utils/tour";
import { callPhone, openLink } from "@/utils/links";
import logoWatermark from "@/static/Logo_BTT-2018-02.png";

const PROMO_KEY = "pref_promo_notifications";
const UPCOMING_DAYS = 5;
const UPCOMING_MAX = 5;
const BOOKED_STATUSES = ["CONFIRMED", "PAID"];
const ZALO_URL = "https://zalo.me/237833859403376914";

interface UpcomingTrip {
  id: string;
  name: string;
  image?: string;
  date: string;
  guests: number;
  daysLeft: number;
}

/** Số ngày từ hôm nay (00:00) đến ngày khởi hành; null nếu ngày không hợp lệ. */
function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

/** Công tắc bật/tắt (thay `Switch` của RN). */
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!on);
      }}
      style={{
        width: 52,
        height: 32,
        minHeight: 32,
        borderRadius: 16,
        padding: 3,
        flexShrink: 0,
        background: on ? "#D0021B" : "#D7DAE2",
        transition: "background 0.2s",
        display: "flex",
        justifyContent: on ? "flex-end" : "flex-start",
      }}
    >
      <span style={{ width: 26, height: 26, borderRadius: 13, background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
    </button>
  );
}

/**
 * Port từ app/(root)/(tabs)/profile.tsx (bản thiết kế lại): hero có avatar theo hạng, 3 ô thống kê,
 * tour sắp khởi hành trong 5 ngày, các nhóm Tài khoản / Hỗ trợ / Cài đặt và nút đăng xuất.
 */
export default function ProfilePage() {
  const { isLoggedIn, user, earnedPoints, logout, refreshPoints } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [trips, setTrips] = useState<UpcomingTrip[]>([]);
  const [favCount, setFavCount] = useState<number | null>(null);
  const [voucherCount, setVoucherCount] = useState<number | null>(null);
  const [promoOn, setPromoOn] = useState(true);

  // Hướng dẫn lần đầu (constants/guideSteps.ts → profile)
  useTabGuide("profile");
  const profileRef = useGuideTarget("profile.profile");
  const statsRef = useGuideTarget("profile.stats");
  const accountRef = useGuideTarget("profile.account");
  const supportRef = useGuideTarget("profile.support");
  const settingsRef = useGuideTarget("profile.settings");
  const [avatarOpen, setAvatarOpen] = useState(false);

  const tier = getTier(earnedPoints ?? 0);
  const fullName =
    user?.firstName || user?.lastName
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
      : "Người dùng";
  const initials =
    `${(user?.firstName ?? "").charAt(0)}${(user?.lastName ?? "").charAt(0)}`.toUpperCase() || "BT";

  useEffect(() => {
    getItem(PROMO_KEY)
      .then((v) => setPromoOn(v !== "off"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  const loadSummary = useCallback(async () => {
    const [orders, favs, vouchers] = await Promise.allSettled([
      getTransactionHistory(1, 50),
      getMyFavorites(),
      getVouchers(1, 20),
    ]);

    if (orders.status === "fulfilled") {
      const items: any[] = Array.isArray(orders.value?.data?.items) ? orders.value.data.items : [];
      const list = items
        .filter((o) => BOOKED_STATUSES.includes(o.status))
        .map((o) => ({ o, days: daysUntil(o.departure?.departureDate) }))
        .filter((x) => x.days !== null && x.days >= 0 && x.days <= UPCOMING_DAYS)
        .sort((a, b) => (a.days as number) - (b.days as number))
        .slice(0, UPCOMING_MAX)
        .map(({ o, days }) => ({
          id: o.id,
          name: o.tour?.name ?? "Tour",
          image: Array.isArray(o.tour?.imageUrl) ? o.tour.imageUrl[0] : o.tour?.imageUrl,
          date: formatDepartureDate(o.departure?.departureDate),
          guests: o.quantity ?? 1,
          daysLeft: days as number,
        }));
      setTrips(list);
    }
    if (favs.status === "fulfilled") {
      setFavCount(Array.isArray(favs.value?.data) ? favs.value.data.length : 0);
    }
    if (vouchers.status === "fulfilled") {
      setVoucherCount(Array.isArray(vouchers.value?.data?.items) ? vouchers.value.data.items.length : 0);
    }
  }, []);

  // Mỗi lần vào tab: làm mới điểm + số liệu tóm tắt (trang được mount lại mỗi lần chuyển tab).
  useEffect(() => {
    if (isLoggedIn) {
      refreshPoints();
      loadSummary();
    }
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

  const togglePromo = (v: boolean) => {
    setPromoOn(v);
    setItem(PROMO_KEY, v ? "on" : "off").catch(() => {});
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "100vh", background: palette.screenBg }}>
        <Spinner />
      </div>
    );
  }

  const textMain = isDark ? "#F1F5F9" : "#1A1A2E";
  const textMuted = isDark ? "#94A3B8" : "#64748B";
  const groupBg = isDark ? "#1A1F2B" : "#FFFFFF";
  const groupBorder = isDark ? "#272D3C" : "#F1F5F9";
  const divider = isDark ? "rgba(51,65,85,0.6)" : "#F1F5F9";
  const iconBg = isDark ? "#334155" : "#FDECEE";
  const iconColor = isDark ? "#FCA5A5" : "#C00119";

  const Row = ({
    icon,
    title,
    subtitle,
    onClick,
    badge,
    last,
    right,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onClick?: () => void;
    badge?: string;
    last?: boolean;
    right?: React.ReactNode;
  }) => (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className="flex items-center"
      style={{
        padding: "0 16px",
        minHeight: 64,
        cursor: onClick ? "pointer" : "default",
        borderBottom: last ? "none" : `1px solid ${divider}`,
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 40, height: 40, borderRadius: 12, marginRight: 14, background: iconBg }}
      >
        <Icon name={icon} size={21} color={iconColor} />
      </div>
      <div className="flex-1 min-w-0" style={{ padding: "8px 0" }}>
        <div className="font-bold" style={{ fontSize: FONT_SIZE.xs, color: textMain }}>
          {title}
        </div>
        {subtitle ? (
          <div style={{ marginTop: 2, fontSize: FONT_SIZE.xxs, color: textMuted }}>{subtitle}</div>
        ) : null}
      </div>
      {badge ? (
        <span
          className="text-white font-bold"
          style={{ background: "#C2410C", borderRadius: 999, padding: "2px 8px", marginRight: 8, fontSize: FONT_SIZE.xxs }}
        >
          {badge}
        </span>
      ) : null}
      {right ?? (onClick ? <Icon name="chevron-forward" size={18} color={isDark ? "#6B7280" : "#A3A8B5"} /> : null)}
    </div>
  );

  const Group = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <div
        className="font-bold uppercase"
        style={{ marginBottom: 8, paddingLeft: 4, letterSpacing: 1, fontSize: FONT_SIZE.xxs, color: textMuted }}
      >
        {label}
      </div>
      <div style={{ borderRadius: 20, overflow: "hidden", background: groupBg, border: `1px solid ${groupBorder}` }}>
        {children}
      </div>
    </div>
  );

  const Tile = ({ icon, value, label, onClick }: { icon: string; value: number | null; label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex-1 text-left"
      style={{
        borderRadius: 18,
        padding: 14,
        background: groupBg,
        border: `1px solid ${groupBorder}`,
        boxShadow: isDark ? "0 6px 12px rgba(26,26,46,0.3)" : "0 6px 12px rgba(26,26,46,0.08)",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ width: 36, height: 36, borderRadius: 12, marginBottom: 8, background: iconBg }}
      >
        <Icon name={icon} size={19} color={iconColor} />
      </div>
      <div className="font-black" style={{ fontSize: FONT_SIZE.xl, color: textMain }}>
        {value ?? "–"}
      </div>
      <div style={{ fontSize: FONT_SIZE.xxs, color: textMuted }}>{label}</div>
    </button>
  );

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: BOTTOM_NAV_SPACE }}>
      {/* Hero */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "calc(env(safe-area-inset-top) + 14px) 20px 76px",
          background: isDark
            ? "linear-gradient(165deg, #2A2E38 0%, #1E222B 50%, #14161C 100%)"
            : "linear-gradient(165deg, #B30014 0%, #8A0010 50%, #5C000B 100%)",
        }}
      >
        <svg width={390} height={260} style={{ position: "absolute", top: 0, right: 0, pointerEvents: "none" }} aria-hidden="true">
          <circle cx={350} cy={30} r={150} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
          <circle cx={350} cy={30} r={210} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1.5} />
        </svg>
        <img
          src={logoWatermark}
          alt=""
          style={{ position: "absolute", right: -60, bottom: -6, width: 260, height: 130, opacity: 0.12, objectFit: "contain", pointerEvents: "none" }}
        />
        <div className="flex items-center justify-between" style={{ position: "relative" }}>
          <div className="text-white font-black" style={{ fontSize: FONT_SIZE.xl }}>
            Tài khoản
          </div>
          <div className="flex items-center" style={{ gap: 8 }}>
          <GuideHelpButton tab="profile" />
          <button
            onClick={() => navigate("/selfprofile")}
            className="flex items-center text-white font-bold"
            style={{
              height: 44,
              padding: "0 16px",
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.15)",
              fontSize: FONT_SIZE.xxs,
              gap: 6,
            }}
          >
            <Icon name="person-outline" size={16} color="#FFFFFF" />
            Sửa hồ sơ
          </button>
          </div>
        </div>

        <div ref={profileRef} className="flex flex-col items-center" style={{ position: "relative", marginTop: 4 }}>
          <button
            onClick={() => setAvatarOpen(true)}
            aria-label="Xem ảnh đại diện"
            style={{ background: "none", padding: 0, minHeight: 0, display: "flex" }}
          >
            <TierAvatar tier={tier.name} avatarUrl={user?.avatarUrl} initials={initials} />
          </button>
          <div className="text-white font-bold text-center" style={{ fontSize: FONT_SIZE.lg, marginTop: -2 }}>
            {fullName}
          </div>
          <div style={{ marginTop: 2, color: "rgba(255,255,255,0.8)", fontSize: FONT_SIZE.xxs }}>
            {user?.phonenumber || user?.email}
          </div>
          <button
            onClick={() => navigate("/membership")}
            className="flex items-center font-bold"
            style={{
              marginTop: 8,
              height: 36,
              padding: "0 12px",
              borderRadius: 18,
              background: "rgba(255,230,128,0.18)",
              border: "1px solid rgba(255,230,128,0.55)",
              color: "#FFF1B8",
              fontSize: FONT_SIZE.xxs,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 4, background: "#F0C020", marginRight: 8 }} />
            Hạng {tier.name} · Xem quyền lợi
          </button>
        </div>
      </div>

      <div style={{ padding: "0 16px", marginTop: -48, display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Ô thống kê nhanh */}
        <div ref={statsRef} className="flex" style={{ gap: 10 }}>
          <Tile icon="calendar-outline" value={trips.length} label="Chuyến sắp đi" onClick={() => navigate("/history")} />
          <Tile icon="heart-outline" value={favCount} label="Tour yêu thích" onClick={() => navigate("/history")} />
          <Tile icon="pricetag-outline" value={voucherCount} label="Voucher" onClick={() => navigate("/vouchers")} />
        </div>

        {/* Tour đã đặt sắp khởi hành: còn ≤ 5 ngày, tối đa 5 */}
        {trips.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between" style={{ marginBottom: 8, padding: "0 4px" }}>
              <span className="font-bold uppercase" style={{ letterSpacing: 1, fontSize: FONT_SIZE.xxs, color: textMuted }}>
                Tour sắp khởi hành của bạn · trong {UPCOMING_DAYS} ngày
              </span>
              <span className="font-semibold flex-shrink-0" style={{ fontSize: FONT_SIZE.xxs, color: textMuted, marginLeft: 8 }}>
                {trips.length} chuyến
              </span>
            </div>
            <div className="flex overflow-x-auto" style={{ gap: 12, marginRight: -16, paddingRight: 16 }}>
              {trips.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/booking-detail/${t.id}`)}
                  className="text-left flex-shrink-0"
                  style={{ width: 296, borderRadius: 20, padding: 14, background: groupBg, border: `1px solid ${groupBorder}` }}
                >
                  <div className="flex" style={{ gap: 12 }}>
                    {t.image ? (
                      <img src={t.image} alt="" style={{ width: 64, height: 64, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: 14, flexShrink: 0, background: isDark ? "#334155" : "#E2E8F0" }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold"
                        style={{
                          fontSize: FONT_SIZE.xxs,
                          color: textMain,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {t.name}
                      </div>
                      <div style={{ marginTop: 4, fontSize: FONT_SIZE.xxs, color: textMuted }}>
                        {t.date} · {t.guests} khách
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-center"
                    style={{
                      marginTop: 12,
                      borderRadius: 16,
                      padding: "10px 12px",
                      background: i === 0 ? "#8A0010" : isDark ? "#3A1F26" : "#FDECEE",
                    }}
                  >
                    <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: 44, marginRight: 12 }}>
                      <span className="font-black" style={{ fontSize: FONT_SIZE.lg, color: i === 0 || isDark ? "#FFFFFF" : "#B30118" }}>
                        {t.daysLeft}
                      </span>
                      <span
                        className="font-semibold"
                        style={{
                          fontSize: FONT_SIZE.xxs,
                          color: i === 0 ? "rgba(255,255,255,0.8)" : isDark ? "#FCA5A5" : "#B30118",
                        }}
                      >
                        {t.daysLeft === 0 ? "hôm nay" : "ngày nữa"}
                      </span>
                    </div>
                    <span
                      className="flex-1"
                      style={{ fontSize: FONT_SIZE.xxs, color: i === 0 ? "#FFFFFF" : isDark ? "#E2E8F0" : "#4B4F5C" }}
                    >
                      {i === 0
                        ? "Chuẩn bị CCCD, có mặt tại điểm hẹn trước giờ khởi hành"
                        : "Xem lịch trình và điểm hẹn"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={accountRef}>
          <Group label="Tài khoản">
            <Row
              icon="person-outline"
              title="Thông tin cá nhân"
              subtitle="Họ tên, ngày sinh, email"
              onClick={() => navigate("/selfprofile")}
            />
            <Row
              icon="lock-closed-outline"
              title="Mật khẩu & mã PIN"
              subtitle="Đổi mật khẩu, mã PIN xác nhận đặt tour"
              onClick={() => navigate("/security")}
              last
            />
          </Group>
        </div>

        <div ref={supportRef}>
          <Group label="Hỗ trợ">
            <Row icon="call-outline" title="Gọi tổng đài 1900 6668" subtitle="Tư vấn & hỗ trợ đặt tour" onClick={() => callPhone("19006668")} />
            <Row icon="chatbubble-outline" title="Nhắn tin qua Zalo" subtitle="Trao đổi trực tiếp với nhân viên" onClick={() => openLink(ZALO_URL)} />
            <Row
              icon="help-circle-outline"
              title="Câu hỏi thường gặp"
              subtitle="Hoàn huỷ, visa, thanh toán, hành lý"
              badge="Mới"
              onClick={() => navigate("/faq")}
            />
            <Row
              icon="chatbox-ellipses-outline"
              title="Gửi góp ý"
              subtitle="Giúp chúng tôi phục vụ tốt hơn"
              onClick={() => navigate("/feedback")}
              last
            />
          </Group>
        </div>

        <div ref={settingsRef}>
          <Group label="Cài đặt">
            <Row icon="moon-outline" title="Giao diện tối" right={<Toggle on={isDark} onChange={() => toggleTheme()} label="Giao diện tối" />} />
            <Row
              icon="notifications-outline"
              title="Thông báo khuyến mãi"
              subtitle="Tour mới, ưu đãi giờ chót"
              right={<Toggle on={promoOn} onChange={togglePromo} label="Thông báo khuyến mãi" />}
            />
            <Row
              icon="document-text-outline"
              title="Điều khoản & chính sách"
              subtitle="Điều khoản sử dụng, bảo mật dữ liệu"
              onClick={() => navigate("/terms")}
            />
            <Row
              icon="information-circle-outline"
              title="Về BenThanh Tourist"
              subtitle="Giới thiệu, liên hệ, văn phòng"
              onClick={() => navigate("/about")}
              last
            />
          </Group>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center"
          style={{
            height: 56,
            borderRadius: 18,
            gap: 8,
            background: isDark ? "#1A1F2B" : "#FFFFFF",
            border: `1.5px solid ${isDark ? "#7F1D1D" : "#F3C4CA"}`,
          }}
        >
          <Icon name="log-out-outline" size={20} color={isDark ? "#FCA5A5" : "#B30118"} />
          <span className="font-bold" style={{ fontSize: FONT_SIZE.xs, color: isDark ? "#FCA5A5" : "#B30118" }}>
            Đăng xuất
          </span>
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <Footer />
        <AvatarViewer
          visible={avatarOpen}
          onClose={() => setAvatarOpen(false)}
          avatarUrl={user?.avatarUrl}
          initials={initials}
          name={fullName}
          tierName={tier.name}
        />
      </div>
    </Page>
  );
}
