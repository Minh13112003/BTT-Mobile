import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";

import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import SearchBar from "@/components/SearchBar";
import TabHeader from "@/components/TabHeader";
import { useGuideTarget, useTabGuide } from "@/context/GuideContext";
import TourCard from "@/components/TourCard";
import { useTheme } from "@/context/ThemeContext";
import { useTourSearch } from "@/hooks/useTourSearch";
import { getPalette, BOTTOM_NAV_SPACE, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { MODE_CHIP_LABELS, SECTION_ORDER, SearchMode, regionsForMode } from "@/constants/tourFilters";

type SheetKey = "category" | "scope" | "region" | "collection";

const ALL_LABEL = "Tất cả";
const CATEGORY_OPTS: { label: string; mode: SearchMode }[] = [
  { label: ALL_LABEL, mode: "newest" },
  { label: "Đang hot", mode: "hot" },
  { label: "Sắp khởi hành", mode: "upcoming" },
  { label: "Bán chạy", mode: "popular" },
];
const SCOPE_OPTS: { label: string; mode: SearchMode }[] = [
  { label: ALL_LABEL, mode: "newest" },
  { label: "Trong nước", mode: "domestic" },
  { label: "Quốc tế", mode: "foreign" },
];
const COLLECTION_MODES: SearchMode[] = [
  "tour_of_the_year_2026",
  "tour_cao_cap",
  "tour_mice",
  "tour_mua_thu_dong",
  "tour_du_lich_xanh",
  "tour_doc_la",
];
const COLLECTION_OPTS: { label: string; mode: SearchMode }[] = [
  { label: ALL_LABEL, mode: "newest" },
  ...COLLECTION_MODES.map((m) => ({ label: MODE_CHIP_LABELS[m], mode: m })),
];

/** Quá khoảng này không vào lại tab Du lịch thì bộ lọc được khôi phục về mặc định ("Tất cả"). */
const SEARCH_IDLE_RESET_MS = 30 * 60 * 1000;

/**
 * Bộ lọc đang chọn ở tab Du lịch, giữ ở bộ nhớ (trang này được mount lại mỗi lần chuyển tab). Vào lại
 * trong vòng 30 phút thì khôi phục đúng chỗ cũ; mỗi lần vào/rời tab hoặc đổi bộ lọc đều tính lại mốc 30 phút.
 */
let searchMemory: { mode: SearchMode; region: string | null; query: string; at: number } | null = null;

/** Ô thả xuống: nhãn nhỏ + giá trị đang chọn; bấm để mở danh sách lựa chọn. */
function DropdownTile({
  label,
  value,
  active,
  disabled,
  onClick,
  isDark,
}: {
  label: string;
  value: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  isDark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center text-left"
      style={{
        flex: 1,
        minWidth: 0,
        height: 56,
        padding: "0 14px",
        borderRadius: 16,
        opacity: disabled ? 0.5 : 1,
        background: active ? (isDark ? "rgba(69,10,10,0.4)" : "#FFF1F3") : isDark ? "#1E222B" : "#FFFFFF",
        border: `1px solid ${active ? (isDark ? "#B91C1C" : "#F3C4CA") : isDark ? "rgba(51,65,85,0.6)" : "#E2E8F0"}`,
      }}
    >
      <span className="flex-1 min-w-0" style={{ display: "block" }}>
        <span style={{ display: "block", fontSize: FONT_SIZE.xxs, color: isDark ? "#94A3B8" : "#64748B" }}>{label}</span>
        <span
          className="font-bold"
          style={{
            display: "block",
            fontSize: FONT_SIZE.xxs,
            color: active ? "#B30118" : isDark ? "#F1F5F9" : "#1A1A2E",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </span>
      </span>
      <Icon name="chevron-down" size={16} color={active ? "#B30118" : "#94A3B8"} />
    </button>
  );
}

/**
 * Port từ app/(root)/(tabs)/search.tsx (bản thiết kế lại): header đỏ (tiêu đề + số kết quả), ô tìm
 * kiếm, 4 ô thả xuống Danh mục / Phạm vi / Khu vực / Bộ sưu tập (chọn một ô thì các ô còn lại về
 * "Tất cả"), mặc định "Tất cả" = toàn bộ tour — trong nước trước, nước ngoài sau. Giữ bộ lọc khi chuyển
 * tab, quá 30 phút thì về mặc định.
 */
export default function SearchPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const paramMode = params.get("mode") ?? "";
  const explicit = !!(paramMode || params.get("q") || params.get("dateMode"));
  const fresh = !!searchMemory && Date.now() - searchMemory.at <= SEARCH_IDLE_RESET_MS;

  // Điều hướng kèm tham số (ô loại tour / ô tìm ngày ở Home) luôn thắng bộ nhớ.
  const initial = (() => {
    if (explicit) {
      return {
        mode: ((SECTION_ORDER as string[]).includes(paramMode) ? paramMode : "newest") as SearchMode,
        region: null as string | null,
        query: params.get("q") ?? "",
      };
    }
    if (fresh && searchMemory) {
      return { mode: searchMemory.mode, region: searchMemory.region, query: searchMemory.query };
    }
    return { mode: "newest" as SearchMode, region: null as string | null, query: "" };
  })();

  const dateMode = params.get("dateMode") ?? undefined;
  const specificDate = params.get("specificDate") ?? undefined;
  const startDate = params.get("startDate") ?? undefined;
  const endDate = params.get("endDate") ?? undefined;

  const { mode, setMode, region, setRegion, query, setQuery, meta, results, hasNext, loading, loadingMore, loadMore, resetSearch } =
    useTourSearch({
      mode: initial.mode,
      region: initial.region,
      query: initial.query,
      dateMode,
      specificDate,
      startDate,
      endDate,
    });

  // Ghi nhớ bộ lọc + mốc thời gian (cả khi rời tab).
  useEffect(() => {
    searchMemory = { mode, region, query, at: Date.now() };
  }, [mode, region, query]);
  useEffect(
    () => () => {
      if (searchMemory) searchMemory = { ...searchMemory, at: Date.now() };
    },
    [],
  );

  const regions = regionsForMode(mode);
  const [sheet, setSheet] = useState<SheetKey | null>(null);

  const tileValue = (opts: { label: string; mode: SearchMode }[]) =>
    mode !== "newest" ? opts.find((o) => o.mode === mode)?.label ?? ALL_LABEL : ALL_LABEL;

  const sheetOpts = sheet === "category" ? CATEGORY_OPTS : sheet === "scope" ? SCOPE_OPTS : COLLECTION_OPTS;
  const sheetOptions: { label: string; selected: boolean; onPick: () => void }[] =
    sheet === "region"
      ? [
          { label: ALL_LABEL, selected: region === null, onPick: () => setRegion(null) },
          ...(regions ?? []).map((r) => ({ label: r, selected: region === r, onPick: () => setRegion(r) })),
        ]
      : sheetOpts.map((o) => ({
          label: o.label,
          selected: tileValue(sheetOpts) === o.label,
          onPick: () => setMode(o.mode),
        }));
  const sheetTitle =
    sheet === "category" ? "Danh mục" : sheet === "scope" ? "Phạm vi" : sheet === "region" ? "Khu vực" : "Bộ sưu tập";

  const backToDefault = () => {
    resetSearch();
    searchMemory = { mode: "newest", region: null, query: "", at: Date.now() };
    navigate("/search", { replace: true });
  };

  // Hướng dẫn lần đầu (constants/guideSteps.ts → search)
  useTabGuide("search", !loading);
  const searchRef = useGuideTarget("search.search");
  const filtersRef = useGuideTarget("search.filters");
  const cardRef = useGuideTarget("search.card");

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: BOTTOM_NAV_SPACE }}>
      <TabHeader
        title="Du lịch"
        guideTab="search"
        subtitle={`${meta?.total ?? results.length} kết quả`}
        onBack={
          params.get("referrer")
            ? () => {
                resetSearch();
                searchMemory = { mode: "newest", region: null, query: "", at: Date.now() };
                navigate(-1);
              }
            : undefined
        }
      />

      <div style={{ padding: "16px 20px 4px" }}>
        <div ref={searchRef}>
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {/* 4 ô thả xuống — mặc định "Tất cả"; chọn ô nào thì các ô còn lại về "Tất cả" */}
        <div ref={filtersRef} style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="flex" style={{ gap: 8 }}>
            <DropdownTile label="Danh mục" value={tileValue(CATEGORY_OPTS)} active={tileValue(CATEGORY_OPTS) !== ALL_LABEL} onClick={() => setSheet("category")} isDark={isDark} />
            <DropdownTile label="Phạm vi" value={tileValue(SCOPE_OPTS)} active={tileValue(SCOPE_OPTS) !== ALL_LABEL} onClick={() => setSheet("scope")} isDark={isDark} />
          </div>
          <div className="flex" style={{ gap: 8 }}>
            <DropdownTile
              label="Khu vực"
              value={regions ? region ?? ALL_LABEL : "Chọn phạm vi trước"}
              active={!!region}
              disabled={!regions}
              onClick={() => setSheet("region")}
              isDark={isDark}
            />
            <DropdownTile label="Bộ sưu tập" value={tileValue(COLLECTION_OPTS)} active={tileValue(COLLECTION_OPTS) !== ALL_LABEL} onClick={() => setSheet("collection")} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* Kết quả */}
      <div style={{ padding: "16px 20px 0" }}>
        {loading ? (
          <div className="flex flex-col items-center" style={{ padding: 40 }}>
            <Spinner />
            <div style={{ marginTop: 8, color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>Đang tải danh sách tour...</div>
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
            <div className="font-bold" style={{ marginTop: 12, color: palette.textPrimary, fontSize: FONT_SIZE.lg }}>
              Không tìm thấy tour
            </div>
            <div style={{ marginTop: 6, marginBottom: 20, color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
              Thử thay đổi từ khoá hoặc bộ lọc.
            </div>
            <button
              onClick={backToDefault}
              className="text-white font-bold"
              style={{ borderRadius: RADIUS.md, padding: "14px 24px", minHeight: 44, background: palette.brand, fontSize: FONT_SIZE.xxs }}
            >
              Quay lại ban đầu
            </button>
          </div>
        ) : (
          <>
            {results.map((tour, i) => (
              <div key={tour.id} ref={i === 0 ? cardRef : undefined}>
                <TourCard tour={tour} dateMode={dateMode} specificDate={specificDate} startDate={startDate} endDate={endDate} />
              </div>
            ))}
            {loadingMore ? (
              <div className="flex justify-center" style={{ padding: 16 }}>
                <Spinner />
              </div>
            ) : hasNext ? (
              <button
                onClick={loadMore}
                className="font-bold w-full"
                style={{ borderRadius: RADIUS.md, padding: "14px 0", minHeight: 44, marginBottom: 20, background: palette.surfaceAlt, color: palette.textSecondary, fontSize: FONT_SIZE.xxs }}
              >
                Xem thêm
              </button>
            ) : (
              <div className="text-center font-semibold" style={{ padding: "12px 0", color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
                ✓ Đã hiển thị tất cả tour
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <Footer />
      </div>

      {/* Bảng chọn từ dưới lên cho 4 ô thả xuống */}
      {sheet && (
        <div className="fixed inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.5)", zIndex: 2000 }} onClick={() => setSheet(null)}>
          <div
            role="dialog"
            aria-label={sheetTitle}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: "20px 20px calc(env(safe-area-inset-bottom) + 16px)",
              background: isDark ? "#1A1F2B" : "#FFFFFF",
            }}
          >
            <div className="font-black" style={{ marginBottom: 12, fontSize: FONT_SIZE.xs, color: isDark ? "#F1F5F9" : "#1A1A2E" }}>
              {sheetTitle}
            </div>
            {sheetOptions.map((o) => (
              <button
                key={o.label}
                onClick={() => {
                  o.onPick();
                  setSheet(null);
                }}
                className="flex items-center w-full text-left"
                style={{
                  height: 56,
                  padding: "0 16px",
                  borderRadius: 16,
                  marginBottom: 8,
                  background: o.selected ? (isDark ? "rgba(69,10,10,0.4)" : "#FFF1F3") : isDark ? "#1E293B" : "#F8FAFC",
                }}
              >
                <span className="flex-1 font-semibold" style={{ fontSize: FONT_SIZE.xxs, color: o.selected ? "#B30118" : isDark ? "#F1F5F9" : "#1A1A2E" }}>
                  {o.label}
                </span>
                {o.selected && <Icon name="checkmark" size={20} color="#D0021B" strokeWidth={2.6} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
