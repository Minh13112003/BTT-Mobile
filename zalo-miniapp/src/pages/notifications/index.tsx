import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useNotification } from "@/context/NotificationContext";
import {
  NotificationItem,
  getNotifications,
  readAllNotifications,
  readNotification,
} from "@/services/notification";
import { getTransactionHistory } from "@/services/booking";
import { formatDateTime } from "@/helper/datetime_helper";
import { getPalette, BOTTOM_NAV_SPACE, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

const LIMIT = 20;

type NotifIconConfig = { emoji: string; color: string; bg: string };

const TYPE_ICON: Record<string, NotifIconConfig> = {
  BOOKING_CREATED: { emoji: "✅", color: "#007545", bg: "#E6F2EC" },
  BOOKING_STATUS_UPDATED: { emoji: "📄", color: "#825500", bg: "#FAF3E6" },
  DEPARTURE_RESCHEDULED: { emoji: "⚠️", color: "#BA1A1A", bg: "#FDF2F2" },
  SCHEDULE_UPDATED: { emoji: "📅", color: "#825500", bg: "#FAF3E6" },
  PASSWORD_CHANGED: { emoji: "🔑", color: "#005A34", bg: "#E6EFF0" },
};
const DEFAULT_ICON: NotifIconConfig = { emoji: "🔔", color: "#A00000", bg: "#FAF0F0" };

function getIconConfig(type?: string | null): NotifIconConfig {
  return (type && TYPE_ICON[type]) || DEFAULT_ICON;
}

/** Port từ app/(root)/(tabs)/notifications.tsx — bỏ listener push (xem ghi chú ở cuối phiên port) và animation thu gọn text. */
export default function NotificationsPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const { user } = useAuth();
  const { refreshUnread, setAllRead, unreadCount } = useNotification();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [navigating, setNavigating] = useState<string | null>(null);

  const fetchPage = useCallback(async (p: number, replace: boolean) => {
    try {
      const res = await getNotifications(p, LIMIT);
      const data = res.data as any;
      const list: NotificationItem[] = data?.items ?? data?.data ?? [];
      const meta = data?.meta;
      setHasNext(meta?.hasNext ?? false);
      setPage(p);
      setItems((prev) => (replace ? list : [...prev, ...list]));
    } catch {
      // silently ignore — keep existing list
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refreshUnread();
    fetchPage(1, true).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevUnreadRef = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) fetchPage(1, true);
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, fetchPage]);

  const loadMore = async () => {
    if (loadingMore || !hasNext) return;
    setLoadingMore(true);
    await fetchPage(page + 1, false);
    setLoadingMore(false);
  };

  const handleMarkAll = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await readAllNotifications();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setAllRead();
    } catch {
      // silently ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const handleRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await readNotification(id);
    } catch {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
    }
    refreshUnread();
  };

  const handleViewDetail = async (item: NotificationItem) => {
    if (!item.isRead) handleRead(item.id);
    if (!item.refId) return;
    setNavigating(item.id);
    try {
      const res = await getTransactionHistory(1, 50);
      const data = res.data as any;
      const bookings: any[] = data?.items ?? data?.data ?? [];
      const match = bookings.find((b: any) => b.tour?.id === item.refId || b.tourId === item.refId);
      navigate(match ? `/booking-detail/${match.id}` : "/history");
    } finally {
      setNavigating(null);
    }
  };

  if (!user) {
    return (
      <Page style={{ background: palette.screenBg, minHeight: "100vh" }}>
        <Header title="BENTHANH TOURIST" showActions />
        <div className="flex flex-col items-center text-center" style={{ padding: "80px 32px" }}>
          <div style={{ fontSize: 48 }}>🔕</div>
          <div className="font-bold" style={{ marginTop: 16, fontSize: FONT_SIZE.lg, color: palette.textSecondary }}>
            Vui lòng đăng nhập
          </div>
          <div style={{ marginTop: 8, color: palette.textMuted, fontSize: FONT_SIZE.card }}>
            Đăng nhập để xem thông báo của bạn.
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: BOTTOM_NAV_SPACE }}>
      <Header title="BENTHANH TOURIST" showActions />

      <div
        className="flex items-center justify-between"
        style={{ padding: "12px 16px", borderBottom: `1px solid ${palette.border}` }}
      >
        <span style={{ fontSize: FONT_SIZE.card, color: palette.textSecondary, fontWeight: 600 }}>
          {unreadCount > 0 ? `${unreadCount} chưa đọc` : "Tất cả đã đọc"}
        </span>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="font-bold"
            style={{ color: palette.brand, fontSize: FONT_SIZE.card }}
          >
            {markingAll ? "Đang xử lý..." : "✓✓ Đánh dấu tất cả đã đọc"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center" style={{ padding: 48 }}>
          <Spinner />
          <div style={{ marginTop: 8, color: palette.textMuted, fontSize: FONT_SIZE.card }}>
            Đang tải thông báo...
          </div>
        </div>
      ) : items.length === 0 ? (
        <div
          className="flex flex-col items-center text-center"
          style={{
            margin: 16,
            padding: 40,
            borderRadius: RADIUS.xl,
            border: `1px dashed ${palette.border}`,
            background: isDark ? "rgba(30,34,43,0.4)" : palette.surface,
          }}
        >
          <div style={{ fontSize: 48 }}>🔕</div>
          <div className="font-bold" style={{ marginTop: 16, color: palette.textSecondary, fontSize: FONT_SIZE.xs }}>
            Chưa có thông báo
          </div>
          <div style={{ marginTop: 6, color: palette.textMuted, fontSize: FONT_SIZE.card }}>
            Thông báo về đơn hàng và khuyến mãi sẽ xuất hiện ở đây.
          </div>
        </div>
      ) : (
        <div style={{ paddingTop: 12 }}>
          {items.map((item) => {
            const cfg = getIconConfig(item.type);
            const canNavigate = !!(item.refId && item.refType === "TOUR");
            return (
              <button
                key={item.id}
                onClick={() => !item.isRead && handleRead(item.id)}
                className="block w-full text-left"
                style={{
                  margin: "0 16px 20px",
                  padding: 16,
                  borderRadius: RADIUS.lg,
                  border: `1px solid ${
                    isDark ? (item.isRead ? "#2D3748" : "#3D2020") : item.isRead ? "#EFEDED" : "#E8BDB6"
                  }`,
                  borderLeft: `4px solid ${cfg.color}`,
                  background: isDark
                    ? item.isRead
                      ? "#1E222B"
                      : "#2C3347"
                    : item.isRead
                    ? "#FFFFFF"
                    : "#FFF0EE",
                  width: "calc(100% - 32px)",
                }}
              >
                <div className="flex items-start">
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: 12,
                      fontSize: 18,
                      background: isDark ? cfg.color + "22" : cfg.bg,
                    }}
                  >
                    {cfg.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                      <span
                        className="font-bold truncate"
                        style={{
                          fontSize: FONT_SIZE.xxs,
                          color: isDark ? (item.isRead ? "#94A3B8" : "#F8FAFC") : item.isRead ? "#5E3F3A" : "#1B1C1C",
                          marginRight: 8,
                        }}
                      >
                        {item.title || "Thông báo mới"}
                      </span>
                      {!item.isRead && (
                        <span
                          style={{ width: 8, height: 8, borderRadius: 4, background: "#A00000", flexShrink: 0 }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: FONT_SIZE.xxs,
                        lineHeight: "26px",
                        color: isDark ? "#94A3B8" : "#5E3F3A",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.message}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: FONT_SIZE.card, color: isDark ? "#64748B" : "#94A3B8" }}>
                        {formatDateTime(item.createdAt)}
                      </div>
                      {canNavigate && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(item);
                          }}
                          className="flex items-center font-black"
                          style={{
                            marginTop: 6,
                            color: isDark ? "#FFA2A2" : "#A00000",
                            fontSize: FONT_SIZE.card,
                            letterSpacing: 0.5,
                          }}
                        >
                          {navigating === item.id ? "Đang tải..." : "XEM CHI TIẾT →"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {loadingMore ? (
            <div className="flex justify-center" style={{ padding: 16 }}>
              <Spinner />
            </div>
          ) : hasNext ? (
            <button
              onClick={loadMore}
              className="font-bold w-full"
              style={{
                borderRadius: RADIUS.md,
                padding: "14px 0",
                minHeight: 44,
                margin: "0 16px 20px",
                width: "calc(100% - 32px)",
                background: palette.surfaceAlt,
                color: palette.textSecondary,
                fontSize: FONT_SIZE.xxs,
              }}
            >
              Xem thêm
            </button>
          ) : (
            <div
              className="text-center font-semibold"
              style={{ padding: "12px 0", color: palette.textMuted, fontSize: FONT_SIZE.card }}
            >
              ✓ Đã hiển thị tất cả thông báo
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Footer />
      </div>
    </Page>
  );
}
