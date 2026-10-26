import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import TourCard from "@/components/TourCard";
import { useAuth } from "@/context/AuthContext";
import { useGuideTarget, useTabGuide } from "@/context/GuideContext";
import { useTheme } from "@/context/ThemeContext";
import { useHomeTours } from "@/hooks/useHomeTours";
import { BLOG_CATEGORY_TRAVEL_GUIDE, getNews, NewsItem } from "@/services/news";
import { getMe } from "@/services/user";
import MemberCard from "@/components/MemberCard";
import { getPalette, BOTTOM_NAV_SPACE, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

import tourYear2026 from "@/static/tour-types/tour_year_2026.png";
import tourCaoCap from "@/static/tour-types/tour_cao_cap.png";
import tourMice from "@/static/tour-types/tour_mice.png";
import tourMuaThuDong from "@/static/tour-types/tour_mua_thu_dong.webp";
import tourDuLichXanh from "@/static/tour-types/tour_du_lich_xanh.png";
import tourDocLa from "@/static/tour-types/tour_doc_la.webp";

const TOUR_TYPE_ICONS = [
  { mode: "tour_of_the_year_2026", label: "TOUR OF THE\nYEAR 2026", image: tourYear2026 },
  { mode: "tour_cao_cap", label: "TOUR\nCAO CẤP", image: tourCaoCap },
  { mode: "tour_mice", label: "TOUR\nMICE", image: tourMice },
  { mode: "tour_mua_thu_dong", label: "TOUR MÙA\nTHU - ĐÔNG", image: tourMuaThuDong },
  { mode: "tour_du_lich_xanh", label: "DU LỊCH\nXANH", image: tourDuLichXanh },
  { mode: "tour_doc_la", label: "TOUR\nĐỘC LẠ", image: tourDocLa },
];

/** Port từ app/(root)/(tabs)/index.tsx bên React Native. */
export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const { sections, loading } = useHomeTours();

  // Hướng dẫn lần đầu (constants/guideSteps.ts → home)
  useTabGuide("home", !loading);
  const memberRef = useGuideTarget("home.member");
  const searchRef = useGuideTarget("home.search");
  const typesRef = useGuideTarget("home.types");
  const hotRef = useGuideTarget("home.hot");
  const newsRef = useGuideTarget("home.news");
  const [searchQuery, setSearchQuery] = useState("");
  // Cuối trang: tin hoạt động công ty + cẩm nang du lịch (thay 3 ô Tin tức / Mẹo hay / Ưu đãi cũ) — giống app RN.
  const [news, setNews] = useState<{ company: NewsItem[]; guide: NewsItem[] }>({ company: [], guide: [] });
  const [newsTab, setNewsTab] = useState<"company" | "guide">("company");
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Bộ tìm theo ngày khởi hành — port từ app/(root)/(tabs)/index.tsx, dùng
  // <input type="date"> thay cho modal DatePickerCalendar tùy biến bên RN.
  const [dateMode, setDateMode] = useState<"specific" | "range">("specific");
  const [specificDate, setSpecificDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const clearDateFilters = () => {
    setSpecificDate("");
    setStartDate("");
    setEndDate("");
  };

  useEffect(() => {
    getNews()
      .then((res) => setNews((n) => ({ ...n, company: Array.isArray(res.data) ? res.data : [] })))
      .catch(() => {});
    getNews(BLOG_CATEGORY_TRAVEL_GUIDE)
      .then((res) => setNews((n) => ({ ...n, guide: Array.isArray(res.data) ? res.data : [] })))
      .catch(() => {});
    getMe()
      .then((res) => {
        const me = (res?.data as any)?.data ?? res?.data;
        setEarnedPoints(typeof me?.earnedPoints === "number" ? me.earnedPoints : 0);
      })
      .catch(() => {});
  }, []);

  const submitSearch = () => {
    const q = searchQuery.trim();
    const parts: string[] = [];
    if (q) parts.push(`q=${encodeURIComponent(q)}`);

    const hasDateFilter = dateMode === "specific" ? !!specificDate : !!startDate || !!endDate;
    if (hasDateFilter) {
      parts.push(`dateMode=${dateMode}`);
      if (dateMode === "specific" && specificDate) parts.push(`specificDate=${specificDate}`);
      if (dateMode === "range") {
        if (startDate) parts.push(`startDate=${startDate}`);
        if (endDate) parts.push(`endDate=${endDate}`);
      }
    }
    navigate(parts.length ? `/search?${parts.join("&")}` : "/search");
  };

  return (
    <Page style={{ background: palette.screenBg, paddingBottom: BOTTOM_NAV_SPACE }}>
      <Header guideTab="home" />

      {/* Thẻ hạng thành viên — bấm vào mở trang quyền lợi đầy đủ */}
      {user && (
        <div style={{ padding: "20px 16px 0" }}>
          <button
            ref={memberRef}
            onClick={() => navigate(`/membership?earnedPoints=${earnedPoints}`)}
            className="block w-full"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <MemberCard earnedPoints={earnedPoints} name={`${user.firstName} ${user.lastName}`} cardWidth={Math.min(420, window.innerWidth - 32)} />
          </button>
          <div className="text-right font-semibold" style={{ marginTop: 10, color: palette.textMuted, fontSize: FONT_SIZE.xxs }}>
            Nhấn để xem quyền lợi thành viên →
          </div>
        </div>
      )}

      {/* Search bar + bộ tìm theo ngày khởi hành */}
      <div style={{ padding: 16 }}>
        <div ref={searchRef} style={{ padding: 16, borderRadius: RADIUS.lg, background: palette.surface, border: `1px solid ${palette.border}` }}>
          <div
            className="flex items-center"
            style={{
              borderRadius: RADIUS.md,
              background: palette.surfaceAlt,
              border: `1px solid ${palette.border}`,
              padding: "0 4px 0 16px",
              marginBottom: 16,
              height: 48,
            }}
          >
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              placeholder="Bạn muốn tìm tour du lịch nào?"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: FONT_SIZE.card,
                color: palette.textPrimary,
                height: "100%",
              }}
            />
          </div>

          <div className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: palette.textPrimary, marginBottom: 10 }}>
            📅 Chọn ngày du lịch / khởi hành
          </div>

          <div className="flex" style={{ marginBottom: 12 }}>
            {(["specific", "range"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setDateMode(m)}
                className="flex-1 font-bold text-center"
                style={{
                  minHeight: 44,
                  padding: "10px 0",
                  borderBottom: `2px solid ${dateMode === m ? palette.brand : "transparent"}`,
                  color: dateMode === m ? palette.brand : palette.textSecondary,
                  fontSize: FONT_SIZE.card,
                }}
              >
                {m === "specific" ? "Ngày cụ thể" : "Khoảng ngày"}
              </button>
            ))}
          </div>

          {dateMode === "specific" ? (
            <input
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              style={{
                width: "100%",
                minHeight: 44,
                padding: "0 12px",
                borderRadius: RADIUS.sm,
                border: `1px solid ${palette.border}`,
                background: palette.surfaceAlt,
                color: palette.textPrimary,
                fontSize: FONT_SIZE.xxs,
                marginBottom: 12,
              }}
            />
          ) : (
            <div className="flex" style={{ gap: 10, marginBottom: 12 }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ flex: 1, minHeight: 44, padding: "0 10px", borderRadius: RADIUS.sm, border: `1px solid ${palette.border}`, background: palette.surfaceAlt, color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ flex: 1, minHeight: 44, padding: "0 10px", borderRadius: RADIUS.sm, border: `1px solid ${palette.border}`, background: palette.surfaceAlt, color: palette.textPrimary, fontSize: FONT_SIZE.xxs }}
              />
            </div>
          )}

          <div className="flex" style={{ gap: 10 }}>
            {(specificDate || startDate || endDate) && (
              <button
                onClick={clearDateFilters}
                className="flex items-center justify-center"
                style={{ minWidth: 44, minHeight: 44, borderRadius: RADIUS.sm, border: `1px solid ${palette.border}`, color: palette.textSecondary }}
              >
                ↺
              </button>
            )}
            <button
              onClick={submitSearch}
              className="flex-1 font-bold text-white"
              style={{ minHeight: 44, borderRadius: RADIUS.sm, background: palette.brand, fontSize: FONT_SIZE.card }}
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* 5 icon loại tour */}
      <div ref={typesRef} className="flex overflow-x-auto" style={{ padding: "4px 16px", gap: 14 }}>
        {TOUR_TYPE_ICONS.map((item) => (
          <button
            key={item.mode}
            onClick={() => navigate(`/search?mode=${item.mode}`)}
            className="flex flex-col items-center flex-shrink-0"
            style={{ width: 90 }}
          >
            <div
              className="flex items-center justify-center overflow-hidden"
              style={{ width: 72, height: 72, borderRadius: 36, border: `2px solid ${palette.brand}`, background: palette.surface }}
            >
              <img src={item.image} alt={item.label} style={{ width: 66, height: 66, objectFit: "contain" }} />
            </div>
            <div
              className="font-extrabold text-center"
              style={{ fontSize: 12, color: palette.textPrimary, marginTop: 6, lineHeight: "15px", whiteSpace: "pre-line" }}
            >
              {item.label}
            </div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center" style={{ padding: 40 }}>
          <Spinner />
        </div>
      ) : (
        <>
          {/* Tour hot — carousel */}
          {sections.hot.length > 0 && (
            <div ref={hotRef} style={{ marginTop: 8 }}>
              <FeaturedCarousel tours={sections.hot} />
            </div>
          )}

          {/* Tour sắp khởi hành */}
          {sections.upcoming.length > 0 && (
            <div style={{ marginTop: 28, padding: "0 16px" }}>
              <div
                className="font-black"
                style={{ fontSize: FONT_SIZE.xl, color: palette.textPrimary, marginBottom: 12 }}
              >
                Tour sắp khởi hành
              </div>
              {sections.upcoming.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}

          {/* Tin tức & cẩm nang — cuối trang */}
          {(news.company.length > 0 || news.guide.length > 0) && (
            <div ref={newsRef} style={{ marginTop: 20 }}>
              <div
                className="flex items-center justify-between"
                style={{ padding: "0 16px", marginBottom: 12 }}
              >
                <div className="font-black" style={{ fontSize: FONT_SIZE.xl, color: palette.textPrimary }}>
                  Tin tức & cẩm nang
                </div>
                <button
                  onClick={() => navigate(`/news?category=${newsTab}`)}
                  className="font-black"
                  style={{ fontSize: FONT_SIZE.xxs, color: palette.brand }}
                >
                  Xem tất cả →
                </button>
              </div>
              <div className="flex" style={{ padding: "0 16px", marginBottom: 12, gap: 8 }}>
                {(
                  [
                    { key: "company", label: "Tin công ty" },
                    { key: "guide", label: "Cẩm nang du lịch" },
                  ] as const
                ).map((t) => {
                  const active = newsTab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setNewsTab(t.key)}
                      className="font-bold"
                      style={{
                        minHeight: 44,
                        padding: "0 16px",
                        borderRadius: 999,
                        fontSize: FONT_SIZE.card,
                        background: active ? palette.brand : palette.surface,
                        color: active ? "#FFFFFF" : palette.textSecondary,
                        border: `1px solid ${active ? palette.brand : palette.border}`,
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <div
                className="flex overflow-x-auto"
                style={{ paddingLeft: 16, paddingRight: 8, gap: 12 }}
              >
                {news[newsTab].length === 0 && (
                  <div style={{ fontSize: FONT_SIZE.xxs, color: palette.textMuted }}>Chưa có bài viết trong mục này.</div>
                )}
                {news[newsTab].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/news/${item.id}`)}
                    className="text-left overflow-hidden flex-shrink-0"
                    style={{
                      width: 288,
                      borderRadius: RADIUS.lg,
                      background: palette.surface,
                      border: `1px solid ${palette.border}`,
                      marginBottom: 8,
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{ width: "100%", height: 128, objectFit: "cover", background: palette.surfaceAlt }}
                    />
                    <div style={{ padding: 12 }}>
                      <div
                        className="font-bold"
                        style={{
                          fontSize: FONT_SIZE.xxs,
                          lineHeight: "26px",
                          color: palette.textPrimary,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        className="flex items-center justify-between"
                        style={{ marginTop: 12, gap: 12 }}
                      >
                        <span style={{ fontSize: FONT_SIZE.card, color: palette.textMuted, fontWeight: 600 }}>
                          {item.date}
                        </span>
                        <span
                          className="font-black uppercase"
                          style={{ fontSize: FONT_SIZE.card, color: isDark ? "#CBD5E1" : "#2563EB" }}
                        >
                          Xem chi tiết
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 36 }}>
        <Footer />
      </div>
    </Page>
  );
}
