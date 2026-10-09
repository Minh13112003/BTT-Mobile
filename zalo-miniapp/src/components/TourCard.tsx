import React from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "zmp-ui";

import { useTheme } from "@/context/ThemeContext";
import { getPalette, RADIUS, BRAND } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { formatPrice } from "@/helper/format";
import type { TourItem } from "@/services/tour";
import { getNearestDeparture, formatDepartureDate } from "@/utils/tour";
import { StarIcon } from "@/components/icons";
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
}: {
  tour: TourItem;
  width?: number;
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
    navigate(`/tour/${detailKey}`);
  };

  const nearest = getNearestDeparture(tour.departures ?? []);
  const displayPrice = nearest?.price ?? null;
  const displayDate = nearest?.departureDate ?? null;

  const imageUrl = Array.isArray(tour.imageUrl) ? tour.imageUrl[0] : tour.imageUrl;

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
      {/* Ảnh + badge rating/thời lượng */}
      <div className="relative w-full" style={{ height: 176, background: palette.surfaceAlt }}>
        <img src={imageUrl} alt={tour.name} className="w-full h-full object-cover" />
        <div
          className="absolute flex items-center"
          style={{
            top: 12,
            right: 12,
            borderRadius: 999,
            padding: "4px 10px",
            background: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.9)",
          }}
        >
          <StarIcon size={12} />
          <span
            className="font-black ml-1"
            style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#F1F5F9" : "#1E293B" }}
          >
            {tour.rating}
          </span>
        </div>
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

      {/* Nội dung — nền sóng đỏ nhạt (light mode) giống bản RN (react-native-svg → SVG inline) */}
      <div className="relative">
        {!isDark && (
          <svg
            width="100%"
            height={170}
            viewBox="0 0 380 170"
            preserveAspectRatio="none"
            className="absolute"
            style={{ top: 0, left: 0, right: 0, pointerEvents: "none" }}
          >
            <path
              d="M0,170 L0,70 C 31.6,54 63.3,54 95,70 C 126.6,86 158.3,86 190,70 C 221.6,54 253.3,54 285,70 C 316.6,86 348.3,86 380,70 L380,170 Z"
              fill={BRAND.red}
              fillOpacity={0.22}
            />
          </svg>
        )}

        <div className="relative" style={{ padding: 16 }}>
          <div
            className="font-black"
            style={{
              fontSize: FONT_SIZE.xl,
              lineHeight: "32px",
              color: palette.textPrimary,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {tour.name}
          </div>

          {/* Ngày khởi hành gần nhất + giá + thời lượng */}
          <div style={{ marginTop: 10 }}>
            <InfoRow emoji="📅" color={palette.textSecondary}>
              {displayDate
                ? `Khởi hành: ${formatDepartureDate(displayDate)}`
                : "Liên hệ để biết lịch khởi hành"}
            </InfoRow>
            <InfoRow emoji="💰" color={isDark ? "#E2E8F0" : BRAND.red} bold>
              {displayPrice != null ? `Từ ${formatPrice(displayPrice)}` : "Giá: Liên hệ"}
            </InfoRow>
            <InfoRow emoji="🕒" color={palette.textSecondary}>
              {tour.duration}
            </InfoRow>
          </div>

          <div
            className="flex items-center justify-end"
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: `1px solid ${isDark ? "rgba(51,65,85,0.6)" : "#F1F5F9"}`,
            }}
          >
            <PrimaryButton as="span" label={hasNoDetailPage ? "Liên hệ tư vấn" : "Xem chi tiết"} />
          </div>
        </div>
      </div>
    </button>
  );
}

function InfoRow({
  emoji,
  color,
  bold = false,
  children,
}: {
  emoji: string;
  color: string;
  bold?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center" style={{ marginTop: 4 }}>
      <span style={{ fontSize: FONT_SIZE.xxs }}>{emoji}</span>
      <span
        style={{ fontSize: FONT_SIZE.xxs, color, marginLeft: 6, fontWeight: bold ? 700 : 600 }}
      >
        {children}
      </span>
    </div>
  );
}
