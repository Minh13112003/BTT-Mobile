import React, { useCallback, useEffect, useState } from "react";
import { Spinner } from "zmp-ui";

import TourCard from "@/components/TourCard";
import { useTheme } from "@/context/ThemeContext";
import { FavoriteItem, getMyFavorites } from "@/services/favorite";
import type { TourItem } from "@/services/tour";
import { getPalette, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { HeartIcon } from "@/components/icons";

/** Map 1 bản ghi Favorite (snapshot) sang TourItem để tái dùng TourCard. */
function favoriteToTourItem(fav: FavoriteItem): TourItem {
  return {
    id: fav.tourKey,
    name: fav.tourName,
    imageUrl: fav.tourImage ? [fav.tourImage] : [],
    imagePublicId: [],
    duration: fav.durationText ?? "",
    rating: 0,
    reviewsCount: 0,
    hasVat: false,
    departures:
      fav.unitPrice != null && fav.departureDate
        ? [
            {
              id: fav.tourKey,
              tourId: fav.tourKey,
              departureDate: fav.departureDate,
              price: fav.unitPrice,
              availableSeats: 1,
            },
          ]
        : [],
  };
}

/**
 * Port từ components/FavoritesList.tsx bên app React Native — tab "Yêu thích"
 * trong trang Lịch sử. Tour đã tim ở trang chi tiết, lưu snapshot qua
 * services/favorite.ts (NestJS). Bấm card mở lại trang chi tiết thật (gọi
 * Laravel lấy dữ liệu mới nhất) — snapshot chỉ để hiển thị nhanh.
 *
 * Bản RN reload bằng useFocusEffect; ở đây component mount lại mỗi lần chuyển
 * sang tab Yêu thích (history page render có điều kiện) nên fetch trong
 * useEffect lúc mount là tương đương. Không có pull-to-refresh trên web → nút
 * "Tải lại" khi lỗi thay thế.
 */
export default function FavoritesList() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getMyFavorites();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Lỗi tải danh sách yêu thích:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  if (loading) {
    return (
      <div className="flex flex-col items-center" style={{ padding: 40 }}>
        <Spinner />
        <div style={{ marginTop: 8, color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
          Đang tải tour yêu thích...
        </div>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div
        className="flex flex-col items-center text-center"
        style={{
          marginTop: 16,
          padding: 32,
          borderRadius: RADIUS.xl,
          border: `1px dashed ${palette.border}`,
          background: isDark ? "rgba(30,34,43,0.4)" : palette.surface,
        }}
      >
        <HeartIcon size={48} color="#9CA3AF" />
        <div className="font-bold" style={{ marginTop: 12, color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}>
          {error ? "Không tải được danh sách yêu thích" : "Chưa có tour yêu thích"}
        </div>
        <div style={{ marginTop: 4, color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
          {error
            ? "Vui lòng kiểm tra kết nối mạng và thử lại."
            : "Nhấn biểu tượng trái tim ở trang chi tiết tour để lưu lại đây."}
        </div>
        {error && (
          <button
            onClick={fetchFavorites}
            className="font-bold"
            style={{
              marginTop: 16,
              padding: "10px 24px",
              minHeight: 44,
              borderRadius: RADIUS.pill,
              border: `1px solid ${palette.brand}`,
              color: palette.brand,
              fontSize: FONT_SIZE.xxs,
            }}
          >
            Tải lại
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 10 }}>
      {items.map((item) => (
        <TourCard key={item.id} tour={favoriteToTourItem(item)} />
      ))}
    </div>
  );
}
