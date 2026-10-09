import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TourCard from "@/components/TourCard";
import { useTheme } from "@/context/ThemeContext";
import { useTourSearch } from "@/hooks/useTourSearch";
import { getPalette, BOTTOM_NAV_SPACE, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import {
  MODE_CHIP_LABELS,
  SECTION_ORDER,
  SearchMode,
  regionsForMode,
} from "@/constants/tourFilters";

/**
 * Port từ app/(root)/(tabs)/search.tsx bên React Native — giản lược phần header
 * cuộn-thu-gọn bằng animation gốc (Animated.diffClamp) thành header tĩnh cho v1;
 * giữ nguyên toàn bộ logic lọc/tìm kiếm/phân trang qua useTourSearch.
 */
export default function SearchPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const initialMode = (SECTION_ORDER as string[]).includes(params.get("mode") ?? "")
    ? (params.get("mode") as SearchMode)
    : "newest";

  const {
    mode,
    setMode,
    region,
    setRegion,
    query,
    setQuery,
    results,
    hasNext,
    loading,
    loadingMore,
    loadMore,
    resetSearch,
  } = useTourSearch({
    mode: initialMode,
    query: params.get("q") ?? "",
    dateMode: params.get("dateMode") ?? undefined,
    specificDate: params.get("specificDate") ?? undefined,
    startDate: params.get("startDate") ?? undefined,
    endDate: params.get("endDate") ?? undefined,
  });

  const regions = useMemo(() => regionsForMode(mode), [mode]);

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: BOTTOM_NAV_SPACE }}>
      <Header title="Du lịch" />

      {/* Ô tìm kiếm */}
      <div style={{ padding: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên tour, điểm đến..."
          style={{
            width: "100%",
            height: 48,
            borderRadius: RADIUS.pill,
            border: `1px solid ${palette.border}`,
            background: palette.surface,
            color: palette.textPrimary,
            padding: "0 20px",
            fontSize: FONT_SIZE.card,
            outline: "none",
          }}
        />
      </div>

      {/* Chip chế độ lọc */}
      <div
        className="flex overflow-x-auto"
        style={{ padding: "0 16px 8px", gap: 8 }}
      >
        {SECTION_ORDER.map((m) => {
          const active = m === mode;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="font-bold flex-shrink-0"
              style={{
                borderRadius: RADIUS.pill,
                padding: "10px 16px",
                minHeight: 44,
                fontSize: FONT_SIZE.xxs,
                background: active ? palette.brand : palette.surface,
                color: active ? "#FFFFFF" : palette.textSecondary,
                border: `1px solid ${active ? palette.brand : palette.border}`,
              }}
            >
              {MODE_CHIP_LABELS[m]}
            </button>
          );
        })}
      </div>

      {/* Chip khu vực (chỉ domestic/foreign) */}
      {regions && !query.trim() && (
        <div className="flex overflow-x-auto" style={{ padding: "0 16px 12px", gap: 8 }}>
          <button
            onClick={() => setRegion(null)}
            className="font-bold flex-shrink-0"
            style={{
              borderRadius: RADIUS.pill,
              padding: "8px 14px",
              minHeight: 36,
              fontSize: FONT_SIZE.card,
              background: region === null ? palette.brand : palette.surfaceAlt,
              color: region === null ? "#FFFFFF" : palette.textSecondary,
            }}
          >
            Tất cả
          </button>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className="font-bold flex-shrink-0"
              style={{
                borderRadius: RADIUS.pill,
                padding: "8px 14px",
                minHeight: 36,
                fontSize: FONT_SIZE.card,
                background: region === r ? palette.brand : palette.surfaceAlt,
                color: region === r ? "#FFFFFF" : palette.textSecondary,
              }}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Kết quả */}
      <div style={{ padding: "8px 16px 0" }}>
        {loading ? (
          <div className="flex flex-col items-center" style={{ padding: 40 }}>
            <Spinner />
            <div style={{ marginTop: 8, color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
              Đang tải danh sách tour...
            </div>
          </div>
        ) : results.length === 0 ? (
          <div
            className="flex flex-col items-center text-center"
            style={{
              padding: 36,
              borderRadius: RADIUS.xl,
              border: `1px dashed ${palette.border}`,
              background: isDark ? "rgba(30,34,43,0.4)" : palette.surface,
            }}
          >
            <div style={{ fontSize: 40 }}>🔍</div>
            <div
              className="font-bold"
              style={{ marginTop: 12, color: palette.textPrimary, fontSize: FONT_SIZE.lg }}
            >
              Không tìm thấy tour
            </div>
            <div style={{ marginTop: 6, marginBottom: 20, color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
              Thử thay đổi từ khoá hoặc bộ lọc.
            </div>
            <button
              onClick={() => {
                resetSearch();
                navigate("/search");
              }}
              className="text-white font-bold"
              style={{
                borderRadius: RADIUS.md,
                padding: "14px 24px",
                minHeight: 44,
                background: palette.brand,
                fontSize: FONT_SIZE.xxs,
              }}
            >
              Quay lại ban đầu
            </button>
          </div>
        ) : (
          <>
            {results.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
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
                  marginBottom: 20,
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
                style={{ padding: "12px 0", color: palette.textMuted, fontSize: FONT_SIZE.xxs }}
              >
                ✓ Đã hiển thị tất cả tour
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <Footer />
      </div>
    </Page>
  );
}
