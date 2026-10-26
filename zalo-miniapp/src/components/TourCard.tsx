import React from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "zmp-ui";

import { useTheme } from "@/context/ThemeContext";
import { getPalette, RADIUS, BRAND } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { formatPrice } from "@/helper/format";
import type { TourItem } from "@/services/tour";
import { getNearestDeparture, formatDepartureDate } from "@/utils/tour";
import PrimaryButton from "@/components/PrimaryButton";

/**
 * Port từ components/tour/TourCard.tsx bên app React Native — dùng ở Home,
 * Search, và Featured Carousel (trước đây tách riêng TourCardCompact bên RN,
 * nhưng bản RN đã hợp nhất lại dùng chung TourCard — xem lịch sử phiên làm
 * việc: "hero card carousel phải giống hero card Tour sắp khởi hành"). `width`
 * optional: bỏ trống dùng full width (list dọc), truyền vào khi nhúng trong
 * carousel ngang.
 */
export default function TourCard({
  tour,
  width,
  dateMode,
  specificDate,
  startDate,
  endDate,
}: {
  tour: TourItem;
  width?: number;
  /** Bộ lọc ngày đang áp dụng (từ ô tìm ngày ở Home) — hiện đúng đợt khớp và chọn sẵn đợt đó ở trang chi tiết. */
  dateMode?: string;
  specificDate?: string;
  startDate?: string;
  endDate?: string;
}) {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  // `tourKey === null` (khác undefined) nghĩa là backend đã đối chiếu và xác
  // nhận tour nguồn NestJS này KHÔNG có bản tương ứng trên Laravel — trang
  // Chi tiết tour luôn gọi Laravel nên điều hướng vào đây chắc chắn lỗi "Không
  // tìm thấy thông tin tour". Chặn trước, báo rõ lý do thay vì vào trang lỗi.
  const hasNoDetailPage = tour.tourKey === null;
  const detailKey = tour.tourKey ?? tour.id;

  const handlePress = () => {
    if (hasNoDetailPage) {
      snackbar.openSnackbar({
        text: "Tour này hiện chưa có trang chi tiết. Vui lòng gọi hotline 1900 6668 để được tư vấn.",
        type: "warning",
      });
      return;
    }
    const q = new URLSearchParams();
    if (dateMode === "specific" && specificDate) {
      q.set("searchDateMode", "specific");
      q.set("searchSpecificDate", specificDate);
    } else if (dateMode === "range" && (startDate || endDate)) {
      q.set("searchDateMode", "range");
      if (startDate) q.set("searchStartDate", startDate);
      if (endDate) q.set("searchEndDate", endDate);
    }
    const qs = q.toString();
    navigate(`/tour/${detailKey}${qs ? `?${qs}` : ""}`);
  };

  // Đợt khởi hành khớp bộ lọc ngày (nếu có) — giống TourCard bên app RN.
  let matchingDeparture: (typeof tour.departures extends (infer D)[] | undefined ? D : never) | undefined;
  if (dateMode === "specific" && specificDate) {
    const target = new Date(specificDate);
    matchingDeparture = tour.departures?.find((dep) => {
      const d = new Date(dep.departureDate);
      return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth() && d.getDate() === target.getDate();
    });
  } else if (dateMode === "range" && (startDate || endDate)) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date(8640000000000000);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    matchingDeparture = [...(tour.departures ?? [])]
      .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime())
      .find((dep) => {
        const d = new Date(dep.departureDate);
        return d >= start && d <= end;
      });
  }

  const nearest = matchingDeparture ?? getNearestDeparture(tour.departures ?? []);
  const displayPrice = nearest?.price ?? null;
  const displayDate = nearest?.departureDate ?? null;

  const imageUrl = Array.isArray(tour.imageUrl) ? tour.imageUrl[0] : tour.imageUrl;
  // Laravel không có cờ trong nước/nước ngoài — đường dẫn ảnh là tour/trong-nuoc/... hoặc tour/nuoc-ngoai/...
  const regionLabel = imageUrl?.includes("/nuoc-ngoai/")
    ? "Nước ngoài"
    : imageUrl?.includes("/trong-nuoc/")
      ? "Trong nước"
      : null;

  return (
    <button
      onClick={handlePress}
      className="block text-left overflow-hidden mb-5"
      style={{
        width: width ?? "100%",
        borderRadius: RADIUS.xl,
        border: isDark ? `1px solid ${palette.border}` : `1px solid rgba(208,2,27,0.12)`,
        background: palette.surface,
        boxShadow: isDark ? "none" : "0 4px 14px rgba(208,2,27,0.08)",
      }}
    >
      {/* Ảnh + nhãn khu vực + thời lượng. Bỏ ô ★ (Laravel luôn trả rating 0). */}
      <div className="relative w-full" style={{ height: 176, background: palette.surfaceAlt }}>
        <img src={imageUrl} alt={tour.name} className="w-full h-full object-cover" />
        {regionLabel && (
          <div
            className="absolute font-semibold"
            style={{
              top: 12,
              left: 12,
              borderRadius: 999,
              padding: "3px 10px",
              fontSize: FONT_SIZE.card,
              color: isDark ? "#F1F5F9" : "#B30118",
              background: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.92)",
            }}
          >
            {regionLabel}
          </div>
        )}
        <div
          className="absolute text-white font-black uppercase"
          style={{
            bottom: 12,
            left: 12,
            borderRadius: RADIUS.sm,
            padding: "4px 10px",
            fontSize: FONT_SIZE.xxs,
            background: isDark ? "rgba(51,65,85,0.95)" : "rgba(208,2,27,0.9)",
          }}
        >
          {tour.duration}
        </div>
      </div>

      {/* Tên tour, ngày khởi hành + giá chung 1 hàng, nút Xem chi tiết — không vạch chia */}
      <div className="relative">
        <svg
          width="100%"
          height={180}
          viewBox="0 0 380 180"
          preserveAspectRatio="none"
          className="absolute"
          style={{ bottom: 0, left: 0, right: 0, pointerEvents: "none" }}
        >
          <path
            d="M0,180 L0,70 C 31.6,54 63.3,54 95,70 C 126.6,86 158.3,86 190,70 C 221.6,54 253.3,54 285,70 C 316.6,86 348.3,86 380,70 L380,180 Z"
            fill={isDark ? "#64748B" : BRAND.red}
            fillOpacity={0.2}
          />
        </svg>

        <div className="relative flex flex-col" style={{ padding: "14px 16px 16px", gap: 12 }}>
          <div
            className="font-black"
            style={{
              fontSize: FONT_SIZE.lg,
              lineHeight: "30px",
              color: palette.textPrimary,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {tour.name}
          </div>

          <div className="flex items-center justify-between" style={{ gap: 10 }}>
            <span
              className="flex items-center font-semibold"
              style={{ gap: 6, fontSize: FONT_SIZE.xs, color: palette.textSecondary, minWidth: 0 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#F87171" : BRAND.red} strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
              {displayDate ? formatDepartureDate(displayDate) : "Chưa có lịch"}
            </span>
            <span className="font-black" style={{ fontSize: FONT_SIZE.lg, color: isDark ? "#F1F5F9" : BRAND.red, whiteSpace: "nowrap" }}>
              {displayPrice != null ? formatPrice(displayPrice) : "Liên hệ"}
            </span>
          </div>

          <div className="flex justify-end" style={{ marginTop: 6 }}>
            <PrimaryButton as="span" label={hasNoDetailPage ? "Liên hệ tư vấn" : "Xem chi tiết"} />
          </div>
        </div>
      </div>
    </button>
  );
}
