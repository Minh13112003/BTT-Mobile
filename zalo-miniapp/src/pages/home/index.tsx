import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Spinner } from "zmp-ui";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import TourCard from "@/components/TourCard";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useHomeTours } from "@/hooks/useHomeTours";
import { getNews, NewsItem } from "@/services/news";
import { getMe } from "@/services/user";
import MemberCard from "@/components/MemberCard";
import { getPalette, BOTTOM_NAV_SPACE, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";

import tourYear2026 from "@/static/tour-types/tour_year_2026.png";
import tourCaoCap from "@/static/tour-types/tour_cao_cap.png";
import tourMice from "@/static/tour-types/tour_mice.png";
import tourHe from "@/static/tour-types/tour_he.png";
import tourDuLichXanh from "@/static/tour-types/tour_du_lich_xanh.png";

const TOUR_TYPE_ICONS = [
  { mode: "tour_of_the_year_2026", label: "TOUR OF THE\nYEAR 2026", image: tourYear2026 },
  { mode: "tour_cao_cap", label: "TOUR\nCAO CẤP", image: tourCaoCap },
  { mode: "tour_mice", label: "TOUR\nMICE", image: tourMice },
  { mode: "tour_he", label: "TOUR\nHÈ", image: tourHe },
  { mode: "tour_du_lich_xanh", label: "DU LỊCH\nXANH", image: tourDuLichXanh },
];

/** Port từ app/(root)/(tabs)/index.tsx bên React Native. */
export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const { sections, loading } = useHomeTours();
  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
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
      .then((res) => setNews(Array.isArray(res.data) ? res.data : []))
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
      <Header />

      {/* Thẻ hạng thành viên — bấm vào mở trang quyền lợi đầy đủ */}
      {user && (
        <div style={{ padding: "20px 16px 0" }}>
          <button
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

      {/* Chào mừng */}
      <div style={{ padding: "20px 16px 0" }}>
        <div className="font-semibold uppercase" style={{ color: palette.textMuted, fontSize: FONT_SIZE.card, letterSpacing: 1 }}>
          Chào mừng bạn trở lại,
        </div>
        <div className="font-black" style={{ color: palette.textPrimary, fontSize: FONT_SIZE.xl, marginTop: 2 }}>
          {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Khách du lịch"} 👋
        </div>
      </div>

      {/* Search bar + bộ tìm theo ngày khởi hành */}
      <div style={{ padding: 16 }}>
        <div style={{ padding: 16, borderRadius: RADIUS.lg, background: palette.surface, border: `1px solid ${palette.border}` }}>
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
      <div className="flex overflow-x-auto" style={{ padding: "4px 16px", gap: 14 }}>
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

      {/* Quick Access Grid */}
      <div
        className="flex"
        style={{ margin: "20px 16px 0", borderRadius: RADIUS.md, background: palette.surface, border: `1px solid ${palette.border}`, padding: "16px 8px" }}
      >
        {[
          { label: "Tin tức", emoji: "📰", bg: isDark ? "#1A2D20" : "#ECFDF5", color: "#10B981", onPress: () => navigate("/news") },
          { label: "Mẹo hay", emoji: "💡", bg: isDark ? "#2A2010" : "#FFFBEB", color: "#F59E0B", onPress: () => navigate("/tips") },
          { label: "Ưu đãi", emoji: "🎁", bg: isDark ? "#2A1520" : "#FFF1F2", color: "#E11D48", onPress: () => navigate("/search?mode=hot") },
        ].map((q) => (
          <button key={q.label} onClick={q.onPress} className="flex-1 flex flex-col items-center" style={{ minHeight: 44 }}>
            <div
              className="flex items-center justify-center"
              style={{ width: 52, height: 52, borderRadius: RADIUS.md, background: q.bg, marginBottom: 6, fontSize: 24 }}
            >
              {q.emoji}
            </div>
            <div className="font-bold" style={{ fontSize: FONT_SIZE.card, color: palette.textPrimary }}>{q.label}</div>
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
            <div style={{ marginTop: 8 }}>
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

          {/* Tin tức nổi bật */}
          {news.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div
                className="flex items-center justify-between"
                style={{ padding: "0 16px", marginBottom: 12 }}
              >
                <div className="font-black" style={{ fontSize: FONT_SIZE.xl, color: palette.textPrimary }}>
                  Tin tức nổi bật
                </div>
                <button
                  onClick={() => navigate("/news")}
                  className="font-black"
                  style={{ fontSize: FONT_SIZE.xxs, color: palette.brand }}
                >
                  Xem tất cả →
                </button>
              </div>
              <div
                className="flex overflow-x-auto"
                style={{ paddingLeft: 16, paddingRight: 8, gap: 12 }}
              >
                {news.map((item) => (
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
