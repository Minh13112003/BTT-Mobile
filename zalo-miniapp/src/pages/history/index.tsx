import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";

import TabHeader from "@/components/TabHeader";
import { useGuideTarget, useTabGuide } from "@/context/GuideContext";
import Footer from "@/components/Footer";
import FavoritesList from "@/components/FavoritesList";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getTransactionHistory } from "@/services/booking";
import type { TourItem } from "@/services/tour";
import { formatDateTime } from "@/helper/datetime_helper";
import { formatDepartureDate } from "@/utils/tour";
import { getPalette, BOTTOM_NAV_SPACE, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

interface OrderItem {
  id: string;
  tour: TourItem;
  quantity: number;
  originalPrice?: number;
  discountAmount?: number;
  price: number;
  notice?: string;
  createdAt: string | Date;
  status: string;
  departure?: { id?: string; tourCode?: string; departureDate?: string };
}

const MAP_STATUS_VN: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PAID: "Đã thanh toán",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

const STATUS_OPTIONS = [
  "Tất cả",
  "Chờ xử lý",
  "Đã xác nhận",
  "Đã thanh toán",
  "Đang diễn ra",
  "Đã hoàn thành",
  "Đã hủy",
  "Đã hoàn tiền",
];

const GREEN_STATUSES = ["Đã thanh toán", "Đã xác nhận", "Đã hoàn thành"];
const RED_STATUSES = ["Đã hủy", "Đã hoàn tiền"];

function statusTone(statusVn: string, isDark: boolean) {
  if (GREEN_STATUSES.includes(statusVn)) {
    return isDark ? { bg: "#334155", text: "#6EE7B7" } : { bg: "#F0FDF4", text: "#15803D" };
  }
  if (RED_STATUSES.includes(statusVn)) {
    return isDark ? { bg: "#334155", text: "#FCA5A5" } : { bg: "#FEF2F2", text: "#DC2626" };
  }
  return isDark ? { bg: "#334155", text: "#FCD34D" } : { bg: "#FFF3DC", text: "#B5710A" };
}

const LIMIT = 5;

/**
 * Trang đầu của lịch sử, giữ lại giữa các lần vào tab (trang này mount lại mỗi lần chuyển tab): vào
 * lại thì hiện ngay dữ liệu cũ rồi âm thầm tải bản mới — không còn màn "Đang tải..." mỗi lần vào.
 * Gắn theo id người dùng để đổi tài khoản không thấy đơn của người trước.
 */
let historyCache: { userId: string; orders: OrderItem[]; hasNext: boolean } | null = null;

/**
 * Port từ app/(root)/(tabs)/history.tsx — giản lược collapsing header + back-to-top.
 * Có 2 tab: "Lịch sử" (đơn đặt tour) và "Yêu thích" (tour đã tim, xem FavoritesList).
 */
export default function HistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const cached = historyCache && historyCache.userId === userId ? historyCache : null;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [activeTab, setActiveTab] = useState<"history" | "favorites">("history");
  const [loading, setLoading] = useState(cached === null);
  const [orders, setOrders] = useState<OrderItem[]>(cached?.orders ?? []);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(cached?.hasNext ?? false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");

  const fetchOrders = async (pageNumber = 1, isLoadMore = false) => {
    try {
      const res: any = await getTransactionHistory(pageNumber, LIMIT);
      if (res?.data) {
        const items = Array.isArray(res.data.items) ? res.data.items : [];
        const meta = res.data.meta;
        setOrders((prev) => (isLoadMore ? [...prev, ...items] : items));
        setHasNext(meta?.hasNext ?? false);
        if (!isLoadMore) historyCache = { userId, orders: items, hasNext: meta?.hasNext ?? false };
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch sử giao dịch:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const handleLoadMore = () => {
    if (!hasNext || loadingMore) return;
    const next = page + 1;
    setLoadingMore(true);
    setPage(next);
    fetchOrders(next, true);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  const filteredOrders = orders.filter((item) => {
    if (selectedStatus === "Tất cả") return true;
    return (MAP_STATUS_VN[item.status] || item.status) === selectedStatus;
  });

  const pendingCount = orders.filter((o) => (MAP_STATUS_VN[o.status] || o.status) === "Chờ xử lý").length;

  // Hướng dẫn lần đầu (constants/guideSteps.ts → history)
  useTabGuide("history", !loading);
  const tabsRef = useGuideTarget("history.tabs");
  const chipsRef = useGuideTarget("history.chips");
  const orderRef = useGuideTarget("history.order");

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: BOTTOM_NAV_SPACE }}>
      <TabHeader
        guideTab="history"
        title={activeTab === "history" ? "Lịch sử đặt tour" : "Tour yêu thích"}
        subtitle={
          activeTab === "history"
            ? pendingCount > 0
              ? `${pendingCount} đơn hàng đang xử lý`
              : `${orders.length} đơn hàng`
            : "Tour bạn đã lưu lại"
        }
      />

      {/* Tab switch: Lịch sử / Yêu thích */}
      <div style={{ padding: "12px 20px 0" }}>
        <div
          ref={tabsRef}
          className="flex"
          style={{ borderRadius: RADIUS.pill, padding: 4, background: isDark ? palette.surface : "#F1F5F9" }}
        >
          {(
            [
              { key: "history", label: "Lịch sử" },
              { key: "favorites", label: "Yêu thích" },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 font-bold"
                style={{
                  minHeight: 44,
                  borderRadius: RADIUS.pill,
                  fontSize: FONT_SIZE.xxs,
                  background: active ? palette.brand : "transparent",
                  color: active ? "#FFFFFF" : palette.textSecondary,
                  transition: "background 0.2s",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter chip trạng thái — chỉ áp dụng cho tab Lịch sử */}
      {activeTab === "history" && (
      <div ref={chipsRef} className="flex overflow-x-auto" style={{ padding: "12px 20px", gap: 8 }}>
        {STATUS_OPTIONS.map((status) => {
          const active = selectedStatus === status;
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className="font-bold flex-shrink-0"
              style={{
                borderRadius: RADIUS.pill,
                padding: "12px 18px",
                minHeight: 44,
                fontSize: FONT_SIZE.card,
                background: active ? palette.brand : palette.surface,
                color: active ? "#FFFFFF" : palette.textSecondary,
                border: `1px solid ${active ? palette.brand : palette.border}`,
              }}
            >
              {status}
            </button>
          );
        })}
      </div>
      )}

      <div style={{ padding: "0 16px" }}>
        {activeTab === "favorites" ? (
          <FavoritesList />
        ) : loading ? (
          <div className="flex flex-col items-center" style={{ padding: 40 }}>
            <Spinner />
            <div style={{ marginTop: 8, color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
              Đang tải lịch sử giao dịch...
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            className="flex flex-col items-center text-center"
            style={{
              padding: 32,
              borderRadius: RADIUS.xl,
              border: `1px dashed ${palette.border}`,
              background: isDark ? "rgba(30,34,43,0.4)" : palette.surface,
            }}
          >
            <div style={{ fontSize: 40 }}>🧾</div>
            <div className="font-bold" style={{ marginTop: 12, color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}>
              Bạn chưa có giao dịch nào
            </div>
            <div style={{ marginTop: 4, color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
              Mọi giao dịch đặt tour du lịch của bạn sẽ hiển thị tại đây.
            </div>
          </div>
        ) : (
          <>
            {filteredOrders.map((item, index) => {
              const statusVn = MAP_STATUS_VN[item.status] || item.status;
              const tone = statusTone(statusVn, isDark);
              const hasDiscount = !!item.discountAmount && item.discountAmount > 0;
              const pct =
                hasDiscount && item.originalPrice
                  ? Math.round((item.discountAmount! / item.originalPrice) * 100)
                  : null;
              const imageUrl = Array.isArray(item.tour.imageUrl) ? item.tour.imageUrl[0] : item.tour.imageUrl;

              return (
                <div
                  key={item.id}
                  ref={index === 0 ? orderRef : undefined}
                  className="relative overflow-hidden"
                  style={{
                    marginBottom: 16,
                    borderRadius: RADIUS.xl,
                    border: `1px solid ${palette.border}`,
                    background: palette.surface,
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: isDark ? 0.3 : 0.15,
                    }}
                  />
                  <div className="relative" style={{ padding: "20px 16px 16px" }}>
                    <div className="flex items-start justify-between">
                      <div style={{ flex: 1, marginRight: 12 }}>
                        <div className="font-black" style={{ fontSize: FONT_SIZE.md, color: palette.textPrimary, lineHeight: "28px" }}>
                          {item.tour.name}
                        </div>
                        <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textMuted, marginTop: 6 }}>
                          # {item.departure?.tourCode || (item.tour as any).code || "—"}
                        </div>
                      </div>
                      <div
                        className="font-black uppercase flex-shrink-0"
                        style={{
                          borderRadius: RADIUS.pill,
                          padding: "6px 10px",
                          fontSize: 12,
                          background: tone.bg,
                          color: tone.text,
                        }}
                      >
                        {statusVn}
                      </div>
                    </div>

                    <div style={{ height: 1, background: palette.border, margin: "12px 0" }} />

                    <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary, fontWeight: 700, marginBottom: 6 }}>
                      📅 Khởi hành: {formatDepartureDate(item.departure?.departureDate)} · {item.tour.duration}
                    </div>
                    <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary, fontWeight: 700, marginBottom: 6 }}>
                      👤 {item.quantity} khách
                    </div>
                    <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textSecondary, fontWeight: 700, marginBottom: 6 }}>
                      🕒 Ngày đặt: {formatDateTime(item.createdAt)}
                    </div>

                    <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
                      <span className="font-black" style={{ color: palette.brand, fontSize: FONT_SIZE.xxs }}>
                        💰 {formatCurrency(item.price)}
                      </span>
                      {hasDiscount && (
                        <>
                          <span style={{ color: palette.textMuted, textDecoration: "line-through", fontSize: 12 }}>
                            {formatCurrency(item.originalPrice || 0)}
                          </span>
                          {pct != null && (
                            <span style={{ color: "#16A34A", fontWeight: 700, fontSize: 12 }}>−{pct}%</span>
                          )}
                        </>
                      )}
                      {item.tour.hasVat && (
                        <span
                          className="font-black uppercase"
                          style={{ color: palette.brand, fontSize: 12, background: "rgba(208,2,27,0.1)", borderRadius: RADIUS.pill, padding: "2px 8px" }}
                        >
                          Đã xuất VAT
                        </span>
                      )}
                    </div>

                    {!!item.notice && (
                      <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textMuted, fontStyle: "italic", marginTop: 8 }}>
                        Ghi chú: {item.notice}
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/booking-detail/${item.id}`)}
                      className="w-full text-center font-bold"
                      style={{
                        marginTop: 14,
                        padding: "10px 0",
                        minHeight: 44,
                        borderRadius: RADIUS.md,
                        border: `1px solid ${palette.brand}`,
                        color: palette.brand,
                        fontSize: FONT_SIZE.xxs,
                      }}
                    >
                      Chi tiết đơn
                    </button>
                  </div>
                </div>
              );
            })}

            {loadingMore ? (
              <div className="flex justify-center" style={{ padding: 16 }}>
                <Spinner />
              </div>
            ) : hasNext ? (
              <button
                onClick={handleLoadMore}
                className="font-bold w-full"
                style={{
                  borderRadius: RADIUS.md,
                  padding: "14px 0",
                  minHeight: 44,
                  marginBottom: 20,
                  background: palette.surfaceAlt,
                  color: palette.textSecondary,
                  fontSize: FONT_SIZE.xxs,
                }}
              >
                Xem thêm
              </button>
            ) : null}
          </>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <Footer />
      </div>
    </Page>
  );
}
